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
  const role = PRESEEDED_CAREER_ROLES.find((r) => r.id === profile.targetRoleId);

  const targetRequirements = role
    ? role.skills
    : profile.skills.length > 0
    ? profile.skills.map((s, idx) => ({
        skillName: s.name,
        requiredProficiency: 80,
        category: "Core Competency",
        importanceWeight: 1.0,
        prerequisites: idx === 0 ? [] : [profile.skills[idx - 1].name],
      }))
    : PRESEEDED_CAREER_ROLES[0].skills;

  const gaps: SkillGap[] = [];
  const userSkillMap = new Map<string, number>();

  for (const s of profile.skills) {
    userSkillMap.set(s.name.toLowerCase().trim(), s.currentProficiency);
  }

  for (const req of targetRequirements) {
    const currentProf = userSkillMap.get(req.skillName.toLowerCase().trim()) ?? 15;
    const delta = Math.max(0, req.requiredProficiency - currentProf);

    let severity: SkillGap["severity"] = "none";
    if (delta >= 45) severity = "critical";
    else if (delta >= 25) severity = "moderate";
    else if (delta > 0) severity = "minor";

    // Estimate hours: 10% gap   2 hours of study
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

    const isActiveByDefault = idx === 0;

    return {
      id: s.id,
      levelNumber: idx + 1,
      displayLevel: `${idx + 1}`,
      title: s.skillName,
      skillName: s.skillName,
      phase: s.phase,
      targetWeek: s.targetWeek,
      estimatedMinutes: s.estimatedMinutes,
      status: isActiveByDefault ? "active" : "locked",
      starsEarned: 0,
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

  const completedCount = 0;

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
      video: (() => {
        // Try to use the prefetched YouTube video from sessionStorage
        try {
          if (typeof window !== "undefined") {
            const prefetched = sessionStorage.getItem(`remediation_video_${subtopic.replace(/\s+/g, "_")}`);
            if (prefetched) {
              const v = JSON.parse(prefetched);
              sessionStorage.removeItem(`remediation_video_${subtopic.replace(/\s+/g, "_")}`);
              return {
                youtubeId: v.youtubeId,
                title: v.title || `${subtopic}  -  Remediation Tutorial`,
                channelTitle: v.channelTitle || "Educational",
                durationSeconds: 900,
                durationFormatted: "15:00",
                relevantStartSeconds: 0,
                relevantEndSeconds: 900,
                pruningReason: `Dynamically fetched for Mistake #${mistakeIndex}: weak area in '${subtopic}'.`,
              };
            }
          }
        } catch {}
        return {
          youtubeId: `REMEDIATION_PENDING_${subtopic.replace(/\s+/g, "_")}`,
          title: `${subtopic}  -  Targeted Remediation Lesson`,
          channelTitle: "LearnPath AI Remediation Engine",
          durationSeconds: 900,
          durationFormatted: "15:00",
          relevantStartSeconds: 0,
          relevantEndSeconds: 900,
          pruningReason: `Dynamically injected for Mistake #${mistakeIndex}: weak area in '${subtopic}'.`,
        };
      })(),

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
    summaryMessage: `Personalized update: Added booster practice for ${subLevelNames} to reinforce these topics before advancing.`,
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

export const EMPTY_LEARNER_PROFILE: LearnerProfile = {
  name: "",
  email: "",
  goalPrompt: "",
  targetRoleId: "full-stack",
  targetRoleTitle: "Full-Stack Software Engineer",
  weeklyHoursBudget: 10,
  totalWeeksBudget: 10,
  hasCompletedOnboarding: false,
  skills: [],
  certifications: [],
  pastProjects: [],
  githubStats: undefined,
  currentStreak: 0,
  darkMode: true,
};

//                                                                              
// Supabase sync helper  -  fire-and-forget (never blocks the UI)
//                                                                              
async function syncToSupabase(route: string, payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    await fetch(route, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Supabase sync is best-effort
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

//                                                                              
// Client-safe Store with dual localStorage + Supabase persistence
//                                                                              
export const mockStore = {
  getProfile(): LearnerProfile | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(PROFILE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  },

  saveProfile(profile: LearnerProfile) {
    if (typeof window === "undefined") return;
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    // Cloud sync
    syncToSupabase("/api/learner/profile", { profile });
  },

  /** Hydrates profile from Supabase if localStorage is empty */
  async hydrateProfile(): Promise<LearnerProfile | null> {
    if (typeof window === "undefined") return null;
    const local = this.getProfile();
    if (local?.email) return local;

    const remote = await loadFromSupabase<{ profile: LearnerProfile }>("/api/learner/profile");
    if (remote?.profile) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(remote.profile));
      return remote.profile;
    }
    return local;
  },

  getLearningPath(): LearningPath | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(PATH_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  },

  saveLearningPath(path: LearningPath) {
    if (typeof window === "undefined") return;
    localStorage.setItem(PATH_KEY, JSON.stringify(path));
    // Cloud sync
    syncToSupabase("/api/learner/path", { path });
  },

  /** Hydrates learning path from Supabase with conflict-free status merge */
  async hydrateLearningPath(): Promise<LearningPath | null> {
    if (typeof window === "undefined") return null;
    const local = this.getLearningPath();

    const remote = await loadFromSupabase<{ path: LearningPath }>("/api/learner/path");
    if (!remote?.path) return local;

    if (!local) {
      localStorage.setItem(PATH_KEY, JSON.stringify(remote.path));
      return remote.path;
    }

    // Monotonic level status reconciliation (merges completed progress across devices)
    const remotePath = remote.path;
    const mergedLevels = local.levels.map((locLvl) => {
      const remLvl = remotePath.levels.find((r) => r.id === locLvl.id);
      if (!remLvl) return locLvl;

      const isCompleted = locLvl.status === "completed" || remLvl.status === "completed";
      const isActive = !isCompleted && (locLvl.status === "active" || remLvl.status === "active");
      const status: LevelNode["status"] = isCompleted ? "completed" : isActive ? "active" : "locked";

      return {
        ...locLvl,
        status,
        starsEarned: Math.max(locLvl.starsEarned || 0, remLvl.starsEarned || 0),
      };
    });

    const completedCount = mergedLevels.filter((l) => l.status === "completed").length;
    const percentage = Math.round((completedCount / mergedLevels.length) * 100);
    const newVersion = Math.max(local.version ?? 1, remotePath.version ?? 1) + 1;

    const reconciledPath: LearningPath = {
      ...local,
      version: newVersion,
      levels: mergedLevels,
      completedLevelsCount: completedCount,
      completionPercentage: percentage,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(PATH_KEY, JSON.stringify(reconciledPath));
    return reconciledPath;
  },

  updateLevelProgress(
    levelId: string,
    updates: { status?: LevelNode["status"]; starsEarned?: number }
  ): LearningPath | null {
    const path = this.getLearningPath();
    if (!path) return null;
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

    // Log activity for dashboard tracking
    if (updates.status === "completed") {
      const level = updatedLevels.find((l) => l.id === levelId);
      this.logActivityDay(level?.estimatedMinutes || 30);
    }

    return updatedPath;
  },


  injectRemediation(parentLevelId: string, weakSubtopics: string | string[]): { updatedPath: LearningPath | null; diff: RoadmapDiff | null } {
    const currentPath = this.getLearningPath();
    if (!currentPath) return { updatedPath: null, diff: null };
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
    const defaults: Record<string, string> = {};

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
    // Cloud sync
    syncToSupabase("/api/learner/notes", { levelId, content });
  },

  /** Hydrates a single note from Supabase if not in localStorage */
  async hydrateNote(levelId: string): Promise<string> {
    if (typeof window === "undefined") return this.getNote(levelId);
    const local = this.getNote(levelId);
    if (local) return local;

    const remote = await loadFromSupabase<{ content: string }>(`/api/learner/notes?levelId=${encodeURIComponent(levelId)}`);
    if (remote?.content) {
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

  /**
   * Logs a lesson completion into the 14-day activity log.
   * Key: "learnpath_activity_log_v1"   { [dateKey: string]: { minutes: number; lessons: number } }
   */
  logActivityDay(minutesStudied: number) {
    if (typeof window === "undefined") return;
    try {
      const KEY = "learnpath_activity_log_v1";
      const stored = localStorage.getItem(KEY);
      const log: Record<string, { minutes: number; lessons: number }> = stored ? JSON.parse(stored) : {};
      const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
      const existing = log[today] || { minutes: 0, lessons: 0 };
      log[today] = { minutes: existing.minutes + minutesStudied, lessons: existing.lessons + 1 };
      localStorage.setItem(KEY, JSON.stringify(log));
    } catch {}
  },

  /**
   * Returns activity for the last N days (default 14).
   * Returns array of { dateKey, shortDay, hours, completedLessons, streakActive }
   */
  getActivityLog(days = 14): Array<{ day: string; shortDay: string; hours: number; completedLessons: number; streakActive: boolean }> {
    const KEY = "learnpath_activity_log_v1";
    let log: Record<string, { minutes: number; lessons: number }> = {};
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(KEY);
        if (stored) log = JSON.parse(stored);
      } catch {}
    }
    const result = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const entry = log[dateKey] || { minutes: 0, lessons: 0 };
      const hours = parseFloat((entry.minutes / 60).toFixed(1));
      const isToday = i === 0;
      result.push({
        day: isToday ? "Today" : d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        shortDay: isToday ? "Today" : dayNames[d.getDay()],
        hours,
        completedLessons: entry.lessons,
        streakActive: entry.minutes > 0,
      });
    }
    return result;
  },
};






