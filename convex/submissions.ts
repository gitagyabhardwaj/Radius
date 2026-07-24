import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Generate an upload URL for file storage.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Record a draft submission after the creator uploads content.
 */
export const submitDraft = mutation({
  args: {
    campaignId: v.id("campaigns"),
    fileId: v.id("_storage"),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Verify the creator has an accepted offer for this campaign
    const offers = await ctx.db
      .query("campaignOffers")
      .withIndex("by_creator", (q) => q.eq("creatorUserId", user._id))
      .collect();

    let acceptedOffer = offers.find(
      (o) => o.campaignId === args.campaignId && o.status === "accepted"
    );

    if (!acceptedOffer) {
      throw new Error("You must have an accepted offer before submitting.");
    }

    // Check for existing submission
    const existingSubmission = await ctx.db
      .query("submissions")
      .withIndex("by_creator", (q) => q.eq("creatorUserId", user._id))
      .collect()
      .then(res => res.find(s => s.campaignId === args.campaignId));

    if (existingSubmission) {
      if (["draft_uploaded", "draft_verifying", "draft_approved", "published_uploaded", "final_verifying", "approved"].includes(existingSubmission.status)) {
         throw new Error("Cannot submit a new draft at this stage.");
      }
      // If draft_rejected or rejected, they can re-upload draft.
      await ctx.db.patch(existingSubmission._id, {
        fileId: args.fileId,
        caption: args.caption,
        status: "draft_uploaded",
        rejectionReason: undefined,
      });
      await ctx.db.patch(args.campaignId, { escrowStatus: "draft_submitted" });
      return existingSubmission._id;
    }

    const submissionId = await ctx.db.insert("submissions", {
      campaignId: args.campaignId,
      creatorUserId: user._id,
      fileId: args.fileId,
      caption: args.caption,
      status: "draft_uploaded",
    });

    // Update campaign escrow status
    await ctx.db.patch(args.campaignId, {
      escrowStatus: "draft_submitted",
    });

    return submissionId;
  },
});

/**
 * Mark a draft submission as "in review" by the brand.
 */
export const startDraftReview = mutation({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new Error("Submission not found");
    const campaign = await ctx.db.get(submission.campaignId);
    if (!campaign) throw new Error("Campaign not found");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user || campaign.brandUserId !== user._id) throw new Error("Unauthorized");

    await ctx.db.patch(args.submissionId, { status: "draft_verifying" });
    await ctx.db.patch(submission.campaignId, { escrowStatus: "draft_verifying" });
    return args.submissionId;
  },
});

/**
 * Approve a draft submission.
 */
export const approveDraft = mutation({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new Error("Submission not found");
    const campaign = await ctx.db.get(submission.campaignId);
    if (!campaign) throw new Error("Campaign not found");
    const user = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject)).unique();
    if (!user || campaign.brandUserId !== user._id) throw new Error("Unauthorized");

    await ctx.db.patch(args.submissionId, { status: "draft_approved" });
    await ctx.db.patch(submission.campaignId, { escrowStatus: "draft_approved" });
    return args.submissionId;
  },
});

/**
 * Reject a draft submission.
 */
export const rejectDraft = mutation({
  args: { submissionId: v.id("submissions"), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new Error("Submission not found");
    const campaign = await ctx.db.get(submission.campaignId);
    if (!campaign) throw new Error("Campaign not found");
    const user = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject)).unique();
    if (!user || campaign.brandUserId !== user._id) throw new Error("Unauthorized");

    await ctx.db.patch(args.submissionId, { status: "draft_rejected", rejectionReason: args.reason });
    await ctx.db.patch(submission.campaignId, { escrowStatus: "locked" });
    return args.submissionId;
  },
});

/**
 * Creator submits the final published link.
 */
export const submitPublishedLink = mutation({
  args: {
    submissionId: v.id("submissions"),
    contentUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new Error("Submission not found");
    const user = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject)).unique();
    if (!user || submission.creatorUserId !== user._id) throw new Error("Unauthorized");

    if (submission.status !== "draft_approved" && submission.status !== "rejected") {
      throw new Error("Cannot submit published link at this stage.");
    }

    await ctx.db.patch(args.submissionId, {
      contentUrl: args.contentUrl,
      status: "published_uploaded",
      rejectionReason: undefined,
    });
    await ctx.db.patch(submission.campaignId, { escrowStatus: "published_link_submitted" });
    return args.submissionId;
  },
});

/**
 * Mark a final published link as "in review" by the brand.
 */
export const startFinalReview = mutation({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new Error("Submission not found");
    const campaign = await ctx.db.get(submission.campaignId);
    if (!campaign) throw new Error("Campaign not found");
    const user = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject)).unique();
    if (!user || campaign.brandUserId !== user._id) throw new Error("Unauthorized");

    await ctx.db.patch(args.submissionId, { status: "final_verifying" });
    await ctx.db.patch(submission.campaignId, { escrowStatus: "final_verifying" });
    return args.submissionId;
  },
});

/**
 * Approve the final published content. Releases Escrow.
 */
export const approveFinal = mutation({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new Error("Submission not found");
    const campaign = await ctx.db.get(submission.campaignId);
    if (!campaign) throw new Error("Campaign not found");
    const user = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject)).unique();
    if (!user || campaign.brandUserId !== user._id) throw new Error("Unauthorized");

    const creator = await ctx.db.get(submission.creatorUserId);

    await ctx.db.patch(args.submissionId, {
      status: "approved",
      engagementScore: creator?.audienceInLocality ?? 0,
      verifiedAt: Date.now(),
    });

    // Approval triggers escrow release
    await ctx.scheduler.runAfter(0, internal.escrow.releasePayout, {
      campaignId: submission.campaignId,
      creatorUserId: submission.creatorUserId,
      amount: campaign.budget / campaign.spotsTotal,
    });

    return args.submissionId;
  },
});

/**
 * Reject the final published content.
 */
export const rejectFinal = mutation({
  args: { submissionId: v.id("submissions"), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new Error("Submission not found");
    const campaign = await ctx.db.get(submission.campaignId);
    if (!campaign) throw new Error("Campaign not found");
    const user = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject)).unique();
    if (!user || campaign.brandUserId !== user._id) throw new Error("Unauthorized");

    await ctx.db.patch(args.submissionId, {
      status: "rejected",
      rejectionReason: args.reason,
      verifiedAt: Date.now(),
    });
    await ctx.db.patch(submission.campaignId, { escrowStatus: "draft_approved" }); // Revert so they can submit link again
    return args.submissionId;
  },
});

/**
 * Get all submissions by the current creator.
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

    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_creator", (q) => q.eq("creatorUserId", user._id))
      .collect();

    return await Promise.all(
      submissions.map(async (s) => {
        const campaign = await ctx.db.get(s.campaignId);
        const fileUrl = await ctx.storage.getUrl(s.fileId);
        return { ...s, campaign, fileUrl };
      })
    );
  },
});

/**
 * Get all submissions for a campaign.
 */
export const getByCampaign = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    return await Promise.all(
      submissions.map(async (s) => {
        const creator = await ctx.db.get(s.creatorUserId);
        const fileUrl = await ctx.storage.getUrl(s.fileId);
        return { ...s, creator, fileUrl };
      })
    );
  },
});
