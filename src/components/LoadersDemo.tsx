import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RadarSweep, TopographicPulse, MinimalOrbit, GlassWave } from './Loaders';

export default function LoadersDemo() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Toggle the loader on and off every 4 seconds to show the entrance/exit animations
    const interval = setInterval(() => {
      setIsLoading(prev => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const renderWindow = (title: string, LoaderComponent: React.ComponentType, exitAnim: any) => (
    <div className="w-1/2 h-1/2 relative border-r border-b border-white/5 overflow-hidden">
      
      {/* ── FAKE WORKSPACE (Underneath) ── */}
      <div className="absolute inset-0 bg-[#0A0B10] flex flex-col items-center justify-center p-8 text-center opacity-80">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 mb-4 animate-pulse" />
        <div className="w-48 h-4 bg-white/10 rounded mb-2" />
        <div className="w-32 h-4 bg-white/5 rounded" />
        <div className="mt-8 font-mono text-xs tracking-[0.2em] text-emerald-400/80">WORKSPACE ACTIVE</div>
      </div>

      {/* ── THE LOADER OVERLAY ── */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loader-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={exitAnim}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-10 origin-center"
          >
            <LoaderComponent />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DRAFT LABEL ── */}
      <div className="absolute top-4 left-4 font-mono text-xs text-white/80 tracking-widest bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 z-20 shadow-lg">
        {title}
      </div>
    </div>
  );

  return (
    <div className="w-screen h-screen bg-black flex flex-wrap">
      {renderWindow("1. RADAR (Curtain Up)", RadarSweep, { y: "-100%" })}
      {renderWindow("2. TOPO (Zoom Dive)", TopographicPulse, { opacity: 0, scale: 1.5, filter: "blur(20px)" })}
      {renderWindow("3. MINIMAL (Smooth Dissolve)", MinimalOrbit, { opacity: 0 })}
      {renderWindow("4. GLASS (Split Wipe)", GlassWave, { scaleY: 0, opacity: 0, transformOrigin: "bottom" })}
    </div>
  );
}
