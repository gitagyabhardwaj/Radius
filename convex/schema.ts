import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ── Users (synced from Clerk) ──────────────────────────────────────
  users: defineTable({
    clerkId: v.string(),
    role: v.union(v.literal("brand"), v.literal("creator")),
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    // Brand-specific fields
    brandName: v.optional(v.string()),
    domain: v.optional(v.string()),
    sector: v.optional(v.string()),
    escrowBalance: v.optional(v.number()),
    // Creator-specific fields
    handle: v.optional(v.string()),
    locality: v.optional(v.string()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    audienceInLocality: v.optional(v.number()), // 0-100 percentage
    niche: v.optional(v.string()),
    followers: v.optional(v.string()),
    latencyHours: v.optional(v.number()),
    velocityTier: v.optional(
      v.union(v.literal("Free"), v.literal("Velocity"))
    ),
    pastWork: v.optional(
      v.array(
        v.object({
          brand: v.string(),
          type: v.string(),
          imgUrl: v.string(),
        })
      )
    ),
    bio: v.optional(v.string()),
    acceptedCampaignIds: v.optional(v.array(v.id("campaigns"))),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_role", ["role"]),

  // ── Campaigns ──────────────────────────────────────────────────────
  campaigns: defineTable({
    brandUserId: v.id("users"),
    title: v.string(),
    brandName: v.string(),
    niche: v.string(),
    deliverable: v.string(), // acts as description / goal
    contentFormat: v.optional(v.string()),
    creativeGuidelines: v.optional(v.string()),
    targetAudience: v.optional(v.string()),
    submissionDeadlineDays: v.optional(v.number()),
    centerLocality: v.string(),
    centerLat: v.number(),
    centerLng: v.number(),
    radiusKm: v.optional(v.number()), // Deprecated — kept for existing data compatibility

    budget: v.number(),
    spotsTotal: v.number(),
    spotsFilled: v.number(),
    durationHours: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("completed")
    ),
    escrowStatus: v.union(
      v.literal("none"),
      v.literal("locked"),
      v.literal("content_submitted"),
      v.literal("verifying"),
      v.literal("released")
    ),
    activeBatchIndex: v.number(),
  })
    .index("by_brand", ["brandUserId"])
    .index("by_status", ["status"]),

  // ── Batches ────────────────────────────────────────────────────────
  batches: defineTable({
    campaignId: v.id("campaigns"),
    batchIndex: v.number(),
    name: v.union(
      v.literal("Batch A"),
      v.literal("Batch B"),
      v.literal("Batch C")
    ),
    creatorIds: v.array(v.id("users")),
    status: v.union(
      v.literal("pending"),
      v.literal("dispatched"),
      v.literal("completed"),
      v.literal("cascaded")
    ),
    dispatchedAt: v.optional(v.number()),
    cascadeAfterMs: v.number(),
  }).index("by_campaign", ["campaignId"]),

  // ── Campaign Offers ────────────────────────────────────────────────
  campaignOffers: defineTable({
    campaignId: v.id("campaigns"),
    batchId: v.id("batches"),
    creatorUserId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("brand_review"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("expired")
    ),
    respondedAt: v.optional(v.number()),
  })
    .index("by_creator", ["creatorUserId"])
    .index("by_campaign", ["campaignId"])
    .index("by_batch", ["batchId"]),

  // ── Submissions ────────────────────────────────────────────────────
  submissions: defineTable({
    campaignId: v.id("campaigns"),
    creatorUserId: v.id("users"),
    fileId: v.id("_storage"),
    contentUrl: v.optional(v.string()), // link to the live reel/story/post
    caption: v.optional(v.string()),
    status: v.union(
      v.literal("uploaded"),
      v.literal("verifying"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    rejectionReason: v.optional(v.string()),
    engagementScore: v.optional(v.number()),
    geoMatchPercentage: v.optional(v.number()),
    verifiedAt: v.optional(v.number()),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_creator", ["creatorUserId"]),

  // ── Escrow Ledger ──────────────────────────────────────────────────
  escrowLedger: defineTable({
    campaignId: v.id("campaigns"),
    creatorUserId: v.optional(v.id("users")),
    action: v.union(
      v.literal("locked"),
      v.literal("submitted"),
      v.literal("verifying"),
      v.literal("released"),
      v.literal("refunded")
    ),
    amount: v.number(),
    txHash: v.string(),
  }).index("by_campaign", ["campaignId"]),

  // ── Ratings ────────────────────────────────────────────────────────
  // One row per (submission, direction). A collab produces up to two rows:
  // the brand rating the creator, and the creator rating the brand. Only
  // writable once a submission is "approved" — i.e. the collab has closed.
  ratings: defineTable({
    submissionId: v.id("submissions"),
    campaignId: v.id("campaigns"),
    raterUserId: v.id("users"),
    ratedUserId: v.id("users"),
    direction: v.union(
      v.literal("brand_to_creator"),
      v.literal("creator_to_brand")
    ),
    stars: v.number(), // 1-5
    comment: v.optional(v.string()),
  })
    .index("by_submission_and_direction", ["submissionId", "direction"])
    .index("by_rated_user", ["ratedUserId"]),
});
