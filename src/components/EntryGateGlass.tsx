import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Briefcase,
  User,
  Shield,
  ChevronRight,
  Radio,
  Zap,
} from 'lucide-react';

const MOCK_PINS = [
  { id: 1, x: 18, y: 22, label: 'Malviya Nagar', budget: '₹8,200' },
  { id: 2, x: 38, y: 55, label: 'Hauz Khas', budget: '₹12,400' },
  { id: 3, x: 62, y: 30, label: 'Saket', budget: '₹6,800' },
  { id: 4, x: 72, y: 68, label: 'Lajpat Nagar', budget: '₹9,600' },
  { id: 5, x: 25, y: 78, label: 'Defence Colony', budget: '₹11,000' },
  { id: 6, x: 82, y: 18, label: 'GK-1', budget: '₹7,400' },
  { id: 7, x: 50, y: 12, label: 'Vasant Kunj', budget: '₹15,200' },
  { id: 8, x: 88, y: 48, label: 'Nehru Place', budget: '₹5,800' },
];

const STAT_BUBBLES = [
  { text: '₹12,400 dispatched', x: 15, y: 35 },
  { text: '3 campaigns live', x: 60, y: 72 },
  { text: '8 creators matched', x: 70, y: 15 },
];

const roleCardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 32, delay: 0.2 + i * 0.12 },
  }),
};

function FullScreenSignalCanvas() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="absolute inset-0 bg-[#070709] overflow-hidden">
      <motion.div
        initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
        animate={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }}
        transition={{ duration: 1.8, ease: [0.25, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        {/* Animated Nebula gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            animate={{ x: [0, 80, -40, 0], y: [0, -50, 50, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute top-[-10%] left-[-10%] w-3/4 h-3/4 rounded-full opacity-60" 
            style={{ background: 'radial-gradient(ellipse at center, rgba(79,70,229,0.3) 0%, transparent 60%)', filter: 'blur(60px)' }} 
          />
          <motion.div 
            animate={{ x: [0, -80, 40, 0], y: [0, 50, -50, 0] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-50" 
            style={{ background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.2) 0%, transparent 60%)', filter: 'blur(50px)' }} 
          />
        </div>

      {/* Orthogonal grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Grid Runners (Data Packets) */}
      {[...Array(7)].map((_, i) => (
        <motion.div
          key={`h-runner-${i}`}
          className="absolute h-[1px] w-64 bg-gradient-to-r from-transparent via-indigo-500/80 to-transparent shadow-[0_0_12px_rgba(99,102,241,0.9)] opacity-40"
          style={{ top: `${15 + i * 12}%` }}
          initial={{ left: '-20%' }}
          animate={{ left: '120%' }}
          transition={{ duration: 5 + (i % 3) * 3, repeat: Infinity, delay: i * 1.5, ease: 'linear' }}
        />
      ))}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`v-runner-${i}`}
          className="absolute w-[1px] h-64 bg-gradient-to-b from-transparent via-emerald-500/80 to-transparent shadow-[0_0_12px_rgba(16,185,129,0.9)] opacity-40"
          style={{ left: `${20 + i * 10}%` }}
          initial={{ top: '-20%' }}
          animate={{ top: '120%' }}
          transition={{ duration: 6 + (i % 4) * 2, repeat: Infinity, delay: i * 1.2, ease: 'linear' }}
        />
      ))}

      {/* Creator pins */}
      {MOCK_PINS.map((pin, i) => (
        <motion.div
          key={pin.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.5 + i * 0.1 }}
          className="absolute group cursor-default"
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
        >
          <span className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(99,102,241,0.3)', animationDuration: `${1.8 + (i % 3) * 0.4}s`, animationDelay: `${i * 0.2}s`, width: 16, height: 16, left: -4, top: -4 }} />
          <div className="relative w-2 h-2 rounded-full" style={{ background: '#6366F1', boxShadow: '0 0 10px rgba(99,102,241,0.9), 0 0 4px rgba(99,102,241,1)' }} />
        </motion.div>
      ))}

      {/* Floating stat bubbles */}
      {STAT_BUBBLES.map((b, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ delay: 1.2 + i * 0.2, duration: 0.5 }}
          className="absolute"
          style={{ left: `${b.x}%`, top: `${b.y}%` }}
        >
          <motion.div 
             animate={{ y: [0, -10, 0] }}
             transition={{ duration: 4, repeat: Infinity, delay: i * 1.3, ease: 'easeInOut' }}
             className="px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 whitespace-nowrap" style={{ background: 'rgba(26,30,39,0.85)', border: '1px solid rgba(99,102,241,0.25)', borderTopColor: 'rgba(99,102,241,0.40)', color: '#A5B4FC', backdropFilter: 'blur(12px)' }}
          >
            <Zap className="w-2.5 h-2.5 text-violet-400" />
            {b.text}
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
    </div>
  );
}

export default function EntryGateGlass() {
  return (
    <div className="w-screen h-screen relative flex items-center justify-center overflow-hidden bg-black text-zinc-200">
      
      <FullScreenSignalCanvas />

      {/* THE MASSIVE GLASS PANE */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-4 md:inset-6 z-10 rounded-3xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)]"
        style={{
          background: 'rgba(15, 17, 22, 0.5)', // Dark tint, NO blur
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderTopColor: 'rgba(255, 255, 255, 0.25)', // Glossy top edge
          borderLeftColor: 'rgba(255, 255, 255, 0.15)',
        }}
      >
        {/* Glossy Diagonal Reflection Overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 30%, transparent 50%, transparent 100%)'
        }} />

        {/* ── LOGO (Old Place: Top Left) ── */}
        <div className="absolute top-8 left-8 md:top-10 md:left-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-black text-white text-xl" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}>
            R.
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-[0.2em] uppercase text-white leading-none">RADIUS</span>
            <span className="text-[10px] font-mono tracking-widest uppercase leading-none mt-1 text-indigo-300">Creator Marketplace</span>
          </div>
        </div>

        {/* ── TAGLINE (Old Place: Bottom Left) ── */}
        <div className="absolute bottom-8 left-8 md:bottom-12 md:left-10">
          <p className="text-xs font-mono uppercase tracking-[0.25em] mb-4 text-indigo-400">
            Local Region · Creator Network
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-white">
            Creator campaigns,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">exactly where they happen.</span>
          </h2>
        </div>

        {/* ── AUTHENTICATION / SELECT PORTAL (Old Place: Right Side 40%) ── */}
        <div className="absolute top-0 right-0 w-full md:w-[40%] h-full flex flex-col justify-center p-8 md:p-12">
          
          {/* Tapered Partition Line */}
          <div className="hidden md:block absolute left-0 top-16 bottom-16 w-[1px] bg-gradient-to-b from-transparent via-white/25 to-transparent pointer-events-none" />

          <div className="flex flex-col gap-2 mb-10">
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-indigo-400">
              Mission Control
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Select your portal.
            </h1>
            <p className="text-sm leading-relaxed text-zinc-400 mt-2">
              Identify your role to enter the Creator Marketplace network.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {/* Brand Card */}
            <motion.button
              custom={0}
              variants={roleCardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.02, y: -2, backgroundColor: 'rgba(99,102,241,0.1)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full text-left rounded-2xl p-5 flex items-start gap-5 cursor-pointer"
              style={{
                background: 'rgba(99,102,241,0.06)',
                borderTop: '1px solid rgba(99,102,241,0.30)',
                borderLeft: '1px solid rgba(99,102,241,0.15)',
                borderRight: '1px solid rgba(99,102,241,0.15)',
                borderBottom: '1px solid rgba(99,102,241,0.08)',
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99,102,241,0.14)', border: '1px solid rgba(99,102,241,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Briefcase className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-white">Brand Portal</h3>
                  <ChevronRight className="w-5 h-5 text-indigo-400/50" />
                </div>
                <p className="text-sm leading-snug text-zinc-400">
                  Launch location-based campaigns, discover local creators, and lock funds in secure vault.
                </p>
              </div>
            </motion.button>

            {/* Creator Card */}
            <motion.button
              custom={1}
              variants={roleCardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.02, y: -2, backgroundColor: 'rgba(16,185,129,0.1)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full text-left rounded-2xl p-5 flex items-start gap-5 cursor-pointer"
              style={{
                background: 'rgba(16,185,129,0.05)',
                borderTop: '1px solid rgba(16,185,129,0.28)',
                borderLeft: '1px solid rgba(16,185,129,0.12)',
                borderRight: '1px solid rgba(16,185,129,0.12)',
                borderBottom: '1px solid rgba(16,185,129,0.06)',
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Radio className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-white">Creator Radar</h3>
                  <ChevronRight className="w-5 h-5 text-emerald-400/50" />
                </div>
                <p className="text-sm leading-snug text-zinc-400">
                  Receive local campaign offers, submit content, and get paid instantly upon verification.
                </p>
              </div>
            </motion.button>

            <div className="flex gap-3 items-start mt-6">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold font-mono tracking-tight uppercase text-zinc-400">100% secure vault</span>
                <p className="text-[11px] leading-relaxed text-zinc-500">
                  Funds lock securely and release autonomously when deliverables are GPS-verified.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
