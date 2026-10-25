import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * Get the currently authenticated user from the database.
 * Returns null if the user hasn't been created yet.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user;
  },
});

/**
 * Get a user by their Convex document ID.
 */
export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

/**
 * Create or update a user record synced from Clerk identity.
 * Called after sign-in / sign-up to ensure the DB row exists.
 */
export const createOrUpdateUser = mutation({
  args: {
    role: v.union(v.literal("brand"), v.literal("creator")),
    name: v.string(),
    brandName: v.optional(v.string()),
    domain: v.optional(v.string()),
    sector: v.optional(v.string()),
    escrowBalance: v.optional(v.number()),
    contactPerson: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    teamMembers: v.optional(
      v.array(
        v.object({
          name: v.string(),
          email: v.string(),
          role: v.string(),
        })
      )
    ),
    website: v.optional(v.string()),
    instagramHandle: v.optional(v.string()),
    otherSocialLinks: v.optional(
      v.array(
        v.object({
          platform: v.string(),
          url: v.string(),
        })
      )
    ),
    brandBio: v.optional(v.string()),
    brandAssets: v.optional(
      v.object({
        logoUrl: v.optional(v.string()),
        productImages: v.optional(v.array(v.string())),
        guidelinesDocUrl: v.optional(v.string()),
      })
    ),
    // Creator fields
    handle: v.optional(v.string()),
    locality: v.optional(v.string()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    audienceInLocality: v.optional(v.number()),
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existing) {
      const updates: Record<string, unknown> = {
        ...args,
        email: identity.email ?? existing.email,
        avatarUrl: identity.pictureUrl ?? existing.avatarUrl,
      };
      if (existing.escrowBalance === undefined || existing.escrowBalance < 10000) {
        updates.escrowBalance = 100000;
      }
      await ctx.db.patch(existing._id, updates);
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email ?? "",
      avatarUrl: identity.pictureUrl,
      ...args,
      escrowBalance: args.escrowBalance ?? 100000,
    });
  },
});

/**
 * Update profile fields for the currently authenticated user.
 */
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    brandName: v.optional(v.string()),
    domain: v.optional(v.string()),
    sector: v.optional(v.string()),
    escrowBalance: v.optional(v.number()),
    contactPerson: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    teamMembers: v.optional(
      v.array(
        v.object({
          name: v.string(),
          email: v.string(),
          role: v.string(),
        })
      )
    ),
    website: v.optional(v.string()),
    instagramHandle: v.optional(v.string()),
    otherSocialLinks: v.optional(
      v.array(
        v.object({
          platform: v.string(),
          url: v.string(),
        })
      )
    ),
    brandBio: v.optional(v.string()),
    brandAssets: v.optional(
      v.object({
        logoUrl: v.optional(v.string()),
        productImages: v.optional(v.array(v.string())),
        guidelinesDocUrl: v.optional(v.string()),
      })
    ),
    handle: v.optional(v.string()),
    locality: v.optional(v.string()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    audienceInLocality: v.optional(v.number()),
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
    upiId: v.optional(v.string()),
    audienceCities: v.optional(
      v.array(
        v.object({
          name: v.string(),
          count: v.optional(v.number()),
          percentage: v.number(),
        })
      )
    ),
    instagramConnected: v.optional(v.boolean()),
    instagramId: v.optional(v.string()),
    instagramUsername: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Filter out undefined values so we only patch provided fields
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(args)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }

    await ctx.db.patch(user._id, updates);
    return user._id;
  },
});

/**
 * Mutation to save Instagram demographics directly for a user (called after Meta OAuth exchange).
 */
export const saveInstagramData = mutation({
  args: {
    userId: v.id("users"),
    handle: v.optional(v.string()),
    followers: v.optional(v.string()),
    audienceInLocality: v.optional(v.number()),
    audienceCities: v.optional(
      v.array(
        v.object({
          name: v.string(),
          count: v.optional(v.number()),
          percentage: v.number(),
        })
      )
    ),
    instagramConnected: v.boolean(),
    instagramId: v.optional(v.string()),
    instagramUsername: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    const cleanUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }
    await ctx.db.patch(userId, cleanUpdates);
    return true;
  },
});

/**
 * List all users with role 'creator'.
 */
export const getAllCreators = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "creator"))
      .collect();
  },
});

export const acceptCampaign = mutation({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");
    if (user.role !== "creator") throw new Error("Only creators can accept campaigns");

    const existing = user.acceptedCampaignIds || [];
    if (!existing.includes(args.campaignId)) {
      await ctx.db.patch(user._id, {
        acceptedCampaignIds: [...existing, args.campaignId],
      });
      
      const campaign = await ctx.db.get(args.campaignId);
      if (campaign) {
        await ctx.db.patch(args.campaignId, {
          spotsFilled: campaign.spotsFilled + 1,
        });
      }
    }
  },
});

/**
 * Delete the currently authenticated user's profile.
 */
export const deleteCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});

/**
 * Credit the currently authenticated user's escrow balance.
 */
export const creditEscrow = mutation({
  args: { 
    amount: v.number(),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let user = null;
    if (args.userId) {
      user = await ctx.db.get(args.userId);
    } else {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Not authenticated");
      user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();
    }

    if (!user) throw new Error("User not found");

    const currentBalance = (user.escrowBalance && user.escrowBalance > 0) ? user.escrowBalance : 0;
    const newBalance = currentBalance + args.amount;
    await ctx.db.patch(user._id, {
      escrowBalance: newBalance,
    });
    return newBalance;
  },
});
