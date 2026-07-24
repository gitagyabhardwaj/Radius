export interface Creator {
  id: string;
  name: string;
  avatar: string;
  handle: string;
  locality: string;
  lat: number;
  lng: number;
  audienceInLocality: number; // e.g. 87 for 87% audience in locality
  niche: string; // e.g. "Food & Lifestyle", "Tech & Gaming", "Fashion"
  matchScore: number; // e.g. 94
  latencyHours: number; // typical response time, e.g. 2
  velocityTier: 'Free' | 'Velocity';
  followers: string;
  pastWork: {
    brand: string;
    type: string;
    imgUrl: string;
  }[];
  bio?: string;
  acceptedCampaignIds?: string[];
}

export interface Batch {
  id: string;
  name: 'Batch A' | 'Batch B' | 'Batch C';
  creatorIds: string[];
  status: 'pending' | 'dispatched' | 'completed' | 'cascaded';
  timeLeftSeconds: number; // static initial calculation
  totalTimeSeconds: number;
  dispatchedAt?: number;
  cascadeAfterMs: number;
}

export interface Campaign {
  id: string;
  title: string;
  brandName: string;
  niche: string;
  deliverable: string;
  centerLocality: string;
  centerLat: number;
  centerLng: number;

  budget: number;
  spotsTotal: number;
  spotsFilled: number;
  
  contentFormat?: string;
  creativeGuidelines?: string;
  targetAudience?: string;
  submissionDeadlineDays?: number;
  durationHours: number;
  createdAt: number;
  status: 'draft' | 'active' | 'completed';
  escrowStatus: 'none' | 'locked' | 'content_submitted' | 'verifying' | 'released';
  batches: Batch[];
  activeBatchIndex: number;
}

export interface Submission {
  id: string;
  campaignId: string;
  creatorId: string;
  imageUrl: string;
  mediaType: 'image' | 'video';
  contentUrl?: string; // link to the live reel/story/post
  caption?: string;
  status: 'uploaded' | 'verifying' | 'approved' | 'rejected';
  rejectionReason?: string;
  engagementScore: number;
  verifiedAt?: string;
}

export interface EscrowLog {
  timestamp: string;
  status: 'locked' | 'submitted' | 'verifying' | 'released';
  amount: number;
  txHash: string;
}
