/**
 * Shared utility functions used across the Convex backend.
 * Pure functions — no database access or side effects.
 */

/**
 * Calculate the great-circle distance between two points using the
 * Haversine formula.
 *
 * @returns Distance in kilometres.
 */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Generate a simulated blockchain-style transaction hash.
 * Returns a string like `0x` followed by 64 random hex characters.
 */
export function generateSimulatedTxHash(): string {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

/**
 * Compute a match score (0-100) for a creator against a campaign.
 *
 * Weighting:
 *  - Absolute Local Reach & Distance: 55 points (based on followers * local% and distance penalty)
 *  - Niche match:                     30 points (exact match)
 *  - Velocity tier bonus:             15 points (Velocity tier gets full, Free gets 5)
 */

export function parseFollowers(followers: string | undefined): number {
  if (!followers) return 0;
  const str = followers.toLowerCase().replace(/,/g, "").trim();
  const match = str.match(/^([\d.]+)\s*(k|m|l|lakh|lakhs)?$/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const suffix = match[2];
  if (suffix === "k") return num * 1000;
  if (suffix === "m") return num * 1000000;
  if (suffix === "l" || suffix === "lakh" || suffix === "lakhs") return num * 100000;
  return num;
}

export function computeMatchScore(
  distanceKm: number,
  creatorNiche: string | undefined,
  campaignNiche: string,
  audienceInLocality: number | undefined,
  followers: string | undefined,
  velocityTier: "Free" | "Velocity" | undefined
): number {
  let score = 0; // base

  // Absolute Local Reach
  const totalFollowers = parseFollowers(followers);
  const localPercentage = audienceInLocality !== undefined ? audienceInLocality / 100 : 0;
  const absoluteLocalReach = totalFollowers * localPercentage;

  // Proximity penalty: reduce reach effectiveness based on distance
  // e.g. 0km = 100% effective, 10km = 50% effective, 20km = 0% effective
  const distancePenaltyFactor = Math.max(0, 1 - (distanceKm / 20));
  const effectiveLocalReach = absoluteLocalReach * distancePenaltyFactor;

  // Map effective reach to 0-55 points. 
  // Let's assume 100k effective reach gives max points (55)
  const reachScore = Math.min(55, (effectiveLocalReach / 100000) * 55);
  score += reachScore;

  // Define related niches for partial matching
  const relatedNiches: Record<string, string[]> = {
    "Food & Lifestyle": ["Travel & Adventure", "Parenting & Family", "Fitness & Health", "Fashion & Aesthetics"],
    "Fashion & Aesthetics": ["Beauty & Makeup", "Photography & Art", "Food & Lifestyle"],
    "Beauty & Makeup": ["Fashion & Aesthetics", "Food & Lifestyle", "Fitness & Health"],
    "Tech & Gaming": ["Education & Review", "Entertainment & Comedy", "Business & Finance"],
    "Photography & Art": ["Fashion & Aesthetics", "Travel & Adventure", "Entertainment & Comedy"],
    "Travel & Adventure": ["Food & Lifestyle", "Photography & Art", "Fitness & Health"],
    "Fitness & Health": ["Sports & Athletics", "Food & Lifestyle", "Beauty & Makeup"],
    "Sports & Athletics": ["Fitness & Health", "Entertainment & Comedy"],
    "Business & Finance": ["Tech & Gaming", "Education & Review"],
    "Entertainment & Comedy": ["Tech & Gaming", "Sports & Athletics", "Photography & Art"],
    "Education & Review": ["Tech & Gaming", "Business & Finance", "Parenting & Family"],
    "Parenting & Family": ["Food & Lifestyle", "Education & Review"]
  };

  // Niche match
  if (creatorNiche && creatorNiche.toLowerCase() === campaignNiche.toLowerCase()) {
    score += 30; // Exact match
  } else if (creatorNiche) {
    // Check for partial match using the related niches dictionary
    const relatedToCampaign = relatedNiches[campaignNiche] || [];
    const relatedToCreator = relatedNiches[creatorNiche] || [];
    
    if (relatedToCampaign.includes(creatorNiche) || relatedToCreator.includes(campaignNiche)) {
      score += 15; // Partial match
    }
  }

  // Velocity tier bonus
  if (velocityTier === "Velocity") {
    score += 15;
  } else {
    score += 5;
  }

  return Math.min(100, score);
}
