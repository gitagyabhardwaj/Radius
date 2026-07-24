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
