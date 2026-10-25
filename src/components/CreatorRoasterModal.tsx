import React, { useState, useEffect, useMemo } from 'react';
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
  Target, 
  Layers, 
  Video, 
  Image as ImageIcon, 
  Clock 
} from 'lucide-react';

export interface CreatorProfileModalProps {
  creator: Creator | null;
  isOpen: boolean;
  onClose: () => void;
  onDirectSelect?: (creator: Creator) => void;
}

export default function CreatorRoasterModal({
  creator,
  isOpen,
  onClose,
  onDirectSelect,
}: CreatorProfileModalProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'reel' | 'story' | 'post'>('all');

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
    if (!creator || !creator.pastWork) return [];
    return creator.pastWork;
  }, [creator]);

  const filteredWork = useMemo(() => {
    if (activeFilter === 'all') return pastWork;
    return pastWork.filter((work) => {
      const typeLower = (work.type || '').toLowerCase();
      if (activeFilter === 'reel') return typeLower.includes('reel') || typeLower.includes('video');
      if (activeFilter === 'story') return typeLower.includes('story');
      if (activeFilter === 'post') return typeLower.includes('post') || typeLower.includes('carousel') || typeLower.includes('photo');
      return true;
    });
  }, [pastWork, activeFilter]);

  if (!isOpen || !creator || typeof document === 'undefined') {
    return null;
  }

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Dark Backdrop */}
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
                    Creator Profile & Portfolio
                  </h2>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#C9B8E8]/15 text-[#C9B8E8] border border-[#C9B8E8]/30 font-bold">
                    Portfolio
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Verified deliverables and creator details for <strong className="text-white">{creator.name}</strong>
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
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 custom-scrollbar">
            
            {/* Creator Overview Hero Card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#17151D] border border-[#26232B]">
              <div className="flex items-center gap-4">
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#2E2938] shrink-0"
                  referrerPolicy="no-referrer"
                />

                <div className="flex flex-col gap-1 min-w-0">
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
                  {creator.handle && <div className="text-xs font-mono text-[#C9B8E8]">{creator.handle}</div>}
                  
                  <div className="flex flex-wrap items-center gap-2.5 mt-1 text-xs text-zinc-400 font-mono">
                    {creator.followers && (
                      <span className="flex items-center gap-1 text-zinc-300">
                        <Users className="w-3.5 h-3.5 text-zinc-500" />
                        <strong className="text-white">{creator.followers}</strong> followers
                      </span>
                    )}
                    {creator.followers && creator.locality && <span>•</span>}
                    {creator.locality && (
                      <span className="flex items-center gap-1 text-zinc-300">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                        {creator.locality}
                      </span>
                    )}
                    {creator.locality && creator.niche && <span>•</span>}
                    {creator.niche && <span className="text-zinc-300">{creator.niche}</span>}
                  </div>
                </div>
              </div>

              {/* Match Score & Local Audience */}
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

            {/* Creator Bio (Only if present) */}
            {creator.bio && (
              <div className="p-4 rounded-xl bg-[#17151D]/60 border border-[#26232B] text-xs text-zinc-300 leading-relaxed font-sans">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">Creator Bio</span>
                {creator.bio}
              </div>
            )}

            {/* Portfolio Section */}
            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#C9B8E8]" />
                  <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                    Portfolio & Past Work
                  </h4>
                  <span className="text-xs font-mono text-zinc-400 bg-[#17151D] px-2.5 py-0.5 rounded-full border border-[#26232B]">
                    {pastWork.length} {pastWork.length === 1 ? 'Collab' : 'Collabs'}
                  </span>
                </div>

                {pastWork.length > 1 && (
                  <div className="flex items-center gap-1 bg-[#17151D] p-1 rounded-xl border border-[#26232B] self-start sm:self-auto text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => setActiveFilter('all')}
                      className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                        activeFilter === 'all' ? 'bg-[#C9B8E8] text-[#0C0B0D] font-bold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveFilter('reel')}
                      className={`px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                        activeFilter === 'reel' ? 'bg-[#C9B8E8] text-[#0C0B0D] font-bold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Video className="w-3 h-3" />
                      Reels
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveFilter('story')}
                      className={`px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                        activeFilter === 'story' ? 'bg-[#C9B8E8] text-[#0C0B0D] font-bold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      Stories
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveFilter('post')}
                      className={`px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                        activeFilter === 'post' ? 'bg-[#C9B8E8] text-[#0C0B0D] font-bold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <ImageIcon className="w-3 h-3" />
                      Posts
                    </button>
                  </div>
                )}
              </div>

              {/* Portfolio Grid or Authentic Empty State */}
              {filteredWork.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredWork.map((work, idx) => {
                    const isReel = (work.type || '').toLowerCase().includes('reel');
                    const isStory = (work.type || '').toLowerCase().includes('story');
                    return (
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
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/75 text-zinc-200 border border-white/10 backdrop-blur-sm flex items-center gap-1">
                            {isReel ? <Video className="w-2.5 h-2.5 text-[#C9B8E8]" /> : isStory ? <Clock className="w-2.5 h-2.5 text-[#F1E3A8]" /> : <ImageIcon className="w-2.5 h-2.5 text-emerald-400" />}
                            {work.type.split('•')[0]?.trim() || 'Deliverable'}
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
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 bg-[#17151D] rounded-2xl border border-dashed border-[#26232B] text-center">
                  <Briefcase className="w-8 h-8 text-zinc-600 mb-2.5" />
                  <h4 className="text-sm font-bold text-white">No portfolio deliverables yet</h4>
                  <p className="text-xs text-zinc-500 max-w-sm mt-1">
                    Verified deliverables will appear here as {creator.name} completes brand campaigns.
                  </p>
                </div>
              )}
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

export { CreatorRoasterModal as CreatorProfileModal };
