import React, { useEffect, useState } from 'react';
import { Clock, UserCheck, UserX, User, AlertCircle, TimerReset, Flame } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

/**
 * Format milliseconds into MM:SS
 */
function formatTimeLeft(ms: number) {
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function DispatchQueue({ 
  campaignId,
  onRoastCreator,
}: { 
  campaignId: string;
  onRoastCreator?: (creator: any) => void;
}) {
  const queue = useQuery(api.campaigns.getDispatchQueue, { campaignId: campaignId as any });
  const [now, setNow] = useState(Date.now());

  // Tick every second to update countdowns
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!queue) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-5 h-5 border-2 border-indigo-500/25 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (queue.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 mt-4">
      <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F1E3A8] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F1E3A8]" />
        </span>
        Live Dispatch Queue
      </h4>

      <div className="flex flex-col gap-2">
        {queue.map((item) => {
          const { creator, status, batchName, expiresAt, batchDispatchedAt, declineReason } = item;
          
          let timeLeft = 0;
          if (expiresAt && batchDispatchedAt && now < expiresAt) {
            timeLeft = expiresAt - now;
          }

          // Determine status visual style
          let statusColor = 'bg-[#151417] text-zinc-400 border-[#26232B]';
          let StatusIcon = Clock;
          let statusText = 'Pending';

          if (status === 'pending' && batchDispatchedAt) {
            statusColor = 'bg-[#C9B8E8]/15 text-[#C9B8E8] border border-[#C9B8E8]/30';
            statusText = 'Notified';
            StatusIcon = User;
          } else if (status === 'accepted') {
            statusColor = 'bg-[#C9B8E8] text-[#0C0B0D] font-bold border-none shadow-sm';
            statusText = 'Accepted';
            StatusIcon = UserCheck;
          } else if (status === 'declined') {
            statusColor = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
            statusText = 'Declined';
            StatusIcon = UserX;
          } else if (status === 'expired') {
            statusColor = 'bg-[#F1E3A8]/15 text-[#F1E3A8] border border-[#F1E3A8]/30';
            statusText = 'Expired';
            StatusIcon = TimerReset;
          }

          return (
            <div key={item.offerId} className="bg-black/20 border border-white/5 rounded-xl p-3 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between transition-all hover:bg-black/30">
              
              {/* Creator Profile Inline */}
              <div 
                className={`flex items-center gap-3 w-full md:w-auto ${onRoastCreator ? 'cursor-pointer group' : ''}`}
                onClick={() => {
                  if (onRoastCreator) {
                    onRoastCreator({
                      id: creator.id || `q_${creator.handle}`,
                      name: creator.name,
                      handle: creator.handle,
                      avatar: creator.avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${creator.handle}`,
                      niche: creator.niche || 'Lifestyle & Culture',
                      followers: creator.followers || '15K',
                      locality: 'Delhi-NCR',
                      matchScore: creator.matchScore || 85,
                      audienceInLocality: 65,
                      lat: 28.5276,
                      lng: 77.2197,
                      isInside: true,
                    });
                  }
                }}
                title={onRoastCreator ? `Click to view ${creator.name}'s profile & portfolio` : undefined}
              >
                <div className="relative">
                  <img src={creator.avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${creator.handle}`} alt={creator.name} className="w-10 h-10 rounded-full bg-zinc-800 object-cover group-hover:ring-2 group-hover:ring-[#C9B8E8] transition-all" />
                  <div className="absolute -bottom-1 -right-1 bg-zinc-900 border border-zinc-800 rounded-md px-1 py-0.5 text-[8px] font-mono text-emerald-400">
                    {creator.matchScore}%
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white leading-tight group-hover:text-[#C9B8E8] transition-colors flex items-center gap-1">
                    <span>{creator.name}</span>
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-zinc-400 font-mono">@{creator.handle}</span>
                    <span className="text-[10px] text-zinc-600">•</span>
                    <span className="text-[10px] text-zinc-400">{creator.followers}</span>
                    <span className="text-[10px] text-zinc-600">•</span>
                    <span className="text-[10px] text-zinc-400 truncate max-w-[100px]">{creator.niche}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto justify-end">
                {/* Batch & Timer */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/5 text-white/60">
                    {batchName}
                  </span>
                  
                  {status === 'pending' && batchDispatchedAt && (
                    <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      <Clock className="w-3 h-3" />
                      {formatTimeLeft(timeLeft)}
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${statusColor}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusText}
                  </div>
                  {status === 'declined' && declineReason && (
                    <div className="flex items-center gap-1 text-[9px] text-rose-400/70 max-w-[120px] truncate" title={declineReason}>
                      <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{declineReason}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
