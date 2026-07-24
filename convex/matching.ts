import { v } from "convex/values";
import { query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { haversineKm, computeMatchScore } from "./helpers";
import { Doc, Id } from "./_generated/dataModel";

/**
 * Find all creators within the given radius of a center point,
 * sorted by match score (descending).
 */
export const findCreatorsInRadius = query({
  args: {
    centerLat: v.number(),
    centerLng: v.number(),
    niche: v.string(),
  },
  handler: async (ctx, args) => {
    const creators = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "creator"))
      .collect();

    const matched = creators
      .filter((c) => {
        if (c.lat === undefined || c.lng === undefined) return false;
        return true;
      })
      .map((c) => {
        const distance = haversineKm(args.centerLat, args.centerLng, c.lat!, c.lng!);
        return {
          ...c,
          distance,
          matchScore: computeMatchScore(
            distance,
            c.niche,
            args.niche,
            c.audienceInLocality,
            c.followers,
            c.velocityTier
          ),
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    return matched;
  },
});

/**
 * Internal mutation: find creators in radius, rank them, split into
 * 3 batches (A/B/C), and dispatch Batch A immediately.
 *
 * Batch assignment strategy:
 *  - Velocity-tier creators get priority placement in Batch A
 *  - Remaining creators sorted by match score and distributed evenly
 *  - Batch A dispatches immediately
 *  - Cascade timers are set based on campaign durationHours / 3
 */
export const assignBatches = internalMutation({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) throw new Error("Campaign not found");

    // Fetch all creators within radius
    const creators = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "creator"))
      .collect();

    type ScoredCreator = Doc<"users"> & {
      matchScore: number;
      distance: number;
    };

    const matched: ScoredCreator[] = creators
      .map((c) => {
        // If a creator doesn't have coordinates, assign a massive distance so they rank lowest
        // but are still included in the batching system
        const hasCoords = c.lat !== undefined && c.lng !== undefined;
        const distance = hasCoords
          ? haversineKm(campaign.centerLat, campaign.centerLng, c.lat!, c.lng!)
          : 20000; // ~Half the circumference of the Earth

        return {
          ...c,
          distance,
          matchScore: computeMatchScore(
            distance,
            c.niche,
            campaign.niche,
            c.audienceInLocality,
            c.followers,
            c.velocityTier
          ),
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    if (matched.length === 0) {
      // No creators found — nothing to batch
      return;
    }

    // Separate Velocity-tier creators for priority in Batch A
    const velocityCreators = matched.filter(
      (c) => c.velocityTier === "Velocity"
    );
    const freeCreators = matched.filter((c) => c.velocityTier !== "Velocity");

    // Combine: velocity first, then free (both already sorted by score)
    const ranked = [...velocityCreators, ...freeCreators];

    // Split into 3 batches (as evenly as possible)
    const batchSize = Math.ceil(ranked.length / 3);
    const batchGroups: Id<"users">[][] = [
      ranked.slice(0, batchSize).map((c) => c._id),
      ranked.slice(batchSize, batchSize * 2).map((c) => c._id),
      ranked.slice(batchSize * 2).map((c) => c._id),
    ].filter((group) => group.length > 0); // Remove empty batches

    const batchNames = ["Batch A", "Batch B", "Batch C"] as const;

    // Cascade window: each batch gets 1/3 of the campaign duration
    const cascadeWindowMs =
      (campaign.durationHours * 60 * 60 * 1000) / batchGroups.length;

    const batchIds: Id<"batches">[] = [];

    for (let i = 0; i < batchGroups.length; i++) {
      const batchId = await ctx.db.insert("batches", {
        campaignId: args.campaignId,
        batchIndex: i,
        name: batchNames[i],
        creatorIds: batchGroups[i],
        status: i === 0 ? "dispatched" : "pending",
        dispatchedAt: i === 0 ? Date.now() : undefined,
        cascadeAfterMs: cascadeWindowMs,
      });
      batchIds.push(batchId);
    }

    // Dispatch Batch A immediately (create offers)
    if (batchIds.length > 0) {
      await ctx.scheduler.runAfter(0, internal.batches.dispatchBatch, {
        batchId: batchIds[0],
        campaignId: args.campaignId,
      });

      // Schedule cascade check after the first window
      await ctx.scheduler.runAfter(
        cascadeWindowMs,
        internal.batches.checkAndCascade,
        { campaignId: args.campaignId }
      );
    }
  },
});
