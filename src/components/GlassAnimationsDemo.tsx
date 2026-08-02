import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, Radio, Shield, ChevronRight } from 'lucide-react';

// ─── BACKGROUND CANVAS (Reused) ───
function MiniSignalCanvas() {
  return (
    <div className="absolute inset-0 bg-[#070709] overflow-hidden">
      <motion.div
        initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
        animate={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: [0.25, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '24px 24px', // smaller grid for demo
          }}
        />
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            animate={{ x: [0, 40, -20, 0], y: [0, -25, 25, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute top-[-10%] left-[-10%] w-3/4 h-3/4 rounded-full opacity-60" 
            style={{ background: 'radial-gradient(ellipse at center, rgba(79,70,229,0.3) 0%, transparent 60%)', filter: 'blur(30px)' }} 
          />
        </div>
      </motion.div>
    </div>
  );
}

// ─── MINI GLASS PANE ───
function MiniGlassPane({ animationProps }: { animationProps: any }) {
  return (
    <motion.div 
      {...animationProps}
      className="absolute inset-4 z-10 rounded-2xl overflow-hidden shadow-2xl"
      style={{
        background: 'rgba(15, 17, 22, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderTopColor: 'rgba(255, 255, 255, 0.25)',
        borderLeftColor: 'rgba(255, 255, 255, 0.15)',
        ...animationProps.style
      }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 30%, transparent 50%, transparent 100%)' }} />

      {/* Mini Layout content to look like the real one */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div className="w-6 h-6 rounded flex items-center justify-center font-display font-black text-white text-[10px]" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>R.</div>
        <span className="font-bold text-[8px] tracking-[0.2em] text-white">RADIUS</span>
      </div>

      <div className="absolute bottom-4 left-4">
        <h2 className="text-sm font-bold leading-tight text-white">Creator campaigns,<br/><span className="text-indigo-400">exactly where they happen.</span></h2>
      </div>

      <div className="absolute top-0 right-0 w-[40%] h-full flex flex-col justify-center p-4">
        <div className="absolute left-0 top-8 bottom-8 w-[1px] bg-gradient-to-b from-transparent via-white/25 to-transparent" />
        <h1 className="text-xs font-bold text-white mb-2">Select your portal.</h1>
        <div className="flex flex-col gap-2">
          <div className="w-full rounded p-2 flex items-center gap-2" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
             <Briefcase className="w-3 h-3 text-indigo-400" />
             <span className="text-[9px] font-bold text-white">Brand Portal</span>
          </div>
          <div className="w-full rounded p-2 flex items-center gap-2" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
             <Radio className="w-3 h-3 text-emerald-400" />
             <span className="text-[9px] font-bold text-white">Creator Radar</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── DEMO MAIN ───
export default function GlassAnimationsDemo() {
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 600); // blank for 600ms before re-entering
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const renderQuadrant = (title: string, animationProps: any) => (
    <div className="w-1/2 h-1/2 relative border-r border-b border-white/5 bg-black" style={{ perspective: '1000px' }}>
      <AnimatePresence>
        {isPlaying && (
          <>
            <MiniSignalCanvas />
            <MiniGlassPane animationProps={animationProps} />
          </>
        )}
      </AnimatePresence>
      <div className="absolute top-2 left-1/2 -translate-x-1/2 font-mono text-[10px] text-white/80 bg-black/80 backdrop-blur px-2 py-1 rounded border border-white/10 z-20">
        {title}
      </div>
    </div>
  );

  return (
    <div className="w-screen h-screen bg-black flex flex-wrap">
      {renderQuadrant("1. CINEMATIC FLOAT + POP", {
        initial: { opacity: 0, scale: 0.96, y: 80, filter: 'blur(30px)' },
        animate: { 
          opacity: [0, 1, 1], 
          y: [80, 0, 0], 
          scale: [0.96, 0.96, 1], 
          filter: ['blur(30px)', 'blur(0px)', 'blur(0px)'] 
        },
        exit: { opacity: 0, scale: 0.95 },
        transition: { 
          duration: 1.4, 
          times: [0, 0.7, 1], 
          ease: ["easeInOut", "easeInOut"], 
          delay: 0.8 
        },
      })}
      
      {renderQuadrant("2. THE HUD POP", {
        initial: { opacity: 0, scale: 0.4, filter: 'blur(30px)' },
        animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
        exit: { opacity: 0, scale: 0.95 },
        transition: { type: 'spring', stiffness: 400, damping: 25, delay: 0.8 },
      })}
      
      {renderQuadrant("3. EXPANDING FLOAT (Scale + Drift)", {
        initial: { opacity: 0, y: 50, scale: 0.92, filter: 'blur(30px)' },
        animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
        exit: { opacity: 0, scale: 0.95 },
        transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.8 },
      })}
      
      {renderQuadrant("4. THE CARD FLIP", {
        initial: { opacity: 0, rotateY: -180, scale: 0.8, filter: 'blur(10px)' },
        animate: { opacity: 1, rotateY: 0, scale: 1, filter: 'blur(0px)' },
        exit: { opacity: 0, scale: 0.95 },
        transition: { type: 'spring', stiffness: 200, damping: 22, delay: 0.8 },
      })}
    </div>
  );
}
