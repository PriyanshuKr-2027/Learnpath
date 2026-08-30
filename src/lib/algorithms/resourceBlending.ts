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
 * Semantic Concept Taxonomy for intelligent token expansion
 */
const CONCEPT_SYNONYM_MAP: Record<string, string[]> = {
  "sql": ["database", "relational", "postgres", "queries", "select", "table"],
  "join": ["merge", "relational", "inner", "left", "foreign key", "combine"],
  "dax": ["power bi", "calculate", "measures", "tabular", "data model", "business intelligence"],
  "pytorch": ["deep learning", "neural network", "tensors", "backprop", "autograd", "cuda"],
  "rag": ["retrieval", "vector", "embeddings", "langchain", "llama", "semantic search"],
  "docker": ["containers", "dockerfile", "images", "devops", "containerization"],
  "kubernetes": ["k8s", "pods", "clusters", "orchestration", "deployment", "ingress"],
  "kafka": ["event stream", "message broker", "pubsub", "distributed queue", "consumers"],
  "dynamic programming": ["memoization", "tabulation", "optimal substructure", "dp", "recursion"],
  "graph": ["bfs", "dfs", "topological sort", "dijkstra", "adjacency", "dag"],
  "tree": ["binary tree", "bst", "trie", "inorder", "traversal", "nodes"],
  "next.js": ["react", "server components", "app router", "ssr", "fullstack", "frontend"],
  "fastapi": ["python api", "pydantic", "rest", "backend", "asyncio", "endpoints"],
  "system design": ["distributed systems", "load balancer", "caching", "sharding", "scalability", "microservices"],
};

/**
 * Calculates semantic token similarity between query topic and resource candidate
 */
function calculateSemanticRelevance(title: string, topicKeyword: string): number {
  const titleTokens = new Set(
    title.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((t) => t.length > 2)
  );
  const rawKeywords = topicKeyword.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((k) => k.length > 2);
  
  if (rawKeywords.length === 0) return 0.80;

  // Expand with concept synonyms
  const expandedQuery = new Set<string>(rawKeywords);
  for (const kw of rawKeywords) {
    if (CONCEPT_SYNONYM_MAP[kw]) {
      CONCEPT_SYNONYM_MAP[kw].forEach((syn) => expandedQuery.add(syn));
    }
  }

  let directHits = 0;
  let semanticHits = 0;

  for (const kw of rawKeywords) {
    if (titleTokens.has(kw) || title.toLowerCase().includes(kw)) {
      directHits++;
    }
  }

  for (const syn of expandedQuery) {
    if (titleTokens.has(syn)) {
      semanticHits++;
    }
  }

  const directScore = directHits / rawKeywords.length;
  const semanticBonus = Math.min(0.35, (semanticHits / Math.max(1, expandedQuery.size)) * 0.5);

  const finalRelevance = Math.min(1.0, Math.max(0.20, 0.45 * directScore + 0.35 + semanticBonus));
  return Number(finalRelevance.toFixed(3));
}

/**
 * 4-Factor Weighted Blending Engine with Semantic Enhancement
 * S = 0.45 * S_relevance + 0.25 * S_rating + 0.15 * S_difficulty + 0.15 * S_freshness
 */
export function calculateBlendedScore(input: CandidateResourceInput): ResourceScore {
  // 1. Semantic Relevance Score (0 to 1.0)
  const relevanceScore = calculateSemanticRelevance(input.title, input.topicKeyword);

  // 2. Rating & Social Proof Score (0 to 1.0)
  let ratingScore = input.ratingRatio ?? 0.85;
  if (input.viewCount) {
    // Normalization curve for views (10k views = 0.70, 500k+ views = 1.0)
    const viewFactor = Math.min(1.0, Math.log10(input.viewCount + 1) / 6.0);
    ratingScore = 0.70 * ratingScore + 0.30 * viewFactor;
  }

  // 3. Difficulty Calibration Score (0 to 1.0)
  let difficultyScore = 0.85;
  if (input.itemLevel === input.targetLevel) {
    difficultyScore = 1.0;
  } else if (input.itemLevel === "all") {
    difficultyScore = 0.88;
  } else {
    difficultyScore = 0.60;
  }

  // 4. Freshness Score (0 to 1.0)
  const currentYear = new Date().getFullYear();
  const pubYear = input.publishedYear || currentYear;
  const ageYears = Math.max(0, currentYear - pubYear);
  // Exponentially decay freshness over 5 years
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
