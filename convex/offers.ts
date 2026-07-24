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
 * Creator accepts a campaign offer.
 * Updates the offer, increments campaign spotsFilled,
 * and marks batch complete if all spots are filled.
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
      throw new Error(`Cannot accept offer with status '${offer.status}'`);
    }

    // Accept the offer
    await ctx.db.patch(args.offerId, {
      status: "accepted",
      respondedAt: Date.now(),
    });

    // Increment campaign spotsFilled
    const campaign = await ctx.db.get(offer.campaignId);
    if (!campaign) throw new Error("Campaign not found");

    const newSpotsFilled = campaign.spotsFilled + 1;
    await ctx.db.patch(offer.campaignId, {
      spotsFilled: newSpotsFilled,
    });

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
