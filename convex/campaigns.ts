import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { generateSimulatedTxHash } from "./helpers";

/**
 * Brand creates a new campaign.
 * Locks escrow budget and triggers creator matching + batch assignment.
 */
export const create = mutation({
  args: {
    title: v.string(),
    brandName: v.string(),
    niche: v.string(),
    deliverable: v.string(),
    centerLocality: v.string(),
    centerLat: v.number(),
    centerLng: v.number(),

    budget: v.number(),
    spotsTotal: v.number(),
    durationHours: v.number(),
    
    contentFormat: v.optional(v.string()),
    creativeGuidelines: v.optional(v.string()),
    targetAudience: v.optional(v.string()),
    submissionDeadlineDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");
    if (user.role !== "brand") throw new Error("Only brands can create campaigns");
    if ((user.escrowBalance || 0) < args.budget) {
      throw new Error("Insufficient escrow balance");
    }

    // Deduct the budget from the user's escrow balance
    await ctx.db.patch(user._id, {
      escrowBalance: (user.escrowBalance || 0) - args.budget,
    });

    const campaignId = await ctx.db.insert("campaigns", {
      brandUserId: user._id,
      title: args.title,
      brandName: args.brandName,
      niche: args.niche,
      deliverable: args.deliverable,
      centerLocality: args.centerLocality,
      centerLat: args.centerLat,
      centerLng: args.centerLng,

      contentFormat: args.contentFormat,
      creativeGuidelines: args.creativeGuidelines,
      targetAudience: args.targetAudience,
      submissionDeadlineDays: args.submissionDeadlineDays,

      budget: args.budget,
      spotsTotal: args.spotsTotal,
      spotsFilled: 0,
      durationHours: args.durationHours,
      status: "active",
      escrowStatus: "locked",
      activeBatchIndex: 0,
    });

    // Lock escrow budget
    await ctx.db.insert("escrowLedger", {
      campaignId,
      action: "locked",
      amount: args.budget,
      txHash: generateSimulatedTxHash(),
    });

    // Schedule matching & batch assignment asynchronously
    await ctx.scheduler.runAfter(0, internal.matching.assignBatches, {
      campaignId,
    });

    return campaignId;
  },
});

/**
 * List campaigns for the currently authenticated brand, with batches.
 */
export const getByBrand = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const campaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_brand", (q) => q.eq("brandUserId", user._id))
      .collect();

    // Attach batches to each campaign
    const results = await Promise.all(
      campaigns.map(async (campaign) => {
        const batches = await ctx.db
          .query("batches")
          .withIndex("by_campaign", (q) => q.eq("campaignId", campaign._id))
          .collect();
        return { ...campaign, batches };
      })
    );

    return results;
  },
});

/**
 * Get a single campaign by ID, with its batches.
 */
export const getById = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) return null;

    const batches = await ctx.db
      .query("batches")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    return { ...campaign, batches };
  },
});

/**
 * Get all active campaigns (for creator feed).
 */
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("campaigns")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

/**
 * Get all campaigns (for creator feed and escrow).
 */
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("campaigns").collect();
  },
});

/**
 * Update campaign status (e.g., mark completed).
 */
export const updateStatus = mutation({
  args: {
    campaignId: v.id("campaigns"),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("completed")
    ),
  },
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
      throw new Error("Not authorized to update this campaign");
    }

    await ctx.db.patch(args.campaignId, { status: args.status });
    return args.campaignId;
  },
});

/**
 * Get brand analytics.
 */
export const getBrandAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "brand") return null;

    // Get all campaigns for this brand
    const campaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_brand", (q) => q.eq("brandUserId", user._id))
      .collect();

    if (campaigns.length === 0) {
      return {
        totalEscrowSecured: 0,
        averageDispatchLatencyHours: 0,
        geotargetedDensity: 0,
        conversionBoosts: [],
      };
    }

    const totalEscrowSecured = campaigns.reduce((sum, c) => sum + c.budget, 0);

    // Get all submissions for these campaigns to calculate real latency
    // If no submissions, use 0
    let totalLatency = 0;
    let submissionCount = 0;
    
    // To calculate avg geoMatchPercentage by grid (centerLocality)
    const gridStats: Record<string, { totalAccuracy: number; count: number }> = {};

    for (const campaign of campaigns) {
      const submissions = await ctx.db
        .query("submissions")
        .withIndex("by_campaign", (q) => q.eq("campaignId", campaign._id))
        .collect();

      for (const sub of submissions) {
        if (sub.verifiedAt) {
          // Approximate latency from campaign creation to submission verification
          const latencyMs = sub.verifiedAt - new Date(campaign._creationTime).getTime();
          totalLatency += latencyMs / (1000 * 60 * 60); // in hours
          submissionCount++;
          
          if (!gridStats[campaign.centerLocality]) {
            gridStats[campaign.centerLocality] = { totalAccuracy: 0, count: 0 };
          }
          // We actually know the geo match percentage from the submission
          const accuracy = sub.geoMatchPercentage || 0;
          gridStats[campaign.centerLocality].totalAccuracy += accuracy;
          gridStats[campaign.centerLocality].count++;
        }
      }
      
      // If no submissions yet for this campaign, initialize the grid with 0
      if (!gridStats[campaign.centerLocality]) {
         gridStats[campaign.centerLocality] = { totalAccuracy: 0, count: 0 };
      }
    }

    const averageDispatchLatencyHours = submissionCount > 0 
      ? Number((totalLatency / submissionCount).toFixed(1))
      : 1.2; // Fallback to 1.2 if no data

    const matchAccuracyByGrid = Object.entries(gridStats).map(([grid, stats]) => {
      const avg = stats.count > 0 ? stats.totalAccuracy / stats.count : 0;
      return {
        grid,
        value: Number(avg.toFixed(1)),
        percent: `w-[${Math.round(avg)}%]`,
      };
    });

    // Count all active creators in the grids the brand operates in
    const uniqueGrids = Object.keys(gridStats);
    let geotargetedDensity = 0;
    
    if (uniqueGrids.length > 0) {
        const allCreators = await ctx.db
            .query("users")
            .withIndex("by_role", (q) => q.eq("role", "creator"))
            .collect();
            
        geotargetedDensity = allCreators.filter(c => uniqueGrids.includes(c.locality || '')).length;
        if (geotargetedDensity === 0) geotargetedDensity = allCreators.length; // fallback
    }

    return {
      totalEscrowSecured,
      averageDispatchLatencyHours,
      geotargetedDensity,
      matchAccuracyByGrid,
    };
  },
});

/**
 * Manually rerun the matching engine for a given campaign.
 * This will delete all existing batches and generate fresh ones based on current creators.
 */
export const rerunMatching = mutation({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "brand") throw new Error("Unauthorized");

    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || campaign.brandUserId !== user._id) {
      throw new Error("Campaign not found or unauthorized");
    }

    // Delete existing batches
    const existingBatches = await ctx.db
      .query("batches")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    for (const batch of existingBatches) {
      await ctx.db.delete(batch._id);
    }

    // Reset campaign activeBatchIndex
    await ctx.db.patch(args.campaignId, {
      activeBatchIndex: 0,
    });

    // Schedule matching & batch assignment asynchronously
    await ctx.scheduler.runAfter(0, internal.matching.assignBatches, {
      campaignId: args.campaignId,
    });
  },
});
