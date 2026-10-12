import { v } from "convex/values";
import { query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Internal: Dispatch a batch — create individual campaign offers for
 * each creator in the batch.
 */
export const dispatchBatch = internalMutation({
  args: {
    batchId: v.id("batches"),
    campaignId: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    const batch = await ctx.db.get(args.batchId);
    if (!batch) throw new Error("Batch not found");

    // Mark batch as dispatched if not already
    if (batch.status !== "dispatched") {
      await ctx.db.patch(args.batchId, {
        status: "dispatched",
        dispatchedAt: Date.now(),
      });
    }

    // Create an offer for each creator in this batch
    for (const creatorId of batch.creatorIds) {
      // Check if offer already exists (idempotency)
      const existing = await ctx.db
        .query("campaignOffers")
        .withIndex("by_batch", (q) => q.eq("batchId", args.batchId))
        .collect();

      const alreadyHasOffer = existing.some(
        (o) => o.creatorUserId === creatorId
      );

      if (!alreadyHasOffer) {
        await ctx.db.insert("campaignOffers", {
          campaignId: args.campaignId,
          batchId: args.batchId,
          creatorUserId: creatorId,
          status: "pending",
        });
      }
    }

    // Update campaign's active batch index
    await ctx.db.patch(args.campaignId, {
      activeBatchIndex: batch.batchIndex,
    });
  },
});

/**
 * Internal: Scheduled cascade check.
 * If the active batch has timed out (not enough accepts), cascade to next batch.
 */
export const checkAndCascade = internalMutation({
  args: { 
    campaignId: v.id("campaigns"),
    immediate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) return;

    // Skip if campaign is no longer active
    if (campaign.status !== "active") return;

    // All spots filled — no need to cascade
    if (campaign.spotsFilled >= campaign.spotsTotal) return;

    // Get all batches for this campaign, sorted by index
    const batches = await ctx.db
      .query("batches")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    batches.sort((a, b) => a.batchIndex - b.batchIndex);

    // Find the currently dispatched batch
    const activeBatch = batches.find((b) => b.status === "dispatched");
    if (!activeBatch) return;

    // Check if the cascade window has elapsed (unless forced immediately)
    if (!args.immediate) {
      const elapsed = Date.now() - (activeBatch.dispatchedAt ?? 0);
      if (elapsed < activeBatch.cascadeAfterMs) {
        // Not yet time — reschedule
        const remaining = activeBatch.cascadeAfterMs - elapsed;
        await ctx.scheduler.runAfter(
          remaining,
          internal.batches.checkAndCascade,
          { campaignId: args.campaignId }
        );
        return;
      }
    }

    // Expire any pending offers in the current batch
    const offers = await ctx.db
      .query("campaignOffers")
      .withIndex("by_batch", (q) => q.eq("batchId", activeBatch._id))
      .collect();

    for (const offer of offers) {
      if (offer.status === "pending") {
        await ctx.db.patch(offer._id, { status: "expired" });
      }
    }

    // Mark current batch as cascaded
    await ctx.db.patch(activeBatch._id, { status: "cascaded" });

    // Find next pending batch
    const nextBatch = batches.find(
      (b) => b.batchIndex > activeBatch.batchIndex && b.status === "pending"
    );

    if (nextBatch) {
      // Dispatch next batch
      await ctx.scheduler.runAfter(0, internal.batches.dispatchBatch, {
        batchId: nextBatch._id,
        campaignId: args.campaignId,
      });

      // Schedule next cascade check
      await ctx.scheduler.runAfter(
        nextBatch.cascadeAfterMs,
        internal.batches.checkAndCascade,
        { campaignId: args.campaignId }
      );
    } else {
      // All batches exhausted — campaign may need attention
      // Optionally mark campaign if not enough spots filled
      if (campaign.spotsFilled < campaign.spotsTotal) {
        // Campaign under-filled but all batches exhausted — keep active
        // Brand can decide to close or extend
      }
    }
  },
});

/**
 * Get all batches for a campaign (public query).
 */
export const getByCampaign = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("batches")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();
  },
});

/**
 * Get all batches (used by the frontend to join with campaigns).
 */
export const getAllBatches = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("batches").collect();
  },
});

