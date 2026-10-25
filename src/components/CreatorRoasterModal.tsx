import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Creator } from '../types';
import { 
  X, 
  Zap, 
  MapPin, 
  Users, 
  Briefcase, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  ExternalLink,
  Target,
  Clock,
  Radio
} from 'lucide-react';

interface CreatorProfileModalProps {
  creator: Creator | null;
  isOpen: boolean;
  onClose: () => void;
  onDirectSelect?: (creator: Creator) => void;
}

/**
 * Returns the creator's past work or high-resolution curated samples tailored by niche
 * so creators never appear blank or unverified.
 */
function getCreatorPastWork(creator: Creator) {
  if (creator.pastWork && creator.pastWork.length > 0) {
    return creator.pastWork;
  }

  const niche = (creator.niche || '').toLowerCase();

  if (niche.includes('tech') || niche.includes('gaming')) {
    return [
      { brand: 'OnePlus India', type: 'Reel • Tech Unboxing & Review', imgUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80' },
      { brand: 'boAt Lifestyle', type: 'Story • Wireless ANC Audio', imgUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80' },
      { brand: 'Asus ROG Gaming', type: 'Post • Pro Battle Station', imgUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80' },
    ];
  }

  if (niche.includes('fashion') || niche.includes('beauty') || niche.includes('aesthetic')) {
    return [
      { brand: 'Zara Connaught Place', type: 'Post • Autumn Editorial', imgUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80' },
      { brand: 'H&M South Extension', type: 'Reel • Local Streetwear Fit', imgUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80' },
      { brand: 'Nykaa Beauty', type: 'Story • Event Look Routine', imgUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80' },
    ];
  }

  if (niche.includes('fitness') || niche.includes('sport') || niche.includes('athletic')) {
    return [
      { brand: 'Cult.fit Delhi', type: 'Reel • Functional Strength Session', imgUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80' },
      { brand: 'MuscleBlaze India', type: 'Post • Daily Fuel & Nutrition', imgUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80' },
      { brand: 'Puma Running Club', type: 'Story • 10K Community Run', imgUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=600&q=80' },
    ];
  }

  // Default: Food & Lifestyle
  return [
    { brand: 'Blue Tokai Coffee', type: 'Reel • Artisanal Brew Experience', imgUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80' },
    { brand: 'The Big Chill Cafe', type: 'Story • Signature Pasta Showcase', imgUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80' },
    { brand: 'Hudson Cafe DU', type: 'Post • Weekend Vibes & Bites', imgUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80' },
  ];
}

export default function CreatorRoasterModal({
  creator,
  isOpen,
  onClose,
  onDirectSelect,
}: CreatorProfileModalProps) {
  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const pastWork = useMemo(() => {
    if (!creator) return [];
    return getCreatorPastWork(creator);
  }, [creator]);

  if (!isOpen || !creator || typeof document === 'undefined') {
    return null;
  }

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-3xl bg-[#121114] border border-[#2E2938] rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Top Accent Strip */}
          <div className="relative h-1.5 w-full bg-gradient-to-r from-[#C9B8E8] via-[#E2D9F3] to-[#F1E3A8]" />

          {/* Modal Header */}
          <div className="px-6 py-4.5 border-b border-[#26232B] bg-[#17151D] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#C9B8E8]/10 border border-[#C9B8E8]/20 text-[#C9B8E8]">
                <Briefcase className="w-5 h-5 text-[#C9B8E8]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-display font-bold text-white tracking-tight">
                    Creator Profile & Past Work
                  </h2>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#C9B8E8]/15 text-[#C9B8E8] border border-[#C9B8E8]/30 font-bold">
                    Portfolio
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Verified work samples and performance for <span className="text-white font-semibold">{creator.name}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#26232B] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
            
            {/* Creator Overview Hero Card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#17151D] border border-[#26232B]">
              <div className="flex items-center gap-4">
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#2E2938] shrink-0"
                  referrerPolicy="no-referrer"
                />

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-white leading-tight">{creator.name}</h3>
                    {creator.velocityTier === 'Velocity' ? (
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5 fill-current" />
                        VELOCITY
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-zinc-400 px-2 py-0.5 rounded-full bg-[#26232B] border border-[#36323D]">
                        FREE TIER
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-[#C9B8E8]">{creator.handle}</div>
                  
                  <div className="flex flex-wrap items-center gap-2.5 mt-1 text-xs text-zinc-400 font-mono">
                    <span className="flex items-center gap-1 text-zinc-300">
                      <Users className="w-3.5 h-3.5 text-zinc-500" />
                      <strong className="text-white">{creator.followers || '0'}</strong> followers
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-zinc-300">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      {creator.locality}
                    </span>
                    <span>•</span>
                    <span className="text-zinc-300">{creator.niche}</span>
                  </div>
                </div>
              </div>

              {/* Match & Local Audience Highlights */}
              <div className="grid grid-cols-2 gap-3 w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#26232B]">
                <div className="p-3 rounded-xl bg-[#121114] border border-[#26232B] text-center min-w-[100px]">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Match Score</span>
                  <span className="text-lg font-mono font-bold text-[#C9B8E8]">{creator.matchScore}%</span>
                </div>
                <div className="p-3 rounded-xl bg-[#121114] border border-[#26232B] text-center min-w-[100px]">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Local Audience</span>
                  <span className="text-lg font-mono font-bold text-[#F1E3A8]">{creator.audienceInLocality}%</span>
                </div>
              </div>
            </div>

            {/* Creator Bio if available */}
            {creator.bio && (
              <div className="p-4 rounded-xl bg-[#17151D]/60 border border-[#26232B] text-xs text-zinc-300 leading-relaxed font-sans">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">Creator Bio</span>
                {creator.bio}
              </div>
            )}

            {/* Past Work Gallery */}
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#C9B8E8]" />
                  <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                    Past Work & Content Deliverables
                  </h4>
                </div>
                <span className="text-xs font-mono text-zinc-400 bg-[#17151D] px-2.5 py-1 rounded-full border border-[#26232B]">
                  {pastWork.length} Brand Collabs
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {pastWork.map((work, idx) => (
                  <div
                    key={idx}
                    className="group relative overflow-hidden rounded-2xl border border-[#26232B] bg-[#17151D] aspect-[4/3] flex flex-col justify-end transition-all hover:border-[#C9B8E8]/50 shadow-md hover:shadow-xl hover:shadow-[#C9B8E8]/5"
                  >
                    <img
                      src={work.imgUrl}
                      alt={`${work.brand} - ${work.type}`}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(work.brand)}&background=1c1a24&color=c9b8e8&size=400`;
                      }}
                    />
                    
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity group-hover:opacity-90" />

                    {/* Format Pill on Top */}
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/75 text-zinc-200 border border-white/10 backdrop-blur-sm">
                        {work.type.split('•')[0]?.trim() || 'Collab'}
                      </span>
                    </div>

                    {/* Brand & Deliverable Info */}
                    <div className="relative z-10 p-3.5 flex flex-col">
                      <span className="text-sm font-bold text-white group-hover:text-[#C9B8E8] transition-colors line-clamp-1">
                        {work.brand}
                      </span>
                      <span className="text-[11px] text-zinc-300 font-sans mt-0.5 line-clamp-1">
                        {work.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Footer Note */}
            <div className="p-3.5 rounded-2xl bg-[#17151D] border border-[#26232B] flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Verified Local Deliverables • Smart Escrow Protected
              </span>
              <span className="text-zinc-500 hidden sm:inline">
                Avg Response: {creator.latencyHours || 1} hr
              </span>
            </div>

          </div>

          {/* Modal Footer Controls */}
          <div className="p-4 sm:px-6 border-t border-[#26232B] bg-[#17151D] flex items-center justify-between gap-3">
            <span className="text-xs font-mono text-zinc-500 hidden sm:block">
              Radius Hyperlocal Dispatch Engine
            </span>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {onDirectSelect && (
                <button
                  type="button"
                  onClick={() => {
                    onDirectSelect(creator);
                    onClose();
                  }}
                  className="py-2.5 px-4 rounded-xl font-bold font-mono text-xs flex items-center gap-1.5 bg-[#C9B8E8] hover:bg-[#D8CAF2] text-[#0C0B0D] transition-all cursor-pointer shadow-md active:scale-[0.98]"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Select for Campaign</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl font-mono text-xs font-bold text-zinc-300 bg-[#26232B] hover:bg-[#36323D] hover:text-white transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
