import React, { useState, useEffect, useRef } from 'react';
import { SignIn, useUser, useClerk } from '@clerk/clerk-react';
import { Creator } from '../types';
import {
  Briefcase,
  User,
  Compass,
  Shield,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  X,
  PlayCircle,
  MapPin,
  Radio,
  DollarSign,
  Sliders,
  Clock,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ─── ANIMATION VARIANTS ───
const canvasVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30, delay: 0.3 },
  },
};

const pinVariants = (delay: number) => ({
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1, scale: 1,
    transition: { type: 'spring', stiffness: 500, damping: 20, delay },
  },
});

const roleCardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 32, delay: 0.55 + i * 0.12 },
  }),
};

// ─── MOCK CREATOR PINS ───
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

// Floating stat bubbles
const STAT_BUBBLES = [
  { text: '₹12,400 dispatched', x: 15, y: 35 },
  { text: '3 campaigns live', x: 60, y: 72 },
  { text: '8 creators matched', x: 70, y: 15 },
];

// ─── WALKTHROUGH SLIDES ───
function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderTopColor: 'rgba(255,255,255,0.16)', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
        <span className="w-2 h-2 rounded-full bg-red-500/60" />
        <span className="w-2 h-2 rounded-full bg-amber-500/60" />
        <span className="w-2 h-2 rounded-full bg-emerald-500/60" />
        <span className="ml-2 text-[9px] font-mono uppercase tracking-wider text-zinc-300">radius.app</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

const SLIDES = [
  {
    label: 'Brand Setup',
    icon: MapPin,
    title: 'Draw a geofence, lock the budget.',
    caption: 'Brands set a coordinate radius and deposit campaign funds straight into a smart escrow contract.',
    visual: (
      <BrowserFrame>
        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-2 flex flex-col gap-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              <Sliders className="w-3 h-3" /> Geofence Radius
            </div>
            <div className="h-1.5 rounded-full bg-zinc-700 relative">
              <div className="absolute inset-y-0 left-0 w-2/3 rounded-full bg-indigo-500" />
              <div className="absolute -top-1 left-2/3 w-3 h-3 rounded-full bg-white border-2 border-indigo-500" />
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400 mt-1">
              <DollarSign className="w-3 h-3" /> Budget
            </div>
            <div className="h-7 rounded-lg px-2 flex items-center text-xs font-mono text-zinc-300" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              ₹25,000
            </div>
            <button className="mt-2 py-2 rounded-lg text-white text-[11px] font-bold font-mono" style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)' }}>
              Lock Budget & Launch
            </button>
          </div>
          <div className="col-span-3 rounded-lg relative flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <div className="w-16 h-16 rounded-full" style={{ border: '1.5px dashed rgba(99,102,241,0.5)', background: 'rgba(99,102,241,0.08)' }} />
            <div className="absolute w-2.5 h-2.5 rounded-full bg-indigo-400" style={{ boxShadow: '0 0 8px rgba(99,102,241,0.8)' }} />
          </div>
        </div>
      </BrowserFrame>
    ),
  },
  {
    label: 'Dispatch Room',
    icon: Radio,
    title: 'Batches auto-forward in real time.',
    caption: 'Matched creators queue in batches — if one times out, the offer moves to the next batch automatically.',
    visual: (
      <BrowserFrame>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { name: 'Batch A', status: 'Dispatched', pct: 70, active: true },
            { name: 'Batch B', status: 'Queued', pct: 20, active: false },
            { name: 'Batch C', status: 'Pending', pct: 0, active: false },
          ].map((b) => (
            <div key={b.name} className="rounded-lg p-2.5 flex flex-col gap-2" style={{ border: `1px solid ${b.active ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)'}`, background: b.active ? 'rgba(99,102,241,0.07)' : 'transparent' }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-zinc-300">{b.name}</span>
                <Clock className="w-3 h-3 text-zinc-400" />
              </div>
              <div className="h-1 rounded-full bg-zinc-700">
                <div className="h-full rounded-full bg-indigo-500" style={{ width: `${b.pct}%` }} />
              </div>
              <span className="text-[9px] font-mono text-zinc-400">{b.status}</span>
            </div>
          ))}
        </div>
      </BrowserFrame>
    ),
  },
  {
    label: 'Creator Radar',
    icon: User,
    title: 'Creators accept & submit content.',
    caption: 'Local creators see hyperlocal offers on their radar and accept a campaign to start delivering.',
    visual: (
      <BrowserFrame>
        <div className="flex flex-col gap-2">
          {[
            { name: 'Nike Air Max Drop', dist: '0.8 km', active: true },
            { name: 'Blue Tokai Coffee', dist: '1.4 km', active: false },
          ].map((c, i) => (
            <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', border: `1px solid ${i === 0 ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '8px', padding: '8px 12px' }}>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-200">{c.name}</span>
                <span className="text-[9px] font-mono text-zinc-400">{c.dist} away</span>
              </div>
              <button
                className="text-[10px] font-mono font-bold px-2 py-1 rounded-md text-white"
                style={{ background: i === 0 ? 'linear-gradient(135deg,#34D399,#10B981)' : 'rgba(255,255,255,0.07)', border: i !== 0 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}
              >
                Accept
              </button>
            </div>
          ))}
        </div>
      </BrowserFrame>
    ),
  },
  {
    label: 'Escrow Release',
    icon: ShieldCheck,
    title: 'Instant, automated payout.',
    caption: 'Once a deliverable is verified, the locked escrow funds release to the creator instantly.',
    visual: (
      <BrowserFrame>
        <div className="flex items-center gap-3">
          <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Content Verified</span>
            <span className="text-sm font-bold text-zinc-200">₹4,200 ready to release</span>
          </div>
          <button className="py-2 px-3 rounded-lg text-white text-[10px] font-bold font-mono whitespace-nowrap" style={{ background: 'linear-gradient(135deg,#10B981,#059669)', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
            Trigger Payout
          </button>
        </div>
      </BrowserFrame>
    ),
  },
];

function AppWalkthroughDeck({ onClose }: { onClose: () => void }) {
  const [slide, setSlide] = useState(0);
  const current = SLIDES[slide];
  const StepIcon = current.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        className="glass-4 w-full max-w-lg p-6 flex flex-col gap-5 rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <StepIcon className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
              {slide + 1} / {SLIDES.length} — {current.label}
            </span>
          </div>
          <button onClick={onClose} aria-label="Close walkthrough" className="text-zinc-400 hover:text-zinc-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold tracking-tight text-zinc-100">{current.title}</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">{current.caption}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
          >
            {current.visual}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all ${i === slide ? 'w-5 bg-indigo-500' : 'w-1.5 bg-zinc-700'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {slide > 0 && (
              <button onClick={() => setSlide((s) => Math.max(0, s - 1))} className="btn-secondary py-1.5 px-2.5 text-[11px] font-mono font-bold flex items-center gap-1">
                <ChevronLeft className="w-3 h-3" /> Back
              </button>
            )}
            {slide < SLIDES.length - 1 ? (
              <button onClick={() => setSlide((s) => Math.min(SLIDES.length - 1, s + 1))} className="btn-primary py-1.5 px-3 text-[11px] font-mono font-bold flex items-center gap-1">
                Next <ChevronRight className="w-3 h-3" />
              </button>
            ) : (
              <button onClick={onClose} className="btn-mint py-1.5 px-3 text-[11px] font-mono font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Done
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── ANIMATED LEFT CANVAS ───
function SignalCanvas() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      variants={canvasVariants}
      initial="hidden"
      animate={visible ? 'visible' : 'hidden'}
      className="relative w-full h-full overflow-hidden"
      style={{ background: 'var(--color-obsidian)' }}
    >
      {/* Nebula gradient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-3/4 h-3/4 rounded-full opacity-60" style={{ background: 'radial-gradient(ellipse at 20% 20%, rgba(79,70,229,0.25) 0%, transparent 60%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 rounded-full opacity-50" style={{ background: 'radial-gradient(ellipse at 80% 80%, rgba(16,185,129,0.15) 0%, transparent 60%)', filter: 'blur(30px)' }} />
      </div>

      {/* Orthogonal grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Creator pins */}
      {MOCK_PINS.map((pin, i) => (
        <motion.div
          key={pin.id}
          variants={pinVariants(0.5 + i * 0.1)}
          initial="hidden"
          animate={visible ? 'visible' : 'hidden'}
          className="absolute group cursor-default"
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
        >
          {/* Pulse rings */}
          <span className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(99,102,241,0.3)', animationDuration: `${1.8 + (i % 3) * 0.4}s`, animationDelay: `${i * 0.2}s`, width: 16, height: 16, left: -4, top: -4 }} />
          {/* Core dot */}
          <div className="relative w-2 h-2 rounded-full" style={{ background: '#6366F1', boxShadow: '0 0 10px rgba(99,102,241,0.9), 0 0 4px rgba(99,102,241,1)' }} />
          {/* Hover tooltip */}
          <div className="absolute left-4 -top-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            <div className="px-2 py-1 rounded-md text-[9px] font-mono" style={{ background: 'rgba(15,17,22,0.95)', border: '1px solid rgba(255,255,255,0.12)', color: '#8B909C' }}>
              <span className="text-violet-400 font-bold">{pin.label}</span> · {pin.budget}
            </div>
          </div>
        </motion.div>
      ))}

      {/* Floating stat bubbles */}
      {STAT_BUBBLES.map((b, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ delay: 1.2 + i * 0.2, duration: 0.5 }}
          className="absolute float-animation"
          style={{ left: `${b.x}%`, top: `${b.y}%`, animationDelay: `${i * 1.3}s` }}
        >
          <div className="px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 whitespace-nowrap" style={{ background: 'rgba(26,30,39,0.85)', border: '1px solid rgba(99,102,241,0.25)', borderTopColor: 'rgba(99,102,241,0.40)', color: '#A5B4FC', backdropFilter: 'blur(12px)' }}>
            <Zap className="w-2.5 h-2.5 text-violet-400" />
            {b.text}
          </div>
        </motion.div>
      ))}

      {/* Bottom brand tagline */}
      <div className="absolute bottom-8 left-8 right-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] mb-2" style={{ color: 'rgba(99,102,241,0.7)' }}>
            Delhi NCR · Hyperlocal Grid
          </p>
          <h2 className="text-2xl font-bold tracking-tight leading-tight" style={{ color: 'rgba(241,241,243,0.9)' }}>
            Creator campaigns,<br />
            <span className="text-gradient-violet">exactly where they happen.</span>
          </h2>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── MAIN ENTRYGATE ───
interface EntryGateProps {
  creators: Creator[];
  onSignIn: (role: 'brand' | 'creator', profileData: any) => void;
}

export default function EntryGate({ creators, onSignIn }: EntryGateProps) {
  const { isSignedIn, user: clerkUser } = useUser();
  const { signOut } = useClerk();

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'brand' | 'creator' | null>(null);
  const [showDeck, setShowDeck] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'var(--color-obsidian)' }}>

      {/* ── LEFT PANEL — 60% — Animated Canvas ── */}
      <div className="hidden lg:block lg:w-[60%] h-full relative">
        <SignalCanvas />

        {/* Logo watermark top-left */}
        <div className="absolute top-8 left-8 flex items-center gap-3 z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.1 }}
            className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-white text-base sidebar-logo-bg"
          >
            R.
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="flex flex-col"
          >
            <span className="font-bold text-sm tracking-[0.2em] uppercase text-white leading-none">RADIUS</span>
            <span className="text-[9px] font-mono tracking-widest uppercase leading-none mt-1" style={{ color: 'var(--color-text-tertiary)' }}>Hyperlocal Escrow</span>
          </motion.div>
        </div>
      </div>

      {/* ── RIGHT PANEL — 40% — Auth Card ── */}
      <div className="w-full lg:w-[40%] h-full flex flex-col overflow-y-auto relative" style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', background: 'var(--color-obsidian-surface)' }}>

        {/* Mobile-only logo */}
        <div className="lg:hidden flex items-center gap-3 p-6 pb-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-white text-sm sidebar-logo-bg">R.</div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-widest uppercase text-white leading-none">RADIUS</span>
            <span className="text-[9px] font-mono tracking-widest uppercase leading-none mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>Hyperlocal Escrow</span>
          </div>
        </div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 flex flex-col justify-center px-8 py-10 max-w-md mx-auto w-full"
        >

          {/* Header text */}
          <div className="flex flex-col gap-2 mb-8">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: 'var(--color-violet-bright)' }}>
              Mission Control
            </p>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              {selectedRole ? 'Authenticate.' : 'Select your portal.'}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {selectedRole
                ? 'Sign in securely to access your workspace.'
                : 'Identify your role to enter the hyperlocal escrow network.'}
            </p>
          </div>

          <AnimatePresence mode="wait">

            {/* ── ROLE SELECTION ── */}
            {!selectedRole && (
              <motion.div
                key="role-select"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >
                {/* Brand Card */}
                <motion.button
                  id="role-brand-btn"
                  custom={0}
                  variants={roleCardVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={() => setSelectedRole('brand')}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full text-left rounded-2xl p-5 flex items-start gap-4 transition-all cursor-pointer"
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
                      <h3 className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>Brand Portal</h3>
                      <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
                    </div>
                    <p className="text-sm leading-snug" style={{ color: 'var(--color-text-secondary)' }}>
                      Launch geo-targeted campaigns, discover local creators, and lock funds in smart escrow.
                    </p>
                  </div>
                </motion.button>

                {/* Creator Card */}
                <motion.button
                  id="role-creator-btn"
                  custom={1}
                  variants={roleCardVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={() => setSelectedRole('creator')}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full text-left rounded-2xl p-5 flex items-start gap-4 transition-all cursor-pointer"
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
                      <h3 className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>Creator Radar</h3>
                      <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
                    </div>
                    <p className="text-sm leading-snug" style={{ color: 'var(--color-text-secondary)' }}>
                      Receive hyperlocal campaign offers, submit content, and get paid instantly upon verification.
                    </p>
                  </div>
                </motion.button>

                {/* Divider + Trust signal */}
                <div className="editorial-rule my-1" />
                <div className="flex gap-3 items-start">
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold font-mono tracking-tight uppercase" style={{ color: 'var(--color-text-secondary)' }}>100% Cryptographic Escrow</span>
                    <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Funds lock securely and release autonomously when deliverables are GPS-verified.
                    </p>
                  </div>
                </div>

                {/* Walkthrough button */}
                <motion.button
                  id="walkthrough-btn"
                  custom={2}
                  variants={roleCardVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={() => setShowDeck(true)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="self-center flex items-center gap-2 text-xs font-mono font-bold px-4 py-2 rounded-full transition-all"
                  style={{ background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.22)', color: '#A5B4FC' }}
                >
                  <PlayCircle className="w-4 h-4" />
                  App Walkthrough
                </motion.button>
              </motion.div>
            )}

            {/* ── SIGN IN ── */}
            {selectedRole && !isSignedIn && (
              <motion.div
                key="sign-in"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                className="flex flex-col gap-5"
              >
                <button
                  id="back-to-role-btn"
                  onClick={() => setSelectedRole(null)}
                  className="text-xs font-mono font-medium self-start transition-colors flex items-center gap-1"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  <ChevronLeft className="w-3 h-3" /> Back to role selection
                </button>

                {/* Role badge */}
                <div className="flex items-center gap-2">
                  {selectedRole === 'brand'
                    ? <span className="status-badge-violet">Brand Portal</span>
                    : <span className="status-badge-mint">Creator Radar</span>}
                </div>

                <SignIn
                  appearance={{
                    elements: {
                      rootBox: 'w-full',
                      card: 'glass-2 rounded-2xl',
                      headerTitle: 'font-bold text-zinc-100',
                      headerSubtitle: 'text-zinc-400',
                      socialButtonsBlockButton: 'btn-secondary w-full',
                      formFieldInput: 'input-field',
                      formButtonPrimary: 'btn-primary rounded-xl w-full',
                      footerActionLink: 'text-indigo-400 hover:text-indigo-300',
                    },
                  }}
                  routing="hash"
                />
              </motion.div>
            )}

            {/* ── PROFILE SETUP ── */}
            {selectedRole && isSignedIn && (
              <motion.div
                key="profile-setup"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                    Complete Your Profile.
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {selectedRole === 'brand' ? 'Provision your brand node.' : 'Activate your creator radar.'}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[11px] font-mono px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-text-tertiary)' }}>
                      Authenticated: <span className="font-bold" style={{ color: 'var(--color-text-secondary)' }}>{clerkUser?.primaryEmailAddress?.emailAddress}</span>
                    </span>
                    <button
                      onClick={async () => { await signOut(); window.location.reload(); }}
                      className="text-[11px] font-mono hover:underline"
                      style={{ color: 'var(--color-rose-alert)' }}
                    >
                      Switch Account
                    </button>
                  </div>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    if (selectedRole === 'brand') {
                      onSignIn('brand', {
                        brandName: (formData.get('brandName') as string) || '',
                        domain: (formData.get('domain') as string) || '',
                        sector: (formData.get('sector') as string) || '',
                      });
                    } else {
                      const localityInput = (formData.get('locality') as string) || '';
                      if (!localityInput.trim()) {
                        setGeocodeError('Please enter your primary city or neighborhood.');
                        return;
                      }
                      setIsGeocoding(true);
                      setGeocodeError(null);
                      try {
                        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(localityInput)}`;
                        const response = await fetch(url, { headers: { 'Accept-Language': 'en-US,en;q=0.9' } });
                        if (!response.ok) throw new Error('Geocoding failed');
                        const data = await response.json();
                        if (data && data.length > 0) {
                          const result = data[0];
                          onSignIn('creator', {
                            handle: (formData.get('handle') as string) || '',
                            niche: (formData.get('niche') as string) || '',
                            locality: result.display_name,
                            lat: parseFloat(result.lat),
                            lng: parseFloat(result.lon),
                          });
                        } else {
                          setGeocodeError('Location not found. Try "Connaught Place, Delhi".');
                          setIsGeocoding(false);
                        }
                      } catch (err) {
                        console.error(err);
                        setGeocodeError('Failed to verify location. Please try again.');
                        setIsGeocoding(false);
                      }
                    }
                  }}
                  className="glass-2 p-5 rounded-2xl flex flex-col gap-4"
                >
                  {selectedRole === 'brand' ? (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-widest font-medium" style={{ color: 'var(--color-text-tertiary)' }}>Brand Name</label>
                        <input name="brandName" required type="text" className="input-field" placeholder="e.g. Nike" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-widest font-medium" style={{ color: 'var(--color-text-tertiary)' }}>Corporate Domain</label>
                        <input name="domain" required type="text" className="input-field" placeholder="e.g. nike.com" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-widest font-medium" style={{ color: 'var(--color-text-tertiary)' }}>Primary Market Sector</label>
                        <select name="sector" required className="input-field" style={{ background: 'var(--color-obsidian-panel)', color: 'var(--color-text-primary)' }}>
                          <option value="" disabled>Select a Sector...</option>
                          <option value="Food & Lifestyle">Food & Lifestyle</option>
                          <option value="Fashion & Aesthetics">Fashion & Aesthetics</option>
                          <option value="Tech & Gaming">Tech & Gaming</option>
                          <option value="Photography & Art">Photography & Art</option>
                          <option value="Beauty & Makeup">Beauty & Makeup</option>
                          <option value="Travel & Adventure">Travel & Adventure</option>
                          <option value="Fitness & Health">Fitness & Health</option>
                          <option value="Sports & Athletics">Sports & Athletics</option>
                          <option value="Business & Finance">Business & Finance</option>
                          <option value="Entertainment & Comedy">Entertainment & Comedy</option>
                          <option value="Education & Review">Education & Review</option>
                          <option value="Parenting & Family">Parenting & Family</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-widest font-medium" style={{ color: 'var(--color-text-tertiary)' }}>Creator Handle</label>
                        <input name="handle" required type="text" className="input-field" placeholder="e.g. @username" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-widest font-medium" style={{ color: 'var(--color-text-tertiary)' }}>Content Niche</label>
                        <select name="niche" required className="input-field" style={{ background: 'var(--color-obsidian-panel)', color: 'var(--color-text-primary)' }}>
                          <option value="" disabled>Select a Niche...</option>
                          <option value="Food & Lifestyle">Food & Lifestyle</option>
                          <option value="Fashion & Aesthetics">Fashion & Aesthetics</option>
                          <option value="Tech & Gaming">Tech & Gaming</option>
                          <option value="Photography & Art">Photography & Art</option>
                          <option value="Beauty & Makeup">Beauty & Makeup</option>
                          <option value="Travel & Adventure">Travel & Adventure</option>
                          <option value="Fitness & Health">Fitness & Health</option>
                          <option value="Sports & Athletics">Sports & Athletics</option>
                          <option value="Business & Finance">Business & Finance</option>
                          <option value="Entertainment & Comedy">Entertainment & Comedy</option>
                          <option value="Education & Review">Education & Review</option>
                          <option value="Parenting & Family">Parenting & Family</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-widest font-medium" style={{ color: 'var(--color-text-tertiary)' }}>Primary Locality / Base Area</label>
                        <input name="locality" required type="text" className="input-field" placeholder="Enter your location" />
                        {geocodeError && <span className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--color-rose-alert)' }}>{geocodeError}</span>}
                      </div>
                    </>
                  )}
                  <motion.button
                    type="submit"
                    disabled={isGeocoding}
                    whileHover={{ scale: isGeocoding ? 1 : 1.01 }}
                    whileTap={{ scale: isGeocoding ? 1 : 0.98 }}
                    className="btn-primary w-full py-3 font-bold mt-1 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isGeocoding ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Locating Coordinates...
                      </>
                    ) : (
                      'Complete Setup →'
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <div className="px-8 pb-6 flex items-center gap-2">
          <span className="live-dot" />
          <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-tertiary)' }}>V2.0 Production Gateway · Secured</span>
        </div>
      </div>

      {/* Walkthrough Modal */}
      <AnimatePresence>
        {showDeck && <AppWalkthroughDeck onClose={() => setShowDeck(false)} />}
      </AnimatePresence>
    </div>
  );
}
