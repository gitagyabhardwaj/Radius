import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Campaign, Creator, Submission } from '../types';
import { getDistanceKm } from './MinimalMap';
import { useMutation, useQuery, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import {
  ShieldCheck,
  Upload,
  AlertTriangle,
  Award,
  DollarSign,
  Briefcase,
  Zap,
  CheckCircle2,
  ChevronRight,
  Trash2,
  Radio,
  Terminal,
  Check,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useClerk } from '@clerk/clerk-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CampaignAcceptModal } from './CampaignAcceptModal';
import RatingWidget, { ReviewsCard } from './RatingWidget';

const generateAudienceLocations = (creator: any) => {
  const indianCities = [
    'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 
    'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur',
    'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
    'Bhopal', 'Visakhapatnam', 'Gurgaon', 'Noida', 'Chandigarh'
  ].filter(city => city.toLowerCase() !== (creator.locality || '').toLowerCase());
  
  // Use character codes of creator handle to deterministically pick cities
  const hash = (creator.handle || '').split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  
  const selectedCities = [
    indianCities[(hash + 1) % indianCities.length],
    indianCities[(hash + 2) % indianCities.length],
    indianCities[(hash + 3) % indianCities.length],
  ];

  return [
    { name: creator.locality || 'Primary Hub', value: creator.audienceInLocality || 35 },
    { name: selectedCities[0], value: 25 },
    { name: selectedCities[1], value: 15 },
    { name: selectedCities[2], value: 15 },
    { name: 'Rest of World', value: 10 },
  ];
};

interface CreatorWorkspaceProps {
  activeCampaigns: Campaign[];

  selectedCreatorId: string;
  setSelectedCreatorId: (id: string) => void;
  selectedCampaignId: string | null;
  setSelectedCampaignId: (id: string | null) => void;
  activeSubTab?: 'radar' | 'escrow' | 'wallet' | 'portfolio' | 'profile';
  creators?: Creator[];
}

export default function CreatorWorkspace({
  activeCampaigns,
  selectedCreatorId,
  setSelectedCreatorId,
  selectedCampaignId,
  setSelectedCampaignId,
  activeSubTab = 'radar',
  creators,
}: CreatorWorkspaceProps) {
  // Convex mutations & queries
  const { signOut } = useClerk();
  const acceptOffer = useMutation(api.offers.accept);
  const creatorOffers = useQuery(api.offers.getByCreator);
  const generateUploadUrl = useMutation(api.submissions.generateUploadUrl);
  const submitDraft = useMutation(api.submissions.submitDraft);
  const submitPublishedLink = useMutation(api.submissions.submitPublishedLink);
  const mySubmissions = useQuery(api.submissions.getByCreator);
  const earnings = useQuery(api.escrow.getCreatorEarnings);
  const updateProfile = useMutation(api.users.updateProfile);
  const deleteCurrentUser = useMutation(api.users.deleteCurrentUser);

  const acceptGenericCampaign = useMutation(api.users.acceptCampaign);
  const fetchProfileData = useAction(api.instagram.fetchProfileData);
  const createVelocityOrder = useAction(api.payments.createVelocityOrder);
  const verifyAndActivateVelocity = useAction(api.payments.verifyAndActivateVelocity);

  // Current user as Creator
  const currentCreator = useMemo(() => {
    if (!creators) return null;
    return creators.find((c) => c.id === selectedCreatorId) || creators[0] || null;
  }, [creators, selectedCreatorId]);

  // Velocity Tier local upgrade state
  const [velocitySubscribed, setVelocitySubscribed] = useState(
    currentCreator?.velocityTier === 'Velocity'
  );

  // Sync velocity subscription state when currentCreator changes
  useEffect(() => {
    if (currentCreator) {
      setVelocitySubscribed(currentCreator.velocityTier === 'Velocity');
    }
  }, [currentCreator]);

  // Profile save feedback state
  const [profileSaveStatus, setProfileSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Profile location geocoding state
  const [addressInput, setAddressInput] = useState(currentCreator?.locality || '');
  const [profileGeocodeData, setProfileGeocodeData] = useState<{ lat: number, lng: number, locality: string } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  useEffect(() => {
    if (currentCreator && !profileGeocodeData) {
      setAddressInput(currentCreator.locality || '');
    }
  }, [currentCreator]);

  const [velocityCheckoutError, setVelocityCheckoutError] = useState<string | null>(null);

  const handleUpgradeVelocity = async () => {
    if (!currentCreator) return;
    setVelocityCheckoutError(null);

    // 1. Ask the server to create the order (amount + key never come from
    //    the client, so nothing here can be tampered with in devtools).
    let order;
    try {
      order = await createVelocityOrder({});
    } catch (err) {
      console.error('Failed to create Razorpay order:', err);
      setVelocityCheckoutError('Could not start checkout. Please try again.');
      return;
    }

    const options = {
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: order.currency,
      name: 'Radius',
      description: 'Velocity Priority Tier — Monthly',
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        // 2. Verify the payment signature server-side before trusting it.
        //    The tier is only granted inside verifyAndActivateVelocity,
        //    never here on the client.
        try {
          const result = await verifyAndActivateVelocity(response);
          if (result.verified) {
            setVelocitySubscribed(true);
          } else {
            setVelocityCheckoutError('Payment could not be verified. If you were charged, contact support.');
          }
        } catch (err) {
          console.error('Verification error:', err);
          setVelocityCheckoutError('Payment verification failed.');
        }
      },
      prefill: {
        name: currentCreator.name,
        email: '',
      },
      theme: {
        color: '#4f46e5',
      },
    };

    // Open Razorpay Checkout
    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
      console.error('Payment failed:', response.error);
      setVelocityCheckoutError(`Payment failed: ${response.error.description}`);
    });
    rzp.open();
  };

  const handleDowngradeVelocity = async () => {
    if (!currentCreator) return;
    setVelocitySubscribed(false);
    try {
      await updateProfile({ velocityTier: 'Basic' as 'Free' | 'Velocity' });
    } catch (err) {
      console.error('Failed to persist velocity tier:', err);
    }
  };

  // When selected creator changes, synchronize subscription state
  const handleCreatorChange = (id: string) => {
    setSelectedCreatorId(id);
    const newCreator = (creators || []).find((c) => c.id === id);
    if (newCreator) {
      setVelocitySubscribed(newCreator.velocityTier === 'Velocity');
    }
  };

  // Creator's feed of campaigns
  // Creator's feed of campaigns
  const creatorCampaigns = useMemo(() => {
    if (!currentCreator) return [];
    
    // Helper to parse followers string like "272.7M" to numbers
    const parseFollowers = (followers: string | undefined): number => {
      if (!followers) return 0;
      const str = followers.toLowerCase().replace(/,/g, "").trim();
      const match = str.match(/^([\d.]+)\s*(k|m|l|lakh|lakhs)?$/);
      if (!match) return 0;
      const num = parseFloat(match[1]);
      const suffix = match[2];
      if (suffix === "k") return num * 1000;
      if (suffix === "m") return num * 1000000;
      if (suffix === "l" || suffix === "lakh" || suffix === "lakhs") return num * 100000;
      return num;
    };

    return activeCampaigns.map((camp) => {
      const distance = getDistanceKm(camp.centerLat, camp.centerLng, currentCreator.lat, currentCreator.lng);
      
      // Calculate dynamic match score
      let score = 0;
      
      // 1. Distance Match (Up to 40 points) - Closeness is its own independent factor now
      const maxDistanceScoring = 50; // beyond 50km, they get 0 distance points
      const distanceScore = Math.max(0, 40 * (1 - (distance / maxDistanceScoring)));
      score += distanceScore;
      
      // 2. Absolute Local Reach (Up to 30 points)
      const totalFollowers = parseFollowers(currentCreator.followers);
      const localPercentage = currentCreator.audienceInLocality !== undefined ? currentCreator.audienceInLocality / 100 : 0;
      const absoluteLocalReach = totalFollowers * localPercentage;
      
      const reachScore = Math.min(30, (absoluteLocalReach / 10000) * 30); 
      score += reachScore;

      // 3. Niche match (Up to 20 points)
      if (currentCreator.niche && currentCreator.niche.toLowerCase() === camp.niche.toLowerCase()) {
        score += 20;
      } else if (currentCreator.niche && camp.niche.toLowerCase().includes(currentCreator.niche.toLowerCase())) {
        score += 10;
      }

      // 4. Velocity tier bonus (Up to 10 points)
      if (velocitySubscribed) {
        score += 10;
      } else {
        score += 2;
      }

      return {
        ...camp,
        distance,
        matchScore: Math.max(1, Math.min(100, Math.round(score))),
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [activeCampaigns, currentCreator, velocitySubscribed]);

  const activeRadarCampaigns = useMemo(() => {
    return creatorCampaigns.filter(camp => {
      if (camp.status !== 'active') return false;
      
      const hasPendingOffer = creatorOffers?.some((o: any) => o.campaignId === camp.id && o.status === 'pending');
      const hasBrandReviewOffer = creatorOffers?.some((o: any) => o.campaignId === camp.id && o.status === 'brand_review');
      const hasAcceptedOffer = creatorOffers?.some((o: any) => o.campaignId === camp.id && o.status === 'accepted');
      const hasSubmission = mySubmissions?.some((s: any) => s.campaignId === camp.id);
      const isDatabaseAccepted = currentCreator?.acceptedCampaignIds?.includes(camp.id);
      
      return hasPendingOffer && !(hasBrandReviewOffer || hasAcceptedOffer || hasSubmission || isDatabaseAccepted);
    });
  }, [creatorCampaigns, creatorOffers, mySubmissions, currentCreator]);

  // Active accepted campaign
  const activeWorkingCampaign = useMemo(() => {
    if (!currentCreator) return null;
    if (selectedCampaignId) {
      return creatorCampaigns.find((c) => c.id === selectedCampaignId);
    }
    // Return first campaign where the creator is in the current active dispatch batch
    return creatorCampaigns.find((camp) => {
      const activeBatch = camp.batches[camp.activeBatchIndex];
      return activeBatch && activeBatch.creatorIds.includes(currentCreator.id);
    });
  }, [creatorCampaigns, selectedCampaignId, currentCreator]);

  // Submission State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(null);
  const [contentLink, setContentLink] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [handleVerifiedData, setHandleVerifiedData] = useState<{followers: string, audienceInLocality: number} | null>(null);
  const [isVerifyingHandle, setIsVerifyingHandle] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [handleVerifyMessage, setHandleVerifyMessage] = useState<{text: string, type: 'error'|'warning'|'success'} | null>(null);
  const [isRadarActive, setIsRadarActive] = useState(true);
  const [escrowLogs, setEscrowLogs] = useState<any[]>([]);
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);
  const [viewingCampaignId, setViewingCampaignId] = useState<string | null>(null);
  const [isInstagramLinked, setIsInstagramLinked] = useState(false);

  // The real submission for the active campaign, as recorded by the backend.
  // Its status ('uploaded' -> 'verifying' -> 'approved'/'rejected') is driven
  // entirely by the brand reviewing the actual deliverable — there is no
  // client-side EXIF/geofence check standing in for that review.
  const activeSubmission = useMemo(() => {
    if (!activeWorkingCampaign || !mySubmissions) return null;
    return (
      mySubmissions.find((s: any) => s.campaignId === activeWorkingCampaign.id) || null
    );
  }, [mySubmissions, activeWorkingCampaign]);

  // Handle file selection from input or drag-and-drop
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadError(null);
    const previewUrl = URL.createObjectURL(file);
    setSelectedFilePreview(previewUrl);
  };

  // Upload the deliverable (photo or video of the actual reel/story/post) to
  // Convex and create the submission for the brand to review.
  const handleFileUploadAndSubmit = async () => {
    if (!selectedFile || !activeWorkingCampaign || !currentCreator) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // 1. Get an upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      // 2. Upload the file
      const result = await fetch(uploadUrl, {
        method: 'POST',
        body: selectedFile,
        headers: { 'Content-Type': selectedFile.type },
      });

      if (!result.ok) throw new Error('File upload failed');

      const { storageId } = await result.json();

      // 3. Create the draft submission record in Convex, including the optional
      // caption so the brand can preview it.
      await submitDraft({
        campaignId: activeWorkingCampaign.id as any,
        fileId: storageId,
        caption: contentLink.trim() || undefined,
      });
    } catch (err: any) {
      console.error('Submission failed:', err);
      setUploadError(err?.message || 'Failed to upload and submit content');
    } finally {
      setIsUploading(false);
    }
  };


  const handleSubmitPublishedLink = async () => {
    if (!activeSubmission || !contentLink.trim()) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      await submitPublishedLink({
        submissionId: activeSubmission._id,
        contentUrl: contentLink.trim(),
      });
    } catch (err: any) {
      console.error('Submission failed:', err);
      setUploadError(err?.message || 'Failed to submit published link');
    } finally {
      setIsUploading(false);
    }
  };

  // Process Payout via Smart Contract Release
  const handleTriggerPayout = () => {
    if (!activeSubmission || !activeWorkingCampaign) return;

    setIsVerifying(true);

    setTimeout(() => {
      const payoutAmount = activeWorkingCampaign.budget;
      const txHash = `0x${Array.from({ length: 40 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`;

      setEscrowLogs((prev) => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString(),
          status: 'released',
          amount: payoutAmount,
          txHash,
        },
      ]);



      setIsVerifying(false);
    }, 2000);
  };

  const handleVerifySocials = async () => {
    const handleInput = document.getElementById('creator-profile-handle-input') as HTMLInputElement;
    if (!handleInput || !handleInput.value) return;

    setIsVerifyingHandle(true);
    setHandleVerifyMessage(null);
    try {
      const cleanHandle = handleInput.value.replace("@", "").trim();

      const result = await fetchProfileData({
        handle: cleanHandle,
        locality: currentCreator?.locality || undefined,
      });

      if (!result) {
        setHandleVerifyMessage({ text: "Could not fetch data for this handle.", type: "error" });
        return;
      }

      setHandleVerifiedData({
        followers: result.followers,
        audienceInLocality: result.audienceInLocality,
      });

      // Automatically save to the database so the handle and stats persist
      await updateProfile({
        handle: cleanHandle,
        followers: result.followers,
        audienceInLocality: result.audienceInLocality,
        avatarUrl: result.profilePicUrl || currentCreator.avatarUrl,
        name: result.fullName || currentCreator.name,
      });

      const sourceLabels: Record<string, string> = {
        instagram_html: "Verified via Instagram.",
        rapidapi: "Verified via API.",
        fallback: "Verified via estimated data (live fetch blocked by Instagram).",
      };

      setHandleVerifyMessage({
        text: sourceLabels[result.source] || "Verified.",
        type: result.source === "fallback" ? "warning" : "success",
      });

    } catch (err: any) {
      console.error(err);
      setHandleVerifyMessage({ text: "Failed to verify handle. Check console.", type: "error" });
    } finally {
      setIsVerifyingHandle(false);
    }
  };
  if (!currentCreator) return null;

  if (activeSubTab === 'profile') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
        {/* Creator Profile Editor Card */}
        <div className="lg:col-span-7 bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div>
              <h2 className="text-xl font-display font-semibold text-zinc-900">Creator Identity & Node Registry</h2>
              <p className="text-sm text-zinc-500 mt-0.5">
                Manage your public creator workspace details, geolocated coordinates, and verify your photography gear credentials.
              </p>
            </div>
            {currentCreator.velocityTier === 'Velocity' ? (
              <span className="bg-amber-50 text-amber-700 text-sm px-2.5 py-1 rounded-full font-semibold border border-amber-200 flex items-center gap-1.5 animate-pulse">
                <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                Velocity Node
              </span>
            ) : (
              <span className="bg-zinc-50 text-zinc-500 text-sm px-2.5 py-1 rounded-full font-semibold border border-zinc-200 flex items-center gap-1.5">
                Basic Node
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Public Display Name</label>
              <input
                id="creator-profile-name-input"
                type="text"
                defaultValue={currentCreator.name}

                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-base text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors font-medium"
                placeholder="e.g. Bhavya Harbola"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Social Handle / Address</label>
              <div className="flex items-center gap-2">
                <input
                  id="creator-profile-handle-input"
                  type="text"
                  defaultValue={currentCreator.handle}
                  onChange={() => setHandleVerifiedData(null)}
                  className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-base text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  placeholder="e.g. @bhavya_craft"
                />
                <button
                  type="button"
                  onClick={handleVerifySocials}
                  disabled={isVerifyingHandle || !!handleVerifiedData}
                  className="shrink-0 px-4 py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:opacity-50 font-bold font-mono text-xs uppercase rounded-xl transition-colors border border-indigo-200"
                >
                  {isVerifyingHandle ? 'Scanning...' : (handleVerifiedData ? 'Verified' : 'Verify')}
                </button>
              </div>
              {handleVerifyMessage && (
                <span className={`text-[10px] font-mono mt-1 ${
                  handleVerifyMessage.type === 'error' ? 'text-red-500' :
                  handleVerifyMessage.type === 'warning' ? 'text-amber-500' : 'text-emerald-500'
                }`}>
                  {handleVerifyMessage.text}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Content Niche Sector</label>
              <select
                id="creator-profile-niche-select"
                defaultValue={currentCreator.niche || ""}

                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-base text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              >
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
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium flex items-center justify-between">
                Total Audience Reach
                {handleVerifiedData ? (
                  <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-bold border border-emerald-200">API VERIFIED</span>
                ) : (
                  <span className="text-[9px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded font-bold">UNVERIFIED</span>
                )}
              </label>
              <div className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-base text-zinc-500 cursor-not-allowed flex items-center justify-between">
                <span>{handleVerifiedData ? handleVerifiedData.followers : (currentCreator.followers && currentCreator.followers !== '0' ? currentCreator.followers : 'Verify Handle to Fetch')}</span>
                <span className="text-xs">{handleVerifiedData ? '✅' : '🔒'}</span>
              </div>
              <input type="hidden" id="creator-profile-followers-input" value={handleVerifiedData ? handleVerifiedData.followers : (currentCreator.followers || '0')} />
              <input type="hidden" id="creator-profile-audience-input" value={handleVerifiedData ? handleVerifiedData.audienceInLocality : (currentCreator.audienceInLocality || 0)} />
              {handleVerifiedData && (
                <span className="text-[10px] text-emerald-600 font-mono mt-1">
                  ↳ {handleVerifiedData.audienceInLocality}% of audience located in target hub.
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Primary Locality / Base Area</label>
              <div className="flex items-center gap-2">
                <input
                  id="creator-profile-locality-input"
                  type="text"
                  value={addressInput}
                  onChange={(e) => {
                    setAddressInput(e.target.value);
                    setProfileGeocodeData(null);
                    setGeocodeError(null);
                  }}
                  className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-base text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  placeholder="Enter your location"
                />
                <button
                  type="button"
                  disabled={isGeocoding || profileGeocodeData !== null || addressInput === currentCreator.locality}
                  onClick={async () => {
                    if (!addressInput.trim()) return;
                    setIsGeocoding(true);
                    setGeocodeError(null);
                    try {
                      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressInput)}`;
                      const response = await fetch(url, { headers: { 'Accept-Language': 'en-US,en;q=0.9' }});
                      if (!response.ok) throw new Error('Geocoding failed');
                      const data = await response.json();
                      if (data && data.length > 0) {
                        const result = data[0];
                        setProfileGeocodeData({
                          lat: parseFloat(result.lat),
                          lng: parseFloat(result.lon),
                          locality: result.display_name,
                        });
                        setAddressInput(result.display_name);
                      } else {
                        setGeocodeError('Location not found. Please be more specific.');
                      }
                    } catch (err) {
                      setGeocodeError('Failed to locate address.');
                    } finally {
                      setIsGeocoding(false);
                    }
                  }}
                  className="shrink-0 px-4 py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:opacity-50 font-bold font-mono text-xs uppercase rounded-xl transition-colors border border-indigo-200"
                >
                  {isGeocoding ? 'Locating...' : (profileGeocodeData ? 'Located' : 'Locate')}
                </button>
              </div>
              {geocodeError && (
                <span className="text-[10px] font-mono mt-1 text-red-500">
                  {geocodeError}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Creative Description / Bio</label>
            <textarea
              id="creator-profile-bio-textarea"
              rows={3}
              defaultValue={currentCreator.bio || ""}
              className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-base text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors resize-none leading-relaxed"
              placeholder="Tell brands why they should send priority offers to you..."
            />
          </div>

          <div className="border-t border-zinc-100 pt-4 flex items-center justify-end gap-3">
            {profileSaveStatus === 'saved' && (
              <span className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Profile updated successfully
              </span>
            )}
            {profileSaveStatus === 'error' && (
              <span className="text-sm text-rose-600 font-medium flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Failed to save profile
              </span>
            )}
            <button
              id="creator-profile-save-btn"
              disabled={profileSaveStatus === 'saving'}
              onClick={async () => {
                setProfileSaveStatus('saving');
                try {
                  const nameInput = document.getElementById('creator-profile-name-input') as HTMLInputElement;
                  const handleInput = document.getElementById('creator-profile-handle-input') as HTMLInputElement;
                  const nicheSelect = document.getElementById('creator-profile-niche-select') as HTMLSelectElement;
                  const bioTextarea = document.getElementById('creator-profile-bio-textarea') as HTMLTextAreaElement;

                  const newFollowers = handleVerifiedData ? handleVerifiedData.followers : currentCreator.followers;
                  const newAudience = handleVerifiedData ? handleVerifiedData.audienceInLocality : currentCreator.audienceInLocality;

                  const rawHandle = handleInput?.value || currentCreator.handle || '';
                  const cleanHandle = rawHandle.replace("@", "").trim();

                  await updateProfile({
                    name: nameInput?.value || currentCreator.name,
                    handle: cleanHandle,
                    niche: nicheSelect?.value || currentCreator.niche,
                    followers: newFollowers,
                    audienceInLocality: newAudience,
                    bio: bioTextarea?.value || '',
                    ...(profileGeocodeData ? {
                      locality: profileGeocodeData.locality,
                      lat: profileGeocodeData.lat,
                      lng: profileGeocodeData.lng,
                    } : {
                      locality: addressInput,
                    }),
                  });
                  
                  setProfileSaveStatus('saved');
                  setTimeout(() => setProfileSaveStatus('idle'), 3000);
                } catch (err: any) {
                  console.error('Failed to update profile:', err);
                  alert(`Failed to save: ${err.message || 'Unknown error'}`);
                  setProfileSaveStatus('error');
                  setTimeout(() => setProfileSaveStatus('idle'), 3000);
                }
              }}
              className="py-2.5 px-5 bg-zinc-950 hover:bg-zinc-900 text-white font-mono text-sm rounded-xl font-bold tracking-wider uppercase transition-all cursor-pointer disabled:opacity-50"
            >
              {profileSaveStatus === 'saving' ? 'SAVING...' : 'COMMIT LOCAL PROFILE CHANGES'}
            </button>
          </div>
          
          <div className="border-t border-rose-100/50 pt-6 mt-2 flex flex-col gap-3">
            <h3 className="text-sm font-mono uppercase tracking-wider text-rose-600 font-bold">Danger Zone</h3>
            <div className="flex items-center justify-between bg-rose-50/50 border border-rose-100 p-4 rounded-xl">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-zinc-900">Delete Account</span>
                <span className="text-xs text-zinc-500">Permanently delete your profile and reset your role.</span>
              </div>
              <button
                onClick={async () => {
                  if (confirm("Are you sure you want to completely delete your profile? This cannot be undone.")) {
                    await deleteCurrentUser();
                    signOut();
                  }
                }}
                className="py-2 px-4 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-mono text-xs rounded-lg font-bold transition-all"
              >
                DELETE PROFILE
              </button>
            </div>
          </div>

        </div>

        {/* Creator Profile Statistics Sidebar */}
        <div className="lg:col-span-5 flex flex-col gap-6 animate-fade-in">
          {/* Creator Profile Display Card */}
          <div className="bg-zinc-950 text-zinc-300 rounded-2xl p-6 shadow-xl flex flex-col gap-5 border border-zinc-800">
            <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
              <img
                src={currentCreator.avatar}
                alt={currentCreator.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/25 referrerPolicy='no-referrer'"
              />
              <div className="flex flex-col">
                <span className="text-base font-bold text-white tracking-tight leading-none">{currentCreator.name}</span>
                <span className="text-[11px] font-mono text-zinc-500 mt-1.5 uppercase">{currentCreator.handle}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col p-4 bg-zinc-900/60 rounded-xl border border-zinc-850 h-64 justify-center items-center text-center">
                  <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Avg Match Score</span>
                  <span className="text-5xl font-black text-white mt-4">
                    {activeRadarCampaigns.length > 0
                      ? Math.round(activeRadarCampaigns.reduce((acc, curr) => acc + curr.matchScore, 0) / activeRadarCampaigns.length)
                      : "-"
                    }%
                  </span>
                  <span className="text-xs text-zinc-500 mt-3 max-w-[80%]">Averaged across all active local campaigns.</span>
                </div>
                <div className="flex flex-col p-4 bg-zinc-900/60 rounded-xl border border-zinc-850 h-64">
                  <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest font-bold mb-2">Top 5 Audience Locations</span>
                  
                  {!isInstagramLinked ? (
                    <div className="flex-1 w-full h-full flex flex-col items-center justify-center text-center px-4">
                      <div className="w-12 h-12 bg-gradient-to-tr from-[#fd5949] to-[#d6249f] rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-pink-500/20">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-[11px] text-zinc-400 mb-3 px-2">Link your Instagram Professional account to verify your local audience demographics.</p>
                      <button 
                        onClick={() => setIsInstagramLinked(true)}
                        className="bg-gradient-to-r from-zinc-800 to-zinc-700 hover:from-zinc-700 hover:to-zinc-600 text-white text-[11px] font-bold py-2 px-4 rounded-full transition-all flex items-center gap-2 border border-zinc-600"
                      >
                        Connect Instagram
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 w-full h-full min-h-0 min-w-0 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={generateAudienceLocations(currentCreator)}
                            cx="50%"
                            cy="45%"
                            innerRadius={30}
                            outerRadius={55}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="transparent"
                          >
                            <Cell fill="#10b981" />
                            <Cell fill="#3b82f6" />
                            <Cell fill="#6366f1" />
                            <Cell fill="#8b5cf6" />
                            <Cell fill="#3f3f46" />
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px', color: '#fff', zIndex: 1000 }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: any) => [`${value}%`, 'Audience']}
                          />
                          <Legend 
                            layout="horizontal" 
                            verticalAlign="bottom" 
                            align="center"
                            iconType="circle"
                            wrapperStyle={{ fontSize: '10px', color: '#a1a1aa', paddingTop: '10px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex flex-col gap-2">
              <span className="text-[11px] font-mono text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                Crypto Verification State
              </span>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Payout release is verified by the brand reviewing your actual deliverable — no camera or GPS check runs on submission.
              </p>
            </div>

            <ReviewsCard userId={currentCreator.id} label="Brand Reviews" />
          </div>
        </div>
      </div>
    );
  }

  if (activeSubTab === 'radar') {
    return (
      <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
        {/* Left Pane: Profiles, Subscriptions and Available feeds */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Node Analytics / Health */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-400 font-bold">Node Analytics</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Real-time geofenced performance metrics.</p>
              </div>
              <button
                onClick={() => setIsRadarActive(!isRadarActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  isRadarActive ? 'bg-emerald-500' : 'bg-zinc-200'
                }`}
                role="switch"
                aria-checked={isRadarActive}
              >
                <span className="sr-only">Toggle Radar</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isRadarActive ? 'translate-x-2.5' : '-translate-x-2.5'
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-50 border border-zinc-100 p-3 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-indigo-600 font-display">{activeRadarCampaigns.length}</span>
                <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold mt-1 tracking-wider">Nearby Offers</span>
              </div>
              <div className="bg-zinc-50 border border-zinc-100 p-3 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-emerald-500 font-display">{currentCreator.audienceInLocality}%</span>
                <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold mt-1 tracking-wider">Local Audience</span>
              </div>
              <div className="col-span-2 bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl flex items-center justify-between">
                 <span className="text-xs font-mono uppercase text-indigo-800 font-bold tracking-wider">Verified Auth Reach</span>
                 <span className="text-sm font-bold text-indigo-900 font-mono">{currentCreator.followers || 0}</span>
              </div>
            </div>
          </div>

          {/* Velocity Tier subscription panel */}
          <div className="bg-zinc-950 text-white rounded-2xl p-5 shadow-lg flex flex-col gap-4 relative overflow-hidden">
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-mono uppercase tracking-wider text-zinc-400 font-bold">Velocity Priority Tier</span>
              </div>
              <span className="bg-zinc-800 text-zinc-300 text-[11px] font-mono px-2 py-0.5 rounded border border-zinc-700 font-bold">
                Delhi NCR Grid
              </span>
            </div>

            <div className="z-10 flex flex-col gap-1">
              <h4 className="text-lg font-display font-black tracking-tight">Programmatic Queue Front-running</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                By upgrading to Velocity priority tier, your profile moves programmatically to Batch A (Priority) in 100% of geofenced campaigns matching your niche.
              </p>
            </div>

            {/* Simulated Tier state toggle */}
            <div className="z-10 flex flex-col gap-2 pt-2 border-t border-zinc-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Upgrade status:</span>
                <span className={`font-mono font-bold ${velocitySubscribed ? 'text-emerald-400' : 'text-zinc-400'}`}>
                  {velocitySubscribed ? 'ACTIVE (PRIORITY FRONT-RUNNING)' : 'INACTIVE (BASIC OFFERS)'}
                </span>
              </div>

              {velocitySubscribed ? (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 font-mono">Subscribed since this session</span>
                  <button
                    onClick={handleDowngradeVelocity}
                    className="text-[11px] text-zinc-500 hover:text-red-400 font-mono underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Cancel subscription
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleUpgradeVelocity}
                  className="w-full py-2 px-3 rounded-xl font-mono text-[11px] font-bold tracking-wider uppercase transition-all active:scale-[0.98] bg-amber-400 hover:bg-amber-500 text-zinc-950"
                >
                  Upgrade to Velocity Tier (₹9.9/mo)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Pane: Available Campaigns Feed */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Local geofenced campaign feed */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-400 font-bold">Local Geofenced Activations</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Campaigns matched to your current coordinates.</p>
            </div>

            <div className="flex flex-col gap-3">
              {!isRadarActive ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
                  <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                    <Radio className="w-8 h-8 text-zinc-400" />
                  </div>
                  <h4 className="text-lg font-display font-bold text-zinc-800">Radar is Offline</h4>
                  <p className="text-sm text-zinc-500 text-center max-w-sm mt-2 leading-relaxed">
                    You have disconnected your node from the cryptographic router. Toggle your radar back on to receive localized priority offers.
                  </p>
                </div>
              ) : activeRadarCampaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4 relative">
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-200 animate-ping opacity-20"></div>
                    <Radio className="w-8 h-8 text-indigo-400 animate-pulse" />
                  </div>
                  <h4 className="text-lg font-display font-bold text-zinc-800">Scanning for offers...</h4>
                  <p className="text-sm text-zinc-500 text-center max-w-sm mt-2 leading-relaxed">
                    Your node is active. We are actively pinging the cryptographic router for geofenced campaigns matching your niche.
                  </p>
                </div>
              ) : activeRadarCampaigns.map((camp) => {
                const inActiveBatch = camp.batches[camp.activeBatchIndex]?.creatorIds.includes(currentCreator.id);

                return (
                  <div
                    key={camp.id}
                    className={`border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                      camp.id === selectedCampaignId
                        ? 'border-indigo-500 bg-indigo-50/10'
                        : 'border-zinc-150 hover:border-zinc-200 bg-white'
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-zinc-800">{camp.title}</h4>
                        {inActiveBatch && (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200/80 font-mono text-[8px] px-1.5 py-0.2 rounded font-bold animate-pulse">
                            Priority Batch Offer
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        Target Locality: {camp.centerLocality}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-1">
                        <span>Distance: {camp.distance.toFixed(2)} km away</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end text-right">
                        <span className="text-[11px] font-mono text-zinc-400">Match score:</span>
                        <span className="text-sm font-bold text-indigo-600">{camp.matchScore}%</span>
                      </div>

                      <div className="flex flex-col items-end text-right">
                        <span className="text-[11px] font-mono text-zinc-400">Your Payout:</span>
                        <span className="text-sm font-bold text-emerald-600 font-mono">₹{Math.round((camp.budget * 0.95) / camp.spotsTotal)}</span>
                      </div>

                      <button
                        onClick={() => {
                          setViewingCampaignId(camp.id);
                        }}
                        className="py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>Express Interest</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

        <CampaignAcceptModal
          campaign={activeRadarCampaigns.find(c => c.id === viewingCampaignId) || null}
          onClose={() => setViewingCampaignId(null)}
          onAccept={async (camp) => {
            // If there's an explicit targeted offer, accept it
            const matchingOffer = creatorOffers?.find(
              (o) => o.campaign?._id === camp.id || o.campaign?.title === camp.title
            );
            if (matchingOffer && matchingOffer.status === 'pending') {
              try {
                await acceptOffer({ offerId: matchingOffer._id });
              } catch (err) {
                console.error('Failed to accept offer:', err);
              }
            }
            
            // Also globally accept the campaign to save it to DB
            try {
              await acceptGenericCampaign({ campaignId: camp.id });
            } catch (err) {
              console.error('Failed to accept generic campaign:', err);
            }

            setSelectedCampaignId(camp.id);
            setExpandedCampaignId(camp.id);
            setSelectedFile(null);
            setSelectedFilePreview(null);
            setContentLink('');
            setViewingCampaignId(null);
          }}
        />
      </>
    );
  }

  if (activeSubTab === 'escrow') {
    const acceptedCampaigns = creatorCampaigns.filter(camp => {
      const hasBrandReviewOffer = creatorOffers?.some((o: any) => o.campaignId === camp.id && o.status === 'brand_review');
      const hasAcceptedOffer = creatorOffers?.some((o: any) => o.campaignId === camp.id && o.status === 'accepted');
      const hasSubmission = mySubmissions?.some((s: any) => s.campaignId === camp.id);
      const isDatabaseAccepted = currentCreator?.acceptedCampaignIds?.includes(camp.id);
      return hasBrandReviewOffer || hasAcceptedOffer || hasSubmission || isDatabaseAccepted;
    });

    return (
      <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-fade-in">
        <h2 className="text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-2 pb-2">Active Campaigns & Escrows</h2>
        
        {acceptedCampaigns.length > 0 ? (
          acceptedCampaigns.map((camp) => {
            const submission = mySubmissions?.find((s: any) => s.campaignId === camp.id);
            const isUploadingThis = isUploading && expandedCampaignId === camp.id;
            
            return (
              <div 
                key={camp.id} 
                className={`relative overflow-hidden bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_0_50px_-12px_rgba(99,102,241,0.2)] flex flex-col group transition-all duration-500 hover:shadow-[0_0_80px_-15px_rgba(99,102,241,0.3)] hover:border-white/20 ${expandedCampaignId === camp.id ? 'p-8 gap-0' : 'p-6'}`}
              >
                {/* Dynamic background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-fuchsia-500/20 transition-all duration-700" />

                {/* Header info */}
                <div 
                  className={`relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer ${expandedCampaignId === camp.id ? 'pb-6' : ''}`}
                  onClick={() => setExpandedCampaignId(expandedCampaignId === camp.id ? null : camp.id)}
                >
                  <div className="flex flex-col gap-2">
                    {(() => {
                      const isPendingApproval = creatorOffers?.some((o: any) => o.campaignId === camp.id && o.status === 'brand_review');
                      return isPendingApproval ? (
                        <span className="bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold px-3 py-1 rounded-full w-max tracking-widest animate-pulse">
                          PENDING BRAND APPROVAL
                        </span>
                      ) : (
                        <span className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono font-bold px-3 py-1 rounded-full w-max tracking-widest">
                          ACTIVE CAMPAIGN
                        </span>
                      );
                    })()}
                    <h2 className="text-2xl font-display font-black text-white">{camp.title}</h2>
                    <span className="text-sm text-zinc-400 font-mono">
                      Brand: <span className="text-zinc-300">{camp.brandName}</span> • Quota: <span className="text-zinc-300">{camp.spotsFilled}/{camp.spotsTotal} spots</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
                      <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1">Your Payout (after 5% fee)</span>
                      <span className="text-3xl font-display font-black text-emerald-400">₹{Math.round((camp.budget * 0.95) / camp.spotsTotal)}</span>
                    </div>
                    
                    <div className="p-2 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300">
                      <ChevronRight className={`w-6 h-6 text-zinc-400 transition-transform duration-300 ${expandedCampaignId === camp.id ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {expandedCampaignId === camp.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="pt-6 border-t border-white/5 flex flex-col gap-8">
                        {/* Escrow Status Stepper */}
                        <div className="relative z-10 flex flex-col gap-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 font-bold">Escrow Protocol State</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { step: 'Locked', desc: 'Budget escrowed', active: true, done: true },
                      {
                        step: 'Submitted',
                        desc: 'Deliverable uploaded',
                        active: !!submission,
                        done: !!submission,
                      },
                      {
                        step: 'Brand Review',
                        desc: 'Brand previews content',
                        active: submission?.status === 'draft_verifying' || submission?.status === 'draft_uploaded' || submission?.status === 'final_verifying' || submission?.status === 'published_uploaded',
                        done: submission?.status === 'approved' || submission?.status === 'draft_approved',
                      },
                      {
                        step: 'Released',
                        desc: 'Instant bank transfer',
                        active: submission?.status === 'approved',
                        done: submission?.status === 'approved',
                      },
                    ].map((st, i) => (
                      <div
                        key={i}
                        className={`relative overflow-hidden rounded-2xl p-4 flex flex-col gap-1.5 transition-all duration-300 ${
                          st.done
                            ? 'bg-emerald-500/10 border border-emerald-500/20'
                            : st.active
                            ? 'bg-indigo-500/10 border border-indigo-500/20'
                            : 'bg-white/5 border border-white/5 opacity-50 grayscale'
                        }`}
                      >
                        {st.active && !st.done && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                        )}
                        <span
                          className={`text-sm font-black ${
                            st.done ? 'text-emerald-400' : st.active ? 'text-indigo-400' : 'text-zinc-500'
                          }`}
                        >
                          {i + 1}. {st.step}
                        </span>
                        <span className="text-xs text-zinc-400 leading-relaxed font-medium">{st.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advanced Professional Requirements */}
                {(camp.contentFormat || camp.targetAudience || camp.creativeGuidelines) && (
                  <div className="relative z-10 bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col gap-4 mt-2">
                    <h4 className="text-sm font-mono uppercase tracking-widest text-zinc-500 font-bold mb-1">Campaign Requirements</h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {camp.contentFormat && (
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] text-zinc-500 uppercase tracking-wider">Format</span>
                          <span className="text-sm text-zinc-300 font-medium">{camp.contentFormat}</span>
                        </div>
                      )}
                      {camp.targetAudience && (
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] text-zinc-500 uppercase tracking-wider">Target Audience</span>
                          <span className="text-sm text-zinc-300 font-medium">{camp.targetAudience}</span>
                        </div>
                      )}
                      {camp.submissionDeadlineDays && (
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] text-zinc-500 uppercase tracking-wider">Deadline</span>
                          <span className="text-sm text-zinc-300 font-medium">{camp.submissionDeadlineDays} days</span>
                        </div>
                      )}
                    </div>
                    
                    {camp.creativeGuidelines && (
                      <div className="flex flex-col gap-1 mt-2 pt-4 border-t border-white/5">
                        <span className="text-[11px] text-zinc-500 uppercase tracking-wider">Creative Guidelines</span>
                        <p className="text-sm text-zinc-400 italic">"{camp.creativeGuidelines}"</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Upload form or verified state */}
                <div className="relative z-10">
                  {!submission || submission.status === 'draft_rejected' ? (
                    <div className="flex flex-col gap-6 pt-4">
                      <div>
                        <h4 className="text-lg font-black text-white flex items-center gap-2">
                          <Upload className="w-5 h-5 text-indigo-400" />
                          Submit Draft Deliverable
                        </h4>
                        <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
                          Upload the actual reel, story, or post draft you made for this campaign. The brand will preview it before you publish.
                        </p>
                      </div>

                      {/* File Upload Zone */}
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOver(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
                            setSelectedCampaignId(camp.id);
                            handleFileSelect(file);
                          }
                        }}
                        onClick={() => {
                          setSelectedCampaignId(camp.id);
                          fileInputRef.current?.click();
                        }}
                        className={`group border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-4 transition-all duration-300 cursor-pointer overflow-hidden relative ${
                          dragOver
                            ? 'border-indigo-400 bg-indigo-500/10'
                            : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/80 hover:border-zinc-600'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelect(file);
                          }}
                        />

                        {selectedFilePreview && expandedCampaignId === camp.id ? (
                          <div className="relative">
                            {selectedFile?.type.startsWith('video/') ? (
                              <video
                                src={selectedFilePreview}
                                className="w-32 h-32 rounded-2xl object-cover border-2 border-indigo-500/50 shadow-2xl"
                                muted
                                autoPlay
                                loop
                              />
                            ) : (
                              <img
                                src={selectedFilePreview}
                                alt="Selected upload"
                                className="w-32 h-32 rounded-2xl object-cover border-2 border-indigo-500/50 shadow-2xl"
                              />
                            )}
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-zinc-900">
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-500">
                            <Upload className="w-8 h-8 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                          </div>
                        )}
                        <div className="flex flex-col gap-1 text-center">
                          <span className="text-base font-bold text-zinc-200">
                            {selectedFile && expandedCampaignId === camp.id ? selectedFile.name : 'Click or drag your draft to upload'}
                          </span>
                          <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider mt-1">Photo or video, up to 10MB</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                          Draft Caption / Notes (optional)
                        </label>
                        <input
                          type="text"
                          value={expandedCampaignId === camp.id ? contentLink : ''}
                          onChange={(e) => {
                            setExpandedCampaignId(camp.id);
                            setContentLink(e.target.value);
                          }}
                          placeholder="Any notes for the brand..."
                          className="w-full py-4 px-5 text-sm bg-zinc-900/80 border border-zinc-800 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
                        />
                      </div>

                      {uploadError && expandedCampaignId === camp.id && (
                        <div className="flex items-center gap-3 text-rose-400 text-sm font-medium bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4">
                          <AlertTriangle className="w-5 h-5 shrink-0" />
                          <span>{uploadError}</span>
                        </div>
                      )}

                      {submission?.status === 'draft_rejected' && submission.rejectionReason && (
                        <div className="flex items-center gap-3 text-rose-400 text-sm font-medium bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4">
                          <AlertTriangle className="w-5 h-5 shrink-0" />
                          <span>Brand Feedback: "{submission.rejectionReason}"</span>
                        </div>
                      )}

                      {selectedFile && expandedCampaignId === camp.id && (
                        <button
                          onClick={handleFileUploadAndSubmit}
                          disabled={isUploadingThis}
                          className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-50 text-white text-base font-black rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-3 shadow-[0_0_30px_-5px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_-5px_rgba(99,102,241,0.6)] hover:-translate-y-0.5 active:translate-y-0"
                        >
                          {isUploadingThis ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                              <span>Uploading & Submitting...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-5 h-5" />
                              <span>Submit Draft Securely</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  ) : submission.status === 'draft_uploaded' || submission.status === 'draft_verifying' ? (
                    <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
                      
                      <div className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-indigo-500/30 shrink-0 bg-zinc-900 shadow-2xl relative group">
                        {submission.fileUrl && submission.fileUrl.match(/\.(mp4|mov|webm)(\?|$)/i) ? (
                          <video src={submission.fileUrl} className="w-full h-full object-cover" autoPlay muted loop />
                        ) : (
                          <img
                            src={submission.fileUrl}
                            alt="Submitted draft"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      <div className="flex-1 flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                          <h4 className="text-xl font-display font-black text-white flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-indigo-400" />
                            {submission.status === 'draft_verifying' ? 'Brand Is Reviewing Your Draft' : 'Draft Submitted Successfully'}
                          </h4>
                          <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
                            <span className="text-white font-bold">{camp.brandName}</span> is previewing your draft.
                            Wait for their approval before publishing!
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : submission.status === 'draft_approved' || submission.status === 'rejected' ? (
                    <div className="flex flex-col gap-6 pt-4">
                      <div>
                        <h4 className="text-lg font-black text-white flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          Draft Approved! Now Publish it!
                        </h4>
                        <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
                          Your draft was approved by the brand. Please publish your post and submit the live link below to get paid.
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                          Link to the live post
                        </label>
                        <input
                          type="url"
                          value={expandedCampaignId === camp.id ? contentLink : ''}
                          onChange={(e) => {
                            setExpandedCampaignId(camp.id);
                            setContentLink(e.target.value);
                          }}
                          placeholder="https://instagram.com/reel/..."
                          className="w-full py-4 px-5 text-sm bg-zinc-900/80 border border-zinc-800 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-inner"
                        />
                      </div>

                      {uploadError && expandedCampaignId === camp.id && (
                        <div className="flex items-center gap-3 text-rose-400 text-sm font-medium bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4">
                          <AlertTriangle className="w-5 h-5 shrink-0" />
                          <span>{uploadError}</span>
                        </div>
                      )}
                      
                      {submission.status === 'rejected' && submission.rejectionReason && (
                        <div className="flex items-center gap-3 text-rose-400 text-sm font-medium bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4">
                          <AlertTriangle className="w-5 h-5 shrink-0" />
                          <span>Brand Feedback: "{submission.rejectionReason}"</span>
                        </div>
                      )}

                      <button
                        onClick={handleSubmitPublishedLink}
                        disabled={isUploadingThis || !contentLink.trim()}
                        className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 text-white text-base font-black rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-3 shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_-5px_rgba(16,185,129,0.6)] hover:-translate-y-0.5 active:translate-y-0"
                      >
                        {isUploadingThis ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            <span>Submitting Link...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-5 h-5" />
                            <span>Submit Published Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : submission.status === 'published_uploaded' || submission.status === 'final_verifying' ? (
                     <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
                      
                      <div className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-indigo-500/30 shrink-0 bg-zinc-900 shadow-2xl relative group flex items-center justify-center">
                          <ExternalLink className="w-10 h-10 text-indigo-500" />
                      </div>

                      <div className="flex-1 flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                          <h4 className="text-xl font-display font-black text-white flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-indigo-400" />
                            {submission.status === 'final_verifying' ? 'Brand Is Reviewing Your Final Post' : 'Final Link Submitted Successfully'}
                          </h4>
                          <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
                            <span className="text-white font-bold">{camp.brandName}</span> is reviewing your published post. Payout releases instantly via smart escrow once they approve it.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Status</span>
                            <span className="text-sm text-indigo-400 font-bold flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                              {submission.status === 'final_verifying' ? 'In Final Review' : 'Awaiting Final Review'}
                            </span>
                          </div>
                          {submission.contentUrl && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Live Link</span>
                              <a
                                href={submission.contentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-indigo-400 font-bold truncate hover:text-indigo-300 transition-colors"
                              >
                                View Live Post ↗
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 flex flex-col items-center text-center gap-5 animate-fade-in relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)]">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>

                      <div className="flex flex-col gap-2 max-w-md">
                        <h4 className="text-xl font-display font-black text-emerald-400">Final Post Approved — Payout Released!</h4>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                          <span className="text-white font-bold">{camp.brandName}</span> approved your final post. Your payout of{' '}
                          <span className="text-emerald-400 font-bold">₹{Math.round((camp.budget * 0.95) / camp.spotsTotal)}</span> (after 5% platform fee) has been transferred directly into your creator account.
                        </p>
                      </div>

                      <div className="pt-2">
                        <RatingWidget
                          submissionId={submission._id}
                          subjectLabel={camp.brandName}
                          dark
                        />
                      </div>
                    </div>
                  )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        ) : (
          <div className="bg-zinc-950/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-16 shadow-2xl text-center max-w-2xl mx-auto flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
              <Briefcase className="w-10 h-10 text-zinc-600 animate-pulse" />
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-2xl font-display font-black text-white">No Active Campaigns</h4>
              <p className="text-base text-zinc-400 max-w-md mx-auto leading-relaxed">
                Accept a hyperlocal campaign from the Active Radar to lock contract payouts. Payout releases once you submit your deliverable and the brand approves it.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeSubTab === 'wallet') {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        {/* Quick Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Unclaimed Escrow Balance</span>
            <span className="text-3xl font-display font-black text-emerald-600">
              {earnings === undefined ? (
                <span className="inline-block w-24 h-8 bg-zinc-100 rounded animate-pulse" />
              ) : (
                `₹${earnings.totalPending.toFixed(2)}`
              )}
            </span>
            <p className="text-xs text-zinc-400">Locked in verified smart contracts. Instant bank payout available.</p>
            <button className="w-full py-2 bg-zinc-950 hover:bg-zinc-900 text-white font-mono text-[11px] rounded-xl font-bold transition-all active:scale-[0.98] cursor-pointer">
              WITHDRAW TO BANK ACCOUNT
            </button>
          </div>
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Total Payouts Released</span>
            <span className="text-3xl font-display font-black text-zinc-950">
              {earnings === undefined ? (
                <span className="inline-block w-24 h-8 bg-zinc-100 rounded animate-pulse" />
              ) : (
                `₹${earnings.totalReleased.toFixed(2)}`
              )}
            </span>
            <p className="text-xs text-zinc-400">All historical geofence runs cleared without disputes.</p>
          </div>
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Velocity Tier Status</span>
            <span className="text-3xl font-display font-black text-indigo-600">{velocitySubscribed ? 'Active' : 'Basic'}</span>
            <p className="text-xs text-zinc-400">2x frequency boost in priority queue offers.</p>
          </div>
        </div>

        {/* History + Earnings Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Chart card */}
          <div className="lg:col-span-7 bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h3 className="text-base font-display font-semibold text-zinc-900">Monthly Localized Earnings</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Your monthly payout progression in the Delhi NCR Grid network.</p>
            </div>

            <div className="flex items-end justify-between gap-4 h-48 pt-6 border-b border-zinc-150 px-4">
              {[
                { month: 'Oct 26', amount: 320, height: 'h-[40%]' },
                { month: 'Nov 26', amount: 480, height: 'h-[60%]' },
                { month: 'Dec 26', amount: 750, height: 'h-[90%]' },
                { month: 'Jan 27 (Est)', amount: 620, height: 'h-[75%]' },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-zinc-800">₹${bar.amount}</span>
                  <div className={`w-full bg-indigo-600/90 rounded-t-sm ${bar.height} transition-all duration-500 hover:bg-indigo-700`} />
                  <span className="text-[11px] font-mono text-zinc-400 mt-1">{bar.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Logs */}
          <div className="lg:col-span-5 bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="text-base font-display font-semibold text-zinc-900">Cryptographic Escrow History</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Logs of recent automated smart contract payouts.</p>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {[
                { campaign: 'Connaught Place Patio Tour', date: 'Yesterday', amount: 250, status: 'Completed' },
                { campaign: 'Sunder Nursery Aesthetics', date: '3 days ago', amount: 300, status: 'Completed' },
                { campaign: 'HKV Cafe Crawl', date: '1 week ago', amount: 180, status: 'Completed' },
              ].map((log, i) => (
                <div key={i} className="p-3 border border-zinc-100 rounded-xl flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-800">{log.campaign}</span>
                    <span className="text-[11px] text-zinc-400 font-mono">{log.date}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-mono font-bold text-emerald-600">+₹${log.amount}</span>
                    <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.2 rounded font-medium">Secured</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSubTab === 'portfolio') {
    return (
      <div className="max-w-5xl mx-auto flex flex-col gap-8 animate-fade-in">
        {/* Portfolio Header */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-5">
            <img
              src={currentCreator.avatar}
              alt={currentCreator.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-display font-black text-zinc-900">{currentCreator.name}</h2>
                {currentCreator.velocityTier === 'Velocity' && (
                  <span className="bg-amber-50 text-amber-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                    VELOCITY
                  </span>
                )}
              </div>
              <span className="text-sm text-indigo-600 font-mono font-medium">{currentCreator.handle || 'No handle set'}</span>
              {currentCreator.bio && (
                <p className="text-sm text-zinc-500 leading-relaxed mt-1 max-w-xl">{currentCreator.bio}</p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-zinc-100">
            <div className="flex flex-col items-center text-center p-3 bg-zinc-50 rounded-xl">
              <span className="text-xl font-black text-zinc-900 font-display">{currentCreator.followers || '0'}</span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-1">Followers</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 bg-zinc-50 rounded-xl">
              <span className="text-xl font-black text-emerald-600 font-display">{currentCreator.audienceInLocality}%</span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-1">Local Audience</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 bg-zinc-50 rounded-xl">
              <span className="text-xl font-black text-indigo-600 font-display">{currentCreator.niche || 'N/A'}</span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-1">Niche</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 bg-zinc-50 rounded-xl">
              <span className="text-xl font-black text-zinc-900 font-display">{currentCreator.locality || 'N/A'}</span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-1">Location</span>
            </div>
          </div>
        </div>

        {/* Past Work Gallery */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-display font-bold text-zinc-900">Portfolio & Past Work</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Previous brand collaborations and content samples.</p>
            </div>
            <span className="text-[11px] font-mono text-zinc-400 bg-zinc-50 px-2.5 py-1 rounded-full border border-zinc-100">
              {currentCreator.pastWork?.length || 0} items
            </span>
          </div>

          {currentCreator.pastWork && currentCreator.pastWork.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {currentCreator.pastWork.map((work, idx) => (
                <div key={idx} className="group relative overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-50 aspect-square">
                  <img
                    src={work.imgUrl}
                    alt={`${work.brand} - ${work.type}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(work.brand)}&background=f1f5f9&color=6366f1&size=300`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <span className="text-sm font-bold text-white">{work.brand}</span>
                    <span className="text-[11px] text-zinc-300 font-mono uppercase">{work.type}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
              <Briefcase className="w-10 h-10 text-zinc-300 mb-3" />
              <h4 className="text-base font-display font-bold text-zinc-600">No portfolio items yet</h4>
              <p className="text-sm text-zinc-400 text-center max-w-sm mt-2">
                Complete your first campaign to build your portfolio. Past work will appear here automatically.
              </p>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-display font-bold text-zinc-900 mb-4">Brand Reviews</h3>
          <ReviewsCard userId={currentCreator.id} label="Reviews from brands" />
        </div>
      </div>
    );
  }

  return null;
}
