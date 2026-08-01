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

function useCountUp(target: number, duration: number = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return count;
}

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number, prefix?: string, suffix?: string }) {
  const count = useCountUp(value);
  return <>{prefix}{count}{suffix}</>;
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
    <div className="mt-2 pt-5 border-t border-[rgba(255,255,255,0.08)] flex flex-col gap-3">
      <span className="text-[11px] font-mono uppercase tracking-wide text-zinc-400 font-bold">
        Deliverables To Review ({submissions.length})
      </span>

      <div className="flex flex-col gap-3">
        {submissions.map((sub: any) => (
          <div
            key={sub._id}
            className="border border-[rgba(255,255,255,0.08)] rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start" style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            <div className="w-20 h-20 rounded-lg overflow-hidden border border-zinc-200/70 shrink-0 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
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
                <span className="text-sm font-bold text-zinc-100">{sub.creator?.name || 'Creator'}</span>
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                    sub.status === 'approved' || sub.status === 'draft_approved'
                      ? 'bg-[rgba(16,185,129,0.08)] border-[rgba(16,185,129,0.3)] text-emerald-400'
                      : sub.status === 'rejected' || sub.status === 'draft_rejected'
                      ? 'bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.2)] text-rose-400'
                      : 'bg-[rgba(99,102,241,0.08)] border-[rgba(99,102,241,0.2)] text-indigo-400'
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
                  className="text-xs text-indigo-400 hover:underline flex items-center gap-1 w-max"
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
                  className="text-xs text-indigo-400 hover:underline flex items-center gap-1 w-max"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open full-size upload
                </a>
              )}

              {sub.rejectionReason && (
                <span className="text-[11px] text-rose-400">Reason: {sub.rejectionReason}</span>
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
                  className="py-1.5 px-3 btn-primary disabled:opacity-50 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
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
                  className="py-1.5 px-3 bg-transparent hover:bg-[rgba(255,255,255,0.03)] disabled:opacity-50 border border-[rgba(255,255,255,0.08)] text-zinc-400 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
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
                  className="py-1.5 px-3 btn-mint disabled:opacity-50 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
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
                  className="py-1.5 px-3 bg-transparent hover:bg-[rgba(255,255,255,0.03)] disabled:opacity-50 border border-[rgba(255,255,255,0.08)] text-zinc-400 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
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
  const [selectedProfileCreator, setSelectedProfileCreator] = useState<any>(null);

  if (!campaignOffers || campaignOffers.length === 0) return null;

  const pendingReview = campaignOffers.filter((o: any) => o.status === 'brand_review');
  const accepted = campaignOffers.filter((o: any) => o.status === 'accepted');

  if (pendingReview.length === 0 && accepted.length === 0) return null;

  return (
    <div className="mt-2 pt-5 border-t border-[rgba(255,255,255,0.08)] flex flex-col gap-4">
      {/* Pending Creator Applications */}
      {pendingReview.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-mono uppercase tracking-wide text-amber-400 font-bold flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5" />
            Creator Applications ({pendingReview.length})
          </span>
          {pendingReview.map((offer: any) => {
            const creator = offer.creator;
            if (!creator) return null;
            return (
              <div key={offer._id} className="border border-[rgba(245,158,11,0.2)] rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start" style={{ background: 'rgba(245,158,11,0.08)' }}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img
                    src={creator.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.name)}&background=random`}
                    alt={creator.name}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-100">{creator.name}</span>
                      {creator.velocityTier === 'Velocity' && (
                        <span className="text-[9px] font-mono bg-[rgba(245,158,11,0.1)] text-amber-400 px-1.5 py-0.5 rounded border border-[rgba(245,158,11,0.2)] font-bold">VELOCITY</span>
                      )}
                    </div>
                    <span className="text-[11px] text-indigo-400 font-mono">{creator.handle || 'No handle'}</span>
                    <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-0.5">
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
                            className="w-8 h-8 rounded object-cover border border-[rgba(255,255,255,0.08)]"
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
                    onClick={() => setSelectedProfileCreator(creator)}
                    className="py-1.5 px-3 bg-[rgba(99,102,241,0.08)] hover:bg-[rgba(99,102,241,0.1)] text-indigo-400 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Profile
                  </button>
                  <button
                    onClick={async () => {
                      setBusyId(offer._id);
                      try { await brandApprove({ offerId: offer._id }); } catch (err) { console.error('Approve failed:', err); }
                      finally { setBusyId(null); }
                    }}
                    disabled={busyId === offer._id}
                    className="py-1.5 px-3 btn-mint disabled:opacity-50 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
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
                    className="py-1.5 px-3 bg-transparent hover:bg-[rgba(255,255,255,0.03)] disabled:opacity-50 border border-[rgba(255,255,255,0.08)] text-zinc-400 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
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
          <span className="text-[11px] font-mono uppercase tracking-wide text-emerald-400 font-bold flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            Approved Creators ({accepted.length})
          </span>
          <div className="flex flex-wrap gap-2">
            {accepted.map((offer: any) => {
              const creator = offer.creator;
              if (!creator) return null;
              return (
                <div key={offer._id} className="flex items-center gap-2 border border-[rgba(16,185,129,0.2)] rounded-lg px-3 py-1.5 cursor-pointer hover:bg-[rgba(16,185,129,0.1)] transition-colors" style={{ background: 'rgba(16,185,129,0.08)' }} onClick={() => setSelectedProfileCreator(creator)}>
                  <img
                    src={creator.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.name)}&background=random`}
                    alt={creator.name}
                    className="w-6 h-6 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-xs font-bold text-emerald-400">{creator.name}</span>
                  <span className="text-[9px] font-mono text-emerald-400 bg-[rgba(16,185,129,0.1)] px-1.5 py-0.5 rounded">WORKING</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Creator Profile Modal */}
      <AnimatePresence>
        {selectedProfileCreator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.93, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.93, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden"
              style={{ background: 'var(--color-obsidian-panel)' }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.08)]">
                <h3 className="text-lg font-bold text-zinc-100">Creator Profile</h3>
                <button
                  onClick={() => setSelectedProfileCreator(null)}
                  className="p-2 text-zinc-400 hover:text-zinc-400 bg-transparent rounded-full shadow-sm border border-[rgba(255,255,255,0.1)] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex flex-col gap-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <img
                    src={selectedProfileCreator.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedProfileCreator.name)}&background=random`}
                    alt={selectedProfileCreator.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-[rgba(255,255,255,0.08)] shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-black text-zinc-100">{selectedProfileCreator.name}</h2>
                      {selectedProfileCreator.velocityTier === 'Velocity' && (
                        <span className="text-[10px] font-mono bg-[rgba(245,158,11,0.1)] text-amber-400 px-2 py-0.5 rounded border border-[rgba(245,158,11,0.2)] font-bold tracking-wider">VELOCITY CREATOR</span>
                      )}
                    </div>
                    <span className="text-sm text-indigo-400 font-mono font-medium">{selectedProfileCreator.handle || 'No handle'}</span>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 mt-1">
                      <div className="flex items-center gap-1.5"><Users className="w-4 h-4" />{selectedProfileCreator.followers || '0'} followers</div>
                      <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{selectedProfileCreator.locality || 'Unknown location'}</div>
                      <div className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" />{selectedProfileCreator.niche || 'No niche'}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1.5 p-4 rounded-xl border border-[rgba(255,255,255,0.08)]" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Match Score</span>
                    <span className="text-2xl font-black text-indigo-400">{selectedProfileCreator.matchScore || 90}%</span>
                  </div>
                  <div className="flex flex-col gap-1.5 p-4 rounded-xl border border-[rgba(255,255,255,0.08)]" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Local Audience</span>
                    <span className="text-2xl font-black text-emerald-400">{selectedProfileCreator.audienceInLocality || 75}%</span>
                  </div>
                  <div className="flex flex-col gap-1.5 p-4 rounded-xl border border-[rgba(255,255,255,0.08)]" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Avg Response</span>
                    <span className="text-2xl font-black text-zinc-100">{selectedProfileCreator.latencyHours || 2}h</span>
                  </div>
                  <div className="flex flex-col gap-1.5 p-4 rounded-xl border border-[rgba(255,255,255,0.08)]" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Collabs</span>
                    <span className="text-2xl font-black text-zinc-100">{selectedProfileCreator.acceptedCampaignIds?.length || 0}</span>
                  </div>
                </div>

                {selectedProfileCreator.bio && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">About</span>
                    <p className="text-sm text-zinc-300 leading-relaxed glass-card-elevated p-6 whitespace-pre-wrap">
                      {selectedProfileCreator.bio}
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">Portfolio & Past Work</span>
                  {selectedProfileCreator.pastWork && selectedProfileCreator.pastWork.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedProfileCreator.pastWork.map((work: any, idx: number) => (
                        <div key={idx} className="flex flex-col group overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-transparent hover:border-indigo-300 hover:shadow-md transition-all">
                          <div className="w-full h-40 overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <img
                              src={work.imgUrl}
                              alt={work.brand}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(work.brand)}&background=f1f5f9&color=6366f1&size=200`;
                              }}
                            />
                          </div>
                          <div className="p-3 flex flex-col">
                            <span className="text-sm font-bold text-zinc-100 truncate">{work.brand}</span>
                            <span className="text-[11px] text-zinc-400 font-mono uppercase mt-0.5 truncate">{work.type}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 border-2 border-dashed border-[rgba(255,255,255,0.08)] rounded-xl flex flex-col items-center justify-center text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <Briefcase className="w-8 h-8 text-zinc-300 mb-2" />
                      <span className="text-sm font-bold text-zinc-400">No Portfolio Yet</span>
                      <span className="text-xs text-zinc-400 max-w-xs mt-1">This creator hasn't uploaded any past work examples.</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <ReviewsCard userId={selectedProfileCreator._id} label="Creator Reviews" dark={true} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
        className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wide text-indigo-400 font-bold hover:text-indigo-400 transition-colors cursor-pointer w-max"
      >
        <Eye className="w-3.5 h-3.5" />
        {showDetails ? 'Hide Campaign Details' : 'View Campaign Details'}
      </button>

      {showDetails && (
        <div className="border border-[rgba(255,255,255,0.08)] rounded-xl p-4 flex flex-col gap-4 animate-fade-in" style={{ background: 'rgba(255,255,255,0.03)' }}>
          {/* Deliverable / Description */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Deliverable</span>
            <p className="text-sm text-zinc-300">{camp.deliverable}</p>
          </div>

          {/* Grid of details */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {camp.contentFormat && (
              <div className="flex flex-col gap-0.5 p-3 bg-transparent rounded-lg border border-[rgba(255,255,255,0.08)]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Format</span>
                <span className="text-sm font-medium text-zinc-100">{camp.contentFormat}</span>
              </div>
            )}
            {camp.targetAudience && (
              <div className="flex flex-col gap-0.5 p-3 bg-transparent rounded-lg border border-[rgba(255,255,255,0.08)]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Target Audience</span>
                <span className="text-sm font-medium text-zinc-100">{camp.targetAudience}</span>
              </div>
            )}
            {camp.submissionDeadlineDays && (
              <div className="flex flex-col gap-0.5 p-3 bg-transparent rounded-lg border border-[rgba(255,255,255,0.08)]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Submission Deadline</span>
                <span className="text-sm font-medium text-zinc-100">{camp.submissionDeadlineDays} days</span>
              </div>
            )}
            <div className="flex flex-col gap-0.5 p-3 bg-transparent rounded-lg border border-[rgba(255,255,255,0.08)]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Niche</span>
              <span className="text-sm font-medium text-zinc-100">{camp.niche}</span>
            </div>
            <div className="flex flex-col gap-0.5 p-3 bg-transparent rounded-lg border border-[rgba(255,255,255,0.08)]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Budget</span>
              <span className="text-sm font-medium text-emerald-400">₹{camp.budget}</span>
            </div>
            <div className="flex flex-col gap-0.5 p-3 bg-transparent rounded-lg border border-[rgba(255,255,255,0.08)]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Spots</span>
              <span className="text-sm font-medium text-zinc-100">{camp.spotsFilled}/{camp.spotsTotal} filled</span>
            </div>
          </div>

          {/* Creative Guidelines */}
          {camp.creativeGuidelines && (
            <div className="flex flex-col gap-1 pt-2 border-t border-[rgba(255,255,255,0.08)]">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Creative Guidelines</span>
              <p className="text-sm text-zinc-400 italic">"{camp.creativeGuidelines}"</p>
            </div>
          )}

          {/* Location */}
          <div className="flex items-center gap-2 pt-2 border-t border-[rgba(255,255,255,0.08)]">
            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[11px] text-zinc-400 font-mono">
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
  const deleteCampaign = useMutation(api.campaigns.deleteCampaign);
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
  const [budget, setBudget] = useState(1000);
  const [spotsTotal, setSpotsTotal] = useState(3);
  const [durationHours, setDurationHours] = useState(24);
  const [contentFormat, setContentFormat] = useState('');
  const [creativeGuidelines, setCreativeGuidelines] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [submissionDeadlineDays, setSubmissionDeadlineDays] = useState(3);
  const [isActivating, setIsActivating] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [fakeRazorpayData, setFakeRazorpayData] = useState<{ amount: number; orderId: string } | null>(null);
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

  const createEscrowOrder = useAction(api.payments.createEscrowDepositOrder);
  const verifyAndCreditEscrow = useAction(api.payments.verifyAndCreditEscrow);

  // Fake Razorpay Processing Effect
  useEffect(() => {
    if (fakeRazorpayData) {
      let isMounted = true;
      const processMockPayment = async () => {
        try {
          // Wait 2.5 seconds to show the modal processing state
          await new Promise((r) => setTimeout(r, 2500));
          if (!isMounted) return;

          const result = await verifyAndCreditEscrow({
            razorpay_order_id: fakeRazorpayData.orderId,
            razorpay_payment_id: `pay_demo_${Date.now()}`,
            razorpay_signature: 'demo_signature',
            amount: fakeRazorpayData.amount,
          });

          if (isMounted && result.verified) {
            setFakeRazorpayData(null);
          }
        } catch (err) {
          console.error('Demo payment error:', err);
          if (isMounted) setFakeRazorpayData(null);
        }
      };
      
      processMockPayment();
      return () => { isMounted = false; };
    }
  }, [fakeRazorpayData, verifyAndCreditEscrow]);

  const handleDeposit = async (amount: number) => {
    if (!currentUser) return;
    setIsDepositing(true);

    try {
      const order = await createEscrowOrder({ amount });
      if (order.error) throw new Error(order.error);

      // ── Demo mode: simulate Razorpay checkout flow ──
      if ((order as any).demo) {
        setFakeRazorpayData({ amount, orderId: order.orderId! });
        setIsDepositing(false);
        return;
      }

      // ── Real Razorpay mode ──
      const options = {
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: 'Radius',
        description: 'Escrow Deposit',
        handler: async (response: any) => {
          try {
            const result = await verifyAndCreditEscrow({
              ...response,
              amount,
            });
            if (!result.verified) throw new Error("Payment verification failed");
          } catch (err) {
            console.error('Verification error:', err);
            alert('Payment verification failed.');
          } finally {
            setIsDepositing(false);
          }
        },
        prefill: {
          name: currentUser.name || '',
          email: currentUser.email || '',
        },
        theme: {
          color: '#4f46e5',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        alert(`Payment failed: ${response.error.description}`);
        setIsDepositing(false);
      });
      rzp.open();
    } catch (err) {
      console.error('Failed to create Razorpay order:', err);
      alert('Could not start checkout. Please try again.');
      setIsDepositing(false);
    }
  };

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
    } catch (err: any) {
      alert("Failed to launch campaign: " + err.message);
    } finally {
      setIsActivating(false);
    }
  };

  const allCampaigns = activeCampaigns || [];
  const totalCampaigns = allCampaigns.length;
  const totalEscrow = allCampaigns.reduce((sum, c) => sum + c.budget, 0);

  // Calculate dynamic PPV based on real budget and an estimated 10k views per spot
  const totalExpectedViews = allCampaigns.reduce((sum, c) => sum + (c.spotsTotal * 10000), 0);
  const avgPpv = totalExpectedViews > 0 ? (totalEscrow / totalExpectedViews).toFixed(2) : "0.00";

  const realPastCampaigns = allCampaigns.map(c => {
    const views = c.spotsTotal * 10000;
    const ppv = views > 0 ? (c.budget / views).toFixed(2) : "0.00";
    return {
      id: (c as any)._id || c.id,
      title: c.title,
      ppv: ppv,
      views: views,
      date: new Date((c as any)._creationTime || c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const brandCampaignIds = allCampaigns.map(c => (c as any)._id || c.id);
  const frequentCreators = (creators || CREATORS)
    .map((creator: any) => {
      const overlap = (creator.acceptedCampaignIds || []).filter((id: string) => brandCampaignIds.includes(id)).length;
      return { ...creator, overlap };
    })
    .filter((c: any) => c.overlap > 0)
    .sort((a: any, b: any) => b.overlap - a.overlap)
    .slice(0, 5);

  const analytics = {
    campaignsLaunched: totalCampaigns,
    totalEscrowSecured: totalEscrow,
    averagePayPerView: avgPpv,
    pastCampaigns: realPastCampaigns,
    ...((brandAnalytics as any) || {}),
  };

  const tabOrder = ['setup', 'dispatch', 'analytics', 'profile'];
  const [prevTab, setPrevTab] = useState(activeSubTab);
  const [direction, setDirection] = useState(1);
  
  if (activeSubTab !== prevTab) {
    setDirection(tabOrder.indexOf(activeSubTab) > tabOrder.indexOf(prevTab) ? 1 : -1);
    setPrevTab(activeSubTab);
  }

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={activeSubTab}
          custom={direction}
          initial={{ opacity: 0, x: direction * 20, filter: 'blur(4px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: direction * -20, filter: 'blur(4px)' }}
          transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
          className="w-full"
        >
          {activeSubTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Brand Profile Editor Card */}
        <div className="lg:col-span-7 glass-card p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Brand Identity & Node Settings</h2>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                Manage your public brand workspace details, authorized contacts, and cryptographically linked release settings.
              </p>
            </div>
            <span className="bg-[rgba(16,185,129,0.08)] text-emerald-400 text-sm px-2.5 py-1 rounded-full font-semibold border border-[rgba(16,185,129,0.2)] flex items-center gap-1.5">
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
                className="input-field w-full font-medium"
                placeholder="e.g. Blue Tokai Coffee"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Corporate Domain</label>
              <input
                id="brand-profile-domain-input"
                type="text"
                defaultValue={currentUser?.domain || ''}
                className="input-field w-full"
                placeholder="e.g. brand.com"
              />
            </div>
            
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Brand Instagram Handle</label>
              <input
                id="brand-profile-handle-input"
                type="text"
                defaultValue={currentUser?.handle || ''}
                className="input-field w-full"
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
                className="input-field w-full opacity-60 cursor-not-allowed"
                placeholder="e.g. admin@brand.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Primary Market Sector</label>
              <select
                id="brand-profile-sector-select"
                defaultValue={currentUser?.sector || "Food & Lifestyle"}
                className="input-field w-full"
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
              className="input-field w-full resize-none leading-relaxed"
              placeholder="Tell creators who you are..."
            />
          </div>

          <div className="border-t border-[rgba(255,255,255,0.08)] pt-5 flex flex-col gap-4">
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
                  className="input-field w-full font-mono"
                  placeholder="0x..."
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Escrow Release Mechanism</label>
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-[rgba(255,255,255,0.08)]" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <span className="text-sm text-zinc-400 font-medium">Manual Brand Verification</span>
                  <span className="bg-[rgba(245,158,11,0.1)] text-amber-400 border border-[rgba(245,158,11,0.2)] font-mono text-[11px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    MANUAL
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[rgba(255,255,255,0.08)] pt-4 flex justify-end items-center gap-3">
            {profileSaveStatus === 'saved' && (
              <span className="text-sm text-emerald-400 font-medium animate-fade-in">Settings saved successfully!</span>
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
              className="py-2.5 px-5 btn-primary font-mono text-sm rounded-xl font-bold tracking-wider uppercase transition-all cursor-pointer"
            >
              {profileSaveStatus === 'saving' ? 'SAVING...' : 'SAVE SETTINGS & DEPLOY'}
            </button>
          </div>
          
          <div className="border-t border-[rgba(239,68,68,0.15)] pt-6 mt-4 flex flex-col gap-3">
            <h3 className="text-sm font-mono uppercase tracking-wider text-rose-400 font-bold">Danger Zone</h3>
            
            <div className="flex items-center justify-between border border-[rgba(255,255,255,0.08)] p-4 rounded-xl mb-3 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-zinc-100">Sign Out</span>
                <span className="text-xs text-zinc-400">Securely disconnect this device from your node.</span>
              </div>
              <button
                onClick={async () => {
                  await signOut();
                  window.location.reload();
                }}
                className="py-2 px-4 border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] text-zinc-300 font-mono text-xs rounded-lg font-bold transition-all"
              >
                SIGN OUT
              </button>
            </div>

            <div className="flex items-center justify-between border border-[rgba(239,68,68,0.2)] p-4 rounded-xl" style={{ background:'rgba(239,68,68,0.06)' }}>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-zinc-100">Delete Account</span>
                <span className="text-xs text-zinc-400">Permanently delete your profile and reset your role.</span>
              </div>
              <button
                onClick={async () => {
                  if (confirm("Are you sure you want to completely delete your profile? This cannot be undone.")) {
                    await deleteCurrentUser();
                    signOut(); // Sign out to clear the session so they can restart fresh
                  }
                }}
                className="py-2 px-4 btn-secondary style={{ borderColor:'rgba(239,68,68,0.3)' }} text-rose-400 hover:bg-[rgba(239,68,68,0.1)] font-mono text-xs rounded-lg font-bold transition-all"
              >
                DELETE PROFILE
              </button>
            </div>
          </div>

        </div>

        {/* Brand Stats Sidebar Card */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-card-elevated p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.06)] pb-4">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-display font-black text-xl">
                {customBrandName.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-white tracking-tight leading-none">{customBrandName}</span>
                <span className="text-[11px] font-mono text-zinc-400 mt-1 uppercase">Brand Node Operator</span>
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
          )}

          {activeSubTab === 'setup' && (
            <div className="grid grid-cols-1 gap-8 items-start">
        {/* Campaign Builder Form */}
        <div className="w-full glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>1. Define Campaign Radius</h2>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                Set localized radius. Creators in this geofence will be programmatically dispatched.
              </p>
            </div>
            <span className="bg-[rgba(99,102,241,0.08)] text-indigo-400 text-sm px-2.5 py-1 rounded-full font-semibold border border-[rgba(99,102,241,0.2)] flex items-center gap-1.5 animate-pulse">
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
                className="input-field w-full opacity-60 cursor-not-allowed"
                placeholder="e.g. Blue Tokai"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">Campaign Title</label>
              <input
                type="text"
                value={title || ''}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field w-full"
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
                className="input-field w-full"
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
                className="input-field w-full"
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
                className="input-field w-full"
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
                className="input-field w-full"
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
              className="input-field w-full resize-none overflow-hidden"
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
                className="w-full cursor-pointer flex-1"
                style={{ '--pct': `${((submissionDeadlineDays - 1) / 13) * 100}%` } as React.CSSProperties}
              />
              <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-1 font-mono text-sm font-bold text-zinc-100 flex items-center shrink-0 min-w-[70px] justify-center">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={submissionDeadlineDays}
                    initial={{ scale: 0.8, opacity: 0, y: 5 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: -5 }}
                  >
                    {submissionDeadlineDays}
                  </motion.span>
                </AnimatePresence>
                <span className="ml-1 text-zinc-400 font-normal">days</span>
              </div>
            </div>
          </div>

          {/* Map Location Coordinates indicator */}
          <div className=" border border-[rgba(255,255,255,0.08)] rounded-xl p-3.5 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[rgba(99,102,241,0.08)] flex items-center justify-center text-indigo-400">
                <Navigation className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-mono font-bold text-zinc-300">{resolvedLocalityLabel()}</span>
                <span className="text-[11px] text-zinc-400">Centered at: {centerLat.toFixed(4)}N, {centerLng.toFixed(4)}E</span>
              </div>
            </div>

          </div>

          {/* Quota Setup slider */}
          <div className="grid grid-cols-1 gap-6 pt-2">

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-zinc-300">Target Quota (Spots)</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={spotsTotal}
                  onChange={(e) => setSpotsTotal(Number(e.target.value))}
                  className="w-full cursor-pointer flex-1"
                  style={{ '--pct': `${((spotsTotal - 1) / 99) * 100}%` } as React.CSSProperties}
                />
                <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-1 font-mono text-sm font-bold text-zinc-100 flex items-center shrink-0 min-w-[95px] justify-center">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={spotsTotal}
                      initial={{ scale: 0.8, opacity: 0, y: 5 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.8, opacity: 0, y: -5 }}
                    >
                      {spotsTotal}
                    </motion.span>
                  </AnimatePresence>
                  <span className="ml-1 text-zinc-400 font-normal">creators</span>
                </div>
              </div>
              <span className="text-[11px] text-zinc-400">Platform automatically sends offers to next batch until filled</span>
            </div>
          </div>

          {/* Smart Budget Estimator Widget */}
          <div className=" border border-slate-200/80 rounded-xl p-4 flex flex-col gap-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-semibold text-zinc-300">Smart Budget Recommender</span>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                Estimated range: <span className="text-zinc-100 font-bold">₹{estMin} - ₹{estMax}</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="range"
                  min={1000}
                  max={10000}
                  step="50"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full cursor-pointer"
                  style={{ '--pct': `${((budget - 1000) / 9000) * 100}%` } as React.CSSProperties}
                />
              </div>
              <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-1.5 font-mono text-base font-bold text-zinc-100 flex items-center min-w-[80px] justify-center">
                ₹
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={budget}
                    initial={{ scale: 0.8, opacity: 0, y: 5 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: -5 }}
                  >
                    {budget}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Cost Summary Widget */}
          <div className="bg-transparent border border-[rgba(255,255,255,0.08)] rounded-xl p-4 flex flex-col gap-3 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-zinc-300">Cost Summary</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 p-3 rounded-lg border border-[rgba(255,255,255,0.08)]" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Total Campaign Budget</span>
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={budget}
                    initial={{ opacity: 0, scale: 0.9, filter: 'brightness(2)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'brightness(1)' }}
                    transition={{ duration: 0.3 }}
                    className="text-lg font-black text-transparent bg-clip-text text-gradient-mint font-mono"
                  >
                    <AnimatedNumber prefix="₹" value={budget} />
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-lg border border-[rgba(99,102,241,0.2)]" style={{ background: 'rgba(99,102,241,0.10)' }}>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">Final Cost Per Creator</span>
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={spotsTotal > 0 ? Math.round(budget / spotsTotal) : 0}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-lg font-black text-indigo-400 font-mono"
                  >
                    <AnimatedNumber prefix="₹" value={spotsTotal > 0 ? Math.round(budget / spotsTotal) : 0} />
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Escrow Contract Terms Notice & Balance */}
          <div className="border border-[rgba(255,255,255,0.08)] rounded-xl p-4 flex flex-col gap-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5 flex-1">
                <div className="flex justify-between items-center w-full">
                  <span className="text-sm font-bold text-zinc-100">Automated Escrow Protocol</span>
                  <div className="bg-transparent border border-[rgba(255,255,255,0.08)] px-2 py-1 rounded-md flex items-center gap-1.5">
                    <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Wallet Balance:</span>
                    <span className="text-sm font-mono font-bold text-emerald-400">₹{currentUser?.escrowBalance || 0}</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 leading-normal mt-1">
                  Your budget of <span className="font-semibold text-zinc-100">₹{budget}</span> will be locked in smart escrow. A 5% platform fee is deducted — creators share <span className="font-semibold text-zinc-100">₹{Math.round(budget * 0.95)}</span> equally, so each creator receives <span className="font-semibold text-emerald-400">₹{spotsTotal > 0 ? Math.round((budget * 0.95) / spotsTotal) : '—'}</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {(currentUser?.escrowBalance || 0) < budget ? (
            <button
              onClick={() => handleDeposit(budget - (currentUser?.escrowBalance || 0))}
              disabled={isDepositing}
              className={`w-full py-4 px-8 rounded-xl font-display font-medium text-base flex items-center justify-center gap-2 transition-all ${
                isDepositing
                  ? 'bg-[rgba(255,255,255,0.05)] text-zinc-400 cursor-not-allowed border border-[rgba(255,255,255,0.08)]'
                  : 'btn-primary active:scale-[0.97] cursor-pointer'
              }`}
            >
              {isDepositing ? (
                <>
                  <div className="w-5 h-5 border-2 border-zinc-500/30 border-t-zinc-300 rounded-full animate-spin" />
                  <span>Processing Deposit...</span>
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 fill-current" />
                  <span>Deposit ₹{budget - (currentUser?.escrowBalance || 0)} to Escrow Account via Razorpay</span>
                </>
              )}
            </button>
          ) : (
            <motion.button
              whileHover={{ scale: isActivating ? 1 : 1.01, y: isActivating ? 0 : -1, boxShadow: isActivating ? 'none' : '0 0 40px rgba(99,102,241,0.6)' }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLaunchCampaign}
              disabled={isActivating}
              className={`relative overflow-hidden w-full py-4 px-8 rounded-xl font-bold text-base flex items-center justify-center gap-2.5 transition-all ${
                isActivating
                  ? 'opacity-70 cursor-not-allowed'
                  : 'btn-primary cursor-pointer'
              }`}
              style={isActivating ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-text-tertiary)' } : {}}
            >
              {!isActivating && <div className="absolute inset-0 w-[200%] opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)', animation: 'shimmer-fill 3s linear infinite' }} />}
              {isActivating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/25 border-t-white rounded-full animate-spin relative z-10" />
                  <span className="relative z-10">Activating Node...</span>
                </>
              ) : (
                <>
                  <Radio className="w-5 h-5 animate-pulse relative z-10" />
                  <span className="relative z-10 text-white drop-shadow-md">LAUNCH CAMPAIGN</span>
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>
          )}

          {activeSubTab === 'dispatch' && (
            <>
            <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-4 mb-6">
          <div>
            <h3 className="text-lg font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Campaign Dispatch Tracking Room</h3>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              Watch programmatic queues send offers to Batch A (Priority), then Batch B, then Batch C.
            </p>
          </div>
        </div>

        {activeCampaigns.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center justify-center border border-dashed border-zinc-200 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <Radio className="w-8 h-8 text-zinc-300 animate-pulse mb-3" />
            <span className="text-sm font-medium text-zinc-400">No active localized flash activations running.</span>
            <p className="text-xs text-zinc-400 mt-1 max-w-[280px]">
              Use the campaign setup card above to lock budget and launch one.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {activeCampaigns.map((camp) => {
              const isCollapsed = collapsedCampaigns[camp.id] ?? true;
              return (
              <div key={camp.id} className="border border-[rgba(255,255,255,0.08)] rounded-xl flex flex-col transition-all bg-transparent overflow-hidden">
                {/* Header info */}
                <div 
                  className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-colors ${!isCollapsed ? 'border-b border-[rgba(255,255,255,0.08)]' : ''}`}
                  onClick={() => setCollapsedCampaigns(prev => ({ ...prev, [camp.id]: !(prev[camp.id] ?? true) }))}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-zinc-100">{camp.title}</h4>
                      <span className=" text-zinc-400 font-mono text-[11px] px-2 py-0.5 rounded border border-zinc-200" style={{ background: 'rgba(255,255,255,0.05)' }}>
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
                      <span className="text-sm font-bold text-emerald-400 font-mono flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        ₹{camp.budget}
                      </span>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-[11px] uppercase font-mono tracking-wider text-zinc-400">Campaign Status</span>
                      <span className="text-sm font-bold text-indigo-400 bg-[rgba(99,102,241,0.08)] px-2 py-0.5 rounded border border-[rgba(99,102,241,0.2)]">
                        {camp.batches.length > 0 
                          ? `Batch ${String.fromCharCode(65 + camp.activeBatchIndex)} Active` 
                          : (now - camp.createdAt > 3000 ? 'No Matches' : 'Initializing')}
                      </span>
                    </div>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this campaign? The locked budget will be refunded to your escrow balance.')) {
                          try {
                            await deleteCampaign({ campaignId: camp.id as Id<'campaigns'> });
                          } catch (err) {
                            console.error('Failed to delete campaign:', err);
                            alert('Failed to delete campaign.');
                          }
                        }
                      }}
                      className="ml-4 text-zinc-400 hover:text-rose-400 hover:bg-[rgba(239,68,68,0.08)] flex items-center justify-center w-8 h-8 rounded-full transition-colors"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="ml-2 text-zinc-400 flex items-center justify-center w-8 h-8 rounded-full hover: transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="p-5 flex flex-col gap-6 bg-transparent">
                    {/* Programmatic Batch Timeline Track */}
                {camp.batches.length === 0 ? (
                  (now - camp.createdAt > 3000) ? (
                    <div className="border border-rose-100 rounded-xl p-8 flex flex-col items-center justify-center gap-3" style={{ background: 'rgba(239,68,68,0.08)' }}>
                      <div className="w-12 h-12 bg-transparent rounded-full flex items-center justify-center shadow-sm border border-rose-100">
                        <AlertTriangle className="w-5 h-5 text-rose-400" />
                      </div>
                      <span className="text-sm font-bold text-rose-200">Zero Target Nodes Located</span>
                      <p className="text-xs text-rose-400/80 text-center max-w-sm">
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
                        className="mt-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-colors"
                      >
                        Rerun Engine
                      </button>
                    </div>
                  ) : (
                    <div className="border border-[rgba(99,102,241,0.2)] rounded-xl p-8 flex flex-col items-center justify-center gap-3" style={{ background: 'rgba(99,102,241,0.06)' }}>
                      <div className="w-6 h-6 border-2 border-[rgba(99,102,241,0.3)] border-t-indigo-600 rounded-full animate-spin" />
                      <span className="text-sm font-bold text-indigo-200">Matching Engine Running...</span>
                      <p className="text-xs text-indigo-400/70 text-center max-w-sm">
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
                            ? 'border-indigo-500/60'
                            : isPassed
                            ? 'border-[rgba(255,255,255,0.06)] opacity-50'
                            : 'border-[rgba(255,255,255,0.04)] opacity-30'
                        }`}
                        style={{
                          background: isCurrent
                            ? 'rgba(99,102,241,0.1)'
                            : isPassed
                            ? 'rgba(255,255,255,0.02)'
                            : 'rgba(255,255,255,0.01)'
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isCurrent
                                  ? 'bg-indigo-600 animate-pulse'
                                  : isPassed
                                  ? 'bg-zinc-500'
                                  : 'bg-zinc-600'
                              }`}
                            />
                            {batch.name}
                          </span>
                          {isCurrent ? (
                            <span className="bg-indigo-100 text-indigo-400 text-[11px] font-mono px-2 py-0.5 rounded font-bold animate-pulse">
                              DISPATCHED
                            </span>
                          ) : isPassed ? (
                            <span className="text-zinc-400 text-[11px] font-mono font-medium">
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
                                  className="flex items-center gap-1 bg-transparent border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.08)] px-1.5 py-0.5 rounded-lg text-[11px] cursor-pointer transition-all shrink-0"
                                  title={`Click to view ${creator.name}`}
                                >
                                  <img
                                    src={creator.avatar}
                                    alt={creator.name}
                                    className="w-4.5 h-4.5 rounded-full object-cover referrerPolicy='no-referrer'"
                                  />
                                  <span className="font-medium text-zinc-300">{creator.name.split(' ')[0]}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {isCurrent && (
                          <div className="mt-2 flex flex-col gap-2">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-zinc-400 font-medium">Remaining Priority Window:</span>
                              <span className="text-indigo-400 font-mono font-bold animate-pulse">
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

      {/* Fake Razorpay Checkout Modal for Demo */}
      {fakeRazorpayData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-transparent w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            {/* Header */}
            <div className="bg-[#3366cc] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-transparent rounded flex items-center justify-center">
                  <div className="w-3 h-3 bg-[#3366cc] rounded-sm transform rotate-45"></div>
                </div>
                <span className="text-white font-bold tracking-wide text-lg">Razorpay</span>
              </div>
              <button onClick={() => setFakeRazorpayData(null)} className="text-white/70 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-8 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-[#3366cc] rounded-full animate-spin mb-2" />
              <div className="text-center">
                <h4 className="text-lg font-bold text-zinc-100 mb-1">Processing Payment</h4>
                <p className="text-sm text-zinc-400">Please wait while we secure your escrow...</p>
              </div>
              <div className="w-full rounded-xl border border-[rgba(255,255,255,0.08)] p-4 mt-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-zinc-400">Amount payable</span>
                  <span className="font-bold text-zinc-100 font-mono">₹{fakeRazorpayData.amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Order</span>
                  <span className="font-mono text-zinc-400 text-xs mt-0.5">{fakeRazorpayData.orderId.split('_').slice(-1)}</span>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-5 py-3 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-center gap-1.5 text-xs text-zinc-400 font-medium" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Secure Checkout (Demo Mode)
            </div>
          </div>
        </div>
      )}

      </>
          )}

          {activeSubTab === 'analytics' && (
            <div className="flex flex-col gap-6">
        {/* Quick Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0, duration: 0.35 }}
            className="glass-2 rounded-2xl p-6 flex flex-col gap-3 card-hover"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--color-text-tertiary)' }}>Campaigns Launched</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
                <Activity className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <span className="text-4xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}><AnimatedNumber value={analytics.campaignsLaunched} /></span>
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Localized flash activations deployed.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07, duration: 0.35 }}
            className="glass-2 rounded-2xl p-6 flex flex-col gap-3 card-hover"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--color-text-tertiary)' }}>Total Escrow Secured</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <span className="text-4xl font-bold tracking-tight font-mono" style={{ color: 'var(--color-mint-bright)' }}><AnimatedNumber prefix="₹" value={analytics.totalEscrowSecured} /></span>
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>100% cryptographic protection active.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14, duration: 0.35 }}
            className="glass-2 rounded-2xl p-6 flex flex-col gap-3 card-hover"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--color-text-tertiary)' }}>Avg Pay Per View</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
                <TrendingUp className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <span className="text-4xl font-bold tracking-tight font-mono" style={{ color: 'var(--color-violet-bright)' }}>₹{analytics.averagePayPerView}</span>
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Cost efficiency by campaign history.</p>
          </motion.div>
        </div>

        {/* Chart + Roster Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Past Campaigns */}
          <div className="lg:col-span-7 glass-card p-6 flex flex-col gap-6">
            <div>
              <h3 className="text-base font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Past Campaigns</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>Historical pay per view and performance metrics.</p>
            </div>

            <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 font-sans">
              {analytics.pastCampaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed border-[rgba(255,255,255,0.1)]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="text-sm font-medium text-zinc-400 mb-1">No Past Campaigns</span>
                  <span className="text-[11px] text-zinc-400">Launch a new campaign to see performance metrics.</span>
                </div>
              ) : (
                analytics.pastCampaigns.map((camp: any) => (
                  <div key={camp.id} className="p-4 border border-[rgba(255,255,255,0.08)] rounded-xl flex items-center justify-between hover:bg-[rgba(255,255,255,0.04)] transition-colors">
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-zinc-100">{camp.title}</span>
                      <span className="text-xs text-zinc-400 font-mono mt-1">{camp.date} • {(camp.views / 1000).toFixed(1)}k views</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider mb-1">PPV</span>
                      <span className="text-sm font-mono font-bold text-emerald-400 bg-[rgba(16,185,129,0.08)] px-2.5 py-1 rounded-lg border border-[rgba(16,185,129,0.2)]">
                        ₹{camp.ppv}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Frequent Creators */}
          <div className="lg:col-span-5 glass-card p-6 flex flex-col gap-4">
            <div>
              <h3 className="text-base font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Frequent Creators</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>Top-performing partners in your network.</p>
            </div>

            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1 font-sans">
              {frequentCreators.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed border-[rgba(255,255,255,0.1)]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="text-sm font-medium text-zinc-400 mb-1">No Frequent Creators</span>
                  <span className="text-[11px] text-zinc-400">Launch campaigns to build your network.</span>
                </div>
              ) : (
                frequentCreators.map((creator: any) => (
                  <div key={creator.id || creator._id} className="p-3 border border-[rgba(255,255,255,0.08)] rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={creator.avatar || creator.avatarUrl} alt={creator.name} className="w-8 h-8 rounded-full object-cover border border-[rgba(255,255,255,0.08)] referrerPolicy='no-referrer'" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-zinc-100">{creator.name}</span>
                        <span className="text-[11px] text-zinc-400 font-mono">{creator.locality}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider mb-0.5">Worked on</span>
                      <span className="text-sm font-mono font-bold text-indigo-400 bg-[rgba(99,102,241,0.08)] px-2 py-0.5 rounded border border-[rgba(99,102,241,0.2)]">{creator.overlap} {creator.overlap === 1 ? 'camp' : 'camps'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
