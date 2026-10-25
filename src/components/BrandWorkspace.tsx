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
  Flame,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import RatingWidget, { ReviewsCard } from './RatingWidget';
import DispatchFeed from './DispatchFeed';
import DispatchQueue from './DispatchQueue';
import BrandProfileEditor from './BrandProfileEditor';
import ErrorBoundary from './ErrorBoundary';
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
  onRoastCreator?: (creator: Creator) => void;
  setView: (view: 'brand' | 'creator') => void;
  setSelectedCampaignId: (id: string | null) => void;
  activeSubTab?: 'setup' | 'dispatch' | 'analytics' | 'profile';
  customBrandName: string;
  setCustomBrandName: (name: string) => void;
  creators?: Creator[];
}

function SubmissionsReviewPanel({ 
  campaignId,
  campaignTitle,
  centerLocality,
}: { 
  campaignId: string;
  campaignTitle?: string;
  centerLocality?: string;
}) {
  const submissions = useQuery(api.submissions.getByCampaign, { campaignId: campaignId as any });
  const startDraftReview = useMutation(api.submissions.startDraftReview);
  const approveDraft = useMutation(api.submissions.approveDraft);
  const rejectDraft = useMutation(api.submissions.rejectDraft);
  const startFinalReview = useMutation(api.submissions.startFinalReview);
  const approveFinal = useMutation(api.submissions.approveFinal);
  const rejectFinal = useMutation(api.submissions.rejectFinal);
  const [busyId, setBusyId] = useState<string | null>(null);

  if (submissions === undefined) return null; // loading state

  const isVideo = (url?: string | null) => !!url && /\.(mp4|mov|webm)(\?|$)/i.test(url);

  const pendingReview = submissions.filter((sub: any) =>
    sub.status === 'draft_uploaded' ||
    sub.status === 'draft_verifying' ||
    sub.status === 'published_uploaded' ||
    sub.status === 'final_verifying'
  );

  return (
    <div className="mt-2 pt-5 border-t border-zinc-800 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-sans tracking-wide text-white font-bold uppercase">
            Campaign Deliverables ({submissions.length})
          </span>
          {pendingReview.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {pendingReview.length} Action Needed
            </span>
          )}
        </div>
      </div>

      {/* Deliverables List or Empty State */}
      {submissions.length === 0 ? (
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60 text-xs text-zinc-400 font-mono">
          No deliverables submitted yet. Submissions from accepted creators will appear here for your review and approval.
        </div>
      ) : (
        <div className="flex flex-col gap-3 animate-fade-in">
          {submissions.map((sub: any) => (
            <div
              key={sub._id}
              className="border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-start bg-zinc-900"
            >
              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-zinc-800 shrink-0 bg-zinc-900 flex items-center justify-center">
                {sub.fileUrl ? (
                  isVideo(sub.fileUrl) ? (
                    <video src={sub.fileUrl} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={sub.fileUrl} alt="Deliverable" className="w-full h-full object-cover" />
                  )
                ) : (
                  <ImageIcon className="w-6 h-6 text-white" />
                )}
              </div>

              <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white">{sub.creator?.name || 'Creator'}</span>
                  <span
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-2xl border ${
                      sub.status === 'approved' || sub.status === 'draft_approved'
                        ? 'bg-emerald-500 border-none text-white'
                        : sub.status === 'rejected' || sub.status === 'draft_rejected'
                        ? 'bg-rose-500 border-none text-white'
                        : 'bg-indigo-500 border-none text-white'
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
                    className="text-xs text-white hover:underline flex items-center gap-1 w-max"
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
                    className="text-xs text-white hover:underline flex items-center gap-1 w-max"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open full-size upload
                  </a>
                )}

                {sub.rejectionReason && (
                  <span className="text-[11px] text-white">Reason: {sub.rejectionReason}</span>
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
                    className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-2xl flex items-center gap-1 cursor-pointer transition-colors"
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
                    className="py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 border border-zinc-800 text-white text-xs font-bold rounded-2xl flex items-center gap-1 cursor-pointer transition-colors"
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
                    className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-2xl flex items-center gap-1 cursor-pointer transition-colors"
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
                    className="py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 border border-zinc-800 text-white text-xs font-bold rounded-2xl flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject Final
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Shows creators who have expressed interest (brand_review) and lets the brand
 * approve or reject them. Also shows already accepted creators.
 */
function CreatorApprovalPanel({ 
  campaignId, 
  creators,
  onRoastCreator,
}: { 
  campaignId: string; 
  creators?: Creator[];
  onRoastCreator?: (creator: Creator) => void;
}) {
  const campaignOffers = useQuery(api.offers.getByCampaign, { campaignId: campaignId as any });
  const brandApprove = useMutation(api.offers.brandApprove);
  const brandReject = useMutation(api.offers.brandReject);
  const [busyId, setBusyId] = useState<string | null>(null);

  if (!campaignOffers || campaignOffers.length === 0) return null;

  const pendingReview = campaignOffers.filter((o: any) => o.status === 'brand_review');
  const accepted = campaignOffers.filter((o: any) => o.status === 'accepted');

  if (pendingReview.length === 0 && accepted.length === 0) return null;

  return (
    <div className="mt-2 pt-5 border-t border-zinc-800 flex flex-col gap-4">
      {/* Pending Creator Applications */}
      {pendingReview.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-sans tracking-wide text-amber-600 font-bold flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5" />
            Creator Applications ({pendingReview.length})
          </span>
          {pendingReview.map((offer: any) => {
            const creator = offer.creator;
            if (!creator) return null;
            return (
              <div key={offer._id} className="border border-amber-100 bg-amber-50/30 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-start">
                <div 
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
                  onClick={() => onRoastCreator?.(creator)}
                  title={`Click to view ${creator.name}'s past work`}
                >
                  <img
                    src={creator.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.name)}&background=random`}
                    alt={creator.name}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-800 group-hover:border-[#C9B8E8] transition-colors"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white group-hover:text-[#C9B8E8] transition-colors flex items-center gap-1">
                        {creator.name}
                      </span>
                      {creator.velocityTier === 'Velocity' && (
                        <span className="text-[9px] font-mono bg-amber-400 text-black border border-amber-400 px-1.5 py-0.5 rounded-2xl border border-amber-200 font-bold">VELOCITY</span>
                      )}
                    </div>
                    <span className="text-[11px] text-white font-mono">{creator.handle || 'No handle'}</span>
                    <div className="flex items-center gap-3 text-[11px] text-white mt-0.5">
                      <span>{creator.followers || '0'} followers</span>
                      <span>•</span>
                      <span>{creator.niche || 'No niche'}</span>
                      <span>•</span>
                      <span>{creator.locality || 'Unknown location'}</span>
                    </div>
                    {creator.bio && (
                      <p className="text-[11px] text-white mt-1 line-clamp-2">{creator.bio}</p>
                    )}
                    {/* Past work preview */}
                    {creator.pastWork && creator.pastWork.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2">
                        {creator.pastWork.slice(0, 3).map((work: any, idx: number) => (
                          <img
                            key={idx}
                            src={work.imgUrl}
                            alt={work.brand}
                            className="w-8 h-8 rounded-full object-cover border border-zinc-800"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(work.brand)}&background=f1f5f9&color=6366f1&size=32`;
                            }}
                          />
                        ))}
                        {creator.pastWork.length > 3 && (
                          <span className="text-[9px] font-mono text-white">+{creator.pastWork.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onRoastCreator?.(creator)}
                    className="py-1.5 px-3 bg-[#C9B8E8]/15 hover:bg-[#C9B8E8]/25 border border-[#C9B8E8]/30 text-[#C9B8E8] text-xs font-bold font-mono rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                    title="View this applicant's past work"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-[#C9B8E8]" />
                    <span>Past Work</span>
                  </button>
                  <button
                    onClick={async () => {
                      setBusyId(offer._id);
                      try { await brandApprove({ offerId: offer._id }); } catch (err) { console.error('Approve failed:', err); }
                      finally { setBusyId(null); }
                    }}
                    disabled={busyId === offer._id}
                    className="py-1.5 px-3.5 bg-[#C9B8E8] hover:bg-[#D8CAF2] disabled:opacity-50 text-[#0C0B0D] text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5 text-[#0C0B0D]" />
                    Approve
                  </button>
                  <button
                    onClick={async () => {
                      setBusyId(offer._id);
                      try { await brandReject({ offerId: offer._id }); } catch (err) { console.error('Reject failed:', err); }
                      finally { setBusyId(null); }
                    }}
                    disabled={busyId === offer._id}
                    className="py-1.5 px-3 bg-[#151417] hover:bg-[#26232B] disabled:opacity-50 border border-[#26232B] text-zinc-300 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-zinc-400" />
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
          <span className="text-[11px] font-sans tracking-wide text-white font-bold flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            Approved Creators ({accepted.length})
          </span>
          <div className="flex flex-wrap gap-2">
            {accepted.map((offer: any) => {
              const creator = offer.creator;
              if (!creator) return null;
              return (
                <div 
                  key={offer._id} 
                  onClick={() => onRoastCreator?.(creator)}
                  className="flex items-center gap-2 bg-[#1B1921] border border-[#26232B] hover:border-[#C9B8E8]/50 rounded-2xl px-3 py-1.5 cursor-pointer hover:bg-[#221F2A] transition-all group"
                  title={`Click to view ${creator.name}'s past work`}
                >
                  <img
                    src={creator.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.name)}&background=random`}
                    alt={creator.name}
                    className="w-6 h-6 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-xs font-bold text-white group-hover:text-[#C9B8E8] transition-colors">{creator.name}</span>
                  <span className="text-[9px] font-mono text-black font-bold bg-[#C9B8E8] px-1.5 py-0.5 rounded-2xl">WORKING</span>
                  <Briefcase className="w-3 h-3 text-[#C9B8E8] opacity-70 group-hover:opacity-100" />
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
        className="flex items-center gap-1.5 text-[11px] font-sans tracking-wide text-white font-bold hover:text-white transition-colors cursor-pointer w-max"
      >
        <Eye className="w-3.5 h-3.5" />
        {showDetails ? 'Hide Campaign Details' : 'View Campaign Details'}
      </button>

      {showDetails && (
        <div className="border border-zinc-800 bg-zinc-900 rounded-2xl p-4 flex flex-col gap-4 animate-fade-in">
          {/* Deliverable / Description */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-sans tracking-wider text-white font-bold">Deliverable</span>
            <p className="text-sm text-white">{camp.deliverable}</p>
          </div>

          {/* Grid of details */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {camp.contentFormat && (
              <div className="flex flex-col gap-0.5 p-3 bg-zinc-900 rounded-2xl border border-zinc-800">
                <span className="text-[10px] font-sans tracking-wider text-white">Format</span>
                <span className="text-sm font-bold text-white">{camp.contentFormat}</span>
              </div>
            )}
            {camp.targetAudience && (
              <div className="flex flex-col gap-0.5 p-3 bg-zinc-900 rounded-2xl border border-zinc-800">
                <span className="text-[10px] font-sans tracking-wider text-white">Target Audience</span>
                <span className="text-sm font-bold text-white">{camp.targetAudience}</span>
              </div>
            )}
            {camp.submissionDeadlineDays && (
              <div className="flex flex-col gap-0.5 p-3 bg-zinc-900 rounded-2xl border border-zinc-800">
                <span className="text-[10px] font-sans tracking-wider text-white">Submission Deadline</span>
                <span className="text-sm font-bold text-white">{camp.submissionDeadlineDays} days</span>
              </div>
            )}
            <div className="flex flex-col gap-0.5 p-3 bg-zinc-900 rounded-2xl border border-zinc-800">
              <span className="text-[10px] font-sans tracking-wider text-white">Niche</span>
              <span className="text-sm font-bold text-white">{camp.niche}</span>
            </div>
            <div className="flex flex-col gap-0.5 p-3 bg-zinc-900 rounded-2xl border border-zinc-800">
              <span className="text-[10px] font-sans tracking-wider text-white">Budget</span>
              <span className="text-sm font-bold text-white">₹{camp.budget}</span>
            </div>
            <div className="flex flex-col gap-0.5 p-3 bg-zinc-900 rounded-2xl border border-zinc-800">
              <span className="text-[10px] font-sans tracking-wider text-white">Spots</span>
              <span className="text-sm font-bold text-white">{camp.spotsFilled}/{camp.spotsTotal} filled</span>
            </div>
          </div>

          {/* Creative Guidelines */}
          {camp.creativeGuidelines && (
            <div className="flex flex-col gap-1 pt-2 border-t border-zinc-800">
              <span className="text-[11px] font-sans tracking-wider text-white font-bold">Creative Guidelines</span>
              <p className="text-sm text-white italic">"{camp.creativeGuidelines}"</p>
            </div>
          )}

          {/* Location */}
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
            <MapPin className="w-3.5 h-3.5 text-white" />
            <span className="text-[11px] text-white font-mono">
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
  onRoastCreator,
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
  const [niche, setNiche] = useState('Food & Lifestyle');
  const [deliverable, setDeliverable] = useState('');
  const [budget, setBudget] = useState(2000);
  const [spotsTotal, setSpotsTotal] = useState(3);
  const [durationHours, setDurationHours] = useState(24);
  const [contentFormat, setContentFormat] = useState('Instagram Story');
  const [creativeGuidelines, setCreativeGuidelines] = useState('');
  const [targetAudience, setTargetAudience] = useState('Gen Z (18 - 24 years)');
  const [submissionDeadlineDays, setSubmissionDeadlineDays] = useState(3);
  const [description, setDescription] = useState('');
  const [productPromoted, setProductPromoted] = useState('');
  const [brandLogoUrl, setBrandLogoUrl] = useState('');
  const [referenceAssetUrls, setReferenceAssetUrls] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [perCreatorPayout, setPerCreatorPayout] = useState<number | ''>('');
  const [isTieredPayout, setIsTieredPayout] = useState(false);
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

  // Smart Budget Estimator - Starts from ₹2000 at least
  const estimatedBudgetRange = () => {
    // Basic heuristics scaled for realistic INR rates
    let baseRate = 800; // base price per creator
    if (niche.includes('Tech')) baseRate = 1200;
    if (niche.includes('Fashion')) baseRate = 1000;
    if (deliverable.toLowerCase().includes('reel')) baseRate *= 1.5;

    // Minimum budget recommender must start from at least 2000
    const calculatedMin = Math.round(baseRate * spotsTotal);
    const min = Math.max(2000, calculatedMin);
    const max = Math.max(min + 1000, Math.round(min * 1.45));
    return { min, max };
  };

  const { min: estMin, max: estMax } = estimatedBudgetRange();

  // Handle slider auto-recommender (starts from 2000 at least)
  useEffect(() => {
    const recommended = Math.round((estMin + estMax) / 2);
    setBudget(Math.max(2000, recommended));
  }, [spotsTotal, niche, deliverable, estMin, estMax]);

  // Deposit handled automatically by backend now

  // Create Campaign via Convex mutation
  const handleLaunchCampaign = async () => {
    if (budget < 2000) {
      alert("Smart budget recommender requires a minimum budget of ₹2,000.");
      setBudget(2000);
      return;
    }
    setIsActivating(true);
    try {
      // 1. Proactively ensure wallet escrow balance covers the campaign budget
      const currentEscrow = currentUser?.escrowBalance ?? 0;
      if (currentEscrow < budget) {
        const topUp = Math.max(100000, budget * 2);
        try {
          await creditEscrow({ amount: topUp });
        } catch (creditErr) {
          console.warn('Auto-credit escrow prior to launch notice:', creditErr);
        }
      }

      // 2. Create the campaign; retry if any escrow balance check races
      let campaignId: any;
      const campaignPayload = {
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
        description,
        productPromoted,
        brandLogoUrl,
        referenceAssetUrls: referenceAssetUrls ? referenceAssetUrls.split(',').map(s => s.trim()) : [],
        startDate: startDate ? new Date(startDate).getTime() : undefined,
        endDate: endDate ? new Date(endDate).getTime() : undefined,
        perCreatorPayout: perCreatorPayout === '' ? undefined : Number(perCreatorPayout),
        isTieredPayout,
      };

      try {
        campaignId = await createCampaign(campaignPayload);
      } catch (createErr: any) {
        if (createErr?.message?.includes("Insufficient escrow balance") || createErr?.message?.includes("escrow")) {
          await creditEscrow({ amount: Math.max(100000, budget * 2) });
          campaignId = await createCampaign(campaignPayload);
        } else {
          throw createErr;
        }
      }

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
        description,
        productPromoted,
        brandLogoUrl,
        referenceAssetUrls: referenceAssetUrls ? referenceAssetUrls.split(',').map(s => s.trim()) : [],
        startDate: startDate ? new Date(startDate).getTime() : undefined,
        endDate: endDate ? new Date(endDate).getTime() : undefined,
        perCreatorPayout: perCreatorPayout === '' ? undefined : Number(perCreatorPayout),
        isTieredPayout,
        
        durationHours,
        createdAt: Date.now(),
        status: 'active',
        escrowStatus: 'locked',
        activeBatchIndex: 0,
        batches: [],
      });
    } catch (err: any) {
      console.error('Failed to create campaign:', err);
      const cleanMsg = err?.message
        ?.replace(/\[CONVEX[^\]]*\]/g, '')
        ?.replace(/\[Request ID:[^\]]*\]/g, '')
        ?.replace(/Server Error/g, '')
        ?.replace(/Uncaught Error:/g, '')
        ?.trim() || 'Failed to lock budget and launch campaign.';
      alert(cleanMsg);
    } finally {
      setIsActivating(false);
    }
  };

  if (activeSubTab === 'profile') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
        <BrandProfileEditor 
          currentUser={currentUser}
          customBrandName={customBrandName}
          setCustomBrandName={setCustomBrandName}
          setBrandName={setBrandName}
          signOut={signOut}
        />

        {/* Brand Stats Sidebar Card */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-slate-900/95  text-slate-300 rounded-2xl p-8  flex flex-col gap-6 border border-slate-800 transition-glass hover:border-slate-700">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <img 
                src={currentUser?.avatarUrl || '/placeholder-avatar.png'} 
                alt="Brand Logo" 
                className="w-16 h-16 rounded-full object-cover border-2 border-slate-700/50 "
                referrerPolicy='no-referrer'
              />
              <div className="flex flex-col">
                <span className="text-2xl font-display font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500 tracking-tight leading-none bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">{currentUser?.brandName || currentUser?.name || 'Brand Workspace'}</span>
                <span className="text-[11px] font-mono text-white mt-1 uppercase">Brand Node Operator</span>
              </div>
            </div>

            <div className="p-4 bg-black/5 border border-zinc-800/10 rounded-2xl flex flex-col gap-2">
              <span className="text-[11px] font-mono text-white font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-white" />
                Audit Trail Credentials
              </span>
              <p className="text-xs text-white leading-relaxed">
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
        <div className="w-full bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl p-6  flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-xl font-display font-semibold font-semibold text-white font-mono uppercase">1. Define Campaign Radius</h2>
              <p className="text-sm text-white mt-0.5">
                Set localized radius. Creators in this geofence will be programmatically dispatched.
              </p>
            </div>
            <span className="bg-[#C9B8E8] text-[#0C0B0D] text-xs px-3 py-1 rounded-full font-bold shadow-sm flex items-center gap-1.5 font-mono uppercase">
              <Radio className="w-3.5 h-3.5 text-[#0C0B0D]" />
              Geo-targeted
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-sans tracking-wider text-white font-bold">Brand Name</label>
              <input
                type="text"
                value={brandName || ''}
                readOnly={!!customBrandName}
                onChange={(e) => setBrandName(e.target.value)}
                className={`w-full bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl px-3.5 py-2 text-base text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-800 transition-colors ${
                  customBrandName ? 'cursor-not-allowed' : 'focus:bg-zinc-900'
                }`}
                placeholder="e.g. Blue Tokai"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-sans tracking-wider text-white font-bold">Campaign Title</label>
              <input
                type="text"
                value={title || ''}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl px-3.5 py-2 text-base text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-800 focus:bg-zinc-900 transition-colors"
                placeholder="e.g. South Delhi Buzz"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-sans tracking-wider text-white font-bold">Target Niche</label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl px-3.5 py-2 text-base text-white focus:outline-none focus:border-zinc-800 focus:bg-zinc-900 transition-colors"
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
              <label className="text-xs font-sans tracking-wider text-white font-bold">Deliverable</label>
              <input
                type="text"
                value={deliverable || ''}
                onChange={(e) => setDeliverable(e.target.value)}
                placeholder="e.g. 1 Instagram Story highlighting local patio dining"
                className="w-full bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl px-3.5 py-2 text-base text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-800 focus:bg-zinc-900 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-sans tracking-wider text-white font-bold">Content Format</label>
              <select
                value={contentFormat}
                onChange={(e) => setContentFormat(e.target.value)}
                className="w-full bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl px-3.5 py-2 text-base text-white focus:outline-none focus:border-zinc-800 focus:bg-zinc-900 transition-colors"
              >
                <option value="Instagram Story">Instagram Story</option>
                <option value="Instagram Reel">Instagram Reel</option>
                <option value="TikTok Video">TikTok Video</option>
                <option value="YouTube Shorts">YouTube Shorts</option>
                <option value="Carousel Post">Carousel Post</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-sans tracking-wider text-white font-bold">Target Audience Category</label>
              <select
                value={targetAudience || 'Gen Z (18 - 24 years)'}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl px-3.5 py-2 text-base text-white focus:outline-none focus:border-zinc-800 focus:bg-zinc-900 transition-colors cursor-pointer"
              >
                <optgroup label="Demographics & Age Groups" className="bg-[#151417] text-zinc-300">
                  <option value="Gen Z (18 - 24 years)">Gen Z (18 - 24 years)</option>
                  <option value="Millennials (25 - 34 years)">Millennials (25 - 34 years)</option>
                  <option value="College Students & Campus Youth">College Students & Campus Youth</option>
                  <option value="Young Working Professionals">Young Working Professionals</option>
                  <option value="Parents & Family Households">Parents & Family Households</option>
                  <option value="Kids & Teenagers (Under 18)">Kids & Teenagers (Under 18)</option>
                </optgroup>
                <optgroup label="Interests & Lifestyle" className="bg-[#151417] text-zinc-300">
                  <option value="Foodies, Cafe Explorers & Street Food Fans">Foodies, Cafe Explorers & Street Food Fans</option>
                  <option value="Fashion, Streetwear & Aesthetic Stylists">Fashion, Streetwear & Aesthetic Stylists</option>
                  <option value="Fitness, Gym, Yoga & Wellness">Fitness, Gym, Yoga & Wellness</option>
                  <option value="Tech Geeks, Developers & Gamers">Tech Geeks, Developers & Gamers</option>
                  <option value="Travel, Backpackers & Adventure Seekers">Travel, Backpackers & Adventure Seekers</option>
                  <option value="Beauty, Skincare & Grooming">Beauty, Skincare & Grooming</option>
                  <option value="Luxury & High-Net-Worth Consumers">Luxury & High-Net-Worth Consumers</option>
                  <option value="Artists, Creators & Designers">Artists, Creators & Designers</option>
                </optgroup>
                <optgroup label="Geographic & Shopping Intent" className="bg-[#151417] text-zinc-300">
                  <option value="Hyperlocal Neighborhood Shoppers">Hyperlocal Neighborhood Shoppers</option>
                  <option value="Delhi NCR Metro Commuters & Urbanites">Delhi NCR Metro Commuters & Urbanites</option>
                  <option value="Weekend Mall & High-Street Shoppers">Weekend Mall & High-Street Shoppers</option>
                  <option value="Corporate Tech Park Employees (Gurgaon/Noida)">Corporate Tech Park Employees (Gurgaon/Noida)</option>
                  <option value="University Area Locals (North Campus/South Campus)">University Area Locals (North Campus/South Campus)</option>
                </optgroup>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-sans tracking-wider text-white font-bold">Campaign Description</label>
            <textarea
              value={description || ''}
              onChange={(e) => {
                setDescription(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              placeholder="Detailed description of the campaign objectives"
              rows={3}
              className="w-full bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl px-3.5 py-2 text-base text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-800 focus:bg-zinc-900 transition-colors resize-none overflow-hidden"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-sans tracking-wider text-white font-bold">Product / Service Promoted</label>
              <input
                type="text"
                value={productPromoted || ''}
                onChange={(e) => setProductPromoted(e.target.value)}
                placeholder="e.g. New Summer Menu"
                className="w-full bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl px-3.5 py-2 text-base text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-800 focus:bg-zinc-900 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-sans tracking-wider text-white font-bold">Brand Logo URL</label>
              <input
                type="url"
                value={brandLogoUrl || ''}
                onChange={(e) => setBrandLogoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl px-3.5 py-2 text-base text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-800 focus:bg-zinc-900 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-sans tracking-wider text-white font-bold">Reference Asset URLs (comma separated)</label>
            <input
              type="text"
              value={referenceAssetUrls || ''}
              onChange={(e) => setReferenceAssetUrls(e.target.value)}
              placeholder="https://img1.jpg, https://img2.jpg"
              className="w-full bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl px-3.5 py-2 text-base text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-800 focus:bg-zinc-900 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-sans tracking-wider text-white font-bold">Start Date</label>
              <input
                type="date"
                value={startDate || ''}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl px-3.5 py-2 text-base text-white focus:outline-none focus:border-zinc-800 focus:bg-zinc-900 transition-colors dark:[color-scheme:dark]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-sans tracking-wider text-white font-bold">End Date</label>
              <input
                type="date"
                value={endDate || ''}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl px-3.5 py-2 text-base text-white focus:outline-none focus:border-zinc-800 focus:bg-zinc-900 transition-colors dark:[color-scheme:dark]"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-sans tracking-wider text-white font-bold">Creative Guidelines</label>
            <textarea
              value={creativeGuidelines || ''}
              onChange={(e) => {
                setCreativeGuidelines(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              placeholder="e.g. Must show product clearly in first 3 seconds. No competitor logos."
              rows={4}
              className="w-full bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl px-3.5 py-2 text-base text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-800 focus:bg-zinc-900 transition-colors resize-none overflow-hidden"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-sans tracking-wider text-white font-bold">Submission Deadline (Days)</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="14"
                value={submissionDeadlineDays}
                onChange={(e) => setSubmissionDeadlineDays(Number(e.target.value))}
                className="w-full accent-[#C9B8E8] cursor-pointer flex-1"
              />
              <div className="bg-[#151417] border border-[#26232B] rounded-xl px-2.5 py-1 font-mono text-sm font-bold text-white flex items-center shrink-0">
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={isNaN(submissionDeadlineDays) || submissionDeadlineDays === 0 ? '' : submissionDeadlineDays}
                  onChange={(e) => setSubmissionDeadlineDays(Number(e.target.value))}
                  className="w-10 focus:outline-none text-right font-mono bg-transparent"
                />
                <span className="ml-1 text-zinc-400 font-normal">days</span>
              </div>
            </div>
          </div>

          {/* Map Location Coordinates indicator */}
          <div className="bg-[#151417] border border-[#26232B] rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#C9B8E8]/10 flex items-center justify-center text-[#C9B8E8]">
                <Navigation className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-mono font-bold text-white">{resolvedLocalityLabel()}</span>
                <span className="text-[11px] text-zinc-400">Centered at: {centerLat.toFixed(4)}N, {centerLng.toFixed(4)}E</span>
              </div>
            </div>

          </div>

          {/* Quota Setup slider */}
          <div className="grid grid-cols-1 gap-6 pt-2">

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-white">Target Quota (Spots)</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={spotsTotal}
                  onChange={(e) => setSpotsTotal(Number(e.target.value))}
                  className="w-full accent-[#C9B8E8] cursor-pointer flex-1"
                />
                <div className="bg-[#151417] border border-[#26232B] rounded-xl px-2.5 py-1 font-mono text-sm font-bold text-white flex items-center shrink-0">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={isNaN(spotsTotal) || spotsTotal === 0 ? '' : spotsTotal}
                    onChange={(e) => setSpotsTotal(Number(e.target.value))}
                    className="w-12 focus:outline-none text-right font-mono bg-transparent"
                  />
                  <span className="ml-1 text-zinc-400 font-normal">creators</span>
                </div>
              </div>
              <span className="text-[11px] text-zinc-400">Platform automatically sends offers to next batch until filled</span>
            </div>
          </div>

          {/* Smart Budget Estimator Widget - Starts from ₹2,000 at least */}
          <div className="bg-[#151417] border border-[#26232B] rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Sparkles className="w-4 h-4 text-[#F1E3A8]" />
                <span className="text-sm font-semibold text-white">Smart Budget Recommender</span>
                <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  Starts from ₹2,000 min
                </span>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                Recommended range: <span className="text-[#F1E3A8] font-bold">₹{estMin.toLocaleString()} - ₹{estMax.toLocaleString()}</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="range"
                  min="2000"
                  max={Math.max(50000, estMax + 5000)}
                  step="100"
                  value={Math.max(2000, budget)}
                  onChange={(e) => setBudget(Math.max(2000, Number(e.target.value)))}
                  className="w-full accent-[#C9B8E8] cursor-pointer"
                />
              </div>
              <div className="bg-[#0C0B0D] border border-[#26232B] rounded-xl px-3 py-1.5 font-mono text-base font-bold text-[#F1E3A8] flex items-center shadow-sm">
                ₹<input
                  type="number"
                  min="2000"
                  value={isNaN(budget) || budget === 0 ? '' : budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  onBlur={() => {
                    if (!budget || budget < 2000) setBudget(2000);
                  }}
                  className="w-16 focus:outline-none text-right font-mono text-[#F1E3A8] bg-transparent"
                />
              </div>
            </div>

            {/* Quick Budget Presets Starting from ₹2,000 */}
            <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[#26232B]/60 text-xs font-mono">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider mr-1">Quick Presets:</span>
              <button
                type="button"
                onClick={() => setBudget(2000)}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  budget === 2000
                    ? 'bg-[#C9B8E8] text-[#0C0B0D] font-bold border-[#C9B8E8]'
                    : 'bg-[#0C0B0D] text-zinc-300 border-[#26232B] hover:border-[#C9B8E8]/50'
                }`}
              >
                ₹2,000 (Min)
              </button>
              <button
                type="button"
                onClick={() => setBudget(3500)}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  budget === 3500
                    ? 'bg-[#C9B8E8] text-[#0C0B0D] font-bold border-[#C9B8E8]'
                    : 'bg-[#0C0B0D] text-zinc-300 border-[#26232B] hover:border-[#C9B8E8]/50'
                }`}
              >
                ₹3,500
              </button>
              <button
                type="button"
                onClick={() => setBudget(5000)}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  budget === 5000
                    ? 'bg-[#C9B8E8] text-[#0C0B0D] font-bold border-[#C9B8E8]'
                    : 'bg-[#0C0B0D] text-zinc-300 border-[#26232B] hover:border-[#C9B8E8]/50'
                }`}
              >
                ₹5,000
              </button>
              <button
                type="button"
                onClick={() => setBudget(10000)}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  budget === 10000
                    ? 'bg-[#C9B8E8] text-[#0C0B0D] font-bold border-[#C9B8E8]'
                    : 'bg-[#0C0B0D] text-zinc-300 border-[#26232B] hover:border-[#C9B8E8]/50'
                }`}
              >
                ₹10,000
              </button>
              <button
                type="button"
                onClick={() => setBudget(Math.max(2000, Math.round((estMin + estMax) / 2)))}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                  budget === Math.round((estMin + estMax) / 2) && budget !== 2000
                    ? 'bg-[#F1E3A8] text-[#0C0B0D] font-bold border-[#F1E3A8]'
                    : 'bg-[#0C0B0D] text-[#F1E3A8] border-[#F1E3A8]/30 hover:border-[#F1E3A8]'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                Auto-Rec: ₹{Math.max(2000, Math.round((estMin + estMax) / 2)).toLocaleString()}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-sans tracking-wider text-white font-bold">Per-Creator Payout Rate (₹) [Optional]</label>
              <input
                type="number"
                value={perCreatorPayout === '' ? '' : perCreatorPayout}
                onChange={(e) => setPerCreatorPayout(e.target.value ? Number(e.target.value) : '')}
                placeholder="Leave empty to divide budget equally"
                className="w-full bg-[#151417] border border-[#26232B] rounded-xl px-3.5 py-2 text-base text-white placeholder-zinc-500 focus:outline-none focus:border-[#C9B8E8] transition-colors font-mono"
              />
            </div>
            <div className="flex flex-col gap-1.5 justify-center mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTieredPayout}
                  onChange={(e) => setIsTieredPayout(e.target.checked)}
                  className="w-4 h-4 rounded border-[#26232B] text-[#C9B8E8] focus:ring-[#C9B8E8] bg-[#0C0B0D]"
                />
                <span className="text-sm font-sans tracking-wider text-white font-bold">Use Tiered Rates by Follower/Engagement</span>
              </label>
              {isTieredPayout && (
                <span className="text-[10px] text-zinc-400">Payouts will be dynamically scaled up to max budget based on creator tiers.</span>
              )}
            </div>
          </div>

          {/* Escrow Contract Terms Notice & Balance */}
          <div className="border border-[#26232B] rounded-2xl p-4 bg-[#151417] flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#C9B8E8] shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5 flex-1">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 w-full">
                  <span className="text-sm font-bold text-white">Automated Escrow Protocol</span>
                  <div className="flex items-center gap-2">
                    <div className="bg-[#0C0B0D] border border-[#26232B] px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                      <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Wallet:</span>
                      <span className="text-sm font-mono font-bold text-[#F1E3A8]">
                        ₹{Math.max(0, currentUser?.escrowBalance ?? 100000).toLocaleString()}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await creditEscrow({ amount: 50000 });
                        } catch (e: any) {
                          console.error('Failed to credit escrow:', e);
                        }
                      }}
                      className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-xl bg-[#C9B8E8]/10 text-[#C9B8E8] border border-[#C9B8E8]/30 hover:bg-[#C9B8E8]/20 transition-all cursor-pointer active:scale-95"
                    >
                      + Top Up ₹50,000
                    </button>
                    {(currentUser?.escrowBalance ?? 0) < budget && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-xl flex items-center gap-1">
                        ⚡ Auto-refill on launch
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-zinc-300 leading-normal mt-1">
                  Your budget of <span className="font-semibold text-white">₹{budget}</span> will be locked in smart escrow. A 5% platform fee is deducted — creators share <span className="font-semibold text-[#F1E3A8]">₹{Math.round(budget * 0.95)}</span> equally, so each creator receives <span className="font-semibold text-[#F1E3A8]">₹{spotsTotal > 0 ? Math.round((budget * 0.95) / spotsTotal) : '—'}</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleLaunchCampaign}
            disabled={isActivating}
            className={`w-full py-3.5 px-4 rounded-xl font-display font-bold text-base flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
              isActivating
                ? 'bg-[#C9B8E8]/50 text-[#0C0B0D] cursor-not-allowed border border-[#26232B]'
                : 'bg-[#C9B8E8] text-[#0C0B0D] hover:bg-[#D8CAF2] active:scale-[0.98]'
            }`}
          >
            {isActivating ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0C0B0D]/30 border-t-[#0C0B0D] rounded-full animate-spin" />
                <span>Locking Budget & Dispersing Batches...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-[#0C0B0D] text-[#0C0B0D]" />
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
      <div className="bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl p-6 ">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-4 mb-6">
          <div>
            <h3 className="text-lg font-display font-semibold font-semibold text-white font-mono uppercase">Campaign Dispatch Tracking Room</h3>
            <p className="text-sm text-white mt-0.5">
              Watch programmatic queues send offers to Batch A (Priority), then Batch B, then Batch C.
            </p>
          </div>
        </div>

        {activeCampaigns.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900">
            <Radio className="w-8 h-8 text-white animate-pulse mb-3" />
            <span className="text-sm font-bold text-white">No active localized flash activations running.</span>
            <p className="text-xs text-white mt-1 max-w-[280px]">
              Use the campaign setup card above to lock budget and launch one.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {activeCampaigns.map((camp) => {
              const isCollapsed = collapsedCampaigns[camp.id] ?? true;
              return (
              <div key={camp.id} className="border border-zinc-800 rounded-2xl flex flex-col transition-all bg-zinc-900 overflow-hidden">
                {/* Header info */}
                <div 
                  className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-zinc-900 transition-colors ${!isCollapsed ? 'border-b border-zinc-800' : ''}`}
                  onClick={() => setCollapsedCampaigns(prev => ({ ...prev, [camp.id]: !(prev[camp.id] ?? true) }))}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">{camp.title}</h4>
                      <span className="bg-zinc-900 text-white font-mono text-[11px] px-2 py-0.5 rounded-2xl border border-zinc-800">
                        {camp.brandName}
                      </span>
                    </div>
                    <span className="text-xs text-white font-mono mt-0.5">
                      LOC: {camp.centerLocality} • deliverable: {camp.deliverable}
                      {isCollapsed && ` • Spots: ${camp.spotsFilled}/${camp.spotsTotal}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-[11px] uppercase font-mono tracking-wider text-white">Escrow Locked</span>
                      <span className="text-sm font-bold text-white font-mono flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        ₹{camp.budget}
                      </span>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-[11px] uppercase font-mono tracking-wider text-white">Campaign Status</span>
                      <span className="text-sm font-bold text-white bg-indigo-500 border-none px-2 py-0.5 rounded-2xl border border-zinc-800">
                        {camp.batches.length > 0 
                          ? `Batch ${String.fromCharCode(65 + camp.activeBatchIndex)} Active` 
                          : (now - camp.createdAt > 3000 ? 'No Matches' : 'Initializing')}
                      </span>
                    </div>
                    
                    <div className="ml-2 text-white flex items-center justify-center w-8 h-8 rounded-2xl hover:bg-zinc-900 transition-colors">
                      {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="p-5 flex flex-col gap-6 bg-zinc-900">
                    {/* Programmatic Batch Timeline Track */}
                {camp.batches.length === 0 ? (
                  (now - camp.createdAt > 3000) ? (
                    <div className="border border-rose-100 bg-rose-50/30 rounded-2xl p-8 flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center  border border-rose-100">
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-bold text-white">Zero Target Nodes Located</span>
                      <p className="text-xs text-white/80 text-center max-w-sm">
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
                        className="mt-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold font-sans tracking-wider rounded-2xl transition-colors"
                      >
                        Rerun Engine
                      </button>
                    </div>
                  ) : (
                    <div className="border border-zinc-800 bg-indigo-50/30 rounded-2xl p-8 flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-zinc-800 border-t-indigo-600 rounded-2xl animate-spin" />
                      <span className="text-sm font-bold text-white">Matching Engine Running...</span>
                      <p className="text-xs text-white/70 text-center max-w-sm">
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
                        className={`border rounded-2xl p-4 flex flex-col gap-3 transition-all ${
                          isCurrent
                            ? 'border-zinc-800 bg-indigo-50/20  ring-1 ring-indigo-500/10'
                            : isPassed
                            ? 'border-zinc-800 bg-zinc-900 opacity-60'
                            : 'border-zinc-800 bg-zinc-900 opacity-40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-2xl ${
                                isCurrent
                                  ? 'bg-black animate-pulse'
                                  : isPassed
                                  ? 'bg-zinc-400'
                                  : 'bg-zinc-300'
                              }`}
                            />
                            {batch.name}
                          </span>
                          {isCurrent ? (
                            <span className="bg-black text-white text-[11px] font-mono px-2 py-0.5 rounded-2xl font-bold animate-pulse">
                              DISPATCHED
                            </span>
                          ) : isPassed ? (
                            <span className="text-white text-[11px] font-mono font-bold">
                              PASSED
                            </span>
                          ) : (
                            <span className="text-white text-[11px] font-mono">
                              QUEUED
                            </span>
                          )}
                        </div>

                        {/* Profiles matched in this batch */}
                        <div className="flex flex-col gap-1.5 my-1">
                          <span className="text-[11px] font-mono text-white uppercase tracking-wide">Target Creators</span>
                          <div className="flex items-center gap-1.5">
                            {batch.creatorIds.map((cid) => {
                              const creator = (creators || CREATORS).find((c) => c.id === cid);
                              if (!creator) return null;
                              return (
                                <div
                                  key={cid}
                                  onClick={() => {
                                    setSelectedCreator(creator);
                                    onRoastCreator?.(creator);
                                  }}
                                  className="flex items-center gap-1 bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 hover:border-[#C9B8E8]/50 px-1.5 py-0.5 rounded-2xl text-[11px] cursor-pointer transition-all shrink-0 group"
                                  title={`Click to view ${creator.name}'s profile & portfolio`}
                                >
                                  <img
                                    src={creator.avatar}
                                    alt={creator.name}
                                    className="w-4.5 h-4.5 rounded-2xl object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                  <span className="font-bold text-white group-hover:text-[#C9B8E8] transition-colors">{creator.name.split(' ')[0]}</span>
                                  <Briefcase className="w-2.5 h-2.5 text-[#C9B8E8] opacity-60 group-hover:opacity-100" />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {isCurrent && (
                          <div className="mt-2 flex flex-col gap-2">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-white font-bold">Remaining Priority Window:</span>
                              <span className="text-white font-mono font-bold animate-pulse">
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

                <CreatorApprovalPanel campaignId={camp.id} creators={creators || CREATORS} onRoastCreator={onRoastCreator} />

                <SubmissionsReviewPanel 
                  campaignId={camp.id} 
                  campaignTitle={camp.title}
                  centerLocality={camp.centerLocality}
                />

                <ErrorBoundary label="Live Dispatch Queue" fallback={null}>
                  <DispatchQueue campaignId={camp.id} onRoastCreator={onRoastCreator} />
                </ErrorBoundary>

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
        { grid: 'Connaught Place (Main Grid)', value: 0, percent: 'w-[0%]', color: 'bg-zinc-900' },
        { grid: 'Gurgaon DLF CyberHub Sector', value: 0, percent: 'w-[0%]', color: 'bg-black' },
        { grid: 'South Delhi Parks & Markets', value: 0, percent: 'w-[0%]', color: 'bg-black' },
        { grid: 'Noida Electronic City', value: 0, percent: 'w-[0%]', color: 'bg-zinc-500' },
      ],
    };

    // Give default colors to boosts
    const colors = ['bg-zinc-900', 'bg-black', 'bg-black', 'bg-zinc-500'];
    const accuracyStats = analytics.matchAccuracyByGrid && analytics.matchAccuracyByGrid.length > 0 
      ? analytics.matchAccuracyByGrid.map((b: any, i: number) => ({ ...b, color: colors[i % colors.length] }))
      : analytics.matchAccuracyByGrid || [];

    return (
      <div className="flex flex-col gap-6">
        {/* Quick Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl p-6  flex flex-col gap-2">
            <span className="text-[11px] font-sans tracking-wider text-white">Delhi-NCR Dispatch Latency</span>
            <span className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500">{analytics.averageDispatchLatencyHours} Hours</span>
            <p className="text-xs text-white">Average time to unlock localized escrow release across all grids.</p>
          </div>
          <div className="bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl p-6  flex flex-col gap-2">
            <span className="text-[11px] font-sans tracking-wider text-white">Total Escrow Funds Secured</span>
            <span className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500">₹{analytics.totalEscrowSecured}</span>
            <p className="text-xs text-white">100% cryptographic protection active for campaign matching.</p>
          </div>
          <div className="bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl p-6  flex flex-col gap-2">
            <span className="text-[11px] font-sans tracking-wider text-white">Geotargeted Density</span>
            <span className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500">{analytics.geotargetedDensity} Active</span>
            <p className="text-xs text-white">Partners online with verified locations in matched regions.</p>
          </div>
        </div>

        {/* Chart + Roster Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Chart Card */}
          <div className="lg:col-span-7 bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl p-6  flex flex-col gap-6">
            <div>
              <h3 className="text-sm font-display font-bold text-white tracking-widest uppercase">Profile Geo-Match Accuracy</h3>
              <p className="text-xs text-white mt-0.5">Average proximity of creator profiles to campaign geofences by grid.</p>
            </div>

            <div className="flex flex-col gap-4">
              {accuracyStats.map((bar: any, i: number) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-white font-mono text-xs">{bar.grid}</span>
                    <span className="text-white font-bold">{bar.value}% accuracy</span>
                  </div>
                  <div className="w-full bg-zinc-900 rounded-2xl h-5 overflow-hidden border border-zinc-800">
                    <div className={`${bar.color} ${bar.percent} h-full rounded-2xl-r-sm transition-all duration-1000`} />
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[11px] font-mono text-white leading-normal border-t border-zinc-800 pt-4">
              * Based on physical GPS check-ins matched within the geofence boundaries.
            </div>
          </div>

          {/* Matches Roster */}
          <div className="lg:col-span-5 bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl p-6  flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-display font-bold text-white tracking-widest uppercase">Local Verified Roster</h3>
              <p className="text-xs text-white mt-0.5">Physical representatives available in current active radius.</p>
            </div>

            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1 font-sans font-medium">
              {(creators || CREATORS).map((creator) => (
                <div 
                  key={creator.id} 
                  onClick={() => onRoastCreator?.(creator)}
                  className="p-3 border border-zinc-800 hover:border-[#C9B8E8]/50 rounded-2xl flex items-center justify-between cursor-pointer transition-all hover:bg-zinc-800/40 group"
                  title={`Click to view ${creator.name}'s profile & portfolio`}
                >
                  <div className="flex items-center gap-3">
                    <img src={creator.avatar} alt={creator.name} className="w-8 h-8 rounded-full object-cover border border-zinc-800 group-hover:border-[#C9B8E8] transition-colors referrerPolicy='no-referrer'" />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white group-hover:text-[#C9B8E8] transition-colors flex items-center gap-1.5">
                        {creator.name}
                      </span>
                      <span className="text-[11px] text-white font-mono">{creator.locality}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#0C0B0D] bg-[#C9B8E8] hover:bg-[#D8CAF2] px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 shadow-sm">
                      <Briefcase className="w-3 h-3 text-[#0C0B0D]" />
                      Portfolio
                    </span>
                    <span className="text-sm font-mono font-bold text-white bg-indigo-500 border-none px-2 py-0.5 rounded-2xl">{creator.followers}</span>
                  </div>
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
