import React, { useEffect, useRef } from 'react';
import { Activity, UserCheck, UserX, Clock3, Upload, CheckCircle2, XCircle, Lock, Banknote, RotateCcw } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const ICONS: Record<string, React.ElementType> = {
  batch_dispatched: Activity,
  batch_cascaded: RotateCcw,
  offer_accepted: UserCheck,
  offer_declined: UserX,
  offer_expired: Clock3,
  submission_uploaded: Upload,
  submission_approved: CheckCircle2,
  submission_rejected: XCircle,
  escrow_locked: Lock,
  escrow_released: Banknote,
  escrow_refunded: RotateCcw,
};

const COLORS: Record<string, string> = {
  batch_dispatched: 'text-[#0C0B0D] bg-[#C9B8E8] border-none',
  batch_cascaded: 'text-[#0C0B0D] bg-[#F1E3A8] border-none',
  offer_accepted: 'text-[#0C0B0D] bg-[#C9B8E8] border-none',
  offer_declined: 'text-zinc-400 bg-[#151417] border-[#26232B]',
  offer_expired: 'text-zinc-400 bg-[#151417] border-[#26232B]',
  submission_uploaded: 'text-[#0C0B0D] bg-[#C9B8E8] border-none',
  submission_approved: 'text-[#0C0B0D] bg-[#F1E3A8] border-none',
  submission_rejected: 'text-rose-400 bg-[#151417] border-rose-900/40',
  escrow_locked: 'text-[#0C0B0D] bg-[#C9B8E8] border-none',
  escrow_released: 'text-[#0C0B0D] bg-[#F1E3A8] border-none',
  escrow_refunded: 'text-zinc-300 bg-[#151417] border-[#26232B]',
};

function timeAgo(ts: number, now: number): string {
  const diffSec = Math.max(0, Math.floor((now - ts) / 1000));
  if (diffSec < 5) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

/**
 * Live, reactive activity timeline for one campaign's dispatch cascade —
 * batch dispatch/cascade, offer accept/decline/expire, submissions, and
 * escrow moves, merged into a single feed via convex/activity.ts.
 * Purely additive/read-only: no write path touches existing mutations.
 */
export default function DispatchFeed({ campaignId }: { campaignId: string }) {
  const events = useQuery(api.activity.getForCampaign, { campaignId: campaignId as any });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = React.useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events?.length]);

  if (!events || events.length === 0) return null;

  return (
    <div className="mt-2 pt-5 border-t border-[#26232B] flex flex-col gap-3">
      <span className="text-[11px] font-sans tracking-wide text-zinc-300 font-bold flex items-center gap-1.5 uppercase font-mono">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F1E3A8] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F1E3A8]" />
        </span>
        Live Dispatch Feed
      </span>

      <div
        ref={scrollRef}
        className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1 scroll-smooth"
      >
        {events.map((ev, i) => {
          const Icon = ICONS[ev.type] || Activity;
          return (
            <div key={i} className="flex items-start gap-2.5">
              <div className={`shrink-0 w-6 h-6 rounded-2xl border flex items-center justify-center mt-0.5 ${COLORS[ev.type] || 'text-white bg-zinc-900 border-zinc-800'}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0 flex items-baseline justify-between gap-2">
                <span className="text-xs text-white leading-snug">{ev.message}</span>
                <span className="text-[10px] text-white font-mono whitespace-nowrap shrink-0">
                  {timeAgo(ev.time, now)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
