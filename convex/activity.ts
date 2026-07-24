import { v } from "convex/values";
import { query } from "./_generated/server";

type ActivityEvent = {
  time: number;
  type:
    | "batch_dispatched"
    | "batch_cascaded"
    | "offer_accepted"
    | "offer_declined"
    | "offer_expired"
    | "submission_uploaded"
    | "submission_approved"
    | "submission_rejected"
    | "escrow_locked"
    | "escrow_released"
    | "escrow_refunded";
  message: string;
};

/**
 * Live activity timeline for a single campaign — merges batches,
 * campaignOffers, submissions, and escrowLedger into one sorted feed.
 * No new tables: every event is derived from timestamps that already
 * exist (dispatchedAt, respondedAt, verifiedAt, _creationTime).
 *
 * Reactive by nature (useQuery), so it updates live as the batch
 * cascade, offer responses, and escrow releases happen.
 */
export const getForCampaign = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    const events: ActivityEvent[] = [];

    const [batches, offers, submissions, ledger] = await Promise.all([
      ctx.db
        .query("batches")
        .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
        .collect(),
      ctx.db
        .query("campaignOffers")
        .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
        .collect(),
      ctx.db
        .query("submissions")
        .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
        .collect(),
      ctx.db
        .query("escrowLedger")
        .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
        .collect(),
    ]);

    // Look up creator names once, for readable messages.
    const creatorIds = new Set<string>();
    offers.forEach((o) => creatorIds.add(o.creatorUserId));
    submissions.forEach((s) => creatorIds.add(s.creatorUserId));
    const creators = await Promise.all(
      [...creatorIds].map((id) => ctx.db.get(id as any))
    );
    const creatorName = new Map(
      creators.filter(Boolean).map((c: any) => [c._id, c.name as string])
    );

    // Batches: dispatch + cascade (cascade deadline is dispatchedAt + cascadeAfterMs,
    // which is exactly when checkAndCascade fires — not an approximation).
    for (const batch of batches) {
      if (batch.status === "dispatched" || batch.status === "cascaded" || batch.status === "completed") {
        if (batch.dispatchedAt) {
          events.push({
            time: batch.dispatchedAt,
            type: "batch_dispatched",
            message: `${batch.name} dispatched to ${batch.creatorIds.length} creator${batch.creatorIds.length === 1 ? "" : "s"}`,
          });
        }
      }
      if (batch.status === "cascaded" && batch.dispatchedAt) {
        events.push({
          time: batch.dispatchedAt + batch.cascadeAfterMs,
          type: "batch_cascaded",
          message: `${batch.name} priority window expired — cascading to the next batch`,
        });
      }
    }

    // Offers: accepted / declined use respondedAt directly. Expired offers
    // don't get their own timestamp — they expire exactly when their batch
    // cascades, so we reuse that same deadline.
    const batchDeadline = new Map(
      batches
        .filter((b) => b.dispatchedAt)
        .map((b) => [b._id, b.dispatchedAt! + b.cascadeAfterMs])
    );

    for (const offer of offers) {
      const name = creatorName.get(offer.creatorUserId) || "A creator";
      if (offer.status === "accepted" && offer.respondedAt) {
        events.push({
          time: offer.respondedAt,
          type: "offer_accepted",
          message: `${name} accepted the offer`,
        });
      } else if (offer.status === "declined" && offer.respondedAt) {
        events.push({
          time: offer.respondedAt,
          type: "offer_declined",
          message: `${name} declined the offer`,
        });
      } else if (offer.status === "expired") {
        const time = batchDeadline.get(offer.batchId) ?? offer._creationTime;
        events.push({
          time,
          type: "offer_expired",
          message: `Offer to ${name} expired without a response`,
        });
      }
    }

    // Submissions: uploaded at creation, reviewed at verifiedAt.
    for (const sub of submissions) {
      const name = creatorName.get(sub.creatorUserId) || "A creator";
      events.push({
        time: sub._creationTime,
        type: "submission_uploaded",
        message: `${name} submitted their deliverable`,
      });
      if (sub.status === "approved" && sub.verifiedAt) {
        events.push({
          time: sub.verifiedAt,
          type: "submission_approved",
          message: `Deliverable from ${name} was approved`,
        });
      } else if (sub.status === "rejected" && sub.verifiedAt) {
        events.push({
          time: sub.verifiedAt,
          type: "submission_rejected",
          message: `Deliverable from ${name} was rejected${sub.rejectionReason ? `: "${sub.rejectionReason}"` : ""}`,
        });
      }
    }

    // Escrow ledger: locked / released / refunded.
    for (const entry of ledger) {
      const name = entry.creatorUserId ? creatorName.get(entry.creatorUserId) : null;
      if (entry.action === "locked") {
        events.push({
          time: entry._creationTime,
          type: "escrow_locked",
          message: `₹${entry.amount} locked in escrow`,
        });
      } else if (entry.action === "released") {
        events.push({
          time: entry._creationTime,
          type: "escrow_released",
          message: `₹${entry.amount} released to ${name || "creator"}`,
        });
      } else if (entry.action === "refunded") {
        events.push({
          time: entry._creationTime,
          type: "escrow_refunded",
          message: `₹${entry.amount} refunded to brand`,
        });
      }
    }

    events.sort((a, b) => a.time - b.time);
    return events;
  },
});
