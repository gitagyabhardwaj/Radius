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
    pastWork: [
      { brand: 'Blue Tokai Coffee', type: 'Reel', imgUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=300&q=80' },
      { brand: 'The Big Chill', type: 'Story', imgUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=300&q=80' }
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
    pastWork: [
      { brand: 'Zara Connaught Place', type: 'Post', imgUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=300&q=80' }
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
    pastWork: [
      { brand: 'OnePlus India', type: 'Reel', imgUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=80' }
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
    pastWork: [
      { brand: 'Pacific Mall', type: 'Reel', imgUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=300&q=80' }
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
    pastWork: [
      { brand: 'Hudson Cafe', type: 'Reel', imgUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=300&q=80' }
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
    pastWork: [
      { brand: 'CyberHub Cafe', type: 'Story', imgUrl: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=300&q=80' }
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
    deliverable: '1 Instagram Story pointing to localized Saket cafe outlet',
    centerLocality: 'South Delhi (Saket)',
    centerLat: 28.5276,
    centerLng: 77.2197,

    budget: 350, // $350
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
    deliverable: '1 Photo Carousel showing the new summer fit inside CP Zara',
    centerLocality: 'Connaught Place',
    centerLat: 28.6304,
    centerLng: 77.2177,

    budget: 600, // $600
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
