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
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-zinc-100 bg-zinc-50">
        <span className="w-2 h-2 rounded-full bg-red-300" />
        <span className="w-2 h-2 rounded-full bg-amber-300" />
        <span className="w-2 h-2 rounded-full bg-emerald-300" />
        <span className={`ml-2 text-[9px] font-mono uppercase tracking-wider text-zinc-400`}>
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
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              <Sliders className="w-3 h-3" /> Geofence Radius
            </div>
            <div className="h-1.5 rounded-full bg-zinc-100 relative">
              <div className="absolute inset-y-0 left-0 w-2/3 rounded-full bg-indigo-500" />
              <div className="absolute -top-1 left-2/3 w-3 h-3 rounded-full bg-white border-2 border-indigo-500" />
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400 mt-1">
              <DollarSign className="w-3 h-3" /> Budget
            </div>
            <div className="h-7 rounded-lg bg-zinc-50 border border-zinc-200 px-2 flex items-center text-xs font-mono text-zinc-600">
              ₹25,000
            </div>
            <button className="mt-2 py-2 rounded-lg bg-zinc-950 text-white text-[11px] font-bold font-mono">
              Lock Budget & Launch
            </button>
          </div>
          <div className="col-span-3 rounded-lg bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:10px_10px] border border-zinc-200 relative flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-indigo-400/60 bg-indigo-400/10" />
            <div className="absolute w-2.5 h-2.5 rounded-full bg-indigo-600" />
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
            <div key={b.name} className="rounded-lg border border-zinc-200 p-2.5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-zinc-700">{b.name}</span>
                <Clock className="w-3 h-3 text-zinc-400" />
              </div>
              <div className="h-1 rounded-full bg-zinc-100">
                <div
                  className={`h-full rounded-full ${b.color === 'indigo' ? 'bg-indigo-500' : 'bg-zinc-300'}`}
                  style={{ width: `${b.pct}%` }}
                />
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
      <BrowserFrame accent="emerald">
        <div className="flex flex-col gap-2">
          {[
            { name: 'Nike Air Max Drop', dist: '0.8 km' },
            { name: 'Blue Tokai Coffee', dist: '1.4 km' },
          ].map((c, i) => (
            <div key={c.name} className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-800">{c.name}</span>
                <span className="text-[9px] font-mono text-zinc-400">{c.dist} away</span>
              </div>
              <button
                className={`text-[10px] font-mono font-bold px-2 py-1 rounded-md ${
                  i === 0 ? 'bg-emerald-600 text-white' : 'bg-zinc-100 text-zinc-400'
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
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Content Verified</span>
            <span className="text-sm font-bold text-zinc-800">₹4,200 ready to release</span>
          </div>
          <button className="py-2 px-3 rounded-lg bg-emerald-600 text-white text-[10px] font-bold font-mono whitespace-nowrap">
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
      className="fixed inset-0 z-50 bg-zinc-950/70 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        className="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-lg p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <StepIcon className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-500 font-bold">
              {slide + 1} / {SLIDES.length} — {current.label}
            </span>
          </div>
          <button onClick={onClose} aria-label="Close walkthrough" className="text-zinc-300 hover:text-zinc-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-display font-black tracking-tight text-zinc-900">{current.title}</h3>
          <p className="text-sm text-zinc-500 leading-relaxed">{current.caption}</p>
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
                className={`h-1.5 rounded-full transition-all ${i === slide ? 'w-5 bg-indigo-600' : 'w-1.5 bg-zinc-200'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {slide > 0 && (
              <button
                onClick={() => setSlide((s) => Math.max(0, s - 1))}
                className="py-1.5 px-2.5 border border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 transition-all"
              >
                <ChevronLeft className="w-3 h-3" />
                Back
              </button>
            )}

            {slide < SLIDES.length - 1 ? (
              <button
                onClick={() => setSlide((s) => Math.min(SLIDES.length - 1, s + 1))}
                className="py-1.5 px-3 bg-zinc-950 hover:bg-zinc-900 text-white rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 transition-all"
              >
                Next
                <ChevronRight className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 transition-all"
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
    <div className="min-h-screen bg-[#fafafc] flex flex-col justify-between py-12 px-6 relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      <div className="absolute inset-0 bg-[radial-gradient(#e4e4e7_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-60 pointer-events-none" />
      <div className="absolute inset-x-0 top-1/4 border-b border-zinc-200/40 pointer-events-none" />
      <div className="absolute inset-y-0 left-1/4 border-r border-zinc-200/40 pointer-events-none" />

      <header className="max-w-4xl mx-auto w-full z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-white font-display font-black tracking-tighter text-base">
            R.
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-sm tracking-wider text-zinc-950 uppercase leading-none">
              RADIUS
            </span>
            <span className="text-[8px] font-mono tracking-widest text-zinc-400 mt-0.5 uppercase leading-none">
              Hyperlocal Escrow Network
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 bg-white border border-zinc-200/60 px-2 py-0.5 rounded-md">
          <Compass className="w-3.5 h-3.5 text-indigo-500 animate-spin-slow" />
          <span>GRID: DELHI_NCR</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto w-full z-10 my-auto flex flex-col gap-6 pt-8 pb-12">
        <div className="text-center flex flex-col gap-2">
          <h1 className="text-3xl font-display font-black tracking-tight text-zinc-900 sm:text-4xl">
            {selectedRole ? 'Secure Authentication.' : 'Select Portal.'}
          </h1>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto font-sans leading-relaxed">
            {selectedRole
              ? 'Complete your sign-in to securely access your workspace.'
              : 'Identify your role to securely access the hyperlocal escrow network.'}
          </p>
        </div>

        {!selectedRole && (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleRoleSelect('brand')}
              className="group relative w-full bg-white border border-zinc-200/80 hover:border-indigo-600/30 rounded-2xl p-6 shadow-sm flex items-start gap-4 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <Briefcase className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex flex-col items-start text-left gap-1">
                <h3 className="font-display font-bold text-zinc-900 text-lg group-hover:text-indigo-600 transition-colors">
                  Brand Login
                </h3>
                <p className="text-sm text-zinc-500 leading-snug">
                  Launch geo-targeted campaigns, discover local creators, and lock funds in smart escrow.
                </p>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect('creator')}
              className="group relative w-full bg-white border border-zinc-200/80 hover:border-emerald-600/30 rounded-2xl p-6 shadow-sm flex items-start gap-4 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex flex-col items-start text-left gap-1">
                <h3 className="font-display font-bold text-zinc-900 text-lg group-hover:text-emerald-600 transition-colors">
                  Creator Login
                </h3>
                <p className="text-sm text-zinc-500 leading-snug">
                  Receive hyperlocal campaign offers, submit content, and get paid instantly upon verification.
                </p>
              </div>
            </button>

            <div className="mt-4 border-t border-zinc-200/60 pt-6 flex gap-3 items-start">
              <Shield className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-zinc-800 font-mono tracking-tight uppercase">100% Cryptographic Escrow</span>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Radius holds budgets securely in escrow and releases funds autonomously when creators deliver matching GPS-verified deliverables.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDeck(true)}
              className="self-center flex items-center gap-2 text-xs font-mono font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-full transition-all"
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
              className="text-xs font-mono font-medium text-zinc-400 hover:text-zinc-600 self-start"
            >
              ← Back to role selection
            </button>
            
            <div className="flex justify-center">
              <SignIn
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'bg-white border border-zinc-200/80 rounded-2xl shadow-sm',
                    headerTitle: 'font-display font-semibold text-zinc-800',
                    headerSubtitle: 'text-zinc-400',
                    socialButtonsBlockButton: 'border-zinc-200 hover:bg-zinc-50 font-medium',
                    formFieldInput: 'bg-zinc-50 border-zinc-200 rounded-xl focus:border-indigo-500',
                    formButtonPrimary: 'bg-zinc-950 hover:bg-zinc-900 rounded-xl font-display shadow-md shadow-zinc-200',
                    footerActionLink: 'text-indigo-600 hover:text-indigo-700',
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
              <h2 className="text-2xl font-display font-black tracking-tight text-zinc-900">
                Complete Your Profile.
              </h2>
              <p className="text-sm text-zinc-500">
                {selectedRole === 'brand' ? 'Enter your brand details to provision your node.' : 'Enter your creator details to activate your radar.'}
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <span className="text-xs text-zinc-500 font-mono bg-zinc-100 px-2 py-1 rounded">
                  Authenticated as: <span className="font-bold text-zinc-700">{clerkUser?.primaryEmailAddress?.emailAddress}</span>
                </span>
                <button
                  onClick={async () => {
                    await signOut();
                    window.location.reload();
                  }}
                  className="text-xs text-red-500 font-mono hover:underline px-2 py-1"
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
              className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-5"
            >
              {selectedRole === 'brand' ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Brand Name</label>
                    <input name="brandName" required type="text" className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-base text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors" placeholder="e.g. Nike" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Corporate Domain</label>
                    <input name="domain" required type="text" className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-base text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors" placeholder="e.g. nike.com" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Primary Market Sector</label>
                    <select name="sector" required className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-base text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors">
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
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Creator Handle</label>
                    <input name="handle" required type="text" className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-base text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors" placeholder="e.g. @username" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Content Niche</label>
                    <select name="niche" required className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-base text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors">
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
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Primary Locality / Base Area</label>
                    <input name="locality" required type="text" className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-base text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors" placeholder="Enter your location" />
                    {geocodeError && <span className="text-xs text-red-500 font-medium mt-1">{geocodeError}</span>}
                  </div>
                </>
              )}
              <button 
                type="submit" 
                disabled={isGeocoding}
                className="w-full py-3 bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl font-display font-bold shadow-md shadow-zinc-200 mt-2 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGeocoding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

      <footer className="max-w-4xl mx-auto w-full z-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>V2.0 Production Gateway • Secured</span>
        </div>
        <div>
          <span>Designed with absolute geometric precision</span>
        </div>
      </footer>

      <AnimatePresence>
        {showDeck && <AppWalkthroughDeck onClose={() => setShowDeck(false)} />}
      </AnimatePresence>
    </div>
  );
}
