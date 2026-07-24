import { useState, useEffect, useMemo } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import MinimalMap from './components/MinimalMap';
import AddressSearch from './components/AddressSearch';
import BrandWorkspace from './components/BrandWorkspace';
import CreatorWorkspace from './components/CreatorWorkspace';
import EntryGate from './components/EntryGate';
import { Campaign, Creator } from './types';
import {
  Compass,
  Briefcase,
  User,
  ShieldCheck,
  HelpCircle,
  Activity,
  LogOut,
  Radio,
  DollarSign,
  Image,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

  // Interactive Map Geofence Center (South Delhi default)
  const [centerLat, setCenterLat] = useState<number>(28.5276);
  const [centerLng, setCenterLng] = useState<number>(77.2197);
  const [centerAddress, setCenterAddress] = useState<string | null>(null);


  // Active sub-tab states for navigation sidebar
  const [activeBrandSubTab, setActiveBrandSubTab] = useState<'setup' | 'dispatch' | 'analytics' | 'profile'>('setup');
  const [activeCreatorSubTab, setActiveCreatorSubTab] = useState<'radar' | 'escrow' | 'wallet' | 'portfolio' | 'profile'>('radar');

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

  // --- LOADING STATE ---
  if (!isAuthLoaded) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-zinc-950 font-display font-black tracking-tighter text-base animate-pulse">
            R.
          </div>
          <span className="text-zinc-500 font-mono text-sm">Initializing Radius...</span>
        </div>
      </div>
    );
  }

  // --- NOT SIGNED IN: Show EntryGate (Clerk auth) ---
  if (!isSignedIn) {
    return <EntryGate creators={creators} onSignIn={() => {}} />;
  }

  // --- SIGNED IN BUT NO CONVEX USER: Show onboarding ---
  if (currentUser === undefined) {
    // Still loading from Convex
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-zinc-950 font-display font-black tracking-tighter text-base animate-pulse">
            R.
          </div>
          <span className="text-zinc-500 font-mono text-sm">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (currentUser === null) {
    // User authenticated with Clerk but no Convex record — show role onboarding
    return (
      <EntryGate
        creators={creators}
        onSignIn={(role, profileData) => {
          handleRoleSelection(role, profileData);
        }}
      />
    );
  }

  // --- FULLY AUTHENTICATED: Main App ---
  const brandDisplayName = currentUser.brandName || currentUser.name || 'Brand';
  const showMap = view === 'brand' && activeBrandSubTab === 'setup';

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-indigo-50/60 via-[#f2f5f9] to-slate-100 text-zinc-900 selection:bg-indigo-100 selection:text-indigo-900 flex flex-row">
      
      {/* MINIMALIST PERSISTENT SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-zinc-950 text-zinc-300 border-r border-zinc-800 flex flex-col justify-between shrink-0 h-screen overflow-y-auto">
        <div className="flex flex-col">
          {/* Logo Brand Header */}
          <div className="p-5 border-b border-zinc-900 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-zinc-950 font-display font-black tracking-tighter text-base">
              R.
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-base tracking-tight text-white uppercase leading-none">
                RADIUS
              </span>
              <span className="text-[11px] font-mono tracking-wider text-zinc-500 mt-0.5 uppercase leading-none">
                Hyperlocal Escrow
              </span>
            </div>
          </div>
          <div className="px-5 py-4 border-b border-zinc-900 bg-zinc-900/20 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <img src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'U')}&background=random`} alt="User" className="w-8 h-8 rounded-full" />
              <div className="flex flex-col">
                <span className="font-medium text-sm text-zinc-200">{currentUser.name}</span>
                <span className="text-[10px] uppercase font-mono text-zinc-500">{currentUser.role}</span>
              </div>
            </div>
            <div className="bg-zinc-950 rounded-lg p-2.5 border border-zinc-800 flex justify-between items-center">
              <span className="text-xs font-mono text-zinc-400">Wallet</span>
              <span className="text-sm font-bold text-emerald-500 font-mono">₹{currentUser.escrowBalance || 0}</span>
            </div>
          </div>
          {/* Subtab Navigation */}
          <div className="p-4 flex flex-col gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 font-bold px-1.5">Navigation Features</span>
            <nav className="flex flex-col gap-1">
              {view === 'brand' ? (
                <>
                  <button
                    onClick={() => setActiveBrandSubTab('setup')}
                    className={`w-full py-2 px-3 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeBrandSubTab === 'setup'
                        ? 'bg-zinc-900 text-white font-semibold border-l-2 border-indigo-500 rounded-l-none'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    <span>1. Launch Engine</span>
                  </button>
                  <button
                    onClick={() => setActiveBrandSubTab('dispatch')}
                    className={`w-full py-2 px-3 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeBrandSubTab === 'dispatch'
                        ? 'bg-zinc-900 text-white font-semibold border-l-2 border-indigo-500 rounded-l-none'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                    <span>2. Dispatch Room</span>
                  </button>
                  <button
                    onClick={() => setActiveBrandSubTab('analytics')}
                    className={`w-full py-2 px-3 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeBrandSubTab === 'analytics'
                        ? 'bg-zinc-900 text-white font-semibold border-l-2 border-indigo-500 rounded-l-none'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>3. Analytics Logs</span>
                  </button>
                  <button
                    onClick={() => setActiveBrandSubTab('profile')}
                    className={`w-full py-2 px-3 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeBrandSubTab === 'profile'
                        ? 'bg-zinc-900 text-white font-semibold border-l-2 border-indigo-500 rounded-l-none'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>4. Brand Profile</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActiveCreatorSubTab('radar')}
                    className={`w-full py-2 px-3 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeCreatorSubTab === 'radar'
                        ? 'bg-zinc-900 text-white font-semibold border-l-2 border-indigo-500 rounded-l-none'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                    }`}
                  >
                    <Radio className="w-4 h-4" />
                    <span>1. Active Radar</span>
                  </button>
                  <button
                    onClick={() => setActiveCreatorSubTab('escrow')}
                    className={`w-full py-2 px-3 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeCreatorSubTab === 'escrow'
                        ? 'bg-zinc-900 text-white font-semibold border-l-2 border-indigo-500 rounded-l-none'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    <span className="truncate">2. Active Campaigns</span>
                  </button>
                  <button
                    onClick={() => setActiveCreatorSubTab('wallet')}
                    className={`w-full py-2 px-3 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeCreatorSubTab === 'wallet'
                        ? 'bg-zinc-900 text-white font-semibold border-l-2 border-indigo-500 rounded-l-none'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>3. Secure Wallet</span>
                  </button>
                  <button
                    onClick={() => setActiveCreatorSubTab('portfolio')}
                    className={`w-full py-2 px-3 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeCreatorSubTab === 'portfolio'
                        ? 'bg-zinc-900 text-white font-semibold border-l-2 border-indigo-500 rounded-l-none'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                    }`}
                  >
                    <Image className="w-4 h-4" />
                    <span>4. Portfolio</span>
                  </button>
                  <button
                    onClick={() => setActiveCreatorSubTab('profile')}
                    className={`w-full py-2 px-3 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeCreatorSubTab === 'profile'
                        ? 'bg-zinc-900 text-white font-semibold border-l-2 border-indigo-500 rounded-l-none'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>5. Creator Profile</span>
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Bottom profile info */}
        <div className="p-4 border-t border-zinc-900 flex flex-col gap-3">
          <div className="flex items-center gap-2.5 px-1">
            {clerkUser?.imageUrl ? (
              <img
                src={clerkUser.imageUrl}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border border-zinc-800"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-sm text-indigo-400 uppercase">
                {view === 'brand' ? brandDisplayName.substring(0, 2) : '?'}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white tracking-tight line-clamp-1 leading-none">
                {view === 'brand' ? brandDisplayName : currentCreatorProfile?.name || 'Creator'}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 mt-1 leading-none truncate max-w-[120px]" title={clerkUser?.primaryEmailAddress?.emailAddress || ''}>
                {clerkUser?.primaryEmailAddress?.emailAddress || (view === 'brand' ? 'Active Brand Admin' : 'Grid Operator')}
              </span>
            </div>
          </div>
          <button
            onClick={async () => {
              await signOut();
              window.location.reload();
            }}
            className="w-full py-2 border border-zinc-850 rounded-xl text-[11px] font-mono font-bold tracking-wider uppercase text-zinc-400 hover:text-white hover:bg-zinc-900/50 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative custom-scrollbar">
        
        {/* Dynamic header status bar */}
        <header className="border-b border-zinc-200/60 bg-white/85 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-mono font-bold text-zinc-400 uppercase">Current Node:</span>
              <span className="text-sm font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded uppercase">
                {view === 'brand' ? `${brandDisplayName} Admin` : `${currentCreatorProfile?.name || 'Creator'} Terminal`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-mono font-medium text-zinc-500">
                <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                <span className="hidden sm:inline">{view === 'brand' ? 'Escrow Node: Connected' : 'Radar Status: Listening for Offers'}</span>
              </div>
              <div className="flex items-center justify-center p-2 rounded-full hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white border border-zinc-800">
                <button 
                  className="flex items-center justify-center" 
                  aria-label="Sign out"
                  onClick={async () => {
                    await signOut();
                    window.location.reload();
                  }}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl w-full mx-auto px-6 py-6 flex flex-col gap-6">
          
          {/* Unified Map Grid */}
          {showMap && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
              <div className="lg:col-span-12 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-base font-display font-bold text-zinc-900 tracking-tight">
                      Hyperlocal Match Engine
                    </h1>
                    <p className="text-sm text-zinc-500 mt-0.5 mb-4">
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
                  <div className="flex items-center gap-2 text-sm font-mono font-medium text-zinc-500 mt-1">
                    <Compass className="w-4 h-4 text-indigo-500 animate-spin-slow" />
                    <span>Delhi Grid (CP Centered)</span>
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
              </div>
            </div>
          )}

          {/* Dynamic Portal view viewport */}
          <AnimatePresence mode="wait">
            {view === 'brand' ? (
              <motion.div
                key="brand"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <BrandWorkspace
                  centerLat={centerLat}
                  centerLng={centerLng}
                  centerAddress={centerAddress}

                  setCenterLat={setCenterLat}
                  setCenterLng={setCenterLng}
                  onCampaignCreated={handleCampaignCreated}
                  activeCampaigns={activeCampaigns}
                  setSelectedCreator={(creator) => {
                    setSelectedCreatorId(creator.id);
                  }}
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
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <CreatorWorkspace
                  activeCampaigns={activeCampaigns}
                  selectedCreatorId={selectedCreatorId}
                  setSelectedCreatorId={setSelectedCreatorId}
                  selectedCampaignId={selectedCampaignId}
                  setSelectedCampaignId={(id) => {
                    setSelectedCampaignId(id);
                    if (id) {
                      setActiveCreatorSubTab('escrow');
                    }
                  }}
                  activeSubTab={activeCreatorSubTab}
                  creators={creators}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
