"use node";

import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import crypto from "node:crypto";

const VELOCITY_TIER_AMOUNT_PAISE = 990 * 100; // ₹990/month, in paise

/**
 * Creates a Razorpay order on the server. The client never sees the key
 * secret — only the order id and the public key id come back.
 *
 * Requires these to be set via `npx convex env set`:
 *   RAZORPAY_KEY_ID
 *   RAZORPAY_KEY_SECRET
 */
export const createVelocityOrder = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error(
        "Razorpay is not configured — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET with `npx convex env set`."
      );
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: VELOCITY_TIER_AMOUNT_PAISE,
        currency: "INR",
        notes: { clerkId: identity.subject, product: "velocity_tier_monthly" },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Razorpay order creation failed: ${res.status} ${body}`);
    }

    const order = await res.json();

    return {
      orderId: order.id as string,
      amount: order.amount as number,
      currency: order.currency as string,
      keyId, // safe to expose — this is the public key, not the secret
    };
  },
});

/**
 * Verifies the Razorpay checkout response server-side (HMAC-SHA256 over
 * order_id|payment_id using the key secret) before granting the paid tier.
 * Never trust the client-side `handler` callback alone — it fires on any
 * "successful" checkout event the browser reports, which is trivial to
 * fake from devtools.
 */
export const verifyAndActivateVelocity = action({
  args: {
    razorpay_order_id: v.string(),
    razorpay_payment_id: v.string(),
    razorpay_signature: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new Error("RAZORPAY_KEY_SECRET is not configured.");
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${args.razorpay_order_id}|${args.razorpay_payment_id}`)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    const givenBuf = Buffer.from(args.razorpay_signature, "utf8");
    const isValid =
      expectedBuf.length === givenBuf.length &&
      crypto.timingSafeEqual(expectedBuf, givenBuf);

    if (!isValid) {
      return { verified: false };
    }

    // Only after verification succeeds do we grant the paid tier —
    // this reuses the existing auth-checked mutation.
    await ctx.runMutation(api.users.updateProfile, {
      velocityTier: "Velocity",
    });

    return { verified: true };
  },
});

export const createEscrowDepositOrder = action({
  args: { amount: v.number() },
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) return { error: "Not authenticated" };

      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      // ── Demo mode: return simulated order when keys aren't set ──
      if (!keyId || !keySecret) {
        const demoOrderId = `order_demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        return {
          orderId: demoOrderId,
          amount: Math.round(args.amount * 100),
          currency: "INR",
          keyId: "rzp_demo_key",
          demo: true,
        };
      }

      const amountPaise = Math.round(args.amount * 100);

      const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
      const res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: "INR",
          notes: { clerkId: identity.subject, product: "escrow_deposit" },
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        return { error: `Razorpay order creation failed: ${res.status} ${body}` };
      }

      const order = await res.json();

      return {
        orderId: order.id as string,
        amount: order.amount as number,
        currency: order.currency as string,
        keyId,
      };
    } catch (e: any) {
      return { error: e.message || e.toString() };
    }
  },
});

export const verifyAndCreditEscrow = action({
  args: {
    razorpay_order_id: v.string(),
    razorpay_payment_id: v.string(),
    razorpay_signature: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // ── Demo mode: skip signature verification for simulated orders ──
    if (args.razorpay_order_id.startsWith("order_demo_")) {
      await ctx.runMutation(api.users.creditEscrow, { amount: args.amount });
      return { verified: true };
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new Error("RAZORPAY_KEY_SECRET is not configured.");
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${args.razorpay_order_id}|${args.razorpay_payment_id}`)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    const givenBuf = Buffer.from(args.razorpay_signature, "utf8");
    const isValid =
      expectedBuf.length === givenBuf.length &&
      crypto.timingSafeEqual(expectedBuf, givenBuf);

    if (!isValid) {
      return { verified: false };
    }

    await ctx.runMutation(api.users.creditEscrow, { amount: args.amount });

    return { verified: true };
  },
});
