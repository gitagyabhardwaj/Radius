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
    <div className="rounded-none border border-zinc-800 bg-zinc-900 overflow-hidden ">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-zinc-800 bg-zinc-50">
        <span className="w-2 h-2 rounded-none bg-red-300" />
        <span className="w-2 h-2 rounded-none bg-amber-300" />
        <span className="w-2 h-2 rounded-none bg-black" />
        <span className={`ml-2 text-[9px] font-sans tracking-wider text-white`}>
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
            <div className="flex items-center gap-1.5 text-[10px] font-sans tracking-wider text-white">
              <Sliders className="w-3 h-3" /> Geofence Radius
            </div>
            <div className="h-1.5 rounded-none bg-zinc-100 relative">
              <div className="absolute inset-y-0 left-0 w-2/3 rounded-none bg-black" />
              <div className="absolute -top-1 left-2/3 w-3 h-3 rounded-none bg-zinc-900 border-2 border-zinc-800" />
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-sans tracking-wider text-white mt-1">
              <DollarSign className="w-3 h-3" /> Budget
            </div>
            <div className="h-7 rounded-none bg-zinc-50 border border-zinc-800 px-2 flex items-center text-xs font-mono text-white">
              ₹25,000
            </div>
            <button className="mt-2 py-2 rounded-none bg-zinc-900 text-white text-[11px] font-bold font-mono">
              Lock Budget & Launch
            </button>
          </div>
          <div className="col-span-3 rounded-none bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:10px_10px] border border-zinc-800 relative flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-zinc-800/60 bg-black/10" />
            <div className="absolute w-2.5 h-2.5 rounded-none bg-black" />
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
            { name: 'Batch A', status: 'Dispatched', color: 'indigo', pct: 70 },
            { name: 'Batch B', status: 'Queued', color: 'zinc', pct: 20 },
            { name: 'Batch C', status: 'Pending', color: 'zinc', pct: 0 },
          ].map((b) => (
            <div key={b.name} className="rounded-none border border-zinc-800 p-2.5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-white">{b.name}</span>
                <Clock className="w-3 h-3 text-white" />
              </div>
              <div className="h-1 rounded-none bg-zinc-100">
                <div
                  className={`h-full rounded-none ${b.color === 'indigo' ? 'bg-black' : 'bg-zinc-300'}`}
                  style={{ width: `${b.pct}%` }}
                />
              </div>
              <span className="text-[9px] font-mono text-white">{b.status}</span>
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
      <BrowserFrame accent="emerald">
        <div className="flex flex-col gap-2">
          {[
            { name: 'Nike Air Max Drop', dist: '0.8 km' },
            { name: 'Blue Tokai Coffee', dist: '1.4 km' },
          ].map((c, i) => (
            <div key={c.name} className="flex items-center justify-between rounded-none border border-zinc-800 px-3 py-2">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">{c.name}</span>
                <span className="text-[9px] font-mono text-white">{c.dist} away</span>
              </div>
              <button
                className={`text-[10px] font-mono font-bold px-2 py-1 rounded-none ${
                  i === 0 ? 'bg-black text-white' : 'bg-zinc-100 text-white'
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
      <BrowserFrame accent="emerald">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-[10px] font-sans tracking-wider text-white">Content Verified</span>
            <span className="text-sm font-bold text-white">₹4,200 ready to release</span>
          </div>
          <button className="py-2 px-3 rounded-none bg-black text-white text-[10px] font-bold font-mono whitespace-nowrap">
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
      className="fixed inset-0 z-50 bg-zinc-900 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        className="bg-zinc-900 rounded-none border border-zinc-800  w-full max-w-lg p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
              <StepIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-sans tracking-wider text-white font-bold">
              {slide + 1} / {SLIDES.length} — {current.label}
            </span>
          </div>
          <button onClick={onClose} aria-label="Close walkthrough" className="text-white hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-display font-semibold font-semibold tracking-tight text-white font-mono uppercase">{current.title}</h3>
          <p className="text-sm text-white leading-relaxed">{current.caption}</p>
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
                className={`h-1.5 rounded-none transition-all ${i === slide ? 'w-5 bg-black' : 'w-1.5 bg-zinc-200'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {slide > 0 && (
              <button
                onClick={() => setSlide((s) => Math.max(0, s - 1))}
                className="py-1.5 px-2.5 border border-zinc-800 text-white hover:bg-zinc-50 rounded-none text-[11px] font-mono font-bold flex items-center gap-1 transition-all"
              >
                <ChevronLeft className="w-3 h-3" />
                Back
              </button>
            )}

            {slide < SLIDES.length - 1 ? (
              <button
                onClick={() => setSlide((s) => Math.min(SLIDES.length - 1, s + 1))}
                className="py-1.5 px-3 bg-zinc-900 hover:bg-zinc-900 text-white rounded-none text-[11px] font-mono font-bold flex items-center gap-1 transition-all"
              >
                Next
                <ChevronRight className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="py-1.5 px-3 bg-black hover:bg-black text-white rounded-none text-[11px] font-mono font-bold flex items-center gap-1 transition-all"
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
    <div className="min-h-screen flex w-full bg-zinc-900 selection:bg-zinc-700 selection:text-white relative">
      
      {/* TEXT HIGHLIGHT ILLUSTRATION (Visible only on large screens, fills empty left space) */}
      <div className="absolute left-8 xl:left-16 top-[45%] -translate-y-[45%] hidden lg:flex flex-col z-30 pointer-events-none max-w-[28%] xl:max-w-[32%]">
        
        {/* Floating Toolbar (Mimicking text selection) */}
        <motion.div 
          animate={{ opacity: [0, 0, 0, 1, 1, 0], y: [10, 10, 10, 0, 0, 10] }}
          transition={{ duration: 5, times: [0, 0.2, 0.4, 0.45, 0.8, 1], repeat: Infinity, ease: "easeOut" }}
          className="absolute -top-14 left-1/4 flex items-center gap-3 bg-zinc-900 border border-zinc-700 shadow-xl px-3 py-1.5 z-40 rounded-none scale-90 origin-bottom-left"
        >
          <div className="flex items-center gap-3 border-r border-zinc-700 pr-3">
            <span className="text-zinc-400 font-serif text-sm font-bold">B</span>
            <span className="text-zinc-400 font-serif text-sm italic">I</span>
            <span className="text-zinc-400 font-serif text-sm underline decoration-2 underline-offset-2">U</span>
            <span className="text-zinc-400 font-serif text-sm line-through">S</span>
            <span className="text-zinc-400 font-sans text-sm font-medium ml-1">🔗</span>
          </div>
          <div className="flex items-center gap-1.5 pl-1">
            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center">
              <span className="text-[8px] text-white">✦</span>
            </div>
            <span className="text-xs text-white font-sans font-medium tracking-wide">Ask AI</span>
          </div>
          {/* Caret pointing down */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-900 border-b border-r border-zinc-700 rotate-45"></div>
        </motion.div>

        {/* The Text Content */}
        <h2 className="text-2xl xl:text-3xl font-display font-medium text-zinc-500 leading-snug">
          Spatial matching connects{' '}
          <span className="relative inline-block mt-1">
            <motion.span 
              animate={{ scaleX: [0, 0, 1, 1, 0] }}
              transition={{ duration: 5, times: [0, 0.2, 0.4, 0.8, 1], repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 origin-left z-0" 
            />
            <span className="relative z-10 px-1 text-white">
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
      <div className="flex-1 flex flex-col justify-between py-12 px-6 lg:px-12 relative overflow-hidden order-2 lg:order-1 z-20 bg-zinc-900  lg:bg-transparent lg:backdrop-blur-none lg:bg-gradient-to-r lg:from-zinc-950 lg:via-zinc-950/90 lg:to-transparent lg:w-1/2">
        <div className="absolute inset-0 bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none mask-image-gradient-to-r" />

        <header className="max-w-xl mx-auto w-full z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-white font-display font-semibold font-semibold tracking-tighter text-base">
              R.
            </div>
            <div className="flex flex-col">
              <span className="font-display font-semibold font-bold text-sm tracking-wider text-white uppercase leading-none">
                RADIUS
              </span>
              <span className="text-[8px] font-mono tracking-widest text-white mt-0.5 uppercase leading-none">
                Hyperlocal Escrow Network
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-black font-bold bg-cyan-400 border border-cyan-400 px-2 py-0.5 rounded-none">
            <Compass className="w-3.5 h-3.5 text-black animate-spin-slow" />
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
                  <svg className="absolute -inset-1 w-full h-full text-zinc-600 z-0 pointer-events-none scale-105" viewBox="0 0 100 40" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10,20 C20,5 80,5 90,20 C100,35 20,35 10,20 C5,15 25,5 35,5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </>
            ) : (
              <>
                Select{' '}
                <span className="relative inline-block whitespace-nowrap">
                  <span className="relative z-10">Portal.</span>
                  <svg className="absolute -inset-2 w-full h-full text-zinc-600 z-0 pointer-events-none scale-110" viewBox="0 0 100 40" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10,20 C20,5 80,5 90,20 C100,35 20,35 10,20 C5,15 25,5 35,5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </>
            )}
          </h1>
          <p className="text-sm text-white max-w-sm mx-auto font-sans font-medium leading-relaxed">
            {selectedRole
              ? 'Complete your sign-in to securely access your workspace.'
              : 'Identify your role to securely access the hyperlocal escrow network.'}
          </p>
        </div>

        {!selectedRole && (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleRoleSelect('brand')}
              className="group relative w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-800/50 rounded-none p-6  flex items-start gap-4 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center shrink-0">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col items-start text-left gap-1">
                <h3 className="font-display font-semibold font-bold text-white text-lg group-hover:text-white transition-colors font-mono uppercase">
                  Brand Login
                </h3>
                <p className="text-sm text-white leading-snug">
                  Launch geo-targeted campaigns, discover local creators, and lock funds in smart escrow.
                </p>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect('creator')}
              className="group relative w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-800/50 rounded-none p-6  flex items-start gap-4 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col items-start text-left gap-1">
                <h3 className="font-display font-semibold font-bold text-white text-lg group-hover:text-white transition-colors font-mono uppercase">
                  Creator Login
                </h3>
                <p className="text-sm text-white leading-snug">
                  Receive hyperlocal campaign offers, submit content, and get paid instantly upon verification.
                </p>
              </div>
            </button>

            <div className="mt-4 border-t border-zinc-800 pt-6 flex gap-3 items-start">
              <Shield className="w-5 h-5 text-white shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-white font-mono tracking-tight uppercase">100% Cryptographic Escrow</span>
                <p className="text-[11px] text-white leading-relaxed">
                  Radius holds budgets securely in escrow and releases funds autonomously when creators deliver matching GPS-verified deliverables.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDeck(true)}
              className="self-center flex items-center gap-2 text-xs font-mono font-bold text-white hover:text-white bg-black/10 hover:bg-black/20 px-3.5 py-2 rounded-none transition-all"
            >
              <PlayCircle className="w-4 h-4" />
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
              className="text-xs font-mono font-bold text-white hover:text-white self-start"
            >
              ← Back to role selection
            </button>
            
            <div className="flex justify-center">
              <SignIn
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'bg-zinc-900 border border-zinc-800 rounded-none ',
                    headerTitle: 'font-display font-semibold font-semibold text-white',
                    headerSubtitle: 'text-white',
                    socialButtonsBlockButton: 'border-zinc-800 hover:bg-black text-white font-bold',
                    formFieldInput: 'bg-zinc-900 border-zinc-800 text-white rounded-none focus:border-zinc-800',
                    formFieldLabel: 'text-white',
                    formButtonPrimary: 'bg-zinc-900 hover:bg-zinc-800 text-white rounded-none font-display font-semibold ',
                    footerActionLink: 'text-white hover:text-white',
                    footerActionText: 'text-white',
                    dividerLine: 'bg-black',
                    dividerText: 'text-white',
                    identityPreviewText: 'text-white',
                    identityPreviewEditButton: 'text-white',
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
              <p className="text-sm text-white">
                {selectedRole === 'brand' ? 'Enter your brand details to provision your node.' : 'Enter your creator details to activate your radar.'}
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <span className="text-xs text-white font-mono bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-none">
                  Authenticated as: <span className="font-bold text-white">{clerkUser?.primaryEmailAddress?.emailAddress}</span>
                </span>
                <button
                  onClick={async () => {
                    await signOut();
                    window.location.reload();
                  }}
                  className="text-xs text-red-400 font-mono hover:underline px-2 py-1"
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
              className="bg-zinc-900 border border-zinc-800 rounded-none p-6  flex flex-col gap-5"
            >
              {selectedRole === 'brand' ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-sans tracking-wider text-white font-bold">Brand Name</label>
                    <input name="brandName" required type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded-none px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-zinc-800 focus:bg-zinc-900 transition-colors" placeholder="e.g. Nike" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-sans tracking-wider text-white font-bold">Corporate Domain</label>
                    <input name="domain" required type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded-none px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-zinc-800 focus:bg-zinc-900 transition-colors" placeholder="e.g. nike.com" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-sans tracking-wider text-white font-bold">Primary Market Sector</label>
                    <select name="sector" required className="w-full bg-zinc-900 border border-zinc-800 rounded-none px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-zinc-800 focus:bg-zinc-900 transition-colors">
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
                    <label className="text-xs font-sans tracking-wider text-white font-bold">Creator Handle</label>
                    <input name="handle" required type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded-none px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-zinc-800 focus:bg-zinc-900 transition-colors" placeholder="e.g. @username" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-sans tracking-wider text-white font-bold">Content Niche</label>
                    <select name="niche" required className="w-full bg-zinc-900 border border-zinc-800 rounded-none px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-zinc-800 focus:bg-zinc-900 transition-colors">
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
                    <label className="text-xs font-sans tracking-wider text-white font-bold">Primary Locality / Base Area</label>
                    <input name="locality" required type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded-none px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-zinc-800 focus:bg-zinc-900 transition-colors" placeholder="Enter your location" />
                    {geocodeError && <span className="text-xs text-red-400 font-bold mt-1">{geocodeError}</span>}
                  </div>
                </>
              )}
              <button 
                type="submit" 
                disabled={isGeocoding}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-none font-display font-semibold font-bold   mt-2 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGeocoding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-none animate-spin" />
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

        <footer className="max-w-xl mx-auto w-full z-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-white pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <span className="w-2 h-2 rounded-none bg-zinc-600 animate-pulse" />
            <span>V2.0 Production Gateway • Secured</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span>Designed with absolute geometric precision</span>
            <span className="text-[10px] text-white font-sans font-medium">&copy; {new Date().getFullYear()} Radius Inc. All rights reserved.</span>
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
