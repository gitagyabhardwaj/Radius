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
            totalPending += campaign.budget / campaign.spotsTotal;
          }
        }
      }
    }

    return { totalReleased, totalPending };
  },
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
