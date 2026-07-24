import React, { useState, useEffect } from 'react';
import { Campaign, Creator } from '../types';
import { REGIONS, CREATORS } from '../data';
import { getDistanceKm } from './MinimalMap';
import {
  Sparkles,
  DollarSign,
  Users,
  Clock,
  Radio,
  Play,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  RotateCcw,
  Navigation,
  Activity,
  Trash2,
  ImageIcon,
  ExternalLink,
  Check,
  X,
  UserPlus,
  Briefcase,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Eye,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import RatingWidget, { ReviewsCard } from './RatingWidget';
import DispatchFeed from './DispatchFeed';
import { Id } from '../../convex/_generated/dataModel';

interface BrandWorkspaceProps {
  centerLat: number;
  centerLng: number;
  centerAddress?: string | null;
  setCenterLat: (lat: number) => void;
  setCenterLng: (lng: number) => void;
  onCampaignCreated: (campaign: Campaign) => void;
  activeCampaigns: Campaign[];

  setSelectedCreator: (creator: Creator) => void;
  setView: (view: 'brand' | 'creator') => void;
  setSelectedCampaignId: (id: string | null) => void;
  activeSubTab?: 'setup' | 'dispatch' | 'analytics' | 'profile';
  customBrandName: string;
  setCustomBrandName: (name: string) => void;
  creators?: Creator[];
}

function SubmissionsReviewPanel({ campaignId }: { campaignId: string }) {
  const submissions = useQuery(api.submissions.getByCampaign, { campaignId: campaignId as any });
  const startDraftReview = useMutation(api.submissions.startDraftReview);
  const approveDraft = useMutation(api.submissions.approveDraft);
  const rejectDraft = useMutation(api.submissions.rejectDraft);
  const startFinalReview = useMutation(api.submissions.startFinalReview);
  const approveFinal = useMutation(api.submissions.approveFinal);
  const rejectFinal = useMutation(api.submissions.rejectFinal);
  const [busyId, setBusyId] = useState<string | null>(null);

  if (!submissions || submissions.length === 0) return null;

  const isVideo = (url?: string | null) => !!url && /\.(mp4|mov|webm)(\?|$)/i.test(url);

  return (
    <div className="mt-2 pt-5 border-t border-zinc-100 flex flex-col gap-3">
      <span className="text-[11px] font-mono uppercase tracking-wide text-zinc-400 font-bold">
        Deliverables To Review ({submissions.length})
      </span>

      <div className="flex flex-col gap-3">
        {submissions.map((sub: any) => (
          <div
            key={sub._id}
            className="border border-zinc-150 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start bg-zinc-50/40"
          >
            <div className="w-20 h-20 rounded-lg overflow-hidden border border-zinc-200/70 shrink-0 bg-zinc-100 flex items-center justify-center">
              {sub.fileUrl ? (
                isVideo(sub.fileUrl) ? (
                  <video src={sub.fileUrl} className="w-full h-full object-cover" muted />
                ) : (
                  <img src={sub.fileUrl} alt="Deliverable" className="w-full h-full object-cover" />
                )
              ) : (
                <ImageIcon className="w-6 h-6 text-zinc-300" />
              )}
            </div>

            <div className="flex-1 flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-zinc-800">{sub.creator?.name || 'Creator'}</span>
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                    sub.status === 'approved' || sub.status === 'draft_approved'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : sub.status === 'rejected' || sub.status === 'draft_rejected'
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-indigo-50 border-indigo-150 text-indigo-700'
                  }`}
                >
                  {sub.status === 'draft_uploaded' ? 'Draft Awaiting Review' : 
                   sub.status === 'draft_verifying' ? 'Draft In Review' : 
                   sub.status === 'draft_approved' ? 'Draft Approved (Pending Publish)' : 
                   sub.status === 'draft_rejected' ? 'Draft Rejected' : 
                   sub.status === 'published_uploaded' ? 'Published Awaiting Review' : 
                   sub.status === 'final_verifying' ? 'Final In Review' : 
                   sub.status === 'approved' ? 'Final Approved' : 'Rejected'}
                </span>
              </div>

              {sub.contentUrl && (
                <a
                  href={sub.contentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-600 hover:underline flex items-center gap-1 w-max"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open live post
                </a>
              )}

              {sub.fileUrl && !sub.contentUrl && (
                <a
                  href={sub.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-600 hover:underline flex items-center gap-1 w-max"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open full-size upload
                </a>
              )}

              {sub.rejectionReason && (
                <span className="text-[11px] text-rose-500">Reason: {sub.rejectionReason}</span>
              )}

              {sub.status === 'approved' && (
                <div className="pt-2">
                  <RatingWidget
                    submissionId={sub._id}
                    subjectLabel={sub.creator?.name || 'this creator'}
                  />
                </div>
              )}
            </div>

            {/* DRAFT REVIEW BUTTONS */}
            {(sub.status === 'draft_uploaded' || sub.status === 'draft_verifying') && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={async () => {
                    setBusyId(sub._id);
                    try {
                      if (sub.status === 'draft_uploaded') await startDraftReview({ submissionId: sub._id });
                      await approveDraft({ submissionId: sub._id });
                    } catch (err) {
                      console.error('Approve failed:', err);
                    } finally {
                      setBusyId(null);
                    }
                  }}
                  disabled={busyId === sub._id}
                  className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve Draft
                </button>
                <button
                  onClick={async () => {
                    const reason = window.prompt('Reason for rejecting this draft (optional):') || undefined;
                    setBusyId(sub._id);
                    try {
                      if (sub.status === 'draft_uploaded') await startDraftReview({ submissionId: sub._id });
                      await rejectDraft({ submissionId: sub._id, reason });
                    } catch (err) {
                      console.error('Reject failed:', err);
                    } finally {
                      setBusyId(null);
                    }
                  }}
                  disabled={busyId === sub._id}
                  className="py-1.5 px-3 bg-white hover:bg-zinc-50 disabled:opacity-50 border border-zinc-200 text-zinc-600 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Reject Draft
                </button>
              </div>
            )}

            {/* FINAL REVIEW BUTTONS */}
            {(sub.status === 'published_uploaded' || sub.status === 'final_verifying') && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={async () => {
                    setBusyId(sub._id);
                    try {
                      if (sub.status === 'published_uploaded') await startFinalReview({ submissionId: sub._id });
                      await approveFinal({ submissionId: sub._id });
                    } catch (err) {
                      console.error('Approve failed:', err);
                    } finally {
                      setBusyId(null);
                    }
                  }}
                  disabled={busyId === sub._id}
                  className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve Final & Release
                </button>
                <button
                  onClick={async () => {
                    const reason = window.prompt('Reason for rejecting this final post (optional):') || undefined;
                    setBusyId(sub._id);
                    try {
                      if (sub.status === 'published_uploaded') await startFinalReview({ submissionId: sub._id });
                      await rejectFinal({ submissionId: sub._id, reason });
                    } catch (err) {
                      console.error('Reject failed:', err);
                    } finally {
                      setBusyId(null);
                    }
                  }}
                  disabled={busyId === sub._id}
                  className="py-1.5 px-3 bg-white hover:bg-zinc-50 disabled:opacity-50 border border-zinc-200 text-zinc-600 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Reject Final
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Shows creators who have expressed interest (brand_review) and lets the brand
 * approve or reject them. Also shows already accepted creators.
 */
function CreatorApprovalPanel({ campaignId, creators }: { campaignId: string; creators?: Creator[] }) {
  const campaignOffers = useQuery(api.offers.getByCampaign, { campaignId: campaignId as any });
  const brandApprove = useMutation(api.offers.brandApprove);
  const brandReject = useMutation(api.offers.brandReject);
  const [busyId, setBusyId] = useState<string | null>(null);

  if (!campaignOffers || campaignOffers.length === 0) return null;

  const pendingReview = campaignOffers.filter((o: any) => o.status === 'brand_review');
  const accepted = campaignOffers.filter((o: any) => o.status === 'accepted');

  if (pendingReview.length === 0 && accepted.length === 0) return null;

  return (
    <div className="mt-2 pt-5 border-t border-zinc-100 flex flex-col gap-4">
      {/* Pending Creator Applications */}
      {pendingReview.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-mono uppercase tracking-wide text-amber-600 font-bold flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5" />
            Creator Applications ({pendingReview.length})
          </span>
          {pendingReview.map((offer: any) => {
            const creator = offer.creator;
            if (!creator) return null;
            return (
              <div key={offer._id} className="border border-amber-100 bg-amber-50/30 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img
                    src={creator.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.name)}&background=random`}
                    alt={creator.name}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-800">{creator.name}</span>
                      {creator.velocityTier === 'Velocity' && (
                        <span className="text-[9px] font-mono bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200 font-bold">VELOCITY</span>
                      )}
                    </div>
                    <span className="text-[11px] text-indigo-600 font-mono">{creator.handle || 'No handle'}</span>
                    <div className="flex items-center gap-3 text-[11px] text-zinc-500 mt-0.5">
                      <span>{creator.followers || '0'} followers</span>
                      <span>•</span>
                      <span>{creator.niche || 'No niche'}</span>
                      <span>•</span>
                      <span>{creator.locality || 'Unknown location'}</span>
                    </div>
                    {creator.bio && (
                      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{creator.bio}</p>
                    )}
                    {/* Past work preview */}
                    {creator.pastWork && creator.pastWork.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2">
                        {creator.pastWork.slice(0, 3).map((work: any, idx: number) => (
                          <img
                            key={idx}
                            src={work.imgUrl}
                            alt={work.brand}
                            className="w-8 h-8 rounded object-cover border border-zinc-200/80"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(work.brand)}&background=f1f5f9&color=6366f1&size=32`;
                            }}
                          />
                        ))}
                        {creator.pastWork.length > 3 && (
                          <span className="text-[9px] font-mono text-zinc-400">+{creator.pastWork.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={async () => {
                      setBusyId(offer._id);
                      try { await brandApprove({ offerId: offer._id }); } catch (err) { console.error('Approve failed:', err); }
                      finally { setBusyId(null); }
                    }}
                    disabled={busyId === offer._id}
                    className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={async () => {
                      setBusyId(offer._id);
                      try { await brandReject({ offerId: offer._id }); } catch (err) { console.error('Reject failed:', err); }
                      finally { setBusyId(null); }
                    }}
                    disabled={busyId === offer._id}
                    className="py-1.5 px-3 bg-white hover:bg-zinc-50 disabled:opacity-50 border border-zinc-200 text-zinc-600 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Accepted Creators */}
      {accepted.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wide text-emerald-600 font-bold flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            Approved Creators ({accepted.length})
          </span>
          <div className="flex flex-wrap gap-2">
            {accepted.map((offer: any) => {
              const creator = offer.creator;
              if (!creator) return null;
              return (
                <div key={offer._id} className="flex items-center gap-2 bg-emerald-50/50 border border-emerald-100 rounded-lg px-3 py-1.5">
                  <img
                    src={creator.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.name)}&background=random`}
                    alt={creator.name}
                    className="w-6 h-6 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-xs font-bold text-emerald-800">{creator.name}</span>
                  <span className="text-[9px] font-mono text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">WORKING</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Shows full campaign details (brief, guidelines, format etc.) in a clean expandable section.
 */
function CampaignDetailPanel({ camp }: { camp: Campaign }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wide text-indigo-600 font-bold hover:text-indigo-700 transition-colors cursor-pointer w-max"
      >
        <Eye className="w-3.5 h-3.5" />
        {showDetails ? 'Hide Campaign Details' : 'View Campaign Details'}
      </button>

      {showDetails && (
        <div className="border border-zinc-100 bg-zinc-50/50 rounded-xl p-4 flex flex-col gap-4 animate-fade-in">
          {/* Deliverable / Description */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Deliverable</span>
            <p className="text-sm text-zinc-700">{camp.deliverable}</p>
          </div>

          {/* Grid of details */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {camp.contentFormat && (
              <div className="flex flex-col gap-0.5 p-3 bg-white rounded-lg border border-zinc-100">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Format</span>
                <span className="text-sm font-medium text-zinc-800">{camp.contentFormat}</span>
              </div>
            )}
            {camp.targetAudience && (
              <div className="flex flex-col gap-0.5 p-3 bg-white rounded-lg border border-zinc-100">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Target Audience</span>
                <span className="text-sm font-medium text-zinc-800">{camp.targetAudience}</span>
              </div>
            )}
            {camp.submissionDeadlineDays && (
              <div className="flex flex-col gap-0.5 p-3 bg-white rounded-lg border border-zinc-100">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Submission Deadline</span>
                <span className="text-sm font-medium text-zinc-800">{camp.submissionDeadlineDays} days</span>
              </div>
            )}
            <div className="flex flex-col gap-0.5 p-3 bg-white rounded-lg border border-zinc-100">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Niche</span>
              <span className="text-sm font-medium text-zinc-800">{camp.niche}</span>
            </div>
            <div className="flex flex-col gap-0.5 p-3 bg-white rounded-lg border border-zinc-100">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Budget</span>
              <span className="text-sm font-medium text-emerald-700">₹{camp.budget}</span>
            </div>
            <div className="flex flex-col gap-0.5 p-3 bg-white rounded-lg border border-zinc-100">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Spots</span>
              <span className="text-sm font-medium text-zinc-800">{camp.spotsFilled}/{camp.spotsTotal} filled</span>
            </div>
          </div>

          {/* Creative Guidelines */}
          {camp.creativeGuidelines && (
            <div className="flex flex-col gap-1 pt-2 border-t border-zinc-100">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Creative Guidelines</span>
              <p className="text-sm text-zinc-600 italic">"{camp.creativeGuidelines}"</p>
            </div>
          )}

          {/* Location */}
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[11px] text-zinc-500 font-mono">
              {camp.centerLocality} ({camp.centerLat.toFixed(4)}N, {camp.centerLng.toFixed(4)}E)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BrandWorkspace({
  centerLat,
  centerLng,
  centerAddress,
  setCenterLat,
  setCenterLng,
  onCampaignCreated,
  activeCampaigns,

  setSelectedCreator,
  setView,
  setSelectedCampaignId,
  activeSubTab = 'setup',
  customBrandName,
  setCustomBrandName,
  creators,
}: BrandWorkspaceProps) {
  const createCampaign = useMutation(api.campaigns.create);
const rerunMatching = useMutation(api.campaigns.rerunMatching);
  const { signOut } = useClerk();
  const updateProfile = useMutation(api.users.updateProfile);
  const deleteCurrentUser = useMutation(api.users.deleteCurrentUser);
  const currentUser = useQuery(api.users.getCurrentUser);
  const brandAnalytics = useQuery(api.campaigns.getBrandAnalytics);
  const creditEscrow = useMutation(api.users.creditEscrow);

  // Campaign Creator State
  const [title, setTitle] = useState('');
  const [brandName, setBrandName] = useState(customBrandName || '');
  const [niche, setNiche] = useState('');
  const [deliverable, setDeliverable] = useState('');
  const [budget, setBudget] = useState(450);
  const [spotsTotal, setSpotsTotal] = useState(3);
  const [durationHours, setDurationHours] = useState(24);
  const [contentFormat, setContentFormat] = useState('');
  const [creativeGuidelines, setCreativeGuidelines] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [submissionDeadlineDays, setSubmissionDeadlineDays] = useState(3);
  const [isActivating, setIsActivating] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [profileSaveStatus, setProfileSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [collapsedCampaigns, setCollapsedCampaigns] = useState<Record<string, boolean>>({});
  
  // Real-time tick for countdowns
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (activeSubTab === 'dispatch') {
      const interval = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(interval);
    }
  }, [activeSubTab]);

  // Sync brandName when customBrandName changes
  useEffect(() => {
    if (customBrandName) {
      setBrandName(customBrandName);
    }
  }, [customBrandName]);

  // Auto-locality match based on coordinates
  const currentLocality = useEffect(() => {
    let closestRegion = REGIONS[0];
    let minDistance = getDistanceKm(centerLat, centerLng, REGIONS[0].lat, REGIONS[0].lng);

    for (let i = 1; i < REGIONS.length; i++) {
      const dist = getDistanceKm(centerLat, centerLng, REGIONS[i].lat, REGIONS[i].lng);
      if (dist < minDistance) {
        minDistance = dist;
        closestRegion = REGIONS[i];
      }
    }
    // Update label to reflect coords
    return;
  }, [centerLat, centerLng]);

  const resolvedLocalityLabel = () => {
    if (centerAddress) return centerAddress;

    let closestRegion = REGIONS[0];
    let minDistance = getDistanceKm(centerLat, centerLng, REGIONS[0].lat, REGIONS[0].lng);

    for (let i = 1; i < REGIONS.length; i++) {
      const dist = getDistanceKm(centerLat, centerLng, REGIONS[i].lat, REGIONS[i].lng);
      if (dist < minDistance) {
        minDistance = dist;
        closestRegion = REGIONS[i];
      }
    }
    return closestRegion.name;
  };

  // Smart Budget Estimator
  const estimatedBudgetRange = () => {
    // Basic heuristics
    let baseRate = 120; // base price per creator
    if (niche.includes('Tech')) baseRate = 180;
    if (niche.includes('Fashion')) baseRate = 150;
    if (deliverable.toLowerCase().includes('reel')) baseRate *= 1.8;

    const min = Math.round(baseRate * spotsTotal);
    const max = Math.round(baseRate * spotsTotal * 1.4);
    return { min, max };
  };

  const { min: estMin, max: estMax } = estimatedBudgetRange();

  // Handle slider auto-recommender
  useEffect(() => {
    setBudget(Math.round((estMin + estMax) / 2));
  }, [spotsTotal, niche, deliverable, estMin, estMax]);

  // Find creators
  const matchingCreators = () => {
    return (creators || CREATORS).map((creator) => {
      const dist = getDistanceKm(centerLat, centerLng, creator.lat, creator.lng);
      return { ...creator, dist, isInside: true };
    });
  };

  // Deposit handled automatically by backend now

  const currentMatches = matchingCreators();

  // Create Campaign via Convex mutation
  const handleLaunchCampaign = async () => {
    setIsActivating(true);
    try {
      const campaignId = await createCampaign({
        title,
        brandName,
        niche,
        deliverable,
        centerLocality: resolvedLocalityLabel(),
        centerLat,
        centerLng,

        budget,
        spotsTotal: Number(spotsTotal),
        durationHours,
        
        contentFormat,
        creativeGuidelines,
        targetAudience,
        submissionDeadlineDays,
      });

      // Small delay for visual activation feedback
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Notify parent with a minimal Campaign object so it can navigate
      onCampaignCreated({
        id: campaignId,
        title,
        brandName,
        niche,
        deliverable,
        centerLocality: resolvedLocalityLabel(),
        centerLat,
        centerLng,

        budget,
        spotsTotal,
        spotsFilled: 0,
        
        contentFormat,
        creativeGuidelines,
        targetAudience,
        submissionDeadlineDays,
        
        durationHours,
        createdAt: Date.now(),
        status: 'active',
        escrowStatus: 'locked',
        activeBatchIndex: 0,
        batches: [],
      });
    } catch (err) {
      console.error('Failed to create campaign:', err);
    } finally {
      setIsActivating(false);
    }
  };

  if (activeSubTab === 'profile') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
        {/* Brand Profile Editor Card */}
        <div className="lg:col-span-7 bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div>
              <h2 className="text-xl font-display font-semibold text-zinc-900">Brand Identity & Node Settings</h2>
              <p className="text-sm text-zinc-500 mt-0.5">
                Manage your public brand workspace details, authorized contacts, and cryptographically linked release settings.
              </p>
            </div>
            <span className="bg-emerald-50 text-emerald-700 text-sm px-2.5 py-1 rounded-full font-semibold border border-emerald-100 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Node
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Brand Corporate Name</label>
              <input
                id="brand-profile-name-input"
                type="text"
                value={customBrandName || ''}
                onChange={(e) => {
                  setCustomBrandName(e.target.value);
                  setBrandName(e.target.value);
                }}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-base text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors font-medium"
                placeholder="e.g. Blue Tokai Coffee"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Corporate Domain</label>
              <input
                id="brand-profile-domain-input"
                type="text"
                defaultValue={currentUser?.domain || ''}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-base text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                placeholder="e.g. brand.com"
              />
            </div>
            
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Brand Instagram Handle</label>
              <input
                id="brand-profile-handle-input"
                type="text"
                defaultValue={currentUser?.handle || ''}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-base text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                placeholder="e.g. @bluetokaicoffee"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Authorized Administrator Email</label>
              <input
                id="brand-profile-email-input"
                type="email"
                defaultValue={currentUser?.email || ''}
                readOnly
                className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-base text-zinc-500 focus:outline-none cursor-not-allowed"
                placeholder="e.g. admin@brand.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Primary Market Sector</label>
              <select
                id="brand-profile-sector-select"
                defaultValue={currentUser?.sector || "Food & Lifestyle"}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-base text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              >
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
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Brand Bio / Mission Statement</label>
            <textarea
              id="brand-profile-bio-textarea"
              rows={3}
              defaultValue={currentUser?.bio || ''}
              className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-base text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors resize-none leading-relaxed"
              placeholder="Tell creators who you are..."
            />
          </div>

          <div className="border-t border-zinc-100 pt-5 flex flex-col gap-4">
            <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-400 font-bold">Secure Escrow Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium flex items-center gap-1">
                  <span className="text-zinc-400">₹</span> Funding Escrow Wallet
                </label>
                <input
                  id="brand-profile-wallet-input"
                  type="text"
                  defaultValue=""
                  className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 font-mono focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  placeholder="0x..."
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Escrow Release Mechanism</label>
                <div className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-xl border border-zinc-200">
                  <span className="text-sm text-zinc-600 font-medium">Manual Brand Verification</span>
                  <span className="bg-amber-100 text-amber-800 border border-amber-200 font-mono text-[11px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    MANUAL
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-100 pt-4 flex justify-end items-center gap-3">
            {profileSaveStatus === 'saved' && (
              <span className="text-sm text-emerald-600 font-medium animate-fade-in">Settings saved successfully!</span>
            )}
            {profileSaveStatus === 'error' && (
              <span className="text-sm text-red-600 font-medium animate-fade-in">Failed to save. Try again.</span>
            )}
            <button
              id="brand-profile-save-btn"
              disabled={profileSaveStatus === 'saving'}
              onClick={async () => {
                setProfileSaveStatus('saving');
                try {
                  const nameInput = document.getElementById('brand-profile-name-input') as HTMLInputElement;
                  const domainInput = document.getElementById('brand-profile-domain-input') as HTMLInputElement;
                  const sectorSelect = document.getElementById('brand-profile-sector-select') as HTMLSelectElement;
                  const bioTextarea = document.getElementById('brand-profile-bio-textarea') as HTMLTextAreaElement;
                  const handleInput = document.getElementById('brand-profile-handle-input') as HTMLInputElement;

                  await updateProfile({
                    brandName: nameInput?.value,
                    domain: domainInput?.value,
                    sector: sectorSelect?.value,
                    bio: bioTextarea?.value,
                    handle: handleInput?.value,
                  });
                  setProfileSaveStatus('saved');
                  setTimeout(() => setProfileSaveStatus('idle'), 3000);
                } catch (err) {
                  console.error('Failed to save profile:', err);
                  setProfileSaveStatus('error');
                  setTimeout(() => setProfileSaveStatus('idle'), 3000);
                }
              }}
              className="py-2.5 px-5 bg-zinc-950 hover:bg-zinc-900 text-white font-mono text-sm rounded-xl font-bold tracking-wider uppercase transition-all cursor-pointer"
            >
              {profileSaveStatus === 'saving' ? 'SAVING...' : 'SAVE SETTINGS & DEPLOY'}
            </button>
          </div>
          
          <div className="border-t border-rose-100/50 pt-6 mt-4 flex flex-col gap-3">
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
                    signOut(); // Sign out to clear the session so they can restart fresh
                  }
                }}
                className="py-2 px-4 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-mono text-xs rounded-lg font-bold transition-all"
              >
                DELETE PROFILE
              </button>
            </div>
          </div>

        </div>

        {/* Brand Stats Sidebar Card */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-zinc-950 text-zinc-300 rounded-2xl p-6 shadow-xl flex flex-col gap-5 border border-zinc-800">
            <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-display font-black text-xl">
                {customBrandName.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-white tracking-tight leading-none">{customBrandName}</span>
                <span className="text-[11px] font-mono text-zinc-500 mt-1 uppercase">Brand Node Operator</span>
              </div>
            </div>

            <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex flex-col gap-2">
              <span className="text-[11px] font-mono text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                Audit Trail Credentials
              </span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Your corporate node is currently integrated into the Delhi NCR cryptographic router. All campaigns automatically deploy automated multi-modal smart escrows.
              </p>
            </div>

            {currentUser?._id && (
              <ReviewsCard userId={currentUser._id} label="Creator Reviews" />
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeSubTab === 'setup') {
    return (
      <div className="flex flex-col gap-8 items-start">
        {/* Campaign Builder Form */}
        <div className="w-full bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div>
              <h2 className="text-xl font-display font-semibold text-zinc-900">1. Define Campaign Radius</h2>
              <p className="text-sm text-zinc-500 mt-0.5">
                Set localized radius. Creators in this geofence will be programmatically dispatched.
              </p>
            </div>
            <span className="bg-indigo-50 text-indigo-700 text-sm px-2.5 py-1 rounded-full font-semibold border border-indigo-100 flex items-center gap-1.5 animate-pulse">
              <Radio className="w-3.5 h-3.5" />
              Geo-targeted
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Brand Name</label>
              <input
                type="text"
                value={brandName || ''}
                readOnly
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2 text-base text-zinc-500 cursor-not-allowed focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="e.g. Blue Tokai"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Campaign Title</label>
              <input
                type="text"
                value={title || ''}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2 text-base text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                placeholder="e.g. South Delhi Buzz"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Target Niche</label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2 text-base text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              >
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
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Deliverable</label>
              <input
                type="text"
                value={deliverable || ''}
                onChange={(e) => setDeliverable(e.target.value)}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2 text-base text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                placeholder="e.g. 1 Instagram Story highlighting local patio dining"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Content Format</label>
              <select
                value={contentFormat}
                onChange={(e) => setContentFormat(e.target.value)}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2 text-base text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              >
                <option value="Instagram Story">Instagram Story</option>
                <option value="Instagram Reel">Instagram Reel</option>
                <option value="TikTok Video">TikTok Video</option>
                <option value="YouTube Shorts">YouTube Shorts</option>
                <option value="Carousel Post">Carousel Post</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Target Audience</label>
              <input
                type="text"
                value={targetAudience || ''}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Gen Z / Millennials"
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2 text-base text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Creative Guidelines</label>
            <textarea
              value={creativeGuidelines || ''}
              onChange={(e) => {
                setCreativeGuidelines(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              placeholder="e.g. Must show product clearly in first 3 seconds. No competitor logos."
              rows={4}
              className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2 text-base text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors resize-none overflow-hidden"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Submission Deadline (Days)</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="14"
                value={submissionDeadlineDays}
                onChange={(e) => setSubmissionDeadlineDays(Number(e.target.value))}
                className="w-full accent-zinc-800 cursor-pointer flex-1"
              />
              <div className="bg-white border border-zinc-200 rounded-lg px-2 py-1 font-mono text-sm font-bold text-zinc-800 flex items-center shrink-0">
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={isNaN(submissionDeadlineDays) || submissionDeadlineDays === 0 ? '' : submissionDeadlineDays}
                  onChange={(e) => setSubmissionDeadlineDays(Number(e.target.value))}
                  className="w-10 focus:outline-none text-right font-mono"
                />
                <span className="ml-1 text-zinc-500 font-normal">days</span>
              </div>
            </div>
          </div>

          {/* Map Location Coordinates indicator */}
          <div className="bg-zinc-50/60 border border-zinc-100 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Navigation className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-mono font-bold text-zinc-700">{resolvedLocalityLabel()}</span>
                <span className="text-[11px] text-zinc-400">Centered at: {centerLat.toFixed(4)}N, {centerLng.toFixed(4)}E</span>
              </div>
            </div>

          </div>

          {/* Quota Setup slider */}
          <div className="grid grid-cols-1 gap-6 pt-2">

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-zinc-700">Target Quota (Spots)</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={spotsTotal}
                  onChange={(e) => setSpotsTotal(Number(e.target.value))}
                  className="w-full accent-zinc-800 cursor-pointer flex-1"
                />
                <div className="bg-white border border-zinc-200 rounded-lg px-2 py-1 font-mono text-sm font-bold text-zinc-800 flex items-center shrink-0">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={isNaN(spotsTotal) || spotsTotal === 0 ? '' : spotsTotal}
                    onChange={(e) => setSpotsTotal(Number(e.target.value))}
                    className="w-12 focus:outline-none text-right font-mono"
                  />
                  <span className="ml-1 text-zinc-500 font-normal">creators</span>
                </div>
              </div>
              <span className="text-[11px] text-zinc-400">Platform automatically sends offers to next batch until filled</span>
            </div>
          </div>

          {/* Smart Budget Estimator Widget */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold text-zinc-700">Smart Budget Recommender</span>
              </div>
              <span className="text-xs font-mono text-zinc-500">
                Estimated range: <span className="text-zinc-800 font-bold">₹{estMin} - ₹{estMax}</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="range"
                  min={estMin - 100 > 50 ? estMin - 100 : 50}
                  max={estMax + 200}
                  step="10"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
              <div className="bg-white border border-zinc-200 rounded-lg px-3 py-1.5 font-mono text-base font-bold text-zinc-800 flex items-center">
                ₹<input
                  type="number"
                  value={isNaN(budget) || budget === 0 ? '' : budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-14 focus:outline-none text-right font-mono"
                />
              </div>
            </div>
          </div>

          {/* Cost Summary Widget */}
          <div className="bg-white border border-zinc-200/80 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-zinc-700">Cost Summary</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Total Campaign Budget</span>
                <span className="text-lg font-black text-zinc-800">₹{budget}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100/50">
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">Final Cost Per Creator</span>
                <span className="text-lg font-black text-indigo-700">₹{spotsTotal > 0 ? Math.round(budget / spotsTotal) : 0}</span>
              </div>
            </div>
          </div>

          {/* Escrow Contract Terms Notice & Balance */}
          <div className="border border-zinc-150 rounded-xl p-4 bg-zinc-50/35 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5 flex-1">
                <div className="flex justify-between items-center w-full">
                  <span className="text-sm font-bold text-zinc-800">Automated Escrow Protocol</span>
                  <div className="bg-white border border-zinc-200 px-2 py-1 rounded-md flex items-center gap-1.5">
                    <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Wallet Balance:</span>
                    <span className="text-sm font-mono font-bold text-emerald-600">₹{currentUser?.escrowBalance || 0}</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 leading-normal mt-1">
                  Your budget of <span className="font-semibold text-zinc-800">₹{budget}</span> will be locked in smart escrow. A 5% platform fee is deducted — creators share <span className="font-semibold text-zinc-800">₹{Math.round(budget * 0.95)}</span> equally, so each creator receives <span className="font-semibold text-emerald-700">₹{spotsTotal > 0 ? Math.round((budget * 0.95) / spotsTotal) : '—'}</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleLaunchCampaign}
            disabled={isActivating}
            className={`w-full py-3 px-4 rounded-xl font-display font-medium text-base flex items-center justify-center gap-2 transition-all ${
              isActivating
                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200'
                : 'bg-zinc-950 text-white hover:bg-zinc-900 active:scale-[0.98] cursor-pointer shadow-md shadow-zinc-200'
            }`}
          >
            {isActivating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />
                <span>Locking Budget & Dispersing Batches...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Lock ₹{budget} in Escrow & Launch Campaign</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (activeSubTab === 'dispatch') {
    return (
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-100 pb-4 mb-6">
          <div>
            <h3 className="text-lg font-display font-semibold text-zinc-900">Campaign Dispatch Tracking Room</h3>
            <p className="text-sm text-zinc-500 mt-0.5">
              Watch programmatic queues send offers to Batch A (Priority), then Batch B, then Batch C.
            </p>
          </div>
        </div>

        {activeCampaigns.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center justify-center border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
            <Radio className="w-8 h-8 text-zinc-300 animate-pulse mb-3" />
            <span className="text-sm font-medium text-zinc-500">No active localized flash activations running.</span>
            <p className="text-xs text-zinc-400 mt-1 max-w-[280px]">
              Use the campaign setup card above to lock budget and launch one.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {activeCampaigns.map((camp) => {
              const isCollapsed = collapsedCampaigns[camp.id] ?? true;
              return (
              <div key={camp.id} className="border border-zinc-150 rounded-xl flex flex-col transition-all bg-white overflow-hidden">
                {/* Header info */}
                <div 
                  className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50/50 transition-colors ${!isCollapsed ? 'border-b border-zinc-100' : ''}`}
                  onClick={() => setCollapsedCampaigns(prev => ({ ...prev, [camp.id]: !(prev[camp.id] ?? true) }))}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-zinc-800">{camp.title}</h4>
                      <span className="bg-zinc-100 text-zinc-600 font-mono text-[11px] px-2 py-0.5 rounded border border-zinc-200">
                        {camp.brandName}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-400 font-mono mt-0.5">
                      LOC: {camp.centerLocality} • deliverable: {camp.deliverable}
                      {isCollapsed && ` • Spots: ${camp.spotsFilled}/${camp.spotsTotal}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-[11px] uppercase font-mono tracking-wider text-zinc-400">Escrow Locked</span>
                      <span className="text-sm font-bold text-emerald-600 font-mono flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        ₹{camp.budget}
                      </span>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-[11px] uppercase font-mono tracking-wider text-zinc-400">Campaign Status</span>
                      <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {camp.batches.length > 0 
                          ? `Batch ${String.fromCharCode(65 + camp.activeBatchIndex)} Active` 
                          : (now - camp.createdAt > 3000 ? 'No Matches' : 'Initializing')}
                      </span>
                    </div>
                    
                    <div className="ml-2 text-zinc-400 flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-100 transition-colors">
                      {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="p-5 flex flex-col gap-6 bg-white">
                    {/* Programmatic Batch Timeline Track */}
                {camp.batches.length === 0 ? (
                  (now - camp.createdAt > 3000) ? (
                    <div className="border border-rose-100 bg-rose-50/30 rounded-xl p-8 flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-rose-100">
                        <AlertTriangle className="w-5 h-5 text-rose-500" />
                      </div>
                      <span className="text-sm font-bold text-rose-900">Zero Target Nodes Located</span>
                      <p className="text-xs text-rose-600/80 text-center max-w-sm">
                        Our matching engine scanned {camp.centerLocality} but found no creators that match your niche requirements and coordinates. Try expanding your parameters or re-deploying in another hub.
                      </p>
                      <button
                        onClick={async () => {
                          try {
                            await rerunMatching({ campaignId: camp.id as Id<'campaigns'> });
                          } catch (err) {
                            console.error('Failed to rerun matching:', err);
                          }
                        }}
                        className="mt-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-colors"
                      >
                        Rerun Engine
                      </button>
                    </div>
                  ) : (
                    <div className="border border-indigo-100 bg-indigo-50/30 rounded-xl p-8 flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                      <span className="text-sm font-bold text-indigo-900">Matching Engine Running...</span>
                      <p className="text-xs text-indigo-600/70 text-center max-w-sm">
                        Analyzing creator density and computing alignment scores for {camp.centerLocality}. Batches will populate shortly.
                      </p>
                    </div>
                  )
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {camp.batches.map((batch, idx) => {
                    const isCurrent = idx === camp.activeBatchIndex;
                    const isPassed = idx < camp.activeBatchIndex;

                    return (
                      <div
                        key={batch.id}
                        className={`border rounded-xl p-4 flex flex-col gap-3 transition-all ${
                          isCurrent
                            ? 'border-indigo-500 bg-indigo-50/20 shadow-sm ring-1 ring-indigo-500/10'
                            : isPassed
                            ? 'border-zinc-200 bg-zinc-50/50 opacity-60'
                            : 'border-zinc-100 bg-white opacity-40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-zinc-800 flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isCurrent
                                  ? 'bg-indigo-600 animate-pulse'
                                  : isPassed
                                  ? 'bg-zinc-400'
                                  : 'bg-zinc-300'
                              }`}
                            />
                            {batch.name}
                          </span>
                          {isCurrent ? (
                            <span className="bg-indigo-100 text-indigo-700 text-[11px] font-mono px-2 py-0.5 rounded font-bold animate-pulse">
                              DISPATCHED
                            </span>
                          ) : isPassed ? (
                            <span className="text-zinc-500 text-[11px] font-mono font-medium">
                              PASSED
                            </span>
                          ) : (
                            <span className="text-zinc-400 text-[11px] font-mono">
                              QUEUED
                            </span>
                          )}
                        </div>

                        {/* Profiles matched in this batch */}
                        <div className="flex flex-col gap-1.5 my-1">
                          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wide">Target Creators</span>
                          <div className="flex items-center gap-1.5">
                            {batch.creatorIds.map((cid) => {
                              const creator = (creators || CREATORS).find((c) => c.id === cid);
                              if (!creator) return null;
                              return (
                                <div
                                  key={cid}
                                  onClick={() => setSelectedCreator(creator)}
                                  className="flex items-center gap-1 bg-white border border-zinc-200/80 hover:border-zinc-300 px-1.5 py-0.5 rounded-lg text-[11px] cursor-pointer transition-all shrink-0"
                                  title={`Click to view ${creator.name}`}
                                >
                                  <img
                                    src={creator.avatar}
                                    alt={creator.name}
                                    className="w-4.5 h-4.5 rounded-full object-cover referrerPolicy='no-referrer'"
                                  />
                                  <span className="font-medium text-zinc-700">{creator.name.split(' ')[0]}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {isCurrent && (
                          <div className="mt-2 flex flex-col gap-2">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-zinc-500 font-medium">Remaining Priority Window:</span>
                              <span className="text-indigo-600 font-mono font-bold animate-pulse">
                                {batch.dispatchedAt && (batch.cascadeAfterMs - (now - batch.dispatchedAt)) > 0
                                  ? `Moves to next batch in ${Math.floor(Math.max(0, batch.cascadeAfterMs - (now - batch.dispatchedAt)) / 1000 / 3600)}h ${Math.floor((Math.max(0, batch.cascadeAfterMs - (now - batch.dispatchedAt)) / 1000 % 3600) / 60)}m ${Math.floor(Math.max(0, batch.cascadeAfterMs - (now - batch.dispatchedAt)) / 1000 % 60)}s`
                                  : 'Moving...'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                    })}
                  </div>
                )}

                <CampaignDetailPanel camp={camp as any} />

                <CreatorApprovalPanel campaignId={camp.id} creators={creators || CREATORS} />

                <SubmissionsReviewPanel campaignId={camp.id} />

                <DispatchFeed campaignId={camp.id} />

                  </div>
                )}
              </div>
            )})}
          </div>
        )}
      </div>
    );
  }

  if (activeSubTab === 'analytics') {
    const analytics = brandAnalytics || {
      averageDispatchLatencyHours: 1.2,
      totalEscrowSecured: activeCampaigns.reduce((sum, c) => sum + c.budget, 0),
      geotargetedDensity: (creators || CREATORS).length,
      matchAccuracyByGrid: [
        { grid: 'Connaught Place (Main Grid)', value: 0, percent: 'w-[0%]', color: 'bg-zinc-950' },
        { grid: 'Gurgaon DLF CyberHub Sector', value: 0, percent: 'w-[0%]', color: 'bg-zinc-800' },
        { grid: 'South Delhi Parks & Markets', value: 0, percent: 'w-[0%]', color: 'bg-indigo-600' },
        { grid: 'Noida Electronic City', value: 0, percent: 'w-[0%]', color: 'bg-zinc-500' },
      ],
    };

    // Give default colors to boosts
    const colors = ['bg-zinc-950', 'bg-zinc-800', 'bg-indigo-600', 'bg-zinc-500'];
    const accuracyStats = analytics.matchAccuracyByGrid && analytics.matchAccuracyByGrid.length > 0 
      ? analytics.matchAccuracyByGrid.map((b: any, i: number) => ({ ...b, color: colors[i % colors.length] }))
      : analytics.matchAccuracyByGrid || [];

    return (
      <div className="flex flex-col gap-6">
        {/* Quick Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Delhi-NCR Dispatch Latency</span>
            <span className="text-3xl font-display font-black text-zinc-950">{analytics.averageDispatchLatencyHours} Hours</span>
            <p className="text-xs text-zinc-400">Average time to unlock localized escrow release across all grids.</p>
          </div>
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Total Escrow Funds Secured</span>
            <span className="text-3xl font-display font-black text-emerald-600">₹{analytics.totalEscrowSecured}</span>
            <p className="text-xs text-zinc-400">100% cryptographic protection active for campaign matching.</p>
          </div>
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Geotargeted Density</span>
            <span className="text-3xl font-display font-black text-indigo-600">{analytics.geotargetedDensity} Active</span>
            <p className="text-xs text-zinc-400">Partners online with verified locations in matched regions.</p>
          </div>
        </div>

        {/* Chart + Roster Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Chart Card */}
          <div className="lg:col-span-7 bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h3 className="text-base font-display font-semibold text-zinc-900">Profile Geo-Match Accuracy</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Average proximity of creator profiles to campaign geofences by grid.</p>
            </div>

            <div className="flex flex-col gap-4">
              {accuracyStats.map((bar: any, i: number) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-zinc-700 font-mono text-xs">{bar.grid}</span>
                    <span className="text-zinc-900 font-bold">{bar.value}% accuracy</span>
                  </div>
                  <div className="w-full bg-zinc-100 rounded-md h-5 overflow-hidden border border-zinc-200/30">
                    <div className={`${bar.color} ${bar.percent} h-full rounded-r-sm transition-all duration-1000`} />
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[11px] font-mono text-zinc-400 leading-normal border-t border-zinc-100 pt-4">
              * Based on physical GPS check-ins matched within the geofence boundaries.
            </div>
          </div>

          {/* Matches Roster */}
          <div className="lg:col-span-5 bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="text-base font-display font-semibold text-zinc-900">Local Verified Roster</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Physical representatives available in current active radius.</p>
            </div>

            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1 font-sans">
              {(creators || CREATORS).map((creator) => (
                <div key={creator.id} className="p-3 border border-zinc-150 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={creator.avatar} alt={creator.name} className="w-8 h-8 rounded-full object-cover border border-zinc-100 referrerPolicy='no-referrer'" />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-zinc-800">{creator.name}</span>
                      <span className="text-[11px] text-zinc-400 font-mono">{creator.locality}</span>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{creator.followers}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
