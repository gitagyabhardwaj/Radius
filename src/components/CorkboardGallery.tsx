import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  ExternalLink, 
  Play, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Calendar,
  Eye,
  Award
} from 'lucide-react';
import RatingWidget from './RatingWidget';

export interface DeliverableSubmission {
  _id: string;
  creatorUserId: string;
  fileUrl?: string | null;
  contentUrl?: string;
  caption?: string;
  status: string;
  geoMatchPercentage?: number;
  engagementScore?: number;
  verifiedAt?: number;
  rejectionReason?: string;
  creator?: {
    name?: string;
    handle?: string;
    avatarUrl?: string;
    locality?: string;
  };
}

interface CorkboardGalleryProps {
  submissions: DeliverableSubmission[];
  campaignTitle?: string;
  centerLocality?: string;
}

// Preset realistic organic tilt angles for pinned polaroids
const TILT_ANGLES = [-4.5, 3.2, -2.8, 4.8, -3.2, 2.5, -5.1, 3.8, -1.9, 4.2];

// Pushpin colors (crimson, brass, emerald, obsidian)
const PIN_COLORS = [
  { head: '#ef4444', ring: '#b91c1c', highlight: '#fca5a5' }, // Crimson
  { head: '#eab308', ring: '#ca8a04', highlight: '#fef08a' }, // Brass Gold
  { head: '#10b981', ring: '#047857', highlight: '#6ee7b7' }, // Emerald
  { head: '#3b82f6', ring: '#1d4ed8', highlight: '#93c5fd' }, // Blue
  { head: '#8b5cf6', ring: '#6d28d9', highlight: '#c4b5fd' }, // Purple
];

// 3D Pushpin Component
function PushPin({ colorIndex = 0 }: { colorIndex?: number }) {
  const pin = PIN_COLORS[colorIndex % PIN_COLORS.length];
  return (
    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none filter drop-shadow-[0_4px_3px_rgba(0,0,0,0.45)]">
      <svg width="22" height="24" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Needle Tip shadow */}
        <path d="M11 16L11 23" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        {/* Needle Metal */}
        <path d="M11 14L11 22" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
        {/* Pin base collar */}
        <ellipse cx="11" cy="14" rx="4.5" ry="1.8" fill={pin.ring} />
        {/* Pin Body / Spherical Top */}
        <circle cx="11" cy="8.5" r="7" fill={pin.head} />
        {/* Specular Highlight */}
        <circle cx="8.5" cy="6" r="2.2" fill={pin.highlight} opacity="0.75" />
      </svg>
    </div>
  );
}

// Rubber Stamp Component
function RubberStamp({ text = "GEO-VERIFIED" }: { text?: string }) {
  return (
    <div className="absolute bottom-2 right-2 rotate-[-12deg] pointer-events-none select-none z-10">
      <div className="border-2 border-dashed border-red-600/80 bg-red-600/10 backdrop-blur-[0.5px] px-2 py-0.5 rounded-[3px] shadow-[0_0_8px_rgba(220,38,38,0.25)] flex items-center gap-1">
        <Award className="w-3 h-3 text-red-600/90" />
        <span className="text-[9px] font-black tracking-widest text-red-600/90 uppercase font-mono leading-none">
          {text}
        </span>
      </div>
    </div>
  );
}

export default function CorkboardGallery({
  submissions,
  campaignTitle,
  centerLocality = "Target Zone"
}: CorkboardGalleryProps) {
  const [selectedSub, setSelectedSub] = useState<DeliverableSubmission | null>(null);

  const isVideo = (url?: string | null) => !!url && /\.(mp4|mov|webm)(\?|$)/i.test(url);

  // Filter only approved / verified submissions for the corkboard showcase
  const verifiedSubmissions = submissions.filter(
    (s) => s.status === 'approved' || s.status === 'published_uploaded' || s.status === 'final_verifying'
  );

  return (
    <div className="relative flex flex-col gap-3 mt-4">
      {/* Gallery Header Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-sm font-sans font-bold text-white tracking-wide uppercase">
            Deliverable Corkboard ({verifiedSubmissions.length} Verified)
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Click any Polaroid to inspect</span>
        </div>
      </div>

      {/* Corkboard Container */}
      <div 
        className="relative w-full min-h-[380px] rounded-3xl p-6 sm:p-8 overflow-hidden select-none border-4 border-[#3c2a1e] shadow-[inset_0_4px_30px_rgba(0,0,0,0.85),0_12px_32px_rgba(0,0,0,0.6)]"
        style={{
          backgroundColor: '#9a6a42',
          backgroundImage: `
            radial-gradient(circle at 50% 40%, rgba(197, 143, 93, 0.45) 0%, rgba(94, 57, 30, 0.85) 100%),
            radial-gradient(circle at 10% 20%, rgba(0,0,0,0.12) 0%, transparent 20%),
            radial-gradient(circle at 80% 80%, rgba(0,0,0,0.15) 0%, transparent 25%),
            radial-gradient(circle at 30% 70%, rgba(255,255,255,0.06) 0%, transparent 15%),
            repeating-radial-gradient(circle at 40% 40%, transparent 0, transparent 4px, rgba(0,0,0,0.04) 4px, rgba(0,0,0,0.04) 6px)
          `,
        }}
      >
        {/* Wooden Frame Corner Accents (Brass studs) */}
        <div className="absolute top-2.5 left-2.5 w-3 h-3 rounded-full bg-amber-600/70 border border-amber-300/40 shadow-sm pointer-events-none" />
        <div className="absolute top-2.5 right-2.5 w-3 h-3 rounded-full bg-amber-600/70 border border-amber-300/40 shadow-sm pointer-events-none" />
        <div className="absolute bottom-2.5 left-2.5 w-3 h-3 rounded-full bg-amber-600/70 border border-amber-300/40 shadow-sm pointer-events-none" />
        <div className="absolute bottom-2.5 right-2.5 w-3 h-3 rounded-full bg-amber-600/70 border border-amber-300/40 shadow-sm pointer-events-none" />

        {/* Ambient Cork Surface Vignette */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(20,10,5,0.7)]" />

        {/* Corkboard Grid / Cards */}
        {verifiedSubmissions.length === 0 ? (
          /* Empty state: Pinned Sticky Note */
          <div className="h-64 flex items-center justify-center">
            <motion.div 
              initial={{ y: -60, opacity: 0, rotate: -4 }}
              animate={{ y: 0, opacity: 1, rotate: -2 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="relative bg-[#fef08a] text-zinc-900 p-6 rounded-[2px] max-w-sm shadow-[0_12px_24px_rgba(0,0,0,0.4)] border-t border-yellow-200"
            >
              <PushPin colorIndex={0} />
              <div className="flex flex-col gap-2 pt-2">
                <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-amber-800">
                  Notice · Pinboard
                </span>
                <h4 className="font-sans font-bold text-base text-zinc-900 leading-snug">
                  No verified posts pinned yet!
                </h4>
                <p className="text-xs text-zinc-700 leading-relaxed">
                  As creators submit their content and you approve their deliverables, their authentic, geo-verified Polaroids will drop in here on this board.
                </p>
                {campaignTitle && (
                  <span className="text-[10px] font-mono text-zinc-600 mt-1 border-t border-yellow-300/60 pt-2">
                    Campaign: {campaignTitle}
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="relative z-10 flex flex-wrap gap-8 sm:gap-10 justify-center items-start py-4">
            {verifiedSubmissions.map((sub, index) => {
              const tilt = TILT_ANGLES[index % TILT_ANGLES.length];
              const creatorName = sub.creator?.name || 'Local Creator';
              const creatorHandle = sub.creator?.handle ? `@${sub.creator.handle}` : '@creator';
              const locality = sub.creator?.locality || centerLocality;
              const hasVideo = isVideo(sub.fileUrl);

              return (
                <motion.div
                  key={sub._id}
                  initial={{ y: -140, opacity: 0, scale: 0.8, rotate: 0 }}
                  animate={{ y: 0, opacity: 1, scale: 1, rotate: tilt }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 220, 
                    damping: 18, 
                    delay: index * 0.12 
                  }}
                  whileHover={{ 
                    scale: 1.08, 
                    rotate: 0, 
                    y: -10, 
                    zIndex: 40,
                    transition: { duration: 0.2, ease: "easeOut" }
                  }}
                  onClick={() => setSelectedSub(sub)}
                  className="relative group cursor-pointer"
                >
                  {/* Pushpin at the top */}
                  <PushPin colorIndex={index} />

                  {/* Physical Polaroid Card */}
                  <div className="relative w-56 sm:w-60 bg-[#fbf9f4] p-3 pb-6 rounded-[2px] shadow-[0_16px_28px_-6px_rgba(0,0,0,0.55),0_6px_12px_-3px_rgba(0,0,0,0.35)] border border-[#e8e4db] transition-shadow duration-200 group-hover:shadow-[0_24px_45px_rgba(0,0,0,0.7)]">
                    
                    {/* Media Window / Photographic cutout */}
                    <div className="relative aspect-square w-full bg-zinc-950 rounded-[1px] overflow-hidden shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)]">
                      {sub.fileUrl ? (
                        hasVideo ? (
                          <div className="relative w-full h-full">
                            <video 
                              src={sub.fileUrl} 
                              className="w-full h-full object-cover" 
                              muted 
                              loop 
                              playsInline 
                              onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                              onMouseLeave={(e) => e.currentTarget.pause()}
                            />
                            <div className="absolute inset-0 bg-black/25 flex items-center justify-center group-hover:opacity-0 transition-opacity">
                              <div className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-zinc-900 shadow-md">
                                <Play className="w-4 h-4 fill-zinc-900 ml-0.5" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img 
                            src={sub.fileUrl} 
                            alt={creatorName} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-1 bg-zinc-900">
                          <Eye className="w-6 h-6 text-zinc-500" />
                          <span className="text-[10px] font-mono text-zinc-500">Live Post</span>
                        </div>
                      )}

                      {/* Photo Surface Gloss/Sheen gradient */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.12] pointer-events-none" />

                      {/* Rubber Stamp in corner */}
                      <RubberStamp text={sub.status === 'approved' ? 'GEO-VERIFIED' : 'IN-REVIEW'} />
                    </div>

                    {/* Polaroid Chin / Handwritten Details */}
                    <div className="mt-3 flex flex-col gap-1 px-1">
                      <div className="flex items-baseline justify-between gap-1">
                        <span className="font-sans font-bold text-xs text-zinc-900 truncate leading-tight">
                          {creatorName}
                        </span>
                        <span className="font-mono text-[9px] text-zinc-500 font-bold shrink-0">
                          {creatorHandle}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-zinc-600 mt-0.5">
                        <div className="flex items-center gap-1 truncate">
                          <MapPin className="w-2.5 h-2.5 text-red-500 shrink-0" />
                          <span className="truncate font-medium">{locality}</span>
                        </div>
                        {sub.geoMatchPercentage && (
                          <span className="font-mono text-[9px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded-sm shrink-0">
                            {sub.geoMatchPercentage}% Match
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── LIGHTBOX / INSPECTION MODAL ── */}
      <AnimatePresence>
        {selectedSub && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 px-6 border-b border-zinc-800 bg-zinc-900/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm font-sans font-bold text-white uppercase tracking-wide">
                    Verified Deliverable Inspection
                  </span>
                </div>
                <button
                  onClick={() => setSelectedSub(null)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-6 overflow-y-auto flex flex-col gap-5">
                {/* Media Preview Player */}
                <div className="w-full aspect-video sm:aspect-[16/10] bg-black rounded-2xl overflow-hidden border border-zinc-800 flex items-center justify-center relative shadow-inner">
                  {selectedSub.fileUrl ? (
                    isVideo(selectedSub.fileUrl) ? (
                      <video
                        src={selectedSub.fileUrl}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img
                        src={selectedSub.fileUrl}
                        alt="Deliverable High Res"
                        className="w-full h-full object-contain"
                      />
                    )
                  ) : (
                    <div className="text-center text-zinc-400 p-6 flex flex-col items-center gap-2">
                      <ExternalLink className="w-8 h-8 text-indigo-400" />
                      <span className="text-sm font-bold text-white">Live URL Post</span>
                      <p className="text-xs text-zinc-500 max-w-xs">
                        This creator verified their post with a direct social URL.
                      </p>
                    </div>
                  )}
                </div>

                {/* Creator & Verification Badges */}
                <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center text-white font-bold">
                      {selectedSub.creator?.avatarUrl ? (
                        <img 
                          src={selectedSub.creator.avatarUrl} 
                          alt="avatar" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        selectedSub.creator?.name?.slice(0, 2).toUpperCase() || 'CR'
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-base leading-tight">
                        {selectedSub.creator?.name || 'Local Creator'}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">
                        {selectedSub.creator?.handle ? `@${selectedSub.creator.handle}` : '@creator'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{selectedSub.status === 'approved' ? 'Escrow Released' : 'Verified'}</span>
                    </div>

                    {selectedSub.geoMatchPercentage && (
                      <div className="px-3 py-1 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono font-bold">
                        {selectedSub.geoMatchPercentage}% Geo-Match
                      </div>
                    )}
                  </div>
                </div>

                {/* Caption / Content URL */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    Submission Details
                  </span>
                  {selectedSub.caption && (
                    <p className="text-sm text-zinc-200 bg-zinc-850 p-3.5 rounded-2xl border border-zinc-800 italic">
                      "{selectedSub.caption}"
                    </p>
                  )}

                  <div className="flex items-center gap-3 flex-wrap mt-1">
                    {selectedSub.contentUrl && (
                      <a
                        href={selectedSub.contentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-3.5 py-2 rounded-xl transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Live Instagram Post</span>
                      </a>
                    )}

                    {selectedSub.fileUrl && (
                      <a
                        href={selectedSub.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 px-3.5 py-2 rounded-xl transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Raw Media File</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Rating Widget for Brand */}
                {selectedSub.status === 'approved' && (
                  <div className="pt-2 border-t border-zinc-800">
                    <RatingWidget
                      submissionId={selectedSub._id}
                      subjectLabel={selectedSub.creator?.name || 'this creator'}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
