import re

with open('src/components/CreatorWorkspace.tsx', 'r') as f:
    content = f.read()

# Add handleSubmitPublishedLink
func_to_add = """
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
"""

content = content.replace("  // Process Payout via Smart Contract Release", func_to_add + "\n  // Process Payout via Smart Contract Release")

# Now the JSX part. We need to replace from {!submission ? ( ... ) : submission.status === 'uploaded' ... ) : submission.status === 'rejected' ? ( ... ) : ( ... )}
# Instead of regex, I will just locate the exact string segments and replace them, or write a custom regex.

# We are replacing the `{!submission ? (` block up to `)}`
# Let's find the indices.
start_idx = content.find("{!submission ? (")
end_idx = content.find("                        </div>\n                      </div>\n                    </motion.div>", start_idx)

if start_idx == -1 or end_idx == -1:
    print("Could not find the JSX block!")
    exit(1)

new_jsx = """{!submission || submission.status === 'draft_rejected' ? (
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
                          <span className="text-white font-bold">{camp.brandName}</span> approved your final post. Budget of{' '}
                          <span className="text-emerald-400 font-bold">₹{camp.budget}</span> has been transferred directly into your creator account.
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
                  )}"""

content = content[:start_idx] + new_jsx + "\n" + content[end_idx:]

with open('src/components/CreatorWorkspace.tsx', 'w') as f:
    f.write(content)

print("Patched successfully")
