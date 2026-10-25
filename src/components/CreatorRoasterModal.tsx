import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Creator } from '../types';
import { generateDynamicRoast, SpiceLevel, RoastResult } from '../utils/roasterEngine';
import { 
  Flame, 
  X, 
  Sparkles, 
  Share2, 
  Check, 
  RefreshCw, 
  Zap, 
  AlertTriangle,
  Skull,
  TrendingDown,
  Clock,
  Eye,
  MapPin,
  Users
} from 'lucide-react';

interface CreatorRoasterModalProps {
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
}: CreatorRoasterModalProps) {
  const [spiceLevel, setSpiceLevel] = useState<SpiceLevel>('spicy');
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [reroastKey, setReroastKey] = useState(0);

  // Synchronously compute roast data so there is zero delay or null flash on first render
  const roastData: RoastResult | null = useMemo(() => {
    if (!creator) return null;
    return generateDynamicRoast(creator, spiceLevel);
  }, [creator, spiceLevel, reroastKey]);

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

  if (!isOpen || !creator || !roastData || typeof document === 'undefined') {
    return null;
  }

  const handleCopyRoast = () => {
    if (!roastData) return;
    const textToCopy = `🔥 ROASTING ${creator.name} (${creator.handle})\n\n"${roastData.title}"\nVerdict: ${roastData.verdict}\n\n${roastData.roasts.map(r => `• ${r}`).join('\n')}\n\nPunchline: ${roastData.signaturePunchline}\n\nRoast Score: ${roastData.heatScore}% Burn via Radius Roaster`;
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReroast = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setReroastKey(prev => prev + 1);
      setIsRegenerating(false);
    }, 250);
  };

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
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-[#121114] border border-[#2E2938] rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Flame Top Banner / Glow */}
          <div className="relative h-2 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 animate-pulse" />
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#26232B] bg-[#18161D] flex items-center justify-between relative overflow-hidden">
            {/* Atmospheric glow */}
            <div className="absolute -top-12 -left-12 w-36 h-36 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 border border-orange-500/30 text-orange-400 shadow-inner">
                <Flame className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-display font-bold text-white tracking-tight">
                    AI Creator Profile Roaster
                  </h2>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold">
                    Burn Lab
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Algorithmic reality-check & ruthless roast for <span className="text-white font-semibold">{creator.name}</span>
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

          {/* Modal Scrollable Body */}
          <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
            
            {/* Creator Identity Hero */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#1B1921] border border-[#2D2838] shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-orange-500/40 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-500 to-rose-600 rounded-full p-1 text-black shadow">
                    <Flame className="w-3 h-3 fill-current" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white leading-tight">{creator.name}</h3>
                    {creator.velocityTier === 'Velocity' ? (
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5 fill-current" />
                        VELOCITY
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-zinc-400 px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700">
                        FREE TIER
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-orange-400/90 mt-0.5">{creator.handle}</div>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-zinc-400 font-mono">
                    <span className="flex items-center gap-1 text-zinc-300">
                      <Users className="w-3 h-3 text-zinc-500" />
                      <strong className="text-white">{creator.followers || '0'}</strong> followers
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-zinc-300">
                      <MapPin className="w-3 h-3 text-zinc-500" />
                      {creator.locality}
                    </span>
                    <span>•</span>
                    <span className="text-amber-300/90">{creator.niche}</span>
                  </div>
                </div>
              </div>

              {/* Heat Score Gauge */}
              <div className="w-full sm:w-auto flex sm:flex-col items-center justify-between sm:justify-center p-3 sm:px-4 sm:py-2.5 rounded-xl bg-[#121114] border border-[#2D2838] shrink-0">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Heat Level</span>
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span className="text-lg font-mono font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">
                    {roastData.heatScore}%
                  </span>
                </div>
                <span className="text-[9px] font-mono text-zinc-500 hidden sm:block">Extra Crispy</span>
              </div>
            </div>

            {/* Spice Level Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Select Roasting Heat:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSpiceLevel('mild')}
                  className={`py-2 px-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                    spiceLevel === 'mild'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                      : 'bg-[#18161D] text-zinc-400 border-[#2D2838] hover:text-white hover:bg-[#201D28]'
                  }`}
                >
                  <span>🌶️</span>
                  <span>Mild Tease</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSpiceLevel('spicy')}
                  className={`py-2 px-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                    spiceLevel === 'spicy'
                      ? 'bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-sm ring-1 ring-orange-500/30'
                      : 'bg-[#18161D] text-zinc-400 border-[#2D2838] hover:text-white hover:bg-[#201D28]'
                  }`}
                >
                  <span>🔥</span>
                  <span>Spicy Burn</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSpiceLevel('nuclear')}
                  className={`py-2 px-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                    spiceLevel === 'nuclear'
                      ? 'bg-rose-600/25 text-rose-300 border-rose-500/60 shadow-sm ring-1 ring-rose-500/40 animate-pulse'
                      : 'bg-[#18161D] text-zinc-400 border-[#2D2838] hover:text-white hover:bg-[#201D28]'
                  }`}
                >
                  <span>💀</span>
                  <span>Nuclear Toast</span>
                </button>
              </div>
            </div>

            {/* Roast Persona & Title Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#241B1F] via-[#1D1924] to-[#16151B] border border-orange-500/30 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl" />
              
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-orange-400 uppercase tracking-wider mb-1">
                <Flame className="w-3.5 h-3.5" />
                <span>Profile Diagnosis</span>
              </div>
              <h4 className="text-xl font-display font-extrabold text-white tracking-tight">
                "{roastData.title}"
              </h4>
              <p className="text-xs text-zinc-300 mt-1 italic font-sans leading-relaxed">
                Verdict: <span className="text-orange-200 font-medium not-italic">{roastData.verdict}</span>
              </p>
            </div>

            {/* Aesthetic Reality Check Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-[#18161D] border border-[#2D2838] flex flex-col gap-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-rose-400" />
                  Delusion Score
                </span>
                <span className="text-sm font-mono font-bold text-rose-400">{roastData.stats.delusionScore}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#18161D] border border-[#2D2838] flex flex-col gap-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Eye className="w-3 h-3 text-amber-400" />
                  Ring Light Usage
                </span>
                <span className="text-sm font-mono font-bold text-amber-300">{roastData.stats.ringLightHours}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#18161D] border border-[#2D2838] flex flex-col gap-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-orange-400" />
                  Aesthetic/Reality
                </span>
                <span className="text-sm font-mono font-bold text-orange-300">{roastData.stats.aestheticVsReality}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#18161D] border border-[#2D2838] flex flex-col gap-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1 truncate">
                  <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
                  DM Latency
                </span>
                <span className="text-[11px] font-mono text-zinc-300 truncate" title={roastData.stats.brandDealReadLatency}>
                  {roastData.stats.brandDealReadLatency}
                </span>
              </div>
            </div>

            {/* Savage Bullet Points */}
            <div className="space-y-2.5">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Skull className="w-3.5 h-3.5 text-rose-400" />
                The Roasts:
              </span>
              <div className="space-y-2">
                {roastData.roasts.map((roast, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="p-3.5 rounded-xl bg-[#16151B] border border-[#2D2838] flex items-start gap-3 hover:border-orange-500/40 transition-colors"
                  >
                    <span className="text-orange-500 font-mono text-xs font-bold shrink-0 mt-0.5">
                      #{index + 1}
                    </span>
                    <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                      {roast}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Signature Punchline Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-amber-500/10 border border-orange-500/40 text-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 font-bold block mb-1">
                💥 Signature Punchline
              </span>
              <p className="text-sm font-display font-bold text-white italic">
                "{roastData.signaturePunchline}"
              </p>
            </div>

          </div>

          {/* Modal Footer Controls */}
          <div className="px-6 py-4 border-t border-[#26232B] bg-[#16141C] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReroast}
                disabled={isRegenerating}
                className="py-2.5 px-3.5 rounded-xl bg-[#26232B] hover:bg-[#312D3A] text-zinc-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-[#3A3546]"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-orange-400 ${isRegenerating ? 'animate-spin' : ''}`} />
                <span>Re-Roast 🔥</span>
              </button>

              <button
                type="button"
                onClick={handleCopyRoast}
                className="py-2.5 px-3.5 rounded-xl bg-[#26232B] hover:bg-[#312D3A] text-zinc-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-[#3A3546]"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Roast Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-[#C9B8E8]" />
                    <span>Copy Roast</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {onDirectSelect && (
                <button
                  type="button"
                  onClick={() => {
                    onDirectSelect(creator);
                    onClose();
                  }}
                  className="py-2.5 px-4 rounded-xl bg-[#C9B8E8] text-[#0C0B0D] hover:bg-[#D8CAF2] text-xs font-display font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Select for Campaign</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-[#201D26] hover:bg-[#2A2633] text-zinc-300 text-xs font-mono font-bold transition-all cursor-pointer border border-[#2D2838]"
              >
                Done Laughing
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
