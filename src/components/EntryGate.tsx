import React, { useState } from 'react';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EntryGateProps {
  creators: Creator[];
  onSignIn: (role: 'brand' | 'creator', profileData: any) => void;
}

// --- Deck slide mockups: simplified stand-ins for the real in-app screens ---

function BrowserFrame({ children, accent = 'indigo' }: { children: React.ReactNode; accent?: 'indigo' | 'emerald' }) {
  return (
    <div className="rounded-xl border border-[#26232B] bg-[#151417] overflow-hidden shadow-xl">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#26232B] bg-black/40">
        <span className="w-2 h-2 rounded-full bg-zinc-700" />
        <span className="w-2 h-2 rounded-full bg-zinc-700" />
        <span className="w-2 h-2 rounded-full bg-[#F1E3A8]" />
        <span className="ml-2 text-[9px] font-mono tracking-wider text-zinc-400">
          radius.app
        </span>
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
            <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-zinc-400">
              <Sliders className="w-3 h-3 text-[#C9B8E8]" /> Geofence Radius
            </div>
            <div className="h-1.5 rounded-full bg-[#26232B] relative">
              <div className="absolute inset-y-0 left-0 w-2/3 rounded-full bg-[#C9B8E8]" />
              <div className="absolute -top-1 left-2/3 w-3 h-3 rounded-full bg-[#0C0B0D] border border-[#C9B8E8]" />
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-zinc-400 mt-1">
              <DollarSign className="w-3 h-3 text-[#F1E3A8]" /> Budget
            </div>
            <div className="h-7 rounded-lg bg-[#0C0B0D] border border-[#26232B] px-2 flex items-center text-xs font-mono text-white">
              ₹25,000
            </div>
            <button className="mt-2 py-2 rounded-lg bg-[#C9B8E8] hover:bg-[#B5A1DB] text-[#0C0B0D] text-[11px] font-bold font-mono transition-colors">
              Lock Budget & Launch
            </button>
          </div>
          <div className="col-span-3 rounded-xl bg-[radial-gradient(#26232B_1px,transparent_1px)] [background-size:10px_10px] border border-[#26232B] relative flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border border-[#C9B8E8]/40 bg-[#C9B8E8]/10" />
            <div className="absolute w-2.5 h-2.5 rounded-full bg-[#F1E3A8] shadow-[0_0_8px_#F1E3A8]" />
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
            { name: 'Batch A', status: 'Dispatched', isAccent: true, pct: 70 },
            { name: 'Batch B', status: 'Queued', isAccent: false, pct: 20 },
            { name: 'Batch C', status: 'Pending', isAccent: false, pct: 0 },
          ].map((b) => (
            <div key={b.name} className="rounded-lg border border-[#26232B] bg-black/40 p-2.5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-white">{b.name}</span>
                <Clock className="w-3 h-3 text-zinc-400" />
              </div>
              <div className="h-1 rounded-full bg-[#26232B]">
                <div
                  className={`h-full rounded-full ${b.isAccent ? 'bg-[#C9B8E8]' : 'bg-zinc-700'}`}
                  style={{ width: `${b.pct}%` }}
                />
              </div>
              <span className={`text-[9px] font-mono ${b.isAccent ? 'text-[#C9B8E8] font-bold' : 'text-zinc-500'}`}>{b.status}</span>
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
            { name: 'Nike Air Max Drop', dist: '0.8 km' },
            { name: 'Blue Tokai Coffee', dist: '1.4 km' },
          ].map((c, i) => (
            <div key={c.name} className="flex items-center justify-between rounded-lg border border-[#26232B] bg-black/40 px-3 py-2">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">{c.name}</span>
                <span className="text-[9px] font-mono text-[#F1E3A8]">{c.dist} away</span>
              </div>
              <button
                className={`text-[10px] font-mono font-bold px-2 py-1 rounded-md transition-colors ${
                  i === 0 ? 'bg-[#C9B8E8] text-[#0C0B0D] hover:bg-[#B5A1DB]' : 'bg-[#26232B] text-zinc-300'
                }`}
              >
                Accept Campaign
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
        <div className="flex items-center gap-3 bg-black/40 p-2 border border-[#26232B] rounded-lg">
          <div className="w-10 h-10 rounded-full bg-[#C9B8E8]/15 border border-[#C9B8E8]/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-[#C9B8E8]" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-[10px] font-mono tracking-wider text-zinc-400">Content Verified</span>
            <span className="text-sm font-bold text-white">₹4,200 ready to release</span>
          </div>
          <button className="py-2 px-3 rounded-lg bg-[#C9B8E8] hover:bg-[#B5A1DB] text-[#0C0B0D] text-[10px] font-bold font-mono whitespace-nowrap transition-colors">
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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        className="bg-[#151417] rounded-2xl border border-[#26232B] w-full max-w-lg p-6 flex flex-col gap-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#C9B8E8]/15 border border-[#C9B8E8]/30 flex items-center justify-center">
              <StepIcon className="w-4 h-4 text-[#C9B8E8]" />
            </div>
            <span className="text-[10px] font-mono tracking-wider text-zinc-400 font-bold uppercase">
              {slide + 1} / {SLIDES.length} — {current.label}
            </span>
          </div>
          <button onClick={onClose} aria-label="Close walkthrough" className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-display font-semibold font-semibold tracking-tight text-white font-mono uppercase">{current.title}</h3>
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
                className={`h-1.5 rounded-full transition-all ${i === slide ? 'w-5 bg-[#C9B8E8]' : 'w-1.5 bg-[#26232B]'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {slide > 0 && (
              <button
                onClick={() => setSlide((s) => Math.max(0, s - 1))}
                className="py-1.5 px-2.5 border border-[#26232B] text-zinc-400 hover:text-white hover:bg-black rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 transition-all"
              >
                <ChevronLeft className="w-3 h-3" />
                Back
              </button>
            )}

            {slide < SLIDES.length - 1 ? (
              <button
                onClick={() => setSlide((s) => Math.min(SLIDES.length - 1, s + 1))}
                className="py-1.5 px-3 bg-[#C9B8E8] hover:bg-[#B5A1DB] text-[#0C0B0D] rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 transition-all"
              >
                Next
                <ChevronRight className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="py-1.5 px-3 bg-[#C9B8E8] hover:bg-[#B5A1DB] text-[#0C0B0D] rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Done
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function EntryGate({ creators, onSignIn }: EntryGateProps) {
  const { isSignedIn, user: clerkUser } = useUser();
  const { signOut } = useClerk();
  
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  const [selectedRole, setSelectedRole] = useState<'brand' | 'creator' | null>(null);
  const [showDeck, setShowDeck] = useState(false);

  const handleRoleSelect = (role: 'brand' | 'creator') => {
    setSelectedRole(role);
  };

  return (
    <div className="min-h-screen flex w-full bg-[#0C0B0D] selection:bg-[#F1E3A8] selection:text-[#0C0B0D] relative">
      
      {/* TEXT HIGHLIGHT ILLUSTRATION (Visible only on large screens, fills empty left space) */}
      <div className="absolute left-8 xl:left-16 top-[45%] -translate-y-[45%] hidden lg:flex flex-col z-30 pointer-events-none max-w-[28%] xl:max-w-[32%]">
        
        {/* Floating Toolbar (Mimicking text selection) */}
        <motion.div 
          animate={{ opacity: [0, 0, 0, 1, 1, 0], y: [10, 10, 10, 0, 0, 10] }}
          transition={{ duration: 5, times: [0, 0.2, 0.4, 0.45, 0.8, 1], repeat: Infinity, ease: "easeOut" }}
          className="absolute -top-14 left-1/4 flex items-center gap-3 bg-[#151417] border border-[#26232B] shadow-2xl px-3 py-1.5 z-40 rounded-xl scale-90 origin-bottom-left"
        >
          <div className="flex items-center gap-3 border-r border-[#26232B] pr-3">
            <span className="text-zinc-400 font-serif text-sm font-bold">B</span>
            <span className="text-zinc-400 font-serif text-sm italic">I</span>
            <span className="text-zinc-400 font-serif text-sm underline decoration-2 underline-offset-2">U</span>
            <span className="text-zinc-400 font-serif text-sm line-through">S</span>
            <span className="text-zinc-400 font-sans text-sm font-medium ml-1">🔗</span>
          </div>
          <div className="flex items-center gap-1.5 pl-1">
            <div className="w-3.5 h-3.5 rounded-full bg-[#F1E3A8] flex items-center justify-center">
              <span className="text-[8px] text-[#0C0B0D] font-bold">✦</span>
            </div>
            <span className="text-xs text-zinc-300 font-mono font-medium tracking-wide">Ask AI</span>
          </div>
          {/* Caret pointing down */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#151417] border-b border-r border-[#26232B] rotate-45"></div>
        </motion.div>

        {/* The Text Content */}
        <h2 className="text-2xl xl:text-3xl font-display font-medium text-zinc-500 leading-snug">
          Spatial matching connects{' '}
          <span className="relative inline-block mt-1">
            <motion.span 
              animate={{ scaleX: [0, 0, 1, 1, 0] }}
              transition={{ duration: 5, times: [0, 0.2, 0.4, 0.8, 1], repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-[#F1E3A8] origin-left z-0 rounded-sm" 
            />
            <span className="relative z-10 px-1 text-[#0C0B0D] font-bold">
              local brands with creators
            </span>

            {/* Fake Cursor Illustration */}
            <motion.div 
              animate={{ 
                left: ["-5%", "-2%", "100%", "100%", "100%"], 
                top: ["150%", "40%", "40%", "150%", "150%"], 
                opacity: [0, 1, 1, 0, 0] 
              }}
              transition={{ duration: 5, times: [0, 0.2, 0.4, 0.8, 1], repeat: Infinity, ease: "easeInOut" }}
              className="absolute z-50 pointer-events-none w-6 h-6"
            >
              <svg className="w-full h-full text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 2l12 11.2-5.8.5 3.3 7.3-2.2 1-3.2-7.4-4.4 4.8z" stroke="black" strokeWidth="1"/>
              </svg>
            </motion.div>
          </span>.
        </h2>
      </div>

      {/* LEFT SIDE: Login Content */}
      <div className="flex-1 flex flex-col justify-between py-12 px-6 lg:px-12 relative overflow-hidden order-2 lg:order-1 z-20 bg-[#0C0B0D] lg:bg-transparent lg:backdrop-blur-none lg:bg-gradient-to-r lg:from-[#0C0B0D] lg:via-[#0C0B0D]/95 lg:to-transparent lg:w-1/2">
        <div className="absolute inset-0 bg-[radial-gradient(#26232B_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none mask-image-gradient-to-r" />

        <header className="max-w-xl mx-auto w-full z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#151417] border border-[#26232B] flex items-center justify-center text-[#C9B8E8] font-display font-semibold tracking-tighter text-base">
              R.
            </div>
            <div className="flex flex-col">
              <span className="font-display font-semibold font-bold text-sm tracking-wider text-white uppercase leading-none">
                RADIUS
              </span>
              <span className="text-[8px] font-mono tracking-widest text-zinc-500 mt-0.5 uppercase leading-none">
                Hyperlocal Escrow Network
              </span>
            </div>
          </div>

          {/* GRID: DELHI_NCR badge - Lilac for badge */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#0C0B0D] font-bold bg-[#C9B8E8] border border-[#C9B8E8] px-3 py-1 rounded-full shadow-sm">
            <Compass className="w-3.5 h-3.5 text-[#0C0B0D] animate-spin-slow" />
            <span>GRID: DELHI_NCR</span>
          </div>
        </header>

      <main className="max-w-lg mx-auto w-full z-10 my-auto flex flex-col gap-6 pt-8 pb-12">
        <div className="text-center flex flex-col gap-2">
          <h1 className="text-3xl font-display font-semibold font-semibold tracking-tight text-white sm:text-4xl font-mono uppercase">
            {selectedRole ? (
              <>
                Secure{' '}
                <span className="relative inline-block whitespace-nowrap">
                  <span className="relative z-10">Authentication.</span>
                  <svg className="absolute -inset-1 w-full h-full text-[#C9B8E8] z-0 pointer-events-none scale-105" viewBox="0 0 100 40" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10,20 C20,5 80,5 90,20 C100,35 20,35 10,20 C5,15 25,5 35,5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </>
            ) : (
              <>
                Select{' '}
                <span className="relative inline-block whitespace-nowrap">
                  <span className="relative z-10">Portal.</span>
                  <svg className="absolute -inset-2 w-full h-full text-[#C9B8E8] z-0 pointer-events-none scale-110" viewBox="0 0 100 40" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10,20 C20,5 80,5 90,20 C100,35 20,35 10,20 C5,15 25,5 35,5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </>
            )}
          </h1>
          <p className="text-sm text-zinc-400 max-w-sm mx-auto font-sans font-medium leading-relaxed">
            {selectedRole
              ? 'Complete your sign-in to securely access your workspace.'
              : 'Identify your role to securely access the hyperlocal escrow network.'}
          </p>
        </div>

        {!selectedRole && (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleRoleSelect('brand')}
              className="group relative w-full bg-[#151417] border border-[#26232B] hover:border-[#C9B8E8] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all text-left cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#C9B8E8]/10 border border-[#C9B8E8]/30 flex items-center justify-center shrink-0 transition-colors group-hover:bg-[#C9B8E8]/20">
                  <Briefcase className="w-6 h-6 text-[#C9B8E8]" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-display font-semibold font-bold text-white text-lg group-hover:text-[#C9B8E8] transition-colors font-mono uppercase">
                    Brand Portal
                  </h3>
                  <p className="text-sm text-zinc-400 leading-snug">
                    Launch geo-targeted campaigns, discover local creators, and lock funds in smart escrow.
                  </p>
                </div>
              </div>
              <span className="shrink-0 px-4 py-2 bg-[#C9B8E8] group-hover:bg-[#D8CAF2] text-[#0C0B0D] font-mono text-xs font-bold uppercase rounded-xl transition-all shadow-sm">
                Enter &rarr;
              </span>
            </button>

            <button
              onClick={() => handleRoleSelect('creator')}
              className="group relative w-full bg-[#151417] border border-[#26232B] hover:border-[#C9B8E8] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all text-left cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#C9B8E8]/10 border border-[#C9B8E8]/30 flex items-center justify-center shrink-0 transition-colors group-hover:bg-[#C9B8E8]/20">
                  <User className="w-6 h-6 text-[#C9B8E8]" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-display font-semibold font-bold text-white text-lg group-hover:text-[#C9B8E8] transition-colors font-mono uppercase">
                    Creator Radar
                  </h3>
                  <p className="text-sm text-zinc-400 leading-snug">
                    Receive hyperlocal campaign offers, submit content, and get paid instantly upon verification.
                  </p>
                </div>
              </div>
              <span className="shrink-0 px-4 py-2 bg-[#C9B8E8] group-hover:bg-[#D8CAF2] text-[#0C0B0D] font-mono text-xs font-bold uppercase rounded-xl transition-all shadow-sm">
                Enter &rarr;
              </span>
            </button>

            <div className="mt-4 border-t border-[#26232B] pt-6 flex gap-3 items-start">
              <Shield className="w-5 h-5 text-[#C9B8E8] shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-white font-mono tracking-tight uppercase">100% Cryptographic Escrow</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Radius holds budgets securely in escrow and releases funds autonomously when creators deliver matching GPS-verified deliverables.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDeck(true)}
              className="self-center flex items-center gap-2 text-xs font-mono font-bold text-[#0C0B0D] bg-[#C9B8E8] hover:bg-[#D8CAF2] px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <PlayCircle className="w-4 h-4 text-[#0C0B0D]" />
              App Walkthrough
            </button>
          </div>
        )}

        {selectedRole && !isSignedIn && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <button 
              onClick={() => {
                setSelectedRole(null);
              }}
              className="text-xs font-mono font-bold text-zinc-400 hover:text-[#C9B8E8] self-start transition-colors"
            >
              ← Back to role selection
            </button>
            
            <div className="flex justify-center">
              <SignIn
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'bg-[#151417] border border-[#26232B] rounded-2xl shadow-2xl',
                    headerTitle: 'font-display font-semibold font-semibold text-white',
                    headerSubtitle: 'text-zinc-400',
                    socialButtonsBlockButton: 'border-[#26232B] bg-[#0C0B0D] hover:bg-black/40 text-white font-bold rounded-xl',
                    formFieldInput: 'bg-[#0C0B0D] border-[#26232B] text-white rounded-xl focus:border-[#C9B8E8]',
                    formFieldLabel: 'text-zinc-300 font-mono text-xs uppercase',
                    formButtonPrimary: 'bg-[#C9B8E8] hover:bg-[#B5A1DB] text-[#0C0B0D] rounded-xl font-display font-bold transition-colors',
                    footerActionLink: 'text-[#C9B8E8] hover:underline',
                    footerActionText: 'text-zinc-400',
                    dividerLine: 'bg-[#26232B]',
                    dividerText: 'text-zinc-500 font-mono text-xs',
                    identityPreviewText: 'text-white',
                    identityPreviewEditButton: 'text-[#C9B8E8]',
                  },
                }}
                routing="hash"
              />
            </div>
          </div>
        )}
        
        {selectedRole && isSignedIn && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="text-center flex flex-col gap-2 mb-2">
              <h2 className="text-2xl font-display font-semibold font-semibold tracking-tight text-white font-mono uppercase">
                Complete Your Profile.
              </h2>
              <p className="text-sm text-zinc-400">
                {selectedRole === 'brand' ? 'Enter your brand details to provision your node.' : 'Enter your creator details to activate your radar.'}
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <span className="text-xs text-zinc-300 font-mono bg-[#151417] border border-[#26232B] px-3 py-1 rounded-xl">
                  Authenticated as: <span className="font-bold text-white">{clerkUser?.primaryEmailAddress?.emailAddress}</span>
                </span>
                <button
                  onClick={async () => {
                    await signOut();
                    window.location.reload();
                  }}
                  className="text-xs text-[#C9B8E8] font-mono hover:underline px-2 py-1"
                >
                  Sign Out / Switch User
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
                    const response = await fetch(url, { headers: { 'Accept-Language': 'en-US,en;q=0.9' }});
                    
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
                      setGeocodeError('Location not found. Please be more specific (e.g. "Connaught Place, Delhi").');
                      setIsGeocoding(false);
                    }
                  } catch (err) {
                    console.error(err);
                    setGeocodeError('Failed to verify location. Please try again.');
                    setIsGeocoding(false);
                  }
                }
              }}
              className="bg-[#151417] border border-[#26232B] rounded-2xl p-6 flex flex-col gap-5 shadow-2xl"
            >
              {selectedRole === 'brand' ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">Brand Name</label>
                    <input name="brandName" required type="text" className="w-full bg-[#0C0B0D] border border-[#26232B] rounded-xl px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-[#C9B8E8] focus:bg-[#0C0B0D] transition-colors" placeholder="e.g. Nike" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">Corporate Domain</label>
                    <input name="domain" required type="text" className="w-full bg-[#0C0B0D] border border-[#26232B] rounded-xl px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-[#C9B8E8] focus:bg-[#0C0B0D] transition-colors" placeholder="e.g. nike.com" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">Primary Market Sector</label>
                    <select name="sector" required className="w-full bg-[#0C0B0D] border border-[#26232B] rounded-xl px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-[#C9B8E8] focus:bg-[#0C0B0D] transition-colors">
                      <option value="" disabled selected>Select a Sector...</option>
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
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">Creator Handle</label>
                    <input name="handle" required type="text" className="w-full bg-[#0C0B0D] border border-[#26232B] rounded-xl px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-[#C9B8E8] focus:bg-[#0C0B0D] transition-colors" placeholder="e.g. @username" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">Content Niche</label>
                    <select name="niche" required className="w-full bg-[#0C0B0D] border border-[#26232B] rounded-xl px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-[#C9B8E8] focus:bg-[#0C0B0D] transition-colors">
                      <option value="" disabled selected>Select a Niche...</option>
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
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">Primary Locality / Base Area</label>
                    <input name="locality" required type="text" className="w-full bg-[#0C0B0D] border border-[#26232B] rounded-xl px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-[#C9B8E8] focus:bg-[#0C0B0D] transition-colors" placeholder="Enter your location" />
                    {geocodeError && <span className="text-xs text-[#F1E3A8] font-bold mt-1">{geocodeError}</span>}
                  </div>
                </>
              )}
              <button 
                type="submit" 
                disabled={isGeocoding}
                className="w-full py-3 bg-[#C9B8E8] hover:bg-[#B5A1DB] text-[#0C0B0D] rounded-xl font-display font-bold mt-2 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGeocoding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#0C0B0D]/30 border-t-[#0C0B0D] rounded-full animate-spin" />
                    Locating Coordinates...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </button>
            </form>
          </div>
        )}
      </main>

        <footer className="max-w-xl mx-auto w-full z-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-zinc-400 pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F1E3A8] animate-pulse" />
            <span className="text-zinc-300">V2.0 Production Gateway • Secured</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span>Designed with creator moodboard aesthetics</span>
            <span className="text-[10px] text-zinc-500 font-sans font-medium">&copy; {new Date().getFullYear()} Radius Inc. All rights reserved.</span>
          </div>
        </footer>

        <AnimatePresence>
          {showDeck && <AppWalkthroughDeck onClose={() => setShowDeck(false)} />}
        </AnimatePresence>
      </div>

      {/* RIGHT SIDE: Infinite Scrolling Background */}
      <div 
        className="absolute inset-0 lg:left-1/3 bg-transparent overflow-hidden flex items-center z-10 pointer-events-none"
        style={{ 
          maskImage: 'linear-gradient(to right, transparent, black 30%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 30%)' 
        }}
      >
        <div className="flex w-[max-content] h-full animate-scroll-infinite opacity-50 mix-blend-screen">
          {/* We create 2 identical sets of tiles to allow seamless infinite looping */}
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex h-full">
              {[1, 2, 3, 4].map(tileIdx => (
                <div key={`${setIdx}-${tileIdx}`} className="w-[800px] h-full relative overflow-hidden shrink-0">
                  {/* Image is larger than the wrapper and anchored right to permanently crop off the left side (Puck) */}
                  <img 
                    src="https://cdn.recent.design/items/l0gvyr4/og/1200.webp" 
                    alt="" 
                    className="absolute right-0 w-[1200px] max-w-none h-full object-cover object-right grayscale invert contrast-[1.2] brightness-[0.9]" 
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
