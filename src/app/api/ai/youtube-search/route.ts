/**
 * /api/ai/youtube-search  -  Real YouTube Data API v3 video search with intelligent chapter segmentation
 * Returns top relevant video with enriched metadata, dynamic chapter pruning, and 24h Redis caching.
 */
import { NextRequest, NextResponse } from "next/server";
import { cachedFetch } from "@/lib/redis";
import { getOrCreateCuratedResource } from "@/lib/data/curatedCorpus";

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: { medium: { url: string } };
  };
}

interface YouTubeVideoDetails {
  id: string;
  snippet?: { description?: string };
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

/**
 * Parses timestamps in video description (e.g. 04:15 or 1:12:30) to compute chapter boundaries
 */
function extractChapterBoundaries(
  description: string,
  totalDuration: number,
  level: string
): { start: number; end: number; chapterName: string } {
  const timestampRegex = /(?:^|\n)\s*(?:(\d{1,2}):)?(\d{1,2}):(\d{2})\s*[- -  - :]?\s*(.+?)(?=\n|$)/g;
  const chapters: Array<{ seconds: number; title: string }> = [];

  let match;
  while ((match = timestampRegex.exec(description)) !== null) {
    const hours = match[1] ? parseInt(match[1], 10) : 0;
    const minutes = parseInt(match[2], 10);
    const seconds = parseInt(match[3], 10);
    const title = match[4].trim();
    const totalSec = hours * 3600 + minutes * 60 + seconds;
    if (totalSec < totalDuration) {
      chapters.push({ seconds: totalSec, title });
    }
  }

  if (chapters.length >= 3) {
    if (level === "advanced" && chapters.length >= 4) {
      const startIdx = Math.floor(chapters.length * 0.6);
      return {
        start: chapters[startIdx].seconds,
        end: totalDuration,
        chapterName: chapters[startIdx].title,
      };
    } else if (level === "intermediate" && chapters.length >= 3) {
      const startIdx = Math.floor(chapters.length * 0.25);
      const endIdx = Math.floor(chapters.length * 0.85);
      return {
        start: chapters[startIdx].seconds,
        end: chapters[endIdx]?.seconds || totalDuration,
        chapterName: chapters[startIdx].title,
      };
    }
  }

  // Heuristic segment defaults if chapters not listed in description
  if (level === "advanced") {
    return {
      start: Math.round(totalDuration * 0.45),
      end: totalDuration,
      chapterName: "Advanced Architecture & Practical Deep Dive",
    };
  } else if (level === "intermediate") {
    return {
      start: Math.round(totalDuration * 0.15),
      end: Math.round(totalDuration * 0.85),
      chapterName: "Core Mechanics & Implementation",
    };
  }

  return {
    start: 0,
    end: totalDuration,
    chapterName: "Foundations & Implementation",
  };
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

      // Fetch video details for duration + stats + description
      const videoIds = items.map((i) => i.id.videoId).join(",");
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${apiKey}`;

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

      const description = bestDetails?.snippet?.description || bestItem.snippet.description || "";
      const segmentation = extractChapterBoundaries(description, bestDuration, level);
      const pubYear = new Date(bestItem.snippet.publishedAt).getFullYear();

      return {
        youtubeId: bestItem.id.videoId,
        title: bestItem.snippet.title,
        channelTitle: bestItem.snippet.channelTitle,
        thumbnailUrl: bestItem.snippet.thumbnails.medium.url,
        durationSeconds: bestDuration,
        durationFormatted: formatDuration(bestDuration),
        relevantStartSeconds: segmentation.start,
        relevantEndSeconds: segmentation.end,
        pruningReason: `Pruned for ${level} level: auto-jumps to [${formatDuration(segmentation.start)}] ("${segmentation.chapterName}") to maximize learning density.`,
        viewCount: parseInt(bestDetails?.statistics?.viewCount || "0"),
      };
    });

    return NextResponse.json({ video });
  } catch (err: any) {
    console.error("[youtube-search]", err);
    const corpus = getOrCreateCuratedResource(skill);
    return NextResponse.json({ video: corpus.video, fallback: true });
  }
}
