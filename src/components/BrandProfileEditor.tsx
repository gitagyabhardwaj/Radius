import React, { useState } from 'react';
import { ShieldCheck, Plus, Trash2, Link as LinkIcon, Instagram, User, Phone, Image as ImageIcon, FileText } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function BrandProfileEditor({ 
  currentUser, 
  customBrandName, 
  setCustomBrandName, 
  setBrandName,
  signOut
}: any) {
  const updateProfile = useMutation(api.users.updateProfile);
  const deleteCurrentUser = useMutation(api.users.deleteCurrentUser);
  
  const [profileSaveStatus, setProfileSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const [teamMembers, setTeamMembers] = useState(currentUser?.teamMembers || []);
  const [otherSocialLinks, setOtherSocialLinks] = useState(currentUser?.otherSocialLinks || []);
  
  const [logoUrl, setLogoUrl] = useState(currentUser?.brandAssets?.logoUrl || '');
  const [guidelinesDocUrl, setGuidelinesDocUrl] = useState(currentUser?.brandAssets?.guidelinesDocUrl || '');
  const [productImages, setProductImages] = useState<string[]>(currentUser?.brandAssets?.productImages || []);
  const [newProductImage, setNewProductImage] = useState('');

  const handleSave = async () => {
    setProfileSaveStatus('saving');
    try {
      const nameInput = document.getElementById('brand-profile-name-input') as HTMLInputElement;
      const domainInput = document.getElementById('brand-profile-domain-input') as HTMLInputElement;
      const sectorSelect = document.getElementById('brand-profile-sector-select') as HTMLSelectElement;
      const bioTextarea = document.getElementById('brand-profile-bio-textarea') as HTMLTextAreaElement;
      const handleInput = document.getElementById('brand-profile-handle-input') as HTMLInputElement;
      
      const contactPersonInput = document.getElementById('brand-profile-contact-person') as HTMLInputElement;
      const contactPhoneInput = document.getElementById('brand-profile-contact-phone') as HTMLInputElement;
      const websiteInput = document.getElementById('brand-profile-website') as HTMLInputElement;

      await updateProfile({
        brandName: nameInput?.value,
        domain: domainInput?.value,
        sector: sectorSelect?.value,
        bio: bioTextarea?.value,
        instagramHandle: handleInput?.value,
        contactPerson: contactPersonInput?.value,
        contactPhone: contactPhoneInput?.value,
        website: websiteInput?.value,
        teamMembers,
        otherSocialLinks,
        brandAssets: {
          logoUrl,
          guidelinesDocUrl,
          productImages
        }
      });
      setProfileSaveStatus('saved');
      setTimeout(() => setProfileSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setProfileSaveStatus('error');
      setTimeout(() => setProfileSaveStatus('idle'), 3000);
    }
  };

  return (
    <div className="lg:col-span-7 bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl p-8 flex flex-col gap-6 transition-glass">
      {/* Existing Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-display font-semibold font-semibold text-white font-mono uppercase">Brand Identity & Node Settings</h2>
          <p className="text-sm text-white mt-0.5">
            Manage your public brand workspace details, authorized contacts, and cryptographically linked release settings.
          </p>
        </div>
        <span className="bg-emerald-400 text-black text-sm px-2.5 py-1 rounded-2xl font-semibold border border-emerald-500 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          Verified Node
        </span>
      </div>

      {/* Brand Identity */}
      <div className="flex flex-col gap-5">
        <h3 className="text-sm font-sans tracking-wider text-white font-bold font-mono uppercase">Basic Identity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-sans tracking-wider text-white font-bold">Brand Corporate Name</label>
            <input
              id="brand-profile-name-input"
              type="text"
              value={customBrandName || ''}
              onChange={(e) => {
                setCustomBrandName(e.target.value);
                if (setBrandName) setBrandName(e.target.value);
              }}
              className="w-full bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-zinc-800 focus:bg-zinc-900 transition-colors font-bold"
              placeholder="e.g. Blue Tokai Coffee"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-sans tracking-wider text-white font-bold">Primary Market Sector</label>
            <select
              id="brand-profile-sector-select"
              defaultValue={currentUser?.sector || "Food & Lifestyle"}
              className="w-full bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-zinc-800 focus:bg-zinc-900 transition-colors"
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
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-sans tracking-wider text-white font-bold">Brand Bio / Description</label>
            <textarea
              id="brand-profile-bio-textarea"
              rows={3}
              defaultValue={currentUser?.bio || ''}
              className="w-full bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-zinc-800 focus:bg-zinc-900 transition-colors resize-none leading-relaxed"
              placeholder="Tell creators who you are and what you stand for..."
            />
          </div>
        </div>
      </div>

      {/* Contact & Account */}
      <div className="flex flex-col gap-5 pt-5 border-t border-zinc-800">
        <h3 className="text-sm font-sans tracking-wider text-white font-bold font-mono uppercase">Contact & Account</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-sans tracking-wider text-white font-bold flex items-center gap-1"><User className="w-3.5 h-3.5"/> Primary Contact Person</label>
            <input
              id="brand-profile-contact-person"
              type="text"
              defaultValue={currentUser?.contactPerson || ''}
              className="w-full bg-zinc-900/70 border border-zinc-800/50 rounded-2xl px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-zinc-800 transition-colors"
              placeholder="e.g. Jane Doe"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-sans tracking-wider text-white font-bold flex items-center gap-1"><Phone className="w-3.5 h-3.5"/> Contact Phone</label>
            <input
              id="brand-profile-contact-phone"
              type="text"
              defaultValue={currentUser?.contactPhone || ''}
              className="w-full bg-zinc-900/70 border border-zinc-800/50 rounded-2xl px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-zinc-800 transition-colors"
              placeholder="+91..."
            />
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-sans tracking-wider text-white font-bold">Team Members / Sub-Accounts</label>
            <div className="flex flex-col gap-2">
              {teamMembers.map((tm: any, i: number) => (
                <div key={i} className="flex gap-2 items-center bg-zinc-900 p-2 rounded-2xl border border-zinc-800">
                  <input value={tm.name} onChange={e => { const newTm = [...teamMembers]; newTm[i].name = e.target.value; setTeamMembers(newTm); }} placeholder="Name" className="bg-transparent text-sm text-white flex-1 outline-none" />
                  <input value={tm.email} onChange={e => { const newTm = [...teamMembers]; newTm[i].email = e.target.value; setTeamMembers(newTm); }} placeholder="Email" className="bg-transparent text-sm text-white flex-1 outline-none border-l border-zinc-800 pl-2" />
                  <input value={tm.role} onChange={e => { const newTm = [...teamMembers]; newTm[i].role = e.target.value; setTeamMembers(newTm); }} placeholder="Role" className="bg-transparent text-sm text-white flex-1 outline-none border-l border-zinc-800 pl-2" />
                  <button onClick={() => setTeamMembers(teamMembers.filter((_, idx: number) => idx !== i))} className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <button onClick={() => setTeamMembers([...teamMembers, { name: '', email: '', role: '' }])} className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 w-fit mt-1"><Plus className="w-3.5 h-3.5" /> Add Team Member</button>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Presence & Links */}
      <div className="flex flex-col gap-5 pt-5 border-t border-zinc-800">
        <h3 className="text-sm font-sans tracking-wider text-white font-bold font-mono uppercase">Brand Presence</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-sans tracking-wider text-white font-bold flex items-center gap-1"><LinkIcon className="w-3.5 h-3.5"/> Website / Corporate Domain</label>
            <input
              id="brand-profile-website"
              type="text"
              defaultValue={currentUser?.website || currentUser?.domain || ''}
              className="w-full bg-zinc-900/70 border border-zinc-800/50 rounded-2xl px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-zinc-800 transition-colors"
              placeholder="e.g. brand.com"
            />
            <input id="brand-profile-domain-input" type="hidden" value={currentUser?.domain || ''} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-sans tracking-wider text-white font-bold flex items-center gap-1"><Instagram className="w-3.5 h-3.5"/> Instagram Handle</label>
            <input
              id="brand-profile-handle-input"
              type="text"
              defaultValue={currentUser?.instagramHandle || currentUser?.handle || ''}
              className="w-full bg-zinc-900/70 border border-zinc-800/50 rounded-2xl px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-zinc-800 transition-colors"
              placeholder="e.g. @bluetokaicoffee"
            />
          </div>
          
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-sans tracking-wider text-white font-bold">Other Social Links</label>
            <div className="flex flex-col gap-2">
              {otherSocialLinks.map((link: any, i: number) => (
                <div key={i} className="flex gap-2 items-center bg-zinc-900 p-2 rounded-2xl border border-zinc-800">
                  <input value={link.platform} onChange={e => { const newL = [...otherSocialLinks]; newL[i].platform = e.target.value; setOtherSocialLinks(newL); }} placeholder="Platform (e.g. YouTube)" className="bg-transparent text-sm text-white flex-1 outline-none" />
                  <input value={link.url} onChange={e => { const newL = [...otherSocialLinks]; newL[i].url = e.target.value; setOtherSocialLinks(newL); }} placeholder="URL" className="bg-transparent text-sm text-white flex-[2] outline-none border-l border-zinc-800 pl-2" />
                  <button onClick={() => setOtherSocialLinks(otherSocialLinks.filter((_, idx: number) => idx !== i))} className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <button onClick={() => setOtherSocialLinks([...otherSocialLinks, { platform: '', url: '' }])} className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 w-fit mt-1"><Plus className="w-3.5 h-3.5" /> Add Social Link</button>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Assets Library */}
      <div className="flex flex-col gap-5 pt-5 border-t border-zinc-800">
        <h3 className="text-sm font-sans tracking-wider text-white font-bold font-mono uppercase">Brand Assets Library</h3>
        <p className="text-xs text-white/70 -mt-3">Provide hosted URLs for creators to download your brand assets (logos, images, guidelines).</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-sans tracking-wider text-white font-bold flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5"/> Vector Logo URL</label>
            <input
              type="text"
              value={logoUrl}
              onChange={e => setLogoUrl(e.target.value)}
              className="w-full bg-zinc-900/70 border border-zinc-800/50 rounded-2xl px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-zinc-800 transition-colors"
              placeholder="e.g. https://.../logo.png"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-sans tracking-wider text-white font-bold flex items-center gap-1"><FileText className="w-3.5 h-3.5"/> Brand Guidelines Doc URL</label>
            <input
              type="text"
              value={guidelinesDocUrl}
              onChange={e => setGuidelinesDocUrl(e.target.value)}
              className="w-full bg-zinc-900/70 border border-zinc-800/50 rounded-2xl px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-zinc-800 transition-colors"
              placeholder="e.g. Notion or Google Drive Link"
            />
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-sans tracking-wider text-white font-bold">Product Images (URLs)</label>
            <div className="flex flex-col gap-2">
              {productImages.map((img: string, i: number) => (
                <div key={i} className="flex gap-2 items-center bg-zinc-900 p-2 rounded-2xl border border-zinc-800">
                  <ImageIcon className="w-4 h-4 text-zinc-500 ml-1" />
                  <input value={img} onChange={e => { const newI = [...productImages]; newI[i] = e.target.value; setProductImages(newI); }} className="bg-transparent text-sm text-white flex-1 outline-none" />
                  <button onClick={() => setProductImages(productImages.filter((_, idx: number) => idx !== i))} className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <div className="flex gap-2 mt-1">
                <input 
                  value={newProductImage} 
                  onChange={e => setNewProductImage(e.target.value)} 
                  placeholder="Add new image URL..." 
                  className="bg-zinc-900 border border-zinc-800 text-sm text-white flex-1 outline-none px-3 py-2 rounded-2xl"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newProductImage.trim()) {
                      setProductImages([...productImages, newProductImage.trim()]);
                      setNewProductImage('');
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    if (newProductImage.trim()) {
                      setProductImages([...productImages, newProductImage.trim()]);
                      setNewProductImage('');
                    }
                  }}
                  className="bg-indigo-500/20 text-indigo-400 px-3 rounded-2xl font-bold text-xs"
                >Add</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-5 flex flex-col gap-4">
        <h3 className="text-sm font-sans tracking-wider text-white font-bold font-mono uppercase">Secure Escrow Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-sans tracking-wider text-white font-bold flex items-center gap-1">
              <span className="text-white">₹</span> Funding Escrow Wallet
            </label>
            <input
              id="brand-profile-wallet-input"
              type="text"
              defaultValue="0x3FaA881c62bE09C137119E15b8c9d09c31F7B92"
              className="w-full bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-zinc-800 focus:bg-zinc-900 transition-colors"
              placeholder="0x..."
              disabled
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-sans tracking-wider text-white font-bold">Escrow Release Mechanism</label>
            <div className="flex items-center justify-between p-2.5 bg-zinc-900 rounded-2xl border border-zinc-800">
              <span className="text-sm text-white font-bold">Manual Brand Verification</span>
              <span className="bg-amber-100 text-amber-800 border border-amber-200 font-mono text-[11px] px-2 py-0.5 rounded-2xl font-bold uppercase tracking-wider">
                MANUAL
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-4 flex justify-end items-center gap-3">
        {profileSaveStatus === 'saved' && (
          <span className="text-sm text-white font-bold animate-fade-in">Settings saved successfully!</span>
        )}
        {profileSaveStatus === 'error' && (
          <span className="text-sm text-red-600 font-bold animate-fade-in">Failed to save. Try again.</span>
        )}
        <button
          onClick={handleSave}
          disabled={profileSaveStatus === 'saving'}
          className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-mono text-sm rounded-2xl font-bold tracking-wider uppercase transition-all shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:scale-100"
        >
          {profileSaveStatus === 'saving' ? 'SAVING...' : 'COMMIT PROFILE CHANGES'}
        </button>
      </div>
      
      <div className="border-t border-rose-100/50 pt-6 mt-4 flex flex-col gap-3">
        <h3 className="text-sm font-sans tracking-wider text-white font-bold font-mono uppercase">Danger Zone</h3>
        <div className="flex items-center justify-between bg-rose-50/50 border border-rose-100 p-4 rounded-2xl">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">Delete Account</span>
            <span className="text-xs text-white">Permanently delete your profile and reset your role.</span>
          </div>
          <button
            onClick={async () => {
              if (confirm("Are you sure you want to completely delete your profile? This cannot be undone.")) {
                await deleteCurrentUser();
                signOut();
              }
            }}
            className="py-2 px-4 bg-zinc-900 border border-rose-200 text-white hover:bg-rose-50 font-mono text-xs rounded-2xl font-bold transition-all"
          >
            DELETE PROFILE
          </button>
        </div>
      </div>
    </div>
  );
}
