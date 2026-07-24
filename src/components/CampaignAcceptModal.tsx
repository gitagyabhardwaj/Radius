import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, CheckCircle2, ShieldCheck, MapPin, Zap, ChevronRight, PenTool } from 'lucide-react';
import { Campaign } from '../types';

interface CampaignAcceptModalProps {
  campaign: (Campaign & { distance?: string; matchScore?: number }) | null;
  onClose: () => void;
  onAccept: (camp: Campaign) => void;
}

export const CampaignAcceptModal: React.FC<CampaignAcceptModalProps> = ({ campaign, onClose, onAccept }) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  return (
    <AnimatePresence>
      {campaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Dynamic glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 p-6 sm:p-8 flex items-center justify-between border-b border-white/5">
              <div className="flex flex-col gap-1">
                <h3 className="text-2xl font-display font-black text-white flex items-center gap-2">
                  <FileText className="w-6 h-6 text-indigo-400" />
                  Contract Review
                </h3>
                <p className="text-sm text-zinc-400">Review terms before initiating escrow.</p>
              </div>
              <button
                onClick={onClose}
                className="p-3 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div
              className="relative z-10 flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col gap-8 custom-scrollbar"
              onScroll={(e) => {
                const target = e.target as HTMLDivElement;
                if (target.scrollHeight - target.scrollTop <= target.clientHeight + 10) {
                  setHasScrolledToBottom(true);
                }
              }}
            >
              {/* Campaign Header Info */}
              <div className="flex flex-col gap-4 bg-white/[0.02] border border-white/5 p-6 rounded-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-display font-black text-xl text-white">
                      {campaign.brandName.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{campaign.brandName}</span>
                      <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Verified Brand</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono tracking-widest text-emerald-500/70 uppercase">Escrow Value</span>
                    <span className="text-2xl font-display font-black text-emerald-400">₹{campaign.budget}</span>
                  </div>
                </div>

                <div className="h-px w-full bg-white/5 my-2" />

                <div>
                  <h4 className="text-xl font-bold text-white mb-2">{campaign.title}</h4>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {campaign.deliverable || `Create a localized social media post for ${campaign.brandName}. The content must align with your niche (${campaign.niche}) and target audience.`}
                  </p>
                </div>
              </div>

              {/* Data Points */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-zinc-500 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-wider font-bold">Target Zone</span>
                  </div>
                  <span className="text-sm text-white font-medium">{campaign.centerLocality || 'Global'}</span>
                  {campaign.distance && <span className="text-xs text-indigo-400 font-mono">{campaign.distance} away</span>}
                </div>
                
                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-zinc-500 mb-2">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-wider font-bold">Match Score</span>
                  </div>
                  <span className="text-sm text-white font-medium">{campaign.matchScore || 90}% Match</span>
                  <span className="text-xs text-indigo-400 font-mono">High Alignment</span>
                </div>
              </div>

              {/* Advanced Professional Requirements */}
              {(campaign.contentFormat || campaign.targetAudience || campaign.creativeGuidelines) && (
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col gap-4">
                  <h4 className="text-sm font-mono uppercase tracking-widest text-zinc-500 font-bold mb-1">Campaign Requirements</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {campaign.contentFormat && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] text-zinc-500 uppercase tracking-wider">Format</span>
                        <span className="text-sm text-zinc-300 font-medium">{campaign.contentFormat}</span>
                      </div>
                    )}
                    {campaign.targetAudience && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] text-zinc-500 uppercase tracking-wider">Target Audience</span>
                        <span className="text-sm text-zinc-300 font-medium">{campaign.targetAudience}</span>
                      </div>
                    )}
                    {campaign.submissionDeadlineDays && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] text-zinc-500 uppercase tracking-wider">Deadline</span>
                        <span className="text-sm text-zinc-300 font-medium">{campaign.submissionDeadlineDays} days</span>
                      </div>
                    )}
                  </div>
                  
                  {campaign.creativeGuidelines && (
                    <div className="flex flex-col gap-1 mt-2 pt-4 border-t border-white/5">
                      <span className="text-[11px] text-zinc-500 uppercase tracking-wider">Creative Guidelines</span>
                      <p className="text-sm text-zinc-400 italic">"{campaign.creativeGuidelines}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* Terms */}
              <div className="flex flex-col gap-4">
                <h4 className="text-sm font-mono uppercase tracking-widest text-zinc-500 font-bold">Protocol Terms</h4>
                
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      <strong className="text-white">Escrow Guarantee:</strong> The brand has already deposited ₹{campaign.budget} into a smart escrow. The funds are locked and guaranteed to be paid upon approval.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      <strong className="text-white">Instant Release:</strong> Once you upload your deliverable and the brand approves it, the funds are instantly released to your linked bank account.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      <strong className="text-white">Fair Usage:</strong> You retain ownership of the content. The brand is granted a license to use the content for marketing purposes as outlined in the campaign brief.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer / Action */}
            <div className="relative z-10 p-6 sm:p-8 border-t border-white/5 bg-zinc-950/80 backdrop-blur-xl">
              <button
                onClick={() => {
                  onAccept(campaign);
                }}
                className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] hover:shadow-[0_0_60px_-15px_rgba(99,102,241,0.7)] group"
              >
                <PenTool className="w-5 h-5" />
                <span>Sign & Accept Contract</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-center text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-4 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Secured by Radius Protocol
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
