import { mutation } from "./_generated/server";
import { generateSimulatedTxHash } from "./helpers";

/**
 * Seed the database with demo data for development.
 * Creates 6 creators, 1 brand, and 2 sample campaigns with batches.
 * Idempotent — checks if data already exists before inserting.
 */
export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if seed data already exists
    const existingUsers = await ctx.db.query("users").first();
    if (existingUsers) {
      return { message: "Database already seeded. Skipping." };
    }

    // ── Create 6 demo creators ────────────────────────────────────────

    const aarav = await ctx.db.insert("users", {
      clerkId: "demo_aarav_sharma",
      role: "creator",
      name: "Aarav Sharma",
      email: "aarav@demo.radius.app",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
      handle: "@aarav.eats",
      locality: "South Delhi Saket",
      lat: 28.5276,
      lng: 77.2197,
      audienceInLocality: 89,
      niche: "Food & Lifestyle",
      followers: "42K",
      latencyHours: 1,
      velocityTier: "Velocity",
      bio: "Delhi food explorer & lifestyle creator. Saket local 🍽️",
      pastWork: [
        { brand: "Blue Tokai", type: "Cafe Review", imgUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&q=80" },
        { brand: "Third Wave", type: "Menu Launch", imgUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80" }
      ],
    });

    const priya = await ctx.db.insert("users", {
      clerkId: "demo_priya_patel",
      role: "creator",
      name: "Priya Patel",
      email: "priya@demo.radius.app",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
      handle: "@priya.fits",
      locality: "Connaught Place",
      lat: 28.6304,
      lng: 77.2177,
      audienceInLocality: 84,
      niche: "Fashion & Aesthetics",
      followers: "28K",
      latencyHours: 2,
      velocityTier: "Free",
      bio: "CP fashionista. Street style meets high fashion 👗",
      pastWork: [
        { brand: "Zara CP", type: "Store Visit", imgUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=400&q=80" },
        { brand: "H&M", type: "Try-on Haul", imgUrl: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=400&q=80" }
      ],
    });

    const kabir = await ctx.db.insert("users", {
      clerkId: "demo_kabir_malhotra",
      role: "creator",
      name: "Kabir Malhotra",
      email: "kabir@demo.radius.app",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
      handle: "@kabir.tech",
      locality: "Noida Sector 62",
      lat: 28.5708,
      lng: 77.3261,
      audienceInLocality: 76,
      niche: "Tech & Gaming",
      followers: "85K",
      latencyHours: 3,
      velocityTier: "Velocity",
      bio: "Tech reviewer & gamer. Noida's gadget guy 🎮",
    });

    const ananya = await ctx.db.insert("users", {
      clerkId: "demo_ananya_sen",
      role: "creator",
      name: "Ananya Sen",
      email: "ananya@demo.radius.app",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
      handle: "@ananya.visuals",
      locality: "West Delhi Dwarka",
      lat: 28.5921,
      lng: 77.0622,
      audienceInLocality: 81,
      niche: "Photography & Art",
      followers: "19K",
      latencyHours: 2,
      velocityTier: "Free",
      bio: "Visual storyteller. Capturing Dwarka's hidden gems 📸",
    });

    const rohan = await ctx.db.insert("users", {
      clerkId: "demo_rohan_gupta",
      role: "creator",
      name: "Rohan Gupta",
      email: "rohan@demo.radius.app",
      avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80",
      handle: "@rohan_vlogs",
      locality: "North Delhi DU",
      lat: 28.6942,
      lng: 77.2090,
      audienceInLocality: 93,
      niche: "Food & Lifestyle",
      followers: "56K",
      latencyHours: 1,
      velocityTier: "Velocity",
      bio: "DU vlogger. Food, campus life & North Delhi vibes 🎬",
    });

    const riya = await ctx.db.insert("users", {
      clerkId: "demo_riya_verma",
      role: "creator",
      name: "Riya Verma",
      email: "riya@demo.radius.app",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80",
      handle: "@riya_chic",
      locality: "Gurgaon DLF Phase 3",
      lat: 28.4901,
      lng: 77.0901,
      audienceInLocality: 79,
      niche: "Fashion & Aesthetics",
      followers: "33K",
      latencyHours: 4,
      velocityTier: "Free",
      bio: "Gurgaon's fashion diary. Style tips & hauls 💅",
    });

    // ── Create 1 demo brand ───────────────────────────────────────────

    const brandUser = await ctx.db.insert("users", {
      clerkId: "demo_brand_zomato",
      role: "brand",
      name: "Zomato Marketing",
      email: "campaigns@zomato.demo",
      brandName: "Zomato",
      domain: "zomato.com",
      sector: "Food & Delivery",
    });

    // ── Create 2 sample campaigns ─────────────────────────────────────

    const campaign1 = await ctx.db.insert("campaigns", {
      brandUserId: brandUser,
      title: "Delhi Street Food Festival 2026",
      brandName: "Zomato",
      niche: "Food & Lifestyle",
      deliverable: "1 Reel + 2 Stories featuring local street food",
      centerLocality: "Connaught Place, New Delhi",
      centerLat: 28.6315,
      centerLng: 77.2167,

      budget: 150000,
      spotsTotal: 4,
      spotsFilled: 0,
      durationHours: 72,
      status: "active",
      escrowStatus: "locked",
      activeBatchIndex: 0,
    });

    // Escrow entry for campaign 1
    await ctx.db.insert("escrowLedger", {
      campaignId: campaign1,
      action: "locked",
      amount: 150000,
      txHash: generateSimulatedTxHash(),
    });

    // Batches for campaign 1
    const batch1A = await ctx.db.insert("batches", {
      campaignId: campaign1,
      batchIndex: 0,
      name: "Batch A",
      creatorIds: [rohan, aarav], // Velocity + Food niche
      status: "dispatched",
      dispatchedAt: Date.now(),
      cascadeAfterMs: 24 * 60 * 60 * 1000, // 24 hours
    });

    await ctx.db.insert("batches", {
      campaignId: campaign1,
      batchIndex: 1,
      name: "Batch B",
      creatorIds: [priya, ananya],
      status: "pending",
      cascadeAfterMs: 24 * 60 * 60 * 1000,
    });

    await ctx.db.insert("batches", {
      campaignId: campaign1,
      batchIndex: 2,
      name: "Batch C",
      creatorIds: [kabir, riya],
      status: "pending",
      cascadeAfterMs: 24 * 60 * 60 * 1000,
    });

    // Offers for Batch A of campaign 1
    await ctx.db.insert("campaignOffers", {
      campaignId: campaign1,
      batchId: batch1A,
      creatorUserId: rohan,
      status: "pending",
    });

    await ctx.db.insert("campaignOffers", {
      campaignId: campaign1,
      batchId: batch1A,
      creatorUserId: aarav,
      status: "pending",
    });

    // Campaign 2
    const campaign2 = await ctx.db.insert("campaigns", {
      brandUserId: brandUser,
      title: "Monsoon Fashion Drop — NCR",
      brandName: "Zomato",
      niche: "Fashion & Aesthetics",
      deliverable: "1 Carousel Post + 1 Reel showcasing monsoon outfits",
      centerLocality: "Gurgaon Cyber Hub",
      centerLat: 28.4949,
      centerLng: 77.0886,

      budget: 200000,
      spotsTotal: 3,
      spotsFilled: 0,
      durationHours: 48,
      status: "active",
      escrowStatus: "locked",
      activeBatchIndex: 0,
    });

    // Escrow entry for campaign 2
    await ctx.db.insert("escrowLedger", {
      campaignId: campaign2,
      action: "locked",
      amount: 200000,
      txHash: generateSimulatedTxHash(),
    });

    // Batches for campaign 2
    const batch2A = await ctx.db.insert("batches", {
      campaignId: campaign2,
      batchIndex: 0,
      name: "Batch A",
      creatorIds: [riya, priya],
      status: "dispatched",
      dispatchedAt: Date.now(),
      cascadeAfterMs: 16 * 60 * 60 * 1000, // 16 hours
    });

    await ctx.db.insert("batches", {
      campaignId: campaign2,
      batchIndex: 1,
      name: "Batch B",
      creatorIds: [ananya],
      status: "pending",
      cascadeAfterMs: 16 * 60 * 60 * 1000,
    });

    // Offers for Batch A of campaign 2
    await ctx.db.insert("campaignOffers", {
      campaignId: campaign2,
      batchId: batch2A,
      creatorUserId: riya,
      status: "pending",
    });

    await ctx.db.insert("campaignOffers", {
      campaignId: campaign2,
      batchId: batch2A,
      creatorUserId: priya,
      status: "pending",
    });

    return {
      message: "Database seeded successfully!",
      data: {
        creators: 6,
        brands: 1,
        campaigns: 2,
        batches: 5,
        offers: 4,
      },
    };
  },
});
