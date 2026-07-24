import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * Submit a rating for the other party once a collab has closed.
 * "Closed" = the submission has been approved (which is also what
 * triggers escrow release in submissions.approve). Each side can rate
 * once per submission — brand → creator, and creator → brand.
 */
export const submit = mutation({
  args: {
    submissionId: v.id("submissions"),
    stars: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!Number.isInteger(args.stars) || args.stars < 1 || args.stars > 5) {
      throw new Error("Rating must be a whole number from 1 to 5.");
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new Error("Submission not found");
    if (submission.status !== "approved") {
      throw new Error("You can only rate after the collab has been approved.");
    }

    const campaign = await ctx.db.get(submission.campaignId);
    if (!campaign) throw new Error("Campaign not found");

    let direction: "brand_to_creator" | "creator_to_brand";
    let ratedUserId;

    if (campaign.brandUserId === user._id) {
      direction = "brand_to_creator";
      ratedUserId = submission.creatorUserId;
    } else if (submission.creatorUserId === user._id) {
      direction = "creator_to_brand";
      ratedUserId = campaign.brandUserId;
    } else {
      throw new Error("Only the brand or the creator on this collab can rate it.");
    }

    const existing = await ctx.db
      .query("ratings")
      .withIndex("by_submission_and_direction", (q) =>
        q.eq("submissionId", args.submissionId).eq("direction", direction)
      )
      .unique();
    if (existing) throw new Error("You've already rated this collab.");

    return await ctx.db.insert("ratings", {
      submissionId: args.submissionId,
      campaignId: submission.campaignId,
      raterUserId: user._id,
      ratedUserId,
      direction,
      stars: args.stars,
      comment: args.comment,
    });
  },
});

/**
 * Whether the current user has already rated a given submission, and
 * what the "other side" rating (if any) looks like — used to gate the
 * rating UI without letting the client infer stars before submitting.
 */
export const getMyRatingStatus = query({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { canRate: false, alreadyRated: false, direction: null };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return { canRate: false, alreadyRated: false, direction: null };

    const submission = await ctx.db.get(args.submissionId);
    if (!submission || submission.status !== "approved") {
      return { canRate: false, alreadyRated: false, direction: null };
    }

    const campaign = await ctx.db.get(submission.campaignId);
    if (!campaign) return { canRate: false, alreadyRated: false, direction: null };

    let direction: "brand_to_creator" | "creator_to_brand" | null = null;
    if (campaign.brandUserId === user._id) direction = "brand_to_creator";
    else if (submission.creatorUserId === user._id) direction = "creator_to_brand";

    if (!direction) return { canRate: false, alreadyRated: false, direction: null };

    const existing = await ctx.db
      .query("ratings")
      .withIndex("by_submission_and_direction", (q) =>
        q.eq("submissionId", args.submissionId).eq("direction", direction!)
      )
      .unique();

    return {
      canRate: !existing,
      alreadyRated: !!existing,
      direction,
      myRating: existing ?? null,
    };
  },
});

/**
 * Average rating + count + recent comments for a given user (brand or
 * creator), for display on their profile.
 */
export const getForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_rated_user", (q) => q.eq("ratedUserId", args.userId))
      .collect();

    if (ratings.length === 0) {
      return { average: null, count: 0, recent: [] };
    }

    const average =
      ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length;

    const recent = [...ratings]
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 10)
      .map((r) => ({ stars: r.stars, comment: r.comment, at: r._creationTime }));

    return { average: Number(average.toFixed(2)), count: ratings.length, recent };
  },
});
