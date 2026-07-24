import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * Get all offers for the currently authenticated creator,
 * enriched with campaign and batch details.
 */
export const getByCreator = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const offers = await ctx.db
      .query("campaignOffers")
      .withIndex("by_creator", (q) => q.eq("creatorUserId", user._id))
      .collect();

    // Enrich each offer with campaign and batch data
    const enriched = await Promise.all(
      offers.map(async (offer) => {
        const campaign = await ctx.db.get(offer.campaignId);
        const batch = await ctx.db.get(offer.batchId);
        return {
          ...offer,
          campaign,
          batch,
        };
      })
    );

    return enriched;
  },
});

/**
 * Creator expresses interest in a campaign offer.
 * Moves the offer to 'brand_review' so the brand can approve or reject.
 */
export const accept = mutation({
  args: { offerId: v.id("campaignOffers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const offer = await ctx.db.get(args.offerId);
    if (!offer) throw new Error("Offer not found");

    if (offer.creatorUserId !== user._id) {
      throw new Error("Not authorized to respond to this offer");
    }

    if (offer.status !== "pending") {
      throw new Error(`Cannot express interest in offer with status '${offer.status}'`);
    }

    // Move to brand_review — brand must approve before work begins
    await ctx.db.patch(args.offerId, {
      status: "brand_review",
      respondedAt: Date.now(),
    });

    return args.offerId;
  },
});

/**
 * Brand approves a creator's interest in a campaign offer.
 * Moves the offer to 'accepted' and increments spotsFilled.
 */
export const brandApprove = mutation({
  args: { offerId: v.id("campaignOffers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");
    if (user.role !== "brand") throw new Error("Only brands can approve creators");

    const offer = await ctx.db.get(args.offerId);
    if (!offer) throw new Error("Offer not found");

    if (offer.status !== "brand_review") {
      throw new Error(`Cannot approve offer with status '${offer.status}'`);
    }

    // Verify this brand owns the campaign
    const campaign = await ctx.db.get(offer.campaignId);
    if (!campaign) throw new Error("Campaign not found");
    if (campaign.brandUserId !== user._id) {
      throw new Error("Not authorized to approve this offer");
    }

    // Accept the offer
    await ctx.db.patch(args.offerId, {
      status: "accepted",
    });

    // Increment campaign spotsFilled
    const newSpotsFilled = campaign.spotsFilled + 1;
    await ctx.db.patch(offer.campaignId, {
      spotsFilled: newSpotsFilled,
    });

    // Also add to creator's acceptedCampaignIds
    const creator = await ctx.db.get(offer.creatorUserId);
    if (creator) {
      const existing = creator.acceptedCampaignIds || [];
      if (!existing.includes(offer.campaignId)) {
        await ctx.db.patch(offer.creatorUserId, {
          acceptedCampaignIds: [...existing, offer.campaignId],
        });
      }
    }

    // If all spots filled, mark the active batch as completed
    if (newSpotsFilled >= campaign.spotsTotal) {
      const batch = await ctx.db.get(offer.batchId);
      if (batch && batch.status === "dispatched") {
        await ctx.db.patch(offer.batchId, { status: "completed" });
      }
    }

    return args.offerId;
  },
});

/**
 * Brand rejects a creator's interest.
 * Moves the offer back to 'declined'.
 */
export const brandReject = mutation({
  args: { offerId: v.id("campaignOffers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");
    if (user.role !== "brand") throw new Error("Only brands can reject creators");

    const offer = await ctx.db.get(args.offerId);
    if (!offer) throw new Error("Offer not found");

    if (offer.status !== "brand_review") {
      throw new Error(`Cannot reject offer with status '${offer.status}'`);
    }

    const campaign = await ctx.db.get(offer.campaignId);
    if (!campaign) throw new Error("Campaign not found");
    if (campaign.brandUserId !== user._id) {
      throw new Error("Not authorized to reject this offer");
    }

    await ctx.db.patch(args.offerId, {
      status: "declined",
      respondedAt: Date.now(),
    });

    return args.offerId;
  },
});

/**
 * Creator declines a campaign offer.
 */
export const decline = mutation({
  args: { offerId: v.id("campaignOffers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const offer = await ctx.db.get(args.offerId);
    if (!offer) throw new Error("Offer not found");

    if (offer.creatorUserId !== user._id) {
      throw new Error("Not authorized to respond to this offer");
    }

    if (offer.status !== "pending") {
      throw new Error(`Cannot decline offer with status '${offer.status}'`);
    }

    await ctx.db.patch(args.offerId, {
      status: "declined",
      respondedAt: Date.now(),
    });

    return args.offerId;
  },
});

/**
 * Get all offers for a specific batch.
 */
export const getByBatch = query({
  args: { batchId: v.id("batches") },
  handler: async (ctx, args) => {
    const offers = await ctx.db
      .query("campaignOffers")
      .withIndex("by_batch", (q) => q.eq("batchId", args.batchId))
      .collect();

    // Enrich with creator details
    const enriched = await Promise.all(
      offers.map(async (offer) => {
        const creator = await ctx.db.get(offer.creatorUserId);
        return { ...offer, creator };
      })
    );

    return enriched;
  },
});

/**
 * Get all offers for a specific campaign, enriched with creator details.
 * Used by the brand to see who has expressed interest.
 */
export const getByCampaign = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    const offers = await ctx.db
      .query("campaignOffers")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    const enriched = await Promise.all(
      offers.map(async (offer) => {
        const creator = await ctx.db.get(offer.creatorUserId);
        return { ...offer, creator };
      })
    );

    return enriched;
  },
});
