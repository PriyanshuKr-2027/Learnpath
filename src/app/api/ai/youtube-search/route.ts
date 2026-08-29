/**
 * /api/ai/youtube-search — Real YouTube Data API v3 video search
 * Returns top relevant video with enriched metadata for a given skill/topic query.
 * Falls back to corpus video if API unavailable.
 */
import { NextRequest, NextResponse } from "next/server";
import { cachedFetch } from "@/lib/redis";
import { getOrCreateCuratedResource } from "@/lib/data/curatedCorpus";

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: { medium: { url: string } };
  };
}

interface YouTubeVideoDetails {
  id: string;
  contentDetails: { duration: string }; // ISO 8601 e.g. PT1H23M45S
  statistics: { viewCount: string; likeCount?: string };
}

function parseISO8601Duration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] || "0");
  const m = parseInt(match[2] || "0");
  const s = parseInt(match[3] || "0");
  return h * 3600 + m * 60 + s;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export async function GET(req: NextRequest) {
  const skill = req.nextUrl.searchParams.get("skill") || "";
  const level = req.nextUrl.searchParams.get("level") || "intermediate"; // beginner | intermediate | advanced

  if (!skill.trim()) {
    return NextResponse.json({ error: "skill query param required" }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  const cacheKey = `yt:${skill.toLowerCase().replace(/\s+/g, "_")}:${level}`;

  try {
    const video = await cachedFetch(cacheKey, 86400, async () => {
      // If no YouTube API key, return corpus fallback
      if (!apiKey) {
        const corpus = getOrCreateCuratedResource(skill);
        return corpus.video;
      }

      const query = encodeURIComponent(`${skill} tutorial ${level} full course`);
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&videoDuration=long&maxResults=5&key=${apiKey}&relevanceLanguage=en&order=relevance`;

      const searchRes = await fetch(searchUrl);
      if (!searchRes.ok) {
        const corpus = getOrCreateCuratedResource(skill);
        return corpus.video;
      }

      const searchData = await searchRes.json();
      const items: YouTubeSearchItem[] = searchData.items || [];
      if (items.length === 0) {
        const corpus = getOrCreateCuratedResource(skill);
        return corpus.video;
      }

      // Fetch video details for duration + stats
      const videoIds = items.map((i) => i.id.videoId).join(",");
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${apiKey}`;

      const detailsRes = await fetch(detailsUrl);
      const detailsData = await detailsRes.json();
      const details: YouTubeVideoDetails[] = detailsData.items || [];

      // Score and pick best video (longest duration = most comprehensive)
      let bestItem = items[0];
      let bestDetails = details[0];
      let bestDuration = 0;

      for (let i = 0; i < items.length; i++) {
        const d = details.find((det) => det.id === items[i].id.videoId);
        if (d) {
          const dur = parseISO8601Duration(d.contentDetails.duration);
          if (dur > bestDuration) {
            bestDuration = dur;
            bestItem = items[i];
            bestDetails = d;
          }
        }
      }

      const pubYear = new Date(bestItem.snippet.publishedAt).getFullYear();

      return {
        youtubeId: bestItem.id.videoId,
        title: bestItem.snippet.title,
        channelTitle: bestItem.snippet.channelTitle,
        thumbnailUrl: bestItem.snippet.thumbnails.medium.url,
        durationSeconds: bestDuration,
        durationFormatted: formatDuration(bestDuration),
        relevantStartSeconds: 0,
        relevantEndSeconds: bestDuration,
        pruningReason: `Live search via YouTube Data API v3 — top result for "${skill}" (${level} level, published ${pubYear})`,
        viewCount: parseInt(bestDetails?.statistics?.viewCount || "0"),
      };
    });

    return NextResponse.json({ video });
  } catch (err: any) {
    console.error("[youtube-search]", err);
    // Hard fallback — corpus resource
    const corpus = getOrCreateCuratedResource(skill);
    return NextResponse.json({ video: corpus.video, fallback: true });
  }
}
