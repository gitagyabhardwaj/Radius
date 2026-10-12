import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Fetch real Instagram profile data via multiple strategies:
 *
 * Strategy 1: Scrape the public Instagram profile page HTML.
 *   Instagram embeds structured data in meta tags and inline JSON.
 *   We parse og:description for follower count and extract the bio.
 *   This works from server IPs for low-volume requests.
 *
 * Strategy 2 (Fallback): Use RapidAPI Instagram scraper.
 *   Requires RAPIDAPI_KEY environment variable.
 *   Uses the "instagram-cheapest" API endpoint.
 *
 * Strategy 3 (Final fallback): Deterministic hash for demo purposes.
 */
export const fetchProfileData = action({
  args: {
    handle: v.string(),
    locality: v.optional(v.string()),
  },
  handler: async (_ctx, args): Promise<{
    followers: string;
    followerCount: number;
    audienceInLocality: number;
    bio: string;
    fullName: string;
    isVerified: boolean;
    profilePicUrl: string;
    source: "instagram_html" | "rapidapi" | "fallback";
  } | null> => {
    const cleanHandle = args.handle.replace("@", "").trim().toLowerCase();
    if (!cleanHandle) return null;

    // ── Strategy 1: Scrape Instagram public profile HTML ──
    try {
      console.log(`[Strategy 1] Attempting HTML scrape for @${cleanHandle}...`);
      const result = await scrapeInstagramHTML(cleanHandle);
      console.log(`[Strategy 1] Result:`, JSON.stringify(result));
      if (result && result.followerCount > 0) {
        const audience = computeLocalAudience(
          result.bio,
          args.locality,
          result.followerCount
        );
        return {
          followers: formatNumber(result.followerCount),
          followerCount: result.followerCount,
          audienceInLocality: audience,
          bio: result.bio,
          fullName: result.fullName,
          isVerified: result.isVerified,
          profilePicUrl: result.profilePicUrl,
          source: "instagram_html",
        };
      }
    } catch (err) {
      console.error("Strategy 1 (HTML scrape) failed:", String(err));
    }

    // ── Strategy 2: RapidAPI fallback ──
    const rapidApiKey = process.env.RAPIDAPI_KEY;
    console.log(`[Strategy 2] RAPIDAPI_KEY present: ${!!rapidApiKey}`);
    if (rapidApiKey) {
      try {
        console.log(`[Strategy 2] Calling Instagram Statistics API for @${cleanHandle}...`);
        const result = await fetchViaRapidAPI(cleanHandle, rapidApiKey);
        console.log(`[Strategy 2] Result:`, JSON.stringify(result));
        if (result && result.followerCount > 0) {
          const audience = computeLocalAudience(
            result.bio,
            args.locality,
            result.followerCount
          );
          return {
            followers: formatNumber(result.followerCount),
            followerCount: result.followerCount,
            audienceInLocality: audience,
            bio: result.bio,
            fullName: result.fullName,
            isVerified: result.isVerified,
            profilePicUrl: result.profilePicUrl,
            source: "rapidapi",
          };
        }
      } catch (err) {
        console.error("Strategy 2 (RapidAPI) failed:", String(err));
      }
    }

    // Both strategies failed — return null so the frontend shows an error
    console.error(`All strategies failed for @${cleanHandle}. No fake fallback.`);
    return null;
  },
});

// ─── Strategy 1 implementation ──────────────────────────────────────────────

interface ScrapedProfile {
  followerCount: number;
  bio: string;
  fullName: string;
  isVerified: boolean;
  profilePicUrl: string;
}

async function scrapeInstagramHTML(
  username: string
): Promise<ScrapedProfile | null> {
  // Fetch the public profile page with browser-like headers
  const response = await fetch(`https://www.instagram.com/${username}/`, {
    method: "GET",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Instagram returned HTTP ${response.status}`);
  }

  const html = await response.text();

  // ── Parse og:description for follower count ──
  // Format: "123K Followers, 456 Following, 78 Posts - See Instagram photos and videos from Name (@handle)"
  // or: "1.2M Followers, ..."
  let followerCount = 0;
  const ogMatch = html.match(
    /<meta\s+(?:property|name)="og:description"\s+content="([^"]+)"/i
  );
  if (ogMatch) {
    const desc = ogMatch[1];
    const followerMatch = desc.match(
      /([\d,.]+)\s*(K|M|B)?\s*Followers/i
    );
    if (followerMatch) {
      let num = parseFloat(followerMatch[1].replace(/,/g, ""));
      const suffix = (followerMatch[2] || "").toUpperCase();
      if (suffix === "K") num *= 1_000;
      else if (suffix === "M") num *= 1_000_000;
      else if (suffix === "B") num *= 1_000_000_000;
      followerCount = Math.round(num);
    }
  }

  // ── Extract bio from meta description or JSON-LD ──
  let bio = "";
  let fullName = username;
  let isVerified = false;
  let profilePicUrl = "";

  // Try to extract from the embedded shared data JSON
  const sharedDataMatch = html.match(
    /window\._sharedData\s*=\s*(\{.+?\});<\/script>/s
  );
  if (sharedDataMatch) {
    try {
      const shared = JSON.parse(sharedDataMatch[1]);
      const user =
        shared?.entry_data?.ProfilePage?.[0]?.graphql?.user;
      if (user) {
        followerCount = user.edge_followed_by?.count || followerCount;
        bio = user.biography || "";
        fullName = user.full_name || username;
        isVerified = user.is_verified || false;
        profilePicUrl = user.profile_pic_url_hd || user.profile_pic_url || "";
      }
    } catch {
      // JSON parse failed, continue with meta tag data
    }
  }

  // Try additional JSON embed format (newer Instagram)
  const additionalDataMatch = html.match(
    /\"user\":\s*(\{[^}]*\"edge_followed_by\"[^}]*\})/
  );
  if (additionalDataMatch && followerCount === 0) {
    try {
      // This is a partial JSON match, try to extract follower count
      const countMatch = additionalDataMatch[1].match(
        /\"edge_followed_by\":\s*\{\"count\":\s*(\d+)\}/
      );
      if (countMatch) {
        followerCount = parseInt(countMatch[1], 10);
      }
    } catch {
      // Continue
    }
  }

  // Extract bio from og:description if not found in JSON
  if (!bio && ogMatch) {
    // The part after the dash often contains the name
    const descParts = ogMatch[1].split(" - ");
    if (descParts.length > 1) {
      // "See Instagram photos and videos from Full Name (@handle)"
      const nameMatch = descParts[descParts.length - 1].match(
        /from\s+(.+?)\s*\(/
      );
      if (nameMatch) {
        fullName = nameMatch[1].trim();
      }
    }
  }

  if (followerCount === 0) {
    return null; // Could not extract any data
  }

  return {
    followerCount,
    bio,
    fullName,
    isVerified,
    profilePicUrl,
  };
}

// ─── Strategy 2 implementation ──────────────────────────────────────────────

async function fetchViaRapidAPI(
  username: string,
  apiKey: string
): Promise<ScrapedProfile | null> {
  const igUrl = encodeURIComponent(`https://www.instagram.com/${username}/`);
  const response = await fetch(
    `https://instagram-statistics-api.p.rapidapi.com/community?url=${igUrl}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "instagram-statistics-api.p.rapidapi.com",
      },
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[RapidAPI] HTTP ${response.status} — Body: ${errorBody.substring(0, 500)}`);
    throw new Error(`RapidAPI returned HTTP ${response.status}`);
  }

  const json = await response.json();
  console.log(`[RapidAPI] Raw response keys:`, Object.keys(json));
  console.log(`[RapidAPI] Raw response (first 1000 chars):`, JSON.stringify(json).substring(0, 1000));

  // The Instagram Statistics API returns data in various possible shapes —
  // try common field names
  const data = json?.data || json;
  if (!data) return null;

  const followerCount =
    data.usersCount ??
    data.follower_count ??
    data.followers_count ??
    data.followers ??
    data.edge_followed_by?.count ??
    0;

  if (followerCount === 0 && !data.description && !data.biography && !data.full_name && !data.name) {
    return null;
  }

  return {
    followerCount,
    bio: data.description || data.biography || data.bio || "",
    fullName: data.name || data.full_name || data.fullName || username,
    isVerified: data.verified || data.is_verified || data.isVerified || false,
    profilePicUrl: data.image || data.profile_pic_url_hd || data.profile_pic_url || data.avatar || "",
  };
}

// ─── Shared utilities ───────────────────────────────────────────────────────

/**
 * Heuristic to estimate what percentage of a creator's audience is in the
 * target locality. Since true demographic data requires Instagram Business
 * API OAuth, we use bio keyword matching as a proxy.
 */
function computeLocalAudience(
  bio: string,
  locality: string | undefined,
  followerCount: number
): number {
  const targetLocality = (locality || "").toLowerCase();
  const lowerBio = bio.toLowerCase();
  let percentage = 22; // baseline

  if (targetLocality && lowerBio.length > 0) {
    const keywords = targetLocality
      .split(" ")
      .filter((w) => w.length > 3);
    const hasMatch = keywords.some((kw) => lowerBio.includes(kw));

    if (hasMatch) {
      percentage = 55 + (followerCount % 20);
    } else {
      percentage = 15 + (followerCount % 15);
    }
  }

  return percentage;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 100_000) return (num / 100_000).toFixed(1) + " Lakhs";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}

/**
 * Connect to Meta Graph API to fetch real Instagram audience insights.
 * Expects a user access token obtained via Facebook Login.
 */
export const connectMetaOAuth = action({
  args: {
    accessToken: v.string(),
    locality: v.optional(v.string()),
  },
  handler: async (_ctx, args): Promise<{
    audienceInLocality: number;
    source: "meta_oauth";
    topCities?: any[];
  } | null> => {
    try {
      console.log(`[Meta OAuth] Fetching connected Facebook Pages...`);
      // 1. Get Facebook Pages connected to the user
      const pagesRes = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?access_token=${args.accessToken}`
      );
      if (!pagesRes.ok) throw new Error("Failed to fetch FB pages");
      const pagesData = await pagesRes.json();
      
      if (!pagesData.data || pagesData.data.length === 0) {
        throw new Error("No Facebook Pages found for this user.");
      }

      let igAccountId = null;
      let pageToken = null;

      // 2. Find a page with a connected Instagram Business Account
      for (const page of pagesData.data) {
        const pageRes = await fetch(
          `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${args.accessToken}`
        );
        if (pageRes.ok) {
          const pageDetail = await pageRes.json();
          if (pageDetail.instagram_business_account) {
            igAccountId = pageDetail.instagram_business_account.id;
            pageToken = page.access_token; // Some endpoints require the page token
            break;
          }
        }
      }

      if (!igAccountId) {
        throw new Error("No connected Instagram Professional Account found.");
      }

      console.log(`[Meta OAuth] Found IG Account: ${igAccountId}. Fetching insights...`);
      
      // 3. Fetch audience insights (e.g. audience_city)
      // Note: Getting lifetime audience insights might require specific metrics and access.
      // This endpoint and metric name depend on the Graph API version and account type.
      const insightsRes = await fetch(
        `https://graph.facebook.com/v19.0/${igAccountId}/insights?metric=audience_city&period=lifetime&access_token=${args.accessToken}`
      );
      
      if (!insightsRes.ok) {
        const err = await insightsRes.text();
        console.error(`[Meta OAuth] Insights fetch failed: ${err}`);
        throw new Error("Failed to fetch audience insights");
      }

      const insightsData = await insightsRes.json();
      const cityData = insightsData.data?.[0]?.values?.[0]?.value;

      if (!cityData) {
        throw new Error("No audience city data returned from Instagram API");
      }

      // 4. Calculate percentage in the target locality
      const targetLocality = (args.locality || "").toLowerCase();
      let totalAudience = 0;
      let matchedAudience = 0;

      // cityData is typically an object like: { "Mumbai, Maharashtra": 4500, "Delhi": 2000, ... }
      const topCities = [];
      for (const [city, count] of Object.entries(cityData)) {
        const numericCount = count as number;
        totalAudience += numericCount;
        topCities.push({ name: city, count: numericCount });
        
        if (targetLocality && city.toLowerCase().includes(targetLocality)) {
          matchedAudience += numericCount;
        }
      }

      // Sort cities by count for returning the top ones if needed
      topCities.sort((a, b) => b.count - a.count);

      let audienceInLocality = 0;
      if (totalAudience > 0) {
        audienceInLocality = Math.round((matchedAudience / totalAudience) * 100);
      }

      console.log(`[Meta OAuth] Success. Calculated ${audienceInLocality}% in ${targetLocality}`);

      return {
        audienceInLocality,
        source: "meta_oauth",
        topCities: topCities.slice(0, 5)
      };

    } catch (err: any) {
      console.error("[Meta OAuth Action Error]", err.message);
      return null;
    }
  },
});

