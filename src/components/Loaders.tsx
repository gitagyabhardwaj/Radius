import React from 'react';
import { motion } from 'motion/react';

export const RadarSweep = () => (
  <div className="w-full h-full bg-[#0A0A0B] flex flex-col items-center justify-center relative overflow-hidden">
    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
    <div className="relative flex items-center justify-center w-64 h-64">
      <div className="absolute inset-0 border border-indigo-500/20 rounded-full" />
      <div className="absolute inset-8 border border-indigo-500/20 rounded-full" />
      <div className="absolute inset-16 border border-indigo-500/30 rounded-full" />
      
      <motion.div 
        className="absolute inset-0 rounded-full origin-center"
        style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(99,102,241,0.05) 280deg, rgba(99,102,241,0.4) 360deg)' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute top-0 left-1/2 w-[2px] h-1/2 bg-indigo-400 origin-bottom shadow-[0_0_10px_rgba(99,102,241,1)]" />
      </motion.div>
      
      <div className="w-3 h-3 bg-indigo-400 rounded-full shadow-[0_0_15px_rgba(99,102,241,1)] z-10" />
      
      {[
        { t: '20%', l: '30%', d: 0 },
        { t: '60%', l: '70%', d: 1.5 },
        { t: '30%', l: '80%', d: 2.2 },
        { t: '70%', l: '40%', d: 0.8 },
      ].map((pos, i) => (
        <motion.div 
          key={i}
          className="absolute w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]"
          style={{ top: pos.t, left: pos.l }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, delay: pos.d, ease: "circOut" }}
        />
      ))}
    </div>
    <div className="mt-8 font-mono text-xs text-indigo-400/60 tracking-[0.3em]">SCANNING GRID</div>
  </div>
);

export const TopographicPulse = () => (
  <div className="w-full h-full bg-[#050508] flex items-center justify-center overflow-hidden relative">
    <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-900/10 to-transparent" />
    
    <div className="relative w-full h-full flex items-center justify-center opacity-60">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-96 h-96 border border-fuchsia-500/30 shadow-[inset_0_0_20px_rgba(217,70,239,0.05)]"
          style={{ 
            borderRadius: `${40 + (i%3)*10}% ${60 - (i%2)*15}% ${50 + (i%4)*5}% ${50 - (i%3)*10}%` 
          }}
          animate={{ 
            rotate: 360,
            scale: [1 + i*0.1, 1.05 + i*0.1, 1 + i*0.1]
          }}
          transition={{ 
            rotate: { duration: 20 + i*2, repeat: Infinity, ease: "linear" },
            scale: { duration: 4 + i, repeat: Infinity, ease: "easeInOut" }
          }}
        />
      ))}
    </div>

    <div className="z-10 bg-[#050508]/80 backdrop-blur-md px-6 py-3 rounded-full border border-fuchsia-500/20 flex items-center gap-3">
      <motion.div className="w-2 h-2 bg-fuchsia-500 rounded-full" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
      <span className="font-mono text-xs text-fuchsia-200 tracking-widest">MAPPING TERRAIN</span>
    </div>
  </div>
);

export const MinimalOrbit = () => (
  <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center relative">
    <div className="relative w-32 h-32 flex items-center justify-center mb-8">
      <motion.div className="absolute inset-0 border-[3px] border-t-zinc-100 border-r-transparent border-b-zinc-100 border-l-transparent rounded-full opacity-80"
        animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute inset-4 border-[3px] border-t-zinc-400 border-r-transparent border-b-zinc-400 border-l-transparent rounded-full opacity-60"
        animate={{ rotate: -360 }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute inset-8 border-[3px] border-t-zinc-600 border-r-transparent border-b-zinc-600 border-l-transparent rounded-full opacity-40"
        animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
      <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
    </div>
    <div className="font-sans text-xs font-semibold text-zinc-400 uppercase tracking-widest">
      Establishing connection
    </div>
  </div>
);

export const GlassWave = () => (
  <div className="w-full h-full bg-[#0A0B10] flex flex-col items-center justify-center relative overflow-hidden">
    <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
      <motion.div className="w-[150%] h-48 bg-gradient-to-r from-transparent via-blue-500 to-transparent blur-[80px]"
        animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
    </div>
    
    <div className="relative z-10 flex gap-[6px] items-end h-16 mb-6">
      {[...Array(9)].map((_, i) => (
        <motion.div 
          key={i} 
          className="w-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
          initial={{ height: '20%' }}
          animate={{ height: ['20%', `${40 + Math.random()*60}%`, '20%'] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
    <div className="font-mono text-xs text-blue-200 tracking-widest opacity-80">
      SYNCING FREQUENCY
    </div>
  </div>
);

export const HolographicOrb = () => (
  <div className="w-48 h-48 relative flex items-center justify-center">
    <motion.div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/20 to-fuchsia-500/20 blur-xl"
      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 4, repeat: Infinity }} />
    <motion.div className="absolute inset-4 rounded-full border border-indigo-400/30"
      animate={{ rotate: 360, scale: [1, 1.05, 1] }} transition={{ rotate: { duration: 8, repeat: Infinity, ease: "linear" }, scale: { duration: 4, repeat: Infinity } }} />
    <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)]">
      <span className="text-white font-bold tracking-tighter">R.</span>
    </div>
  </div>
);

export const NeuralStream = () => <div />;
