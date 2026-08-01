import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import MinimalMap from './components/MinimalMap';
import AddressSearch from './components/AddressSearch';
import BrandWorkspace from './components/BrandWorkspace';
import CreatorWorkspace from './components/CreatorWorkspace';
import EntryGate from './components/EntryGate';
import { NeuralStream } from './components/Loaders';
import { Campaign, Creator } from './types';
import {
  Compass,
  User,
  LogOut,
  Radio,
  DollarSign,
  Image,
  Activity,
  ShieldCheck,
  BarChart2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ─── ANIMATION VARIANTS ───
const sidebarVariants = {
  collapsed: { width: 64, transition: { type: 'spring', stiffness: 500, damping: 42 } },
  expanded:  { width: 240, transition: { type: 'spring', stiffness: 500, damping: 42 } },
};

const labelVariants = {
  collapsed: { opacity: 0, x: -6, transition: { duration: 0.12 } },
  expanded:  { opacity: 1, x: 0,  transition: { duration: 0.18, delay: 0.08 } },
};

const wordmarkVariants = {
  collapsed: { opacity: 0, width: 0, overflow: 'hidden', transition: { duration: 0.12 } },
  expanded:  { opacity: 1, width: 'auto', transition: { duration: 0.18, delay: 0.08 } },
};

// Adapter: Convert Convex user document to frontend Creator type for backward compatibility
function convexUserToCreator(user: any): Creator {
  return {
    id: user._id,
    name: user.name || '',
    avatar: user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=random`,
    handle: user.handle || '',
    locality: user.locality || '',
    lat: user.lat || 0,
    lng: user.lng || 0,
    audienceInLocality: user.audienceInLocality || 0,
    niche: user.niche || '',
    matchScore: user.name ? 80 + (user.name.charCodeAt(0) % 19) : 88,
    latencyHours: user.latencyHours || 0,
    velocityTier: user.velocityTier || 'Free',
    followers: user.followers || '0',
    pastWork: user.pastWork || [],
    bio: user.bio || '',
    acceptedCampaignIds: user.acceptedCampaignIds || [],
  };
}

// Adapter: Convert Convex campaign + batches to frontend Campaign type
function convexToCampaign(campaign: any, batches: any[]): Campaign {
  const sourceBatches = campaign.batches ? campaign.batches : batches.filter((b: any) => b.campaignId === campaign._id);
  const campaignBatches = sourceBatches
    .sort((a: any, b: any) => a.batchIndex - b.batchIndex)
    .map((b: any) => ({
      id: b._id,
      name: b.name as 'Batch A' | 'Batch B' | 'Batch C',
      creatorIds: b.creatorIds || [],
      status: b.status as 'pending' | 'dispatched' | 'completed' | 'cascaded',
      timeLeftSeconds: b.dispatchedAt
        ? Math.max(0, (b.cascadeAfterMs - (Date.now() - b.dispatchedAt)) / 1000)
        : b.cascadeAfterMs / 1000,
      totalTimeSeconds: b.cascadeAfterMs / 1000,
      dispatchedAt: b.dispatchedAt,
      cascadeAfterMs: b.cascadeAfterMs,
    }));

  return {
    id: campaign._id,
    title: campaign.title,
    brandName: campaign.brandName,
    niche: campaign.niche,
    deliverable: campaign.deliverable,
    centerLocality: campaign.centerLocality,
    centerLat: campaign.centerLat,
    centerLng: campaign.centerLng,
    budget: campaign.budget,
    spotsTotal: campaign.spotsTotal,
    spotsFilled: campaign.spotsFilled,
    contentFormat: campaign.contentFormat,
    creativeGuidelines: campaign.creativeGuidelines,
    targetAudience: campaign.targetAudience,
    submissionDeadlineDays: campaign.submissionDeadlineDays,
    durationHours: campaign.durationHours,
    createdAt: campaign._creationTime || Date.now(),
    status: campaign.status as 'draft' | 'active' | 'completed',
    escrowStatus: campaign.escrowStatus as any,
    batches: campaignBatches,
    activeBatchIndex: campaign.activeBatchIndex,
  };
}

// ─── NAV ITEM COMPONENT ───
function NavItem({
  icon: Icon,
  label,
  isActive,
  onClick,
  id,
  imgUrl,
}: {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
  id: string;
  imgUrl?: string;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center w-16 h-14 rounded-[16px] transition-all duration-300 outline-none ${
        isActive ? 'text-indigo-400' : 'text-zinc-400 hover:text-zinc-300 hover:bg-white/5'
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="bottom-nav-pill"
          className="absolute inset-0 rounded-[16px]"
          style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', zIndex: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}
      {imgUrl ? (
        <img src={imgUrl} alt={label} className={`w-[20px] h-[20px] mb-1 rounded-full relative z-10 transition-transform duration-300 object-cover border border-[rgba(255,255,255,0.1)] ${isActive ? 'scale-110 border-indigo-400/50' : ''}`} referrerPolicy="no-referrer" />
      ) : (
        <Icon className={`w-[18px] h-[18px] mb-1 relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
      )}
      <span className="text-[9px] font-medium tracking-wide relative z-10">{label}</span>
    </button>
  );
}

// ─── WORKSPACE BACKDROP ───
const WorkspaceBackdrop = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
    {/* Nebula gradient blobs */}
    <motion.div 
      animate={{ x: [0, 40, -20, 0], y: [0, -20, 20, 0] }}
      transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      className="absolute top-[-10%] left-[-10%] w-3/4 h-3/4 rounded-full opacity-[0.15]" 
      style={{ background: 'radial-gradient(ellipse at center, rgba(79,70,229,0.3) 0%, transparent 60%)', filter: 'blur(80px)' }} 
    />
    <motion.div 
      animate={{ x: [0, -40, 20, 0], y: [0, 20, -20, 0] }}
      transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-[0.1]" 
      style={{ background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.2) 0%, transparent 60%)', filter: 'blur(70px)' }} 
    />

    {/* Spectral lines (runners) */}
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={`h-runner-${i}`}
        className="absolute h-[1px] w-64 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent shadow-[0_0_12px_rgba(99,102,241,0.4)] opacity-25"
        style={{ top: `${8 + i * 8}%` }}
        initial={{ left: '-20%' }}
        animate={{ left: '120%' }}
        transition={{ duration: 8 + (i % 3) * 4, repeat: Infinity, delay: i * 2.5, ease: 'linear' }}
      />
    ))}
    {[...Array(16)].map((_, i) => (
      <motion.div
        key={`v-runner-${i}`}
        className="absolute w-[1px] h-64 bg-gradient-to-b from-transparent via-emerald-500/50 to-transparent shadow-[0_0_12px_rgba(16,185,129,0.4)] opacity-25"
        style={{ left: `${5 + i * 6}%` }}
        initial={{ top: '-20%' }}
        animate={{ top: '120%' }}
        transition={{ duration: 10 + (i % 4) * 3, repeat: Infinity, delay: i * 1.8, ease: 'linear' }}
      />
    ))}
  </div>
);

export default function App() {
  // Clerk auth
  const { isSignedIn, isLoaded: isAuthLoaded, user: clerkUser } = useUser();
  const { signOut } = useClerk();

  // Convex user data
  const currentUser = useQuery(api.users.getCurrentUser);
  const allCreators = useQuery(api.users.getAllCreators);
  const brandCampaigns = useQuery(
    api.campaigns.getByBrand,
    currentUser?.role === 'brand' ? {} : 'skip'
  );
  const allBatches = useQuery(api.batches.getAllBatches);
  const allCampaignsData = useQuery(api.campaigns.getAll);

  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);

  // Local UI state
  const [pendingRole, setPendingRole] = useState<'brand' | 'creator' | null>(null);
  const [customBrandName, setCustomBrandName] = useState<string>('');
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  // Interactive Map Geofence Center (Local default)
  const [centerLat, setCenterLat] = useState<number>(28.5276);
  const [centerLng, setCenterLng] = useState<number>(77.2197);
  const [centerAddress, setCenterAddress] = useState<string | null>(null);

  // Active sub-tab states for navigation sidebar
  const [activeBrandSubTab, setActiveBrandSubTab] = useState<'setup' | 'dispatch' | 'analytics' | 'profile'>('setup');
  const [activeCreatorSubTab, setActiveCreatorSubTab] = useState<'radar' | 'escrow' | 'wallet' | 'portfolio' | 'profile'>('radar');

  // Sidebar expanded state
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Header scroll state
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // Track scroll for header style
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const handleScroll = () => setHeaderScrolled(el.scrollTop > 8);
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine role and view from Convex user
  const userRole = currentUser?.role || null;
  const view = userRole || 'brand';

  // Convert Convex data to frontend format
  const creators: Creator[] = useMemo(() => {
    if (!allCreators) return [];
    return allCreators.map(convexUserToCreator);
  }, [allCreators]);

  const activeCampaigns: Campaign[] = useMemo(() => {
    const campaigns = userRole === 'brand' ? brandCampaigns : allCampaignsData;
    const batches = allBatches || [];
    if (!campaigns) return [];
    return campaigns.map((c: any) => convexToCampaign(c, batches));
  }, [userRole, brandCampaigns, allCampaignsData, allBatches]);

  // Set initial creator when data loads
  useEffect(() => {
    if (creators.length > 0 && !selectedCreatorId) {
      if (userRole === 'creator' && currentUser?._id) {
        setSelectedCreatorId(currentUser._id);
      } else {
        setSelectedCreatorId(creators[0].id);
      }
    }
  }, [creators, selectedCreatorId, userRole, currentUser]);

  // Set initial campaign when data loads
  useEffect(() => {
    if (activeCampaigns.length > 0 && !selectedCampaignId) {
      setSelectedCampaignId(activeCampaigns[0].id);
    }
  }, [activeCampaigns, selectedCampaignId]);

  // Sync geofence center coordinate when selected campaign changes
  useEffect(() => {
    if (selectedCampaignId) {
      const camp = activeCampaigns.find((c) => c.id === selectedCampaignId);
      if (camp) {
        setCenterLat(camp.centerLat);
        setCenterLng(camp.centerLng);
      }
    }
  }, [selectedCampaignId, activeCampaigns]);

  // Synchronize persona map marker when selected creator changes
  const handleSelectCreatorOnMap = (creatorId: string) => {
    setSelectedCreatorId(creatorId);
    const creator = creators.find((c) => c.id === creatorId);
    if (creator) {
      const matchingCamp = activeCampaigns.find((camp) => {
        const activeBatch = camp.batches[camp.activeBatchIndex];
        return activeBatch && activeBatch.creatorIds.includes(creator.id);
      });
      if (matchingCamp) {
        setSelectedCampaignId(matchingCamp.id);
      }
    }
  };

  const currentCreatorProfile = creators.find((c) => c.id === selectedCreatorId) || creators[0];

  // Callback when a new campaign is successfully launched
  const handleCampaignCreated = (newCampaign: Campaign) => {
    setSelectedCampaignId(newCampaign.id);
    setActiveBrandSubTab('dispatch');
  };

  // Handle role selection after Clerk sign-in (onboarding)
  const handleRoleSelection = async (role: 'brand' | 'creator', profileData?: any) => {
    try {
      await createOrUpdateUser({
        role,
        name: profileData?.name || clerkUser?.fullName || clerkUser?.firstName || 'User',
        ...(role === 'brand' ? {
          brandName: profileData?.brandName || clerkUser?.fullName || 'Untitled Brand',
          domain: profileData?.domain,
          sector: profileData?.sector,
        } : {
          handle: profileData?.handle,
          niche: profileData?.niche,
          locality: profileData?.locality,
          velocityTier: 'Free' as const,
        }),
      });
      setPendingRole(null);
    } catch (err) {
      console.error('Failed to create user:', err);
    }
  };

  // ── LOADING STATE ──
  const isLoading = !isAuthLoaded || (isSignedIn && currentUser === undefined);

  // ── FULLY AUTHENTICATED: Main App ──
  const brandDisplayName = currentUser?.brandName || currentUser?.name || 'Brand';
  const showMap = view === 'brand' && activeBrandSubTab === 'setup';

  const brandNavItems = [
    { id: 'nav-launch',   icon: Compass,    label: 'Launch Engine',  tab: 'setup' as const },
    { id: 'nav-dispatch', icon: Activity,   label: 'Dispatch Room',  tab: 'dispatch' as const },
    { id: 'nav-analytics',icon: BarChart2,  label: 'Analytics Logs', tab: 'analytics' as const },
    { id: 'nav-profile',  icon: User,       label: 'Brand Profile',  tab: 'profile' as const },
  ];

  const creatorNavItems = [
    { id: 'nav-radar',     icon: Radio,      label: 'Active Radar',    tab: 'radar' as const },
    { id: 'nav-escrow',    icon: ShieldCheck,label: 'Active Campaigns', tab: 'escrow' as const },
    { id: 'nav-wallet',    icon: DollarSign, label: 'Secure Wallet',   tab: 'wallet' as const },
    { id: 'nav-portfolio', icon: Image,      label: 'Portfolio',       tab: 'portfolio' as const },
    { id: 'nav-creator-profile', icon: User, label: 'Creator Profile', tab: 'profile' as const },
  ];

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="app-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100]"
          >
            <NeuralStream text={!isAuthLoaded ? "INITIALIZING" : "SYNCING"} />
          </motion.div>
        )}
      </AnimatePresence>

      {!isLoading && !isSignedIn && (
        <EntryGate creators={creators} onSignIn={() => {}} />
      )}

      {!isLoading && isSignedIn && currentUser === null && (
        <EntryGate
          creators={creators}
          onSignIn={(role, profileData) => {
            handleRoleSelection(role, profileData);
          }}
        />
      )}

      {!isLoading && isSignedIn && currentUser !== null && currentUser !== undefined && (
        <div className="h-screen overflow-hidden app-bg text-zinc-200 flex flex-row relative">
          <WorkspaceBackdrop />

      {/* ── MAIN CONTENT ── */}
      <div ref={mainRef} className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative pb-32 z-10">



        <main className={`${view === 'brand' && activeBrandSubTab === 'setup' ? 'max-w-5xl' : 'max-w-7xl'} w-full mx-auto px-6 py-6 flex flex-col gap-6`}>

          {/* Map section */}
          <AnimatePresence>
            {showMap && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.98, filter: 'blur(10px)' }}
                animate={{ opacity: 1, height: 'auto', scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, height: 0, scale: 0.98, filter: 'blur(10px)', overflow: 'hidden', marginTop: 0, marginBottom: 0 }}
                transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                className="flex flex-col gap-4 origin-top"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-lg font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                      Match Engine
                    </h1>
                    <p className="text-sm mt-1 mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                      Search an address or place the target pin to visualize creator match density.
                    </p>
                    <AddressSearch
                      onLocationFound={(lat, lng, address) => {
                        setCenterLat(lat);
                        setCenterLng(lng);
                        setCenterAddress(address);
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-1 ml-6">
                    <Compass className="w-4 h-4 text-indigo-400 animate-spin-slow" />
                    <span className="text-[11px] font-mono" style={{ color: 'var(--color-text-tertiary)' }}>Local Grid · CP Origin</span>
                  </div>
                </div>

                <MinimalMap
                  centerLat={centerLat}
                  centerLng={centerLng}
                  onMapClick={(lat, lng) => {
                    setCenterLat(lat);
                    setCenterLng(lng);
                    setCenterAddress(null);
                  }}
                  selectedCreatorId={selectedCreatorId}
                  onSelectCreator={handleSelectCreatorOnMap}
                  activeCampaignId={selectedCampaignId}
                  creators={creators}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Workspace */}
          <AnimatePresence mode="wait">
            {view === 'brand' ? (
              <motion.div
                key="brand"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <BrandWorkspace
                  centerLat={centerLat}
                  centerLng={centerLng}
                  centerAddress={centerAddress}
                  setCenterLat={setCenterLat}
                  setCenterLng={setCenterLng}
                  onCampaignCreated={handleCampaignCreated}
                  activeCampaigns={activeCampaigns}
                  setSelectedCreator={(creator) => { setSelectedCreatorId(creator.id); }}
                  setView={() => {}}
                  setSelectedCampaignId={setSelectedCampaignId}
                  activeSubTab={activeBrandSubTab}
                  customBrandName={brandDisplayName}
                  setCustomBrandName={setCustomBrandName}
                  creators={creators}
                />
              </motion.div>
            ) : (
              <motion.div
                key="creator"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <CreatorWorkspace
                  activeCampaigns={activeCampaigns}
                  selectedCreatorId={selectedCreatorId}
                  setSelectedCreatorId={setSelectedCreatorId}
                  selectedCampaignId={selectedCampaignId}
                  setSelectedCampaignId={(id) => {
                    setSelectedCampaignId(id);
                    if (id) setActiveCreatorSubTab('escrow');
                  }}
                  activeSubTab={activeCreatorSubTab}
                  creators={creators}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      
      {/* ── FLOATING BOTTOM NAV ── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center justify-center pointer-events-none">
        <div className="glass-4 p-2 rounded-[24px] flex items-center gap-1 pointer-events-auto border border-[rgba(255,255,255,0.08)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          {view === 'brand'
            ? brandNavItems.map(({ tab, ...item }) => (
                <NavItem
                  key={tab}
                  id={item.id}
                  icon={item.icon}
                  imgUrl={tab === 'profile' ? (currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'U')}&background=4F46E5&color=fff`) : undefined}
                  label={item.label}
                  isActive={activeBrandSubTab === tab}
                  onClick={() => setActiveBrandSubTab(tab)}
                />
              ))
            : creatorNavItems.map(({ tab, ...item }) => (
                <NavItem
                  key={tab}
                  id={item.id}
                  icon={item.icon}
                  imgUrl={tab === 'profile' ? (currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'U')}&background=4F46E5&color=fff`) : undefined}
                  label={item.label}
                  isActive={activeCreatorSubTab === tab}
                  onClick={() => setActiveCreatorSubTab(tab as any)}
                />
              ))}
        </div>
      </div>
</div>
        </div>
      )}
    </>
  );
}
