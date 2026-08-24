import {
  DAGEdge,
  LearnerProfile,
  LearningPath,
  LevelNode,
  RoadmapDiff,
  SkillEntry,
  SkillGap,
  UserLessonNote,
} from "@/types";
import { PRESEEDED_CAREER_ROLES } from "@/lib/data/roleTaxonomy";
import { getOrCreateCuratedResource, PRESEEDED_CURATED_CORPUS } from "@/lib/data/curatedCorpus";
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

    return {
      id: s.id,
      levelNumber: idx + 1,
      displayLevel: `${idx + 1}`,
      title: s.skillName,
      skillName: s.skillName,
      phase: s.phase,
      targetWeek: s.targetWeek,
      estimatedMinutes: s.estimatedMinutes,
      status: idx === 0 ? "active" : "locked",
      starsEarned: 0,
      isBossCheckpoint: isBoss,
      isRemediation: false,
      video: curated.video,
      doc: curated.doc,
      githubRepo: curated.githubRepo,
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

  const path: LearningPath = {
    id: `path-${Date.now()}`,
    version: 1,
    title: `${profile.targetRoleTitle || "Technical"} Career Acceleration Path`,
    targetRoleId: profile.targetRoleId,
    targetRoleTitle: profile.targetRoleTitle,
    totalWeeks: scheduled[scheduled.length - 1]?.targetWeek || 6,
    weeklyHours: profile.weeklyHoursBudget || 10,
    totalLevelsCount: levels.length,
    completedLevelsCount: 0,
    completionPercentage: 0,
    levels,
    edges,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return path;
}

/**
 * In-Place Remediation Injection Engine:
 * Spliced dynamically into the active roadmap when score on subtopic is < 70%.
 */
export function injectRemedialLevelIntoPath(
  currentPath: LearningPath,
  parentLevelId: string,
  weakSubtopicName: string
): { updatedPath: LearningPath; diff: RoadmapDiff } {
  const parentIndex = currentPath.levels.findIndex((l) => l.id === parentLevelId);
  if (parentIndex === -1) return { updatedPath: currentPath, diff: null as any };

  const parentLevel = currentPath.levels[parentIndex];
  const remedialId = `${parentLevel.id}.1`;

  // Calculate dedicated offset coordinate
  const remedialCoord = calculateRemediationCoordinate(parentLevel.coordinates, 1);

  const remedialLevel: LevelNode = {
    id: remedialId,
    levelNumber: parentLevel.levelNumber + 0.1,
    displayLevel: `${parentLevel.levelNumber}.1`,
    title: `Remediation Lab: ${weakSubtopicName}`,
    skillName: parentLevel.skillName,
    phase: `${parentLevel.phase} (Targeted Remediation)`,
    targetWeek: parentLevel.targetWeek,
    estimatedMinutes: 45,
    status: "active",
    starsEarned: 0,
    isBossCheckpoint: false,
    isRemediation: true,
    video: {
      youtubeId: "rfscVS0vtbw",
      title: `${weakSubtopicName} - Rapid Concept & Syntax Refresher`,
      channelTitle: "LearnPath AI Remediation Lab",
      durationSeconds: 1200,
      durationFormatted: "20:00",
      relevantStartSeconds: 0,
      relevantEndSeconds: 1200,
      pruningReason: `Dynamically injected because your diagnostic score on '${weakSubtopicName}' was below 70%.`,
    },
    doc: {
      title: `${weakSubtopicName} Deep-Dive Cheat Sheet`,
      url: "https://devdocs.io/",
      provider: "LearnPath AI Diagnostic Lab",
      summary: `Targeted cheat sheet focusing on common pitfalls, edge cases, and best practices in ${weakSubtopicName}.`,
    },
    githubRepo: {
      repoName: `${weakSubtopicName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-remedial-sandbox`,
      repoUrl: "https://github.com/learnpath/remedial-sandbox",
      owner: "learnpath",
      starsCount: 410,
      description: `Targeted interactive sandbox challenge to master ${weakSubtopicName}.`,
    },
    whyRecommended: `Injected dynamically by the Autonomous Adaptive Loop because your assessment identified a comprehension gap in ${weakSubtopicName}.`,
    prerequisites: [parentLevel.id],
    coordinates: remedialCoord,
  };

  // Clone levels and insert right after parent
  const newLevels = [...currentPath.levels];
  newLevels.splice(parentIndex + 1, 0, remedialLevel);

  // Update edges to branch to remedial node
  const newEdges = [...currentPath.edges];
  newEdges.push({
    id: `e-${parentLevel.id}-${remedialId}`,
    source: parentLevel.id,
    target: remedialId,
    isRemediationEdge: true,
  });

  const nextLevel = currentPath.levels[parentIndex + 1];
  if (nextLevel) {
    newEdges.push({
      id: `e-${remedialId}-${nextLevel.id}`,
      source: remedialId,
      target: nextLevel.id,
      isRemediationEdge: true,
    });
  }

  const newVersion = currentPath.version + 1;

  const diff: RoadmapDiff = {
    previousVersion: currentPath.version,
    newVersion,
    injectedLevels: [remedialLevel],
    modifiedLevelIds: [parentLevel.id, remedialId],
    remedialTopic: weakSubtopicName,
    summaryMessage: `⚠️ Autonomous Adaptive Recalibration: Injected Level ${remedialLevel.displayLevel} (${weakSubtopicName}) to strengthen prerequisites before proceeding.`,
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

// Client-safe LocalStorage helper
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

  injectRemediation(parentLevelId: string, weakSubtopic: string): { updatedPath: LearningPath; diff: RoadmapDiff } {
    const currentPath = this.getLearningPath();
    const result = injectRemedialLevelIntoPath(currentPath, parentLevelId, weakSubtopic);
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

  getNote(levelId: string): string {
    if (typeof window === "undefined") return "";
    try {
      const stored = localStorage.getItem(NOTES_KEY);
      if (stored) {
        const notesMap = JSON.parse(stored);
        return notesMap[levelId] || "";
      }
    } catch {}
    return "";
  },

  saveNote(levelId: string, content: string) {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(NOTES_KEY);
      const notesMap = stored ? JSON.parse(stored) : {};
      notesMap[levelId] = content;
      localStorage.setItem(NOTES_KEY, JSON.stringify(notesMap));
    } catch {}
  },
};
