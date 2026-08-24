import { ResourceScore } from "@/types";

export interface CandidateResourceInput {
  title: string;
  topicKeyword: string;
  viewCount?: number;
  likeCount?: number;
  ratingRatio?: number; // 0 to 1.0 (e.g. likes/(likes+dislikes) or stars/5)
  publishedYear?: number;
  targetLevel: "beginner" | "intermediate" | "advanced";
  itemLevel: "beginner" | "intermediate" | "advanced" | "all";
}

/**
 * 4-Factor Weighted Blending Engine
 * S = 0.45 * S_relevance + 0.25 * S_rating + 0.15 * S_difficulty + 0.15 * S_freshness
 */
export function calculateBlendedScore(input: CandidateResourceInput): ResourceScore {
  // 1. Relevance Score (0 to 1.0)
  const titleLower = input.title.toLowerCase();
  const keywordLower = input.topicKeyword.toLowerCase();
  const keywords = keywordLower.split(" ").filter((k) => k.length > 2);
  let matchedCount = 0;
  for (const kw of keywords) {
    if (titleLower.includes(kw)) matchedCount++;
  }
  const relevanceScore = keywords.length > 0
    ? Math.min(1.0, 0.4 + (matchedCount / keywords.length) * 0.6)
    : 0.8;

  // 2. Rating & Social Proof Score (0 to 1.0)
  let ratingScore = input.ratingRatio ?? 0.85;
  if (input.viewCount) {
    // Normalization curve for views (10k views = 0.7, 500k+ views = 1.0)
    const viewFactor = Math.min(1.0, Math.log10(input.viewCount + 1) / 6.0);
    ratingScore = 0.7 * ratingScore + 0.3 * viewFactor;
  }

  // 3. Difficulty Calibration Score (0 to 1.0)
  let difficultyScore = 0.85;
  if (input.itemLevel === input.targetLevel) {
    difficultyScore = 1.0;
  } else if (input.itemLevel === "all") {
    difficultyScore = 0.85;
  } else {
    difficultyScore = 0.60;
  }

  // 4. Freshness Score (0 to 1.0)
  const currentYear = new Date().getFullYear();
  const pubYear = input.publishedYear || currentYear;
  const ageYears = Math.max(0, currentYear - pubYear);
  // Decay freshness over 5 years
  const freshnessScore = Math.max(0.40, 1.0 - ageYears * 0.12);

  // Blended Linear Combination
  const blendedScore =
    0.45 * relevanceScore +
    0.25 * ratingScore +
    0.15 * difficultyScore +
    0.15 * freshnessScore;

  return {
    relevanceScore: Number(relevanceScore.toFixed(3)),
    ratingScore: Number(ratingScore.toFixed(3)),
    difficultyScore: Number(difficultyScore.toFixed(3)),
    freshnessScore: Number(freshnessScore.toFixed(3)),
    blendedScore: Number(blendedScore.toFixed(3)),
  };
}
