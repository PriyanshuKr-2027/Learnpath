import {
  DAGEdge,
  Flashcard,
  LearnerProfile,
  LearningPath,
  LevelNode,
  RoadmapDiff,
  SkillEntry,
  SkillGap,
  UserLessonNote,
} from "@/types";
import { PRESEEDED_CAREER_ROLES } from "@/lib/data/roleTaxonomy";
import {
  getOrCreateCuratedResource,
  PRESEEDED_CURATED_CORPUS,
  generateFlashcardsForSubtopic,
} from "@/lib/data/curatedCorpus";
import { scheduleNodesWithKahns, TopoNodeInput } from "@/lib/algorithms/kahnsAlgorithm";
import {
  generateSerpentineCoordinates,
  calculateRemediationCoordinate,
} from "@/lib/algorithms/serpentineLayout";

const PROFILE_KEY = "learnpath_profile_v2";
const PATH_KEY = "learnpath_active_path_v2";
const NOTES_KEY = "learnpath_notes_v2";
const DIFF_KEY = "learnpath_last_diff_v2";

/**
 * Calculates fine-grained skill gaps: Gap = max(0, Required - Current)
 */
export function computeSkillGaps(profile: LearnerProfile): SkillGap[] {
  const role =
    PRESEEDED_CAREER_ROLES.find((r) => r.id === profile.targetRoleId) ||
    PRESEEDED_CAREER_ROLES[0];

  const gaps: SkillGap[] = [];
  const userSkillMap = new Map<string, number>();

  for (const s of profile.skills) {
    userSkillMap.set(s.name.toLowerCase().trim(), s.currentProficiency);
  }

  for (const req of role.skills) {
    const currentProf = userSkillMap.get(req.skillName.toLowerCase().trim()) ?? 15;
    const delta = Math.max(0, req.requiredProficiency - currentProf);

    let severity: SkillGap["severity"] = "none";
    if (delta >= 45) severity = "critical";
    else if (delta >= 25) severity = "moderate";
    else if (delta > 0) severity = "minor";

    // Estimate hours: 10% gap ≈ 2 hours of study
    const estimatedHours = Math.max(1, Math.round((delta / 10) * 2));

    gaps.push({
      skillName: req.skillName,
      requiredProficiency: req.requiredProficiency,
      currentProficiency: currentProf,
      deltaGap: delta,
      severity,
      category: req.category,
      estimatedHoursToClose: estimatedHours,
      prerequisites: req.prerequisites,
    });
  }

  // Sort gaps by severity (critical first) and deltaGap
  return gaps.sort((a, b) => b.deltaGap - a.deltaGap);
}

/**
 * Synthesizes a full versioned DAG Learning Path with Candy Crush serpentine coordinates
 */
export function generateLearningPathFromProfile(profile: LearnerProfile): LearningPath {
  const gaps = computeSkillGaps(profile);
  const targetGaps = gaps.filter((g) => g.deltaGap > 0);

  // Prepare input for Kahn's topological sort
  const topoInputs: TopoNodeInput[] = targetGaps.map((gap, index) => ({
    id: `lvl-${index + 1}`,
    skillName: gap.skillName,
    category: gap.category,
    estimatedMinutes: gap.estimatedHoursToClose * 60,
    prerequisites: gap.prerequisites,
    importanceWeight: gap.severity === "critical" ? 2.0 : 1.0,
  }));

  // Run Kahn's algorithm
  const scheduled = scheduleNodesWithKahns(topoInputs, profile.weeklyHoursBudget || 10);
  const coordinates = generateSerpentineCoordinates(scheduled.length);

  const levels: LevelNode[] = scheduled.map((s, idx) => {
    const curated = getOrCreateCuratedResource(s.skillName);
    const isBoss = (idx + 1) % 5 === 0;

    const isCompletedByDefault = idx < 2;
    const isActiveByDefault = idx === 2;

    return {
      id: s.id,
      levelNumber: idx + 1,
      displayLevel: `${idx + 1}`,
      title: s.skillName,
      skillName: s.skillName,
      phase: s.phase,
      targetWeek: s.targetWeek,
      estimatedMinutes: s.estimatedMinutes,
      status: isCompletedByDefault ? "completed" : isActiveByDefault ? "active" : "locked",
      starsEarned: isCompletedByDefault ? 3 : 0,
      isBossCheckpoint: isBoss,
      isRemediation: false,
      video: curated.video,
      doc: curated.doc,
      githubRepo: curated.githubRepo,
      flashcards: curated.flashcards,
      whyRecommended: curated.whyRecommendedTemplate,
      prerequisites: idx === 0 ? [] : [`lvl-${idx}`],
      coordinates: coordinates[idx] || { x: 350, y: idx * 160 + 60 },
    };
  });

  // Create sequential DAG edges
  const edges: DAGEdge[] = [];
  for (let i = 0; i < levels.length - 1; i++) {
    edges.push({
      id: `e-${levels[i].id}-${levels[i + 1].id}`,
      source: levels[i].id,
      target: levels[i + 1].id,
    });
  }

  const completedCount = levels.filter((l) => l.status === "completed").length;

  const path: LearningPath = {
    id: `path-${Date.now()}`,
    version: 1,
    title: `${profile.targetRoleTitle || "Technical"} Career Acceleration Path`,
    targetRoleId: profile.targetRoleId,
    targetRoleTitle: profile.targetRoleTitle,
    totalWeeks: scheduled[scheduled.length - 1]?.targetWeek || 6,
    weeklyHours: profile.weeklyHoursBudget || 10,
    totalLevelsCount: levels.length,
    completedLevelsCount: completedCount,
    completionPercentage: Math.round((completedCount / levels.length) * 100),
    levels,
    edges,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return path;
}

/**
 * In-Place Remediation Injection Engine:
 * Mistake-Proportional Sub-Level Scaling:
 * 1 mistake -> Injects Level 5.1 with Flashcards
 * 2 mistakes -> Injects Level 5.1 and Level 5.2 with Flashcards
 * 3 mistakes -> Injects Level 5.1, 5.2, 5.3...
 */
export function injectRemedialLevelsIntoPath(
  currentPath: LearningPath,
  parentLevelId: string,
  weakSubtopics: string[]
): { updatedPath: LearningPath; diff: RoadmapDiff } {
  const parentIndex = currentPath.levels.findIndex((l) => l.id === parentLevelId);
  if (parentIndex === -1 || !weakSubtopics || weakSubtopics.length === 0) {
    return { updatedPath: currentPath, diff: null as any };
  }

  const parentLevel = currentPath.levels[parentIndex];
  const injectedLevels: LevelNode[] = [];
  const newEdges = [...currentPath.edges];

  // Generate sub-levels (.1, .2, .3...) for each mistake
  weakSubtopics.forEach((subtopic, idx) => {
    const mistakeIndex = idx + 1; // 1, 2, 3...
    const subLevelNumber = Number((parentLevel.levelNumber + mistakeIndex * 0.1).toFixed(1));
    const subDisplayLevel = `${parentLevel.levelNumber}.${mistakeIndex}`;
    const remedialId = `${parentLevel.id}.${mistakeIndex}`;

    const remedialCoord = calculateRemediationCoordinate(parentLevel.coordinates, mistakeIndex);
    const flashcardDeck = generateFlashcardsForSubtopic(subtopic, parentLevel.skillName);

    const remedialLevel: LevelNode = {
      id: remedialId,
      levelNumber: subLevelNumber,
      displayLevel: subDisplayLevel,
      title: `Remediation Lab: ${subtopic}`,
      skillName: parentLevel.skillName,
      phase: `${parentLevel.phase} (Mistake #${mistakeIndex} Remediation)`,
      targetWeek: parentLevel.targetWeek,
      estimatedMinutes: 30,
      status: "active",
      starsEarned: 0,
      isBossCheckpoint: false,
      isRemediation: true,
      flashcards: flashcardDeck,
      video: {
        youtubeId: "rfscVS0vtbw",
        title: `${subtopic} — Concept & Syntax Deep Dive`,
        channelTitle: "LearnPath AI Remediation Lab",
        durationSeconds: 900,
        durationFormatted: "15:00",
        relevantStartSeconds: 0,
        relevantEndSeconds: 900,
        pruningReason: `Dynamically injected because Mistake #${mistakeIndex} in assessment was in '${subtopic}'.`,
      },
      doc: {
        title: `${subtopic} High-Yield Flashcard Cheat Sheet`,
        url: "https://devdocs.io/",
        provider: "LearnPath AI Diagnostic Lab",
        summary: `Interactive Flashcards & targeted cheat sheet focusing on ${subtopic}.`,
      },
      githubRepo: {
        repoName: `${subtopic.toLowerCase().replace(/[^a-z0-9]/g, "-")}-sandbox`,
        repoUrl: "https://github.com/learnpath/remedial-sandbox",
        owner: "learnpath",
        starsCount: 420,
        description: `Targeted practice challenge to master ${subtopic}.`,
      },
      whyRecommended: `Injected dynamically by the Autonomous Adaptive Loop for Mistake #${mistakeIndex} (${subtopic}).`,
      prerequisites: idx === 0 ? [parentLevel.id] : [`${parentLevel.id}.${idx}`],
      coordinates: remedialCoord,
    };

    injectedLevels.push(remedialLevel);

    // Edge from parent (or previous sub-level) to this sub-level
    const sourceNodeId = idx === 0 ? parentLevel.id : `${parentLevel.id}.${idx}`;
    newEdges.push({
      id: `e-${sourceNodeId}-${remedialId}`,
      source: sourceNodeId,
      target: remedialId,
      isRemediationEdge: true,
    });
  });

  // Edge from last sub-level to downstream next level
  const lastSubLevel = injectedLevels[injectedLevels.length - 1];
  const nextLevel = currentPath.levels[parentIndex + 1];
  if (nextLevel && lastSubLevel) {
    newEdges.push({
      id: `e-${lastSubLevel.id}-${nextLevel.id}`,
      source: lastSubLevel.id,
      target: nextLevel.id,
      isRemediationEdge: true,
    });
  }

  // Clone levels and insert all injected sub-levels right after parent
  const newLevels = [...currentPath.levels];
  newLevels.splice(parentIndex + 1, 0, ...injectedLevels);

  const newVersion = currentPath.version + 1;
  const subLevelNames = injectedLevels.map((l) => `Level ${l.displayLevel} (${l.title.replace("Remediation Lab: ", "")})`).join(", ");

  const diff: RoadmapDiff = {
    previousVersion: currentPath.version,
    newVersion,
    injectedLevels,
    modifiedLevelIds: [parentLevel.id, ...injectedLevels.map((l) => l.id)],
    remedialTopic: weakSubtopics.join(", "),
    summaryMessage: `⚠️ Autonomous Adaptive Recalibration: Detected ${weakSubtopics.length} question mistake(s) ➔ Injected ${subLevelNames} with Interactive Flashcard Decks.`,
    timestamp: new Date().toISOString(),
  };

  const updatedPath: LearningPath = {
    ...currentPath,
    version: newVersion,
    totalLevelsCount: newLevels.length,
    levels: newLevels,
    edges: newEdges,
    updatedAt: new Date().toISOString(),
  };

  return { updatedPath, diff };
}

// Default Seed Profile for instant 1-click judging review
export const DEMO_DATA_ANALYST_PROFILE: LearnerProfile = {
  name: "Alex Dev",
  email: "alex@example.com",
  goalPrompt: "Transition from Junior Developer to Senior Data Analyst with strong Power BI and SQL expertise in 10 weeks.",
  targetRoleId: "data-analyst",
  targetRoleTitle: "Data Analyst & Business Intelligence Specialist",
  weeklyHoursBudget: 10,
  totalWeeksBudget: 10,
  hasCompletedOnboarding: true,
  skills: [
    { name: "SQL", source: "resume", currentProficiency: 40, evidence: "Used basic queries in previous role" },
    { name: "Excel & Advanced Formulas", source: "resume", currentProficiency: 80, evidence: "VLOOKUP & Pivot Tables" },
    { name: "Python for Data Analysis", source: "github", currentProficiency: 60, evidence: "Analyzed in GitHub repos" },
    { name: "Pandas & Data Cleaning", source: "github", currentProficiency: 55, evidence: "Found in repo data-scripts" },
    { name: "Power BI & DAX", source: "inferred", currentProficiency: 20, evidence: "Zero previous experience" },
    { name: "Applied Business Statistics", source: "resume", currentProficiency: 30, evidence: "College course" },
    { name: "Data Modeling & Star Schema", source: "inferred", currentProficiency: 25, evidence: "Basic relational understanding" },
  ],
  certifications: ["Google Data Analytics Professional Certificate"],
  pastProjects: [
    {
      title: "E-Commerce Customer Churn Analysis",
      techStack: ["Python", "Pandas", "Matplotlib"],
      description: "Cleaned 50k customer records and visualized retention trends.",
    },
  ],
  githubStats: {
    username: "alex-analyst",
    publicReposCount: 14,
    topLanguages: { Python: 62, SQL: 24, JavaScript: 14 },
    detectedSkills: ["Python", "SQL", "Pandas", "Git"],
    recentRepos: [
      { name: "data-pipeline-etl", description: "Automated ETL script", language: "Python", stars: 12, isFork: false },
      { name: "sql-case-studies", description: "LeetCode SQL problem solutions", language: "SQL", stars: 8, isFork: false },
    ],
  },
  currentStreak: 5,
  darkMode: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// Supabase sync helper — fire-and-forget (never blocks the UI)
// ─────────────────────────────────────────────────────────────────────────────
async function syncToSupabase(route: string, payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    await fetch(route, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Supabase sync is best-effort — localStorage is the source of truth for UX
  }
}

async function loadFromSupabase<T>(route: string): Promise<T | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch(route);
    if (!res.ok) return null;
    const data = await res.json();
    return data ?? null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Client-safe Store with dual localStorage + Supabase persistence
// ─────────────────────────────────────────────────────────────────────────────
export const mockStore = {
  getProfile(): LearnerProfile {
    if (typeof window === "undefined") return DEMO_DATA_ANALYST_PROFILE;
    try {
      const stored = localStorage.getItem(PROFILE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEMO_DATA_ANALYST_PROFILE;
  },

  saveProfile(profile: LearnerProfile) {
    if (typeof window === "undefined") return;
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    // Fire-and-forget cloud sync
    syncToSupabase("/api/learner/profile", { profile });
  },

  /** Hydrates profile from Supabase if localStorage is empty */
  async hydrateProfile(): Promise<LearnerProfile> {
    if (typeof window === "undefined") return DEMO_DATA_ANALYST_PROFILE;
    const local = this.getProfile();
    // If we already have real data locally, use it immediately
    if (local.email && local.email !== "alex@example.com") return local;

    const remote = await loadFromSupabase<{ profile: LearnerProfile }>("/api/learner/profile");
    if (remote?.profile) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(remote.profile));
      return remote.profile;
    }
    return local;
  },

  getLearningPath(): LearningPath {
    if (typeof window === "undefined") {
      return generateLearningPathFromProfile(DEMO_DATA_ANALYST_PROFILE);
    }
    try {
      const stored = localStorage.getItem(PATH_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    const defaultPath = generateLearningPathFromProfile(this.getProfile());
    this.saveLearningPath(defaultPath);
    return defaultPath;
  },

  saveLearningPath(path: LearningPath) {
    if (typeof window === "undefined") return;
    localStorage.setItem(PATH_KEY, JSON.stringify(path));
    // Fire-and-forget cloud sync
    syncToSupabase("/api/learner/path", { path });
  },

  /** Hydrates learning path from Supabase if localStorage is empty */
  async hydrateLearningPath(): Promise<LearningPath> {
    if (typeof window === "undefined") {
      return generateLearningPathFromProfile(DEMO_DATA_ANALYST_PROFILE);
    }
    const local = this.getLearningPath();

    const remote = await loadFromSupabase<{ path: LearningPath }>("/api/learner/path");
    if (remote?.path && remote.path.version >= (local.version ?? 0)) {
      localStorage.setItem(PATH_KEY, JSON.stringify(remote.path));
      return remote.path;
    }
    return local;
  },

  updateLevelProgress(
    levelId: string,
    updates: { status?: LevelNode["status"]; starsEarned?: number }
  ): LearningPath {
    const path = this.getLearningPath();
    let completedCount = 0;

    const updatedLevels = path.levels.map((lvl) => {
      if (lvl.id === levelId) {
        const newLvl = {
          ...lvl,
          status: updates.status || lvl.status,
          starsEarned: updates.starsEarned !== undefined ? updates.starsEarned : lvl.starsEarned,
        };
        if (newLvl.status === "completed") completedCount++;
        return newLvl;
      }
      if (lvl.status === "completed") completedCount++;
      return lvl;
    });

    // Auto-unlock next level if current completed
    const currentIdx = updatedLevels.findIndex((l) => l.id === levelId);
    if (updates.status === "completed" && currentIdx !== -1 && currentIdx + 1 < updatedLevels.length) {
      if (updatedLevels[currentIdx + 1].status === "locked") {
        updatedLevels[currentIdx + 1].status = "active";
      }
    }

    const percentage = Math.round((completedCount / updatedLevels.length) * 100);

    const updatedPath: LearningPath = {
      ...path,
      levels: updatedLevels,
      completedLevelsCount: completedCount,
      completionPercentage: percentage,
      updatedAt: new Date().toISOString(),
    };

    this.saveLearningPath(updatedPath);
    return updatedPath;
  },

  injectRemediation(parentLevelId: string, weakSubtopics: string | string[]): { updatedPath: LearningPath; diff: RoadmapDiff } {
    const currentPath = this.getLearningPath();
    const subtopicsArray = Array.isArray(weakSubtopics) ? weakSubtopics : [weakSubtopics];
    const result = injectRemedialLevelsIntoPath(currentPath, parentLevelId, subtopicsArray);
    this.saveLearningPath(result.updatedPath);
    if (typeof window !== "undefined") {
      localStorage.setItem(DIFF_KEY, JSON.stringify(result.diff));
    }
    return result;
  },

  getLastDiff(): RoadmapDiff | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(DIFF_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  },

  getAllNotes(): Record<string, string> {
    const defaults: Record<string, string> = {
      "lvl-1": `# SQL Window Functions & Analytics Notes\n\n### Key Concepts Mastered:\n1. **ROW_NUMBER() vs RANK() vs DENSE_RANK()**:\n   - ROW_NUMBER assigns sequential integers without ties.\n   - DENSE_RANK does not skip numbers after ties (1, 2, 2, 3).\n\n2. **Moving 7-Day Running Averages**:\n\`\`\`sql\nSELECT \n  transaction_date,\n  daily_revenue,\n  AVG(daily_revenue) OVER (\n    ORDER BY transaction_date \n    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW\n  ) AS running_7d_avg\nFROM sales_records;\n\`\`\``,
      "lvl-2": `# Relational Data Modeling & Star Schema\n\n### Core Architecture:\n- **Fact Tables**: Contain numeric business metrics (order_amount, discount_rate, quantity) and foreign keys to dimension tables.\n- **Dimension Tables**: Contain contextual business attributes (DimCustomer, DimProduct, DimDate).\n- **Star vs Snowflake**: Star schema minimizes join overhead for columnar OLAP databases like Power BI VertiPaq.`,
    };

    if (typeof window === "undefined") return defaults;

    try {
      const stored = localStorage.getItem(NOTES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaults, ...parsed };
      }
    } catch {}

    return defaults;
  },

  getNote(levelId: string): string {
    const all = this.getAllNotes();
    return all[levelId] || "";
  },

  saveNote(levelId: string, content: string) {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(NOTES_KEY);
      const notesMap = stored ? JSON.parse(stored) : {};
      notesMap[levelId] = content;
      localStorage.setItem(NOTES_KEY, JSON.stringify(notesMap));
      window.dispatchEvent(new CustomEvent("learnpath_notes_updated", { detail: { levelId, content } }));
    } catch {}
    // Fire-and-forget cloud sync
    syncToSupabase("/api/learner/notes", { levelId, content });
  },

  /** Hydrates a single note from Supabase if not in localStorage */
  async hydrateNote(levelId: string): Promise<string> {
    if (typeof window === "undefined") return this.getNote(levelId);
    const local = this.getNote(levelId);
    if (local) return local;

    const remote = await loadFromSupabase<{ content: string }>(`/api/learner/notes?levelId=${encodeURIComponent(levelId)}`);
    if (remote?.content) {
      // Cache in localStorage
      try {
        const stored = localStorage.getItem(NOTES_KEY);
        const notesMap = stored ? JSON.parse(stored) : {};
        notesMap[levelId] = remote.content;
        localStorage.setItem(NOTES_KEY, JSON.stringify(notesMap));
      } catch {}
      return remote.content;
    }
    return "";
  },
};

