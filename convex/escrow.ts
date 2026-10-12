import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { generateSimulatedTxHash } from "./helpers";

/**
 * Internal: Lock budget when a campaign is created.
 * Creates an escrow ledger entry with action "locked".
 */
export const lockBudget = internalMutation({
  args: {
    campaignId: v.id("campaigns"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("escrowLedger", {
      campaignId: args.campaignId,
      action: "locked",
      amount: args.amount,
      txHash: generateSimulatedTxHash(),
    });
  },
});

/**
 * Internal: Release payout to a creator after content verification.
 * Creates a ledger entry with action "released".
 */
export const releasePayout = internalMutation({
  args: {
    campaignId: v.id("campaigns"),
    creatorUserId: v.id("users"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("escrowLedger", {
      campaignId: args.campaignId,
      creatorUserId: args.creatorUserId,
      action: "released",
      amount: args.amount,
      txHash: generateSimulatedTxHash(),
    });

    // Check if all spots are filled and paid — if so, update escrow status
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) return;

    const releasedEntries = await ctx.db
      .query("escrowLedger")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    const releasedCount = releasedEntries.filter(
      (e) => e.action === "released"
    ).length;

    if (releasedCount >= campaign.spotsTotal) {
      await ctx.db.patch(args.campaignId, {
        escrowStatus: "released",
        status: "completed",
      });
    }
  },
});

/**
 * Refund remaining budget to the brand (e.g., campaign cancelled).
 */
export const refund = mutation({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) throw new Error("Campaign not found");

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || campaign.brandUserId !== user._id) {
      throw new Error("Not authorized to refund this campaign");
    }

    // Calculate already-released amount
    const ledgerEntries = await ctx.db
      .query("escrowLedger")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    const releasedTotal = ledgerEntries
      .filter((e) => e.action === "released")
      .reduce((sum, e) => sum + e.amount, 0);

    const refundAmount = campaign.budget - releasedTotal;

    if (refundAmount <= 0) {
      throw new Error("No funds available to refund");
    }

    await ctx.db.insert("escrowLedger", {
      campaignId: args.campaignId,
      action: "refunded",
      amount: refundAmount,
      txHash: generateSimulatedTxHash(),
    });

    // Mark campaign as completed
    await ctx.db.patch(args.campaignId, {
      status: "completed",
      escrowStatus: "released",
    });

    return refundAmount;
  },
});

/**
 * Get the full escrow ledger for a campaign.
 */
export const getLedger = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("escrowLedger")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();
  },
});

/**
 * Get aggregate earnings for the current creator.
 * Returns total released and total pending (from submitted but not yet released).
 */
export const getCreatorEarnings = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { totalReleased: 0, totalPending: 0 };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return { totalReleased: 0, totalPending: 0 };

    // Get all ledger entries for this creator
    // (No direct index on creatorUserId, so we scan and filter)
    const allEntries = await ctx.db.query("escrowLedger").collect();
    const creatorEntries = allEntries.filter(
      (e) => e.creatorUserId === user._id
    );

    const totalReleased = creatorEntries
      .filter((e) => e.action === "released")
      .reduce((sum, e) => sum + e.amount, 0);

    // Pending = offers accepted but content not yet verified/released
    // We approximate by looking at accepted offers without a corresponding release
    const acceptedOffers = await ctx.db
      .query("campaignOffers")
      .withIndex("by_creator", (q) => q.eq("creatorUserId", user._id))
      .collect();

    let totalPending = 0;
    for (const offer of acceptedOffers) {
      if (offer.status === "accepted") {
        const hasRelease = creatorEntries.some(
          (e) =>
            e.campaignId === offer.campaignId && e.action === "released"
        );
        if (!hasRelease) {
          const campaign = await ctx.db.get(offer.campaignId);
          if (campaign) {
            totalPending += (campaign.budget * 0.95) / campaign.spotsTotal;
          }
        }
      }
    }

    // Calculate total withdrawn
    const withdrawals = await ctx.db
      .query("withdrawals")
      .withIndex("by_creator", (q) => q.eq("creatorUserId", user._id))
      .collect();
      
    const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);
    const availableBalance = totalReleased - totalWithdrawn;

    return { totalReleased, totalPending, totalWithdrawn, availableBalance };
  },
});

/**
 * Get detailed transaction history for the creator.
 * Combines completed payouts from campaigns and withdrawal requests.
 */
export const getCreatorTransactions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const transactions: any[] = [];

    // 1. Get Campaign Payouts
    const acceptedOffers = await ctx.db
      .query("campaignOffers")
      .withIndex("by_creator", (q) => q.eq("creatorUserId", user._id))
      .collect();

    const allEntries = await ctx.db.query("escrowLedger").collect();
    const creatorEntries = allEntries.filter((e) => e.creatorUserId === user._id);

    for (const offer of acceptedOffers) {
      if (offer.status === "accepted") {
        const campaign = await ctx.db.get(offer.campaignId);
        if (!campaign) continue;

        const amount = (campaign.budget * 0.95) / campaign.spotsTotal;
        const releaseEntry = creatorEntries.find(
          (e) => e.campaignId === offer.campaignId && e.action === "released"
        );

        let status = "Escrow Locked";
        let date = offer._creationTime;

        // Check submission status if not released
        if (!releaseEntry) {
          const submissions = await ctx.db
            .query("submissions")
            .withIndex("by_campaign", (q) => q.eq("campaignId", campaign._id))
            .collect();
          
          const creatorSub = submissions.find(s => s.creatorUserId === user._id);
          if (creatorSub && (creatorSub.status === "approved" || creatorSub.status === "final_verifying")) {
            status = "Deliverable Verified";
          }
        } else {
          status = "Released";
          date = releaseEntry._creationTime;
        }

        transactions.push({
          id: offer._id,
          type: "payout",
          brandName: campaign.brandName,
          campaignName: campaign.title,
          amount,
          date,
          status,
        });
      }
    }

    // 2. Get Withdrawals
    const withdrawals = await ctx.db
      .query("withdrawals")
      .withIndex("by_creator", (q) => q.eq("creatorUserId", user._id))
      .collect();

    for (const w of withdrawals) {
      transactions.push({
        id: w._id,
        type: "withdrawal",
        brandName: "Bank Withdrawal (UPI)",
        campaignName: `To: ${w.upiId}`,
        amount: -w.amount,
        date: w._creationTime,
        status: w.status.charAt(0).toUpperCase() + w.status.slice(1),
      });
    }

    // Sort by date descending
    transactions.sort((a, b) => b.date - a.date);

    return transactions;
  },
});

/**
 * Request a withdrawal of available funds via UPI.
 */
export const requestWithdrawal = mutation({
  args: {
    amount: v.number(),
    upiId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");
    if (user.role !== "creator") throw new Error("Only creators can withdraw");

    // 1. Recalculate available balance to prevent double-spend
    const allEntries = await ctx.db.query("escrowLedger").collect();
    const creatorEntries = allEntries.filter((e) => e.creatorUserId === user._id);
    const totalReleased = creatorEntries
      .filter((e) => e.action === "released")
      .reduce((sum, e) => sum + e.amount, 0);

    const withdrawals = await ctx.db
      .query("withdrawals")
      .withIndex("by_creator", (q) => q.eq("creatorUserId", user._id))
      .collect();
    const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);
    
    const availableBalance = totalReleased - totalWithdrawn;

    if (args.amount <= 0) throw new Error("Amount must be positive");
    if (args.amount > availableBalance) {
      throw new Error("Insufficient available balance");
    }

    // 2. Insert withdrawal record
    await ctx.db.insert("withdrawals", {
      creatorUserId: user._id,
      amount: args.amount,
      upiId: args.upiId,
      status: "pending",
    });

    // 3. Update user's UPI ID if it's new
    if (user.upiId !== args.upiId) {
      await ctx.db.patch(user._id, { upiId: args.upiId });
    }

    return true;
  }
});

/**
 * Get aggregate spend for the current brand.
 */
export const getBrandSpend = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity)
      return { totalLocked: 0, totalReleased: 0, totalRefunded: 0 };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user)
      return { totalLocked: 0, totalReleased: 0, totalRefunded: 0 };

    // Get all campaigns by this brand
    const campaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_brand", (q) => q.eq("brandUserId", user._id))
      .collect();

    let totalLocked = 0;
    let totalReleased = 0;
    let totalRefunded = 0;

    for (const campaign of campaigns) {
      const entries = await ctx.db
        .query("escrowLedger")
        .withIndex("by_campaign", (q) => q.eq("campaignId", campaign._id))
        .collect();

      for (const entry of entries) {
        switch (entry.action) {
          case "locked":
            totalLocked += entry.amount;
            break;
          case "released":
            totalReleased += entry.amount;
            break;
          case "refunded":
            totalRefunded += entry.amount;
            break;
        }
      }
    }

    return { totalLocked, totalReleased, totalRefunded };
  },
});
