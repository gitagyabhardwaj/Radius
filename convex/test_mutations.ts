import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const setAcceptedCampaigns = internalMutation({
  args: { userId: v.id("users"), campaignIds: v.array(v.id("campaigns")) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      acceptedCampaignIds: args.campaignIds,
    });
  },
});

export const clearRatingsForUser = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_rated_user", (q) => q.eq("ratedUserId", args.userId))
      .collect();
    for (const r of ratings) {
      await ctx.db.delete(r._id);
    }
    return { deleted: ratings.length };
  },
});
