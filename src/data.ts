import { Creator } from './types';

export const CREATORS: Creator[] = [
  {
    id: 'c1',
    name: 'Aarav Sharma',
    handle: '@aarav.eats',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    locality: 'South Delhi (Saket)',
    lat: 28.5276,
    lng: 77.2197,
    audienceInLocality: 89,
    niche: 'Food & Lifestyle',
    matchScore: 96,
    latencyHours: 1,
    velocityTier: 'Velocity',
    followers: '42K',
    bio: 'Hyperlocal culinary creator documenting authentic Delhi NCR cafes, specialty brews, and hidden patio eateries.',
    pastWork: [
      { brand: 'Blue Tokai Coffee', type: 'Reel • Artisanal Cold Brew Experience', imgUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80' },
      { brand: 'The Big Chill Cafe', type: 'Story • Signature Pasta & Desserts Tour', imgUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80' },
      { brand: 'Blue Door Cafe', type: 'Post • Khan Market Weekend Brunch Fit', imgUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80' },
      { brand: 'Paul India Bistro', type: 'Reel • Fresh French Sourdough & Patisserie', imgUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80' }
    ]
  },
  {
    id: 'c2',
    name: 'Priya Patel',
    handle: '@priya.fits',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    locality: 'Connaught Place',
    lat: 28.6304,
    lng: 77.2177,
    audienceInLocality: 84,
    niche: 'Fashion & Aesthetics',
    matchScore: 92,
    latencyHours: 2,
    velocityTier: 'Free',
    followers: '28K',
    bio: 'Delhi-based streetwear and editorial stylist showcasing sustainable fits, local boutiques, and seasonal high-street lookbooks.',
    pastWork: [
      { brand: 'Zara Connaught Place', type: 'Post • Autumn Streetwear Editorial', imgUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80' },
      { brand: 'H&M South Extension', type: 'Reel • City Style Walk & Layering Guide', imgUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80' },
      { brand: 'Nykaa Luxe', type: 'Story • Minimalist Golden Glow Evening Routine', imgUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80' },
      { brand: 'FabIndia Heritage', type: 'Post • Modern Indigo Handloom Edit', imgUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80' }
    ]
  },
  {
    id: 'c3',
    name: 'Kabir Malhotra',
    handle: '@kabir.tech',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    locality: 'Noida Sector 62',
    lat: 28.5708,
    lng: 77.3261,
    audienceInLocality: 76,
    niche: 'Tech & Gaming',
    matchScore: 88,
    latencyHours: 3,
    velocityTier: 'Velocity',
    followers: '85K',
    bio: 'Tech reviewer, gadget teardown specialist, and esports community streamer breaking down everyday gear and consumer tech.',
    pastWork: [
      { brand: 'OnePlus India', type: 'Reel • Flagship Speed & Camera Stress Test', imgUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80' },
      { brand: 'boAt Lifestyle', type: 'Story • Wireless ANC Earbuds Daily Commute', imgUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80' },
      { brand: 'Asus ROG Gaming', type: 'Post • Ultimate Minimalist Esports Rig', imgUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80' },
      { brand: 'Logitech G', type: 'Reel • Pro Mechanical Keyboard Typing Test', imgUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80' }
    ]
  },
  {
    id: 'c4',
    name: 'Ananya Sen',
    handle: '@ananya.visuals',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    locality: 'West Delhi (Dwarka)',
    lat: 28.5921,
    lng: 77.0622,
    audienceInLocality: 81,
    niche: 'Photography & Art',
    matchScore: 91,
    latencyHours: 2,
    velocityTier: 'Free',
    followers: '19K',
    bio: 'Visual artist and travel photographer capturing the contrasts of old-world monuments and contemporary metropolitan culture.',
    pastWork: [
      { brand: 'Pacific Mall Tagore Garden', type: 'Reel • Architectural Sunset Walkthrough', imgUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=600&q=80' },
      { brand: 'Nikon India', type: 'Post • Street Portraits at Lodhi Art District', imgUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80' },
      { brand: 'Dilli Haat Crafts', type: 'Story • Vibrant Artisan Textile Story', imgUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80' }
    ]
  },
  {
    id: 'c5',
    name: 'Rohan Gupta',
    handle: '@rohan_vlogs',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80',
    locality: 'North Delhi (DU)',
    lat: 28.6942,
    lng: 77.2090,
    audienceInLocality: 93,
    niche: 'Food & Lifestyle',
    matchScore: 97,
    latencyHours: 1,
    velocityTier: 'Velocity',
    followers: '56K',
    bio: 'DU campus insider, street food hunter, and high-energy lifestyle creator connecting student crowds with local hangouts.',
    pastWork: [
      { brand: 'Hudson Cafe DU', type: 'Reel • Campus Hangout & Signature Shakes', imgUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80' },
      { brand: 'Ricos North Campus', type: 'Story • Waffle & Pizza Late Night Tasting', imgUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80' },
      { brand: 'Chaayos DU Campus', type: 'Post • Monsoon Kadak Chai & Bun Maska', imgUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80' }
    ]
  },
  {
    id: 'c6',
    name: 'Riya Verma',
    handle: '@riya_chic',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80',
    locality: 'Gurgaon DLF Phase 3',
    lat: 28.4901,
    lng: 77.0901,
    audienceInLocality: 79,
    niche: 'Fashion & Aesthetics',
    matchScore: 84,
    latencyHours: 4,
    velocityTier: 'Free',
    followers: '33K',
    bio: 'Corporate stylist turned lifestyle influencer exploring NCR nightlife, luxury hospitality, and everyday workwear aesthetics.',
    pastWork: [
      { brand: 'CyberHub Cafe', type: 'Story • Rooftop Golden Hour Gathering', imgUrl: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=600&q=80' },
      { brand: 'Mango DLF Promenade', type: 'Post • Tailored Office Chic Lookbook', imgUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80' },
      { brand: 'Sephora India', type: 'Reel • 5-Minute Minimal Morning Glow Routine', imgUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80' }
    ]
  }
];

export const REGIONS = [
  { name: 'Connaught Place (Central)', lat: 28.6304, lng: 77.2177, audienceConcentration: 'High' },
  { name: 'South Delhi (Saket)', lat: 28.5276, lng: 77.2197, audienceConcentration: 'Very High' },
  { name: 'North Delhi (DU Area)', lat: 28.6942, lng: 77.2090, audienceConcentration: 'High' },
  { name: 'West Delhi (Dwarka)', lat: 28.5921, lng: 77.0622, audienceConcentration: 'Medium' },
  { name: 'Noida Sector 62', lat: 28.5708, lng: 77.3261, audienceConcentration: 'High' },
  { name: 'Gurgaon DLF Phase 3', lat: 28.4901, lng: 77.0901, audienceConcentration: 'Very High' }
];

export const MOCK_UPLOADS = [
  {
    name: 'Blue Tokai Saket Session (Match)',
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    lat: 28.5278,
    lng: 77.2199,
    device: 'Apple iPhone 15 Pro Max',
    dateTime: '2026-06-25 11:42:09',
    description: 'Perfect match for South Delhi campaign (Saket area).'
  },
  {
    name: 'Connaught Place Zara Haul (Match)',
    url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80',
    lat: 28.6301,
    lng: 77.2175,
    device: 'Sony ILCE-7RM4 (Alpha 7R IV)',
    dateTime: '2026-06-25 12:15:30',
    description: 'Perfect match for Connaught Place campaign.'
  },
  {
    name: 'Gurgaon CyberHub Vibe (Mismatched Location)',
    url: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=600&q=80',
    lat: 28.4903,
    lng: 77.0905,
    device: 'Fujifilm X-T5',
    dateTime: '2026-06-25 09:30:11',
    description: 'Located in Gurgaon. This will trigger a Geo Mismatch warning if submitted for South or North Delhi.'
  }
];

export const DEFAULT_CAMPAIGNS = [
  {
    id: 'camp_1',
    title: 'Blue Tokai South Delhi Buzz',
    brandName: 'Blue Tokai Coffee',
    niche: 'Food & Lifestyle',
    targetAudience: 'Foodies, Cafe Explorers & Street Food Fans',
    contentFormat: 'Instagram Story',
    deliverable: '1 Instagram Story pointing to localized Saket cafe outlet',
    centerLocality: 'South Delhi (Saket)',
    centerLat: 28.5276,
    centerLng: 77.2197,

    budget: 3500, // ₹3,500
    spotsTotal: 3,
    spotsFilled: 1,
    durationHours: 24,
    createdAt: '2026-06-25T01:00:00Z',
    status: 'active' as const,
    escrowStatus: 'locked' as const,
    activeBatchIndex: 0,
    batches: [
      { id: 'b1', name: 'Batch A' as const, creatorIds: ['c1'], status: 'dispatched' as const, timeLeftSeconds: 14400, totalTimeSeconds: 14400 },
      { id: 'b2', name: 'Batch B' as const, creatorIds: ['c5'], status: 'pending' as const, timeLeftSeconds: 14400, totalTimeSeconds: 14400 },
      { id: 'b3', name: 'Batch C' as const, creatorIds: ['c2', 'c4'], status: 'pending' as const, timeLeftSeconds: 14400, totalTimeSeconds: 14400 }
    ]
  },
  {
    id: 'camp_2',
    title: 'Zara CP Style Flash Walk',
    brandName: 'Zara India',
    niche: 'Fashion & Aesthetics',
    targetAudience: 'Fashion, Streetwear & Aesthetic Stylists',
    contentFormat: 'Carousel Post',
    deliverable: '1 Photo Carousel showing the new summer fit inside CP Zara',
    centerLocality: 'Connaught Place',
    centerLat: 28.6304,
    centerLng: 77.2177,

    budget: 6000, // ₹6,000
    spotsTotal: 2,
    spotsFilled: 0,
    durationHours: 48,
    createdAt: '2026-06-24T18:00:00Z',
    status: 'active' as const,
    escrowStatus: 'locked' as const,
    activeBatchIndex: 0,
    batches: [
      { id: 'b4', name: 'Batch A' as const, creatorIds: ['c2'], status: 'dispatched' as const, timeLeftSeconds: 18000, totalTimeSeconds: 18000 },
      { id: 'b5', name: 'Batch B' as const, creatorIds: ['c6'], status: 'pending' as const, timeLeftSeconds: 18000, totalTimeSeconds: 18000 },
      { id: 'b6', name: 'Batch C' as const, creatorIds: ['c4'], status: 'pending' as const, timeLeftSeconds: 18000, totalTimeSeconds: 18000 }
    ]
  }
];
