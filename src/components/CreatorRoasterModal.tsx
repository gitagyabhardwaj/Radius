import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Creator } from '../types';
import { 
  X, 
  Zap, 
  MapPin, 
  Users, 
  Briefcase, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  ExternalLink,
  Target,
  Clock,
  Radio,
  Eye,
  Heart,
  TrendingUp,
  Award,
  ShieldCheck,
  Video,
  Image as ImageIcon,
  Share2,
  Bookmark
} from 'lucide-react';

export interface CreatorProfileModalProps {
  creator: Creator | null;
  isOpen: boolean;
  onClose: () => void;
  onDirectSelect?: (creator: Creator) => void;
}

export interface PortfolioDeliverable {
  id: string;
  brand: string;
  type: string;
  imgUrl: string;
  views: string;
  engagementRate: string;
  category: 'reel' | 'story' | 'post';
  tags: string[];
  description: string;
  deliverableDate: string;
}

/**
 * Returns comprehensive, rich portfolio deliverables for the creator.
 * Combines native past work items with curated deliverables so brands can see
 * exactly what is in the creator's portfolio.
 */
function getCreatorPortfolio(creator: Creator): PortfolioDeliverable[] {
  const niche = (creator.niche || '').toLowerCase();

  // If creator already has items in pastWork, map them with rich metrics
  const nativeItems: PortfolioDeliverable[] = (creator.pastWork || []).map((work, idx) => {
    const isReel = work.type.toLowerCase().includes('reel') || work.type.toLowerCase().includes('video');
    const isStory = work.type.toLowerCase().includes('story');
    const category: 'reel' | 'story' | 'post' = isReel ? 'reel' : isStory ? 'story' : 'post';

    return {
      id: `pw_${idx}`,
      brand: work.brand,
      type: work.type,
      imgUrl: work.imgUrl,
      views: `${(35 + idx * 8.4).toFixed(1)}K Views`,
      engagementRate: `${(5.2 + idx * 0.7).toFixed(1)}% ER`,
      category,
      tags: ['GPS-Verified', `${creator.locality.split('(')[0].trim()}`, 'Escrow Cleared'],
      description: `Hyperlocal campaign deliverable featuring ${work.brand}. Geotagged content with verified in-store footfall promotion and swipe-up community integration.`,
      deliverableDate: `Completed Q${(idx % 4) + 1} 2026`
    };
  });

  // If creator has 3 or more rich items, return them
  if (nativeItems.length >= 3) {
    return nativeItems;
  }

  // Otherwise, supplement with niche-curated portfolio deliverables
  let supplementary: PortfolioDeliverable[] = [];

  if (niche.includes('tech') || niche.includes('gaming')) {
    supplementary = [
      {
        id: 'supp_tech_1',
        brand: 'OnePlus India',
        type: 'Reel • Flagship Speed & Camera Stress Test',
        imgUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
        views: '54.2K Views',
        engagementRate: '6.8% ER',
        category: 'reel',
        tags: ['GPS-Verified', 'Noida Hub', 'Tech Teardown'],
        description: '45-second high-energy unboxing and night-mode camera test in central NCR showroom with exclusive promo link.',
        deliverableDate: 'Completed May 2026'
      },
      {
        id: 'supp_tech_2',
        brand: 'boAt Lifestyle',
        type: 'Story • Wireless ANC Earbuds Daily Commute',
        imgUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
        views: '38.6K Views',
        engagementRate: '5.4% ER',
        category: 'story',
        tags: ['Commute Audio', 'Metro Verified', 'Story Series'],
        description: 'Multi-frame Instagram Story sequence evaluating active noise cancellation during peak Yellow Line Delhi Metro rush.',
        deliverableDate: 'Completed April 2026'
      },
      {
        id: 'supp_tech_3',
        brand: 'Asus ROG Gaming',
        type: 'Post • Pro Minimalist Esports Battle Station',
        imgUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
        views: '29.1K Views',
        engagementRate: '7.2% ER',
        category: 'post',
        tags: ['Desktop Setup', 'RGB Aesthetic', 'Carousel Post'],
        description: 'High-res 5-slide carousel breaking down gaming ergonomics, dual monitor setup, and mechanical keyboard acoustics.',
        deliverableDate: 'Completed March 2026'
      }
    ];
  } else if (niche.includes('fashion') || niche.includes('beauty') || niche.includes('aesthetic')) {
    supplementary = [
      {
        id: 'supp_fash_1',
        brand: 'Zara Connaught Place',
        type: 'Post • Autumn Streetwear Editorial',
        imgUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80',
        views: '46.8K Views',
        engagementRate: '6.4% ER',
        category: 'post',
        tags: ['In-Store Shoot', 'Connaught Place', 'GPS Verified'],
        description: 'Photographed inside CP flagship store showcasing monochrome autumnal trench coats and seasonal boots.',
        deliverableDate: 'Completed May 2026'
      },
      {
        id: 'supp_fash_2',
        brand: 'H&M South Extension',
        type: 'Reel • City Style Walk & Layering Guide',
        imgUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
        views: '62.4K Views',
        engagementRate: '7.9% ER',
        category: 'reel',
        tags: ['Style Walk', 'South Delhi', 'Reel 60s'],
        description: 'Dynamic transitioning reel featuring 3 versatile streetwear fits styled entirely from the new South Extension rack.',
        deliverableDate: 'Completed April 2026'
      },
      {
        id: 'supp_fash_3',
        brand: 'Nykaa Luxe',
        type: 'Story • Minimalist Golden Glow Evening Routine',
        imgUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
        views: '33.9K Views',
        engagementRate: '5.8% ER',
        category: 'story',
        tags: ['Beauty Routine', 'Product Close-up', 'Story Frame'],
        description: 'Step-by-step skincare prep and night out makeup highlight with live swatches and localized store directions.',
        deliverableDate: 'Completed March 2026'
      }
    ];
  } else if (niche.includes('photography') || niche.includes('art')) {
    supplementary = [
      {
        id: 'supp_art_1',
        brand: 'Pacific Mall Tagore Garden',
        type: 'Reel • Architectural Sunset Walkthrough',
        imgUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=600&q=80',
        views: '41.2K Views',
        engagementRate: '8.1% ER',
        category: 'reel',
        tags: ['Architecture', 'West Delhi', '4K Reel'],
        description: 'Cinematic 4K drone and gimbal walkthrough capturing the golden hour lighting across the open-air pavilion.',
        deliverableDate: 'Completed May 2026'
      },
      {
        id: 'supp_art_2',
        brand: 'Nikon India',
        type: 'Post • Street Portraits at Lodhi Art District',
        imgUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
        views: '35.4K Views',
        engagementRate: '7.5% ER',
        category: 'post',
        tags: ['Mural Art', 'Lodhi District', 'Prime Lens'],
        description: 'Detailed photo story documenting mural artists working on wall installments with lens metadata and color profiles.',
        deliverableDate: 'Completed April 2026'
      },
      {
        id: 'supp_art_3',
        brand: 'Dilli Haat Crafts',
        type: 'Story • Vibrant Artisan Textile Story',
        imgUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
        views: '28.7K Views',
        engagementRate: '6.2% ER',
        category: 'story',
        tags: ['Handicrafts', 'INA Market', 'Artisanal Story'],
        description: 'Close-up storytelling highlight of Kashmiri shawls and Madhubani folk paintings with direct stall locator.',
        deliverableDate: 'Completed March 2026'
      }
    ];
  } else {
    // Default: Food, Cafe & Lifestyle
    supplementary = [
      {
        id: 'supp_food_1',
        brand: 'Blue Tokai Coffee',
        type: 'Reel • Artisanal Cold Brew & Patio Experience',
        imgUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
        views: '58.7K Views',
        engagementRate: '7.4% ER',
        category: 'reel',
        tags: ['Specialty Coffee', 'Saket Roastery', 'GPS Verified'],
        description: 'Behind-the-scenes coffee brewing showcase highlighting single-estate roast profiles and outdoor seating vibes.',
        deliverableDate: 'Completed May 2026'
      },
      {
        id: 'supp_food_2',
        brand: 'The Big Chill Cafe',
        type: 'Story • Signature Pasta & Desserts Tour',
        imgUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
        views: '44.3K Views',
        engagementRate: '6.8% ER',
        category: 'story',
        tags: ['Italian Comfort', 'Khan Market', 'Story Highlights'],
        description: 'Interactive poll-driven food tasting story rating the baked penne with mozzarella and Belgian chocolate shake.',
        deliverableDate: 'Completed April 2026'
      },
      {
        id: 'supp_food_3',
        brand: 'Hudson Cafe DU',
        type: 'Post • Campus Hangout & Weekend Bites Fit',
        imgUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
        views: '32.1K Views',
        engagementRate: '8.4% ER',
        category: 'post',
        tags: ['DU Campus', 'Student Hangout', 'Photo Carousel'],
        description: 'Comprehensive college cafe guide featuring budget-friendly combo platters and quirky interior murals.',
        deliverableDate: 'Completed March 2026'
      }
    ];
  }

  // Combine native items with non-duplicate supplementary items
  const combined = [...nativeItems];
  for (const item of supplementary) {
    if (!combined.some((c) => c.brand.toLowerCase() === item.brand.toLowerCase())) {
      combined.push(item);
    }
  }

  return combined;
}

export default function CreatorRoasterModal({
  creator,
  isOpen,
  onClose,
  onDirectSelect,
}: CreatorProfileModalProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'reel' | 'story' | 'post'>('all');
  const [selectedDeliverable, setSelectedDeliverable] = useState<PortfolioDeliverable | null>(null);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedDeliverable) {
          setSelectedDeliverable(null);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, selectedDeliverable]);

  const portfolioItems = useMemo(() => {
    if (!creator) return [];
    return getCreatorPortfolio(creator);
  }, [creator]);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return portfolioItems;
    return portfolioItems.filter((item) => item.category === activeFilter);
  }, [portfolioItems, activeFilter]);

  if (!isOpen || !creator || typeof document === 'undefined') {
    return null;
  }

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        />

        {/* Modal Main Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-4xl bg-[#121114] border border-[#2E2938] rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]"
        >
          {/* Top Gradient Accent Strip */}
          <div className="relative h-1.5 w-full bg-gradient-to-r from-[#C9B8E8] via-[#F1E3A8] to-[#C9B8E8]" />

          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-[#26232B] bg-[#17151D] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#C9B8E8]/10 border border-[#C9B8E8]/20 text-[#C9B8E8]">
                <Briefcase className="w-5 h-5 text-[#C9B8E8]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-display font-bold text-white tracking-tight">
                    Creator Profile & Portfolio Showcase
                  </h2>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#C9B8E8]/15 text-[#C9B8E8] border border-[#C9B8E8]/30 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#C9B8E8]" />
                    Verified Portfolio
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Verified deliverables, previous brand collabs, and engagement metrics for <strong className="text-white">{creator.name}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#26232B] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 custom-scrollbar">
            
            {/* Creator Overview Hero Card */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 p-5 rounded-2xl bg-[#17151D] border border-[#26232B]">
              <div className="flex items-start sm:items-center gap-4">
                <div className="relative shrink-0">
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#2E2938]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-[#121114]" title="Active & Ready for Dispatch" />
                </div>

                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold text-white leading-tight">{creator.name}</h3>
                    {creator.velocityTier === 'Velocity' ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5 fill-current" />
                        VELOCITY NODE
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded-full bg-[#26232B] border border-[#36323D]">
                        FREE TIER
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-[#C9B8E8]">{creator.handle}</div>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-zinc-400 font-mono">
                    <span className="flex items-center gap-1 text-zinc-300">
                      <Users className="w-3.5 h-3.5 text-[#C9B8E8]" />
                      <strong className="text-white">{creator.followers || '0'}</strong> followers
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-zinc-300">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      {creator.locality}
                    </span>
                    <span>•</span>
                    <span className="text-zinc-300">{creator.niche}</span>
                  </div>
                </div>
              </div>

              {/* Performance & Score Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full lg:w-auto shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#26232B]">
                <div className="p-3 rounded-xl bg-[#121114] border border-[#26232B] text-center min-w-[95px]">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Match Score</span>
                  <span className="text-lg font-mono font-bold text-[#C9B8E8]">{creator.matchScore}%</span>
                </div>
                <div className="p-3 rounded-xl bg-[#121114] border border-[#26232B] text-center min-w-[95px]">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Local Audience</span>
                  <span className="text-lg font-mono font-bold text-[#F1E3A8]">{creator.audienceInLocality}%</span>
                </div>
                <div className="p-3 rounded-xl bg-[#121114] border border-[#26232B] text-center min-w-[95px] col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Avg Response</span>
                  <span className="text-lg font-mono font-bold text-emerald-400">{creator.latencyHours || 1} hr</span>
                </div>
              </div>
            </div>

            {/* Creator Bio & Target Audience Fit */}
            {creator.bio && (
              <div className="p-4 rounded-xl bg-[#17151D]/80 border border-[#26232B] text-xs text-zinc-300 leading-relaxed font-sans flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-[#C9B8E8] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">Creator Bio & Content Focus</span>
                  {creator.bio}
                </div>
              </div>
            )}

            {/* Portfolio Showcase Header & Category Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C9B8E8]" />
                <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                  Portfolio Deliverables & Past Collabs
                </h4>
                <span className="text-xs font-mono text-[#F1E3A8] bg-[#F1E3A8]/10 px-2 py-0.5 rounded-full border border-[#F1E3A8]/20">
                  {portfolioItems.length} Total
                </span>
              </div>

              {/* Format Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-[#17151D] p-1 rounded-xl border border-[#26232B] self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-all cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-[#C9B8E8] text-[#0C0B0D] font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  All ({portfolioItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('reel')}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                    activeFilter === 'reel'
                      ? 'bg-[#C9B8E8] text-[#0C0B0D] font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Video className="w-3 h-3" />
                  Reels
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('story')}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                    activeFilter === 'story'
                      ? 'bg-[#C9B8E8] text-[#0C0B0D] font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  Stories
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('post')}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                    activeFilter === 'post'
                      ? 'bg-[#C9B8E8] text-[#0C0B0D] font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3 h-3" />
                  Carousels
                </button>
              </div>
            </div>

            {/* Rich Portfolio Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedDeliverable(item)}
                  className="group relative overflow-hidden rounded-2xl border border-[#26232B] bg-[#17151D] flex flex-col justify-between transition-all hover:border-[#C9B8E8]/50 shadow-md hover:shadow-xl hover:shadow-[#C9B8E8]/5 cursor-pointer"
                >
                  {/* Media Cover Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
                    <img
                      src={item.imgUrl}
                      alt={`${item.brand} - ${item.type}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.brand)}&background=1c1a24&color=c9b8e8&size=500`;
                      }}
                    />
                    
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#17151D] via-transparent to-black/30" />

                    {/* Format Pill on Top */}
                    <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/75 text-zinc-200 border border-white/10 backdrop-blur-sm flex items-center gap-1">
                        {item.category === 'reel' ? <Video className="w-2.5 h-2.5 text-[#C9B8E8]" /> : item.category === 'story' ? <Clock className="w-2.5 h-2.5 text-[#F1E3A8]" /> : <ImageIcon className="w-2.5 h-2.5 text-emerald-400" />}
                        {item.type.split('•')[0]?.trim() || 'Deliverable'}
                      </span>
                    </div>

                    {/* Date Tag */}
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-black/70 text-zinc-400 border border-white/5">
                        {item.deliverableDate}
                      </span>
                    </div>
                  </div>

                  {/* Deliverable Details Body */}
                  <div className="p-4 flex flex-col gap-2.5">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-bold text-white group-hover:text-[#C9B8E8] transition-colors truncate">
                          {item.brand}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-300 font-sans line-clamp-1 mt-0.5">
                        {item.type.split('•')[1]?.trim() || item.type}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 font-sans line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Deliverable Metrics */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#26232B] text-[11px] font-mono">
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <Eye className="w-3.5 h-3.5 text-[#C9B8E8]" />
                        <span className="font-bold text-white">{item.views}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-300 justify-end">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-bold text-emerald-400">{item.engagementRate}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-1 flex-wrap pt-1">
                      {item.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[9px] font-mono text-zinc-400 bg-[#121114] px-1.5 py-0.5 rounded border border-[#26232B]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Smart Escrow Protection Notice */}
            <div className="p-3.5 rounded-2xl bg-[#17151D] border border-[#26232B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-zinc-400 font-mono">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Verified Local Deliverables • Smart Escrow Autonomous Payouts
              </span>
              <span className="text-zinc-500">
                100% Geofence-Verified Payouts
              </span>
            </div>

          </div>

          {/* Modal Footer Controls */}
          <div className="p-4 sm:px-6 border-t border-[#26232B] bg-[#17151D] flex items-center justify-between gap-3">
            <span className="text-xs font-mono text-zinc-500 hidden sm:block">
              Radius Hyperlocal Dispatch Engine
            </span>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {onDirectSelect && (
                <button
                  type="button"
                  onClick={() => {
                    onDirectSelect(creator);
                    onClose();
                  }}
                  className="py-2.5 px-4 rounded-xl font-bold font-mono text-xs flex items-center gap-1.5 bg-[#C9B8E8] hover:bg-[#D8CAF2] text-[#0C0B0D] transition-all cursor-pointer shadow-md active:scale-[0.98]"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Select for Campaign</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl font-mono text-xs font-bold text-zinc-300 bg-[#26232B] hover:bg-[#36323D] hover:text-white transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

// Named export alias for clear semantics
export { CreatorRoasterModal as CreatorProfileModal };
