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
 * Record a submission after the creator uploads content.
 */
export const create = mutation({
  args: {
    campaignId: v.id("campaigns"),
    fileId: v.id("_storage"),
    contentUrl: v.optional(v.string()),
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
      // If no accepted offer, check if there's a pending one and auto-accept it for a smoother UX
      const pendingOffer = offers.find(
        (o) => o.campaignId === args.campaignId && o.status === "pending"
      );

      if (pendingOffer) {
        // Auto-accept it
        await ctx.db.patch(pendingOffer._id, {
          status: "accepted",
          respondedAt: Date.now(),
        });
        
        const campaign = await ctx.db.get(args.campaignId);
        if (campaign) {
          await ctx.db.patch(args.campaignId, {
            spotsFilled: campaign.spotsFilled + 1,
          });
          
          if (campaign.spotsFilled + 1 >= campaign.spotsTotal) {
            const batch = await ctx.db.get(pendingOffer.batchId);
            if (batch && batch.status === "dispatched") {
              await ctx.db.patch(pendingOffer.batchId, { status: "completed" });
            }
          }
        }
        
        acceptedOffer = { ...pendingOffer, status: "accepted" };
      } else {
        // For a seamless hackathon demo, if they have no offer at all, 
        // we will create an accepted offer on the fly.
        const campaign = await ctx.db.get(args.campaignId);
        if (!campaign) throw new Error("Campaign not found");
        
        const batches = await ctx.db
          .query("batches")
          .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
          .collect();
          
        let activeBatch = batches.find((b) => b.batchIndex === campaign.activeBatchIndex) || batches[0];
        
        if (!activeBatch) {
          // If no batches exist (e.g. they were never generated or campaign was manually seeded),
          // create a dummy 'Batch A' on the fly to satisfy the offer schema.
          const newBatchId = await ctx.db.insert("batches", {
            campaignId: args.campaignId,
            batchIndex: 0,
            name: "Batch A",
            creatorIds: [user._id],
            status: "pending",
            cascadeAfterMs: 3600000,
          });
          activeBatch = (await ctx.db.get(newBatchId))!;
        }

        const newOfferId = await ctx.db.insert("campaignOffers", {
          campaignId: args.campaignId,
          batchId: activeBatch._id,
          creatorUserId: user._id,
          status: "accepted",
        });

        const existing = user.acceptedCampaignIds || [];
        if (!existing.includes(args.campaignId)) {
          await ctx.db.patch(args.campaignId, {
            spotsFilled: campaign.spotsFilled + 1,
          });
        }

        acceptedOffer = { _id: newOfferId, campaignId: args.campaignId, batchId: activeBatch._id, creatorUserId: user._id, status: "accepted" as const, _creationTime: Date.now() };
      }
    }

    // Check for duplicate submission
    const existingSubmission = await ctx.db
      .query("submissions")
      .withIndex("by_creator", (q) => q.eq("creatorUserId", user._id))
      .collect();

    const alreadySubmitted = existingSubmission.some(
      (s) => s.campaignId === args.campaignId
    );

    if (alreadySubmitted) {
      throw new Error("You have already submitted content for this campaign.");
    }

    const submissionId = await ctx.db.insert("submissions", {
      campaignId: args.campaignId,
      creatorUserId: user._id,
      fileId: args.fileId,
      contentUrl: args.contentUrl,
      caption: args.caption,
      status: "uploaded",
    });

    // Update campaign escrow status
    await ctx.db.patch(args.campaignId, {
      escrowStatus: "content_submitted",
    });

    return submissionId;
  },
});

/**
 * Mark a submission as "in review" once the brand opens it to preview the
 * deliverable (the uploaded photo/video and/or the live reel/story link).
 * This is a manual, human-in-the-loop review — there is no EXIF or GPS
 * auto-check. The brand looks at the actual content and decides.
 */
export const startReview = mutation({
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

    if (!user || campaign.brandUserId !== user._id) {
      throw new Error("Only the campaign owner can review submissions");
    }

    await ctx.db.patch(args.submissionId, { status: "verifying" });
    await ctx.db.patch(submission.campaignId, { escrowStatus: "verifying" });

    return args.submissionId;
  },
});

/**
 * Approve a submission after the brand has previewed the actual deliverable.
 * Approval is what triggers escrow release — there is no automated
 * location/EXIF check standing in for the brand's judgment.
 */
export const approve = mutation({
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

    if (!user || campaign.brandUserId !== user._id) {
      throw new Error("Only the campaign owner can approve submissions");
    }

    // Sanity check: creator must still have an accepted offer for this campaign
    const offers = await ctx.db
      .query("campaignOffers")
      .withIndex("by_creator", (q) =>
        q.eq("creatorUserId", submission.creatorUserId)
      )
      .collect();

    const isAssigned = offers.some(
      (o) => o.campaignId === submission.campaignId && o.status === "accepted"
    );

    if (!isAssigned) {
      throw new Error("Creator does not have an accepted offer for this campaign");
    }

    const creator = await ctx.db.get(submission.creatorUserId);

    await ctx.db.patch(args.submissionId, {
      status: "approved",
      engagementScore: creator?.audienceInLocality ?? 0,
      verifiedAt: Date.now(),
    });

    // Approval is the trigger for escrow release
    await ctx.scheduler.runAfter(0, internal.escrow.releasePayout, {
      campaignId: submission.campaignId,
      creatorUserId: submission.creatorUserId,
      amount: campaign.budget / campaign.spotsTotal, // equal share
    });

    return args.submissionId;
  },
});

/**
 * Reject a submission after brand review (e.g. the deliverable doesn't
 * match the brief). No escrow is released; the creator can resubmit.
 */
export const reject = mutation({
  args: { submissionId: v.id("submissions"), reason: v.optional(v.string()) },
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

    if (!user || campaign.brandUserId !== user._id) {
      throw new Error("Only the campaign owner can reject submissions");
    }

    await ctx.db.patch(args.submissionId, {
      status: "rejected",
      rejectionReason: args.reason,
      verifiedAt: Date.now(),
    });

    await ctx.db.patch(submission.campaignId, {
      escrowStatus: "content_submitted",
    });

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

    // Enrich with campaign details + a viewable URL for the uploaded file
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

    // Enrich with creator details + a viewable URL for the uploaded file
    return await Promise.all(
      submissions.map(async (s) => {
        const creator = await ctx.db.get(s.creatorUserId);
        const fileUrl = await ctx.storage.getUrl(s.fileId);
        return { ...s, creator, fileUrl };
      })
    );
  },
});
