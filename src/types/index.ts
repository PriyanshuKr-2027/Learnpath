// LearnPath AI 2.0 Domain Type Definitions

export type SkillSource = "resume" | "github" | "manual" | "inferred";
export type NodeStatus = "completed" | "active" | "locked" | "remediation";
export type DifficultyTier = 1 | 2 | 3 | 4 | 5; // 1: Beginner, 2: Elementary, 3: Intermediate, 4: Advanced, 5: Expert

// --- Learner Profile & Onboarding Types ---
export interface SkillEntry {
  name: string;
  source: SkillSource;
  currentProficiency: number; // 0 to 100
  evidence?: string;          // e.g. "Stated in Resume (2 yrs), Found in GitHub repo"
}

export interface ProjectEntry {
  title: string;
  techStack: string[];
  description: string;
  repoUrl?: string;
}

export interface GitHubTelemetry {
  username: string;
  avatarUrl?: string;
  publicReposCount: number;
  topLanguages: Record<string, number>; // language -> percentage (e.g. "Python": 65)
  detectedSkills: string[];
  recentRepos: Array<{
    name: string;
    description: string;
    language: string;
    stars: number;
    isFork: boolean;
  }>;
}

export interface LearnerProfile {
  id?: string;
  name: string;
  email?: string;
  goalPrompt: string;
  targetRoleId: string;
  targetRoleTitle: string;
  weeklyHoursBudget: number;
  totalWeeksBudget: number;
  skills: SkillEntry[];
  certifications: string[];
  pastProjects: ProjectEntry[];
  githubStats?: GitHubTelemetry;
  hasCompletedOnboarding: boolean;
  groqApiKey?: string;
  geminiApiKey?: string;
  youtubeApiKey?: string;
  githubToken?: string;
  currentStreak?: number;
  lastActiveDate?: string | null;
  darkMode?: boolean;
}

// --- Role Taxonomy & Skill Gap Types ---
export interface RoleSkillRequirement {
  skillName: string;
  requiredProficiency: number; // 0 to 100
  category: "Core" | "Framework" | "Tool" | "Architecture" | "SoftSkill";
  importanceWeight: number;    // 0.1 to 1.0 (multiplier for sequencing priority)
  prerequisites: string[];     // Array of skillNames that must precede this
}

export interface CareerRole {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  skills: RoleSkillRequirement[];
}

export interface SkillGap {
  skillName: string;
  requiredProficiency: number;
  currentProficiency: number;
  deltaGap: number;            // max(0, required - current)
  severity: "none" | "minor" | "moderate" | "critical";
  category: string;
  estimatedHoursToClose: number;
  prerequisites: string[];
}

// --- Multi-Source Resource Models ---
export interface VideoResource {
  youtubeId: string;
  title: string;
  channelTitle: string;
  durationSeconds: number;
  durationFormatted: string;   // e.g. "18:45"
  thumbnailUrl?: string;
  relevantStartSeconds?: number;
  relevantEndSeconds?: number;
  pruningReason?: string;      // e.g. "Selected because chapters 3-5 match your 40% SQL Joins gap"
}

export interface DocResource {
  title: string;
  url: string;
  provider: string;           // e.g. "Official PyTorch Docs", "MDN", "PostgreSQL Docs"
  summary: string;
}

export interface GitHubRepoResource {
  repoName: string;
  repoUrl: string;
  owner: string;
  starsCount: number;
  description: string;
  starterBranch?: string;
}

export interface ResourceScore {
  relevanceScore: number;      // 0 to 1.0
  ratingScore: number;         // 0 to 1.0
  difficultyScore: number;     // 0 to 1.0
  freshnessScore: number;      // 0 to 1.0
  blendedScore: number;        // S = 0.45*rel + 0.25*rat + 0.15*diff + 0.15*fresh
}

// --- Candy Crush RPG Level & DAG Types ---
export interface LevelNode {
  id: string;                  // e.g. "lvl-1", "lvl-5", "lvl-5.1"
  levelNumber: number;         // 1, 2, 3... (remediation levels use float/sub-index e.g. 5.1)
  displayLevel: string;        // "1", "2", "5", "5.1"
  title: string;
  skillName: string;
  phase: string;               // e.g. "Phase 1: Foundations", "Phase 2: Core Modeling"
  targetWeek: number;
  estimatedMinutes: number;
  status: NodeStatus;
  starsEarned: number;         // 0 to 3
  isBossCheckpoint: boolean;   // true every 5 levels (e.g. lvl-5, lvl-10)
  isRemediation: boolean;      // true if injected dynamically
  video: VideoResource;
  doc: DocResource;
  githubRepo: GitHubRepoResource;
  whyRecommended: string;      // XAI reasoning string
  prerequisites: string[];     // Array of level IDs that must be completed
  coordinates: { x: number; y: number }; // Serpentine S-curve layout
}

export interface DAGEdge {
  id: string;
  source: string;
  target: string;
  isRemediationEdge?: boolean;
}

export interface LearningPath {
  id: string;
  version: number;             // v1, v2 (increments when adaptive loop injects levels)
  userId?: string;
  title: string;
  targetRoleId: string;
  targetRoleTitle: string;
  totalWeeks: number;
  weeklyHours: number;
  totalLevelsCount: number;
  completedLevelsCount: number;
  completionPercentage: number;
  levels: LevelNode[];
  edges: DAGEdge[];
  createdAt: string;
  updatedAt: string;
}

// --- Computerized Adaptive Testing (1-PL IRT) Types ---
export interface CATQuestion {
  id: string;
  skillName: string;
  topic: string;
  difficultyTier: DifficultyTier; // 1 to 5
  calibratedDifficulty: number;   // D in range [0.10, 0.95]
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  codeSnippet?: string;
}

export interface CATAttempt {
  questionId: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
  thetaBefore: number;
  thetaAfter: number;
  timeSpentSeconds: number;
}

export interface CATSession {
  sessionId: string;
  skillName: string;
  currentQuestionIndex: number;
  totalQuestions: number;      // e.g. 5 questions
  latentAbilityTheta: number;  // theta in range [0.10, 0.98], initialized at 0.50
  attempts: CATAttempt[];
  isCompleted: boolean;
  finalScorePercentage: number;
  verifiedBadgeEarned: boolean;
  subtopicScores: Record<string, number>; // subtopic -> score%
  recommendedRemediation?: {
    needsRemediation: boolean;
    weakSubtopic?: string;
    remedialLevelTitle?: string;
  };
}

// --- Personal Notes & Study Workspace ---
export interface UserLessonNote {
  id?: string;
  userId?: string;
  levelId: string;
  content: string;             // Markdown content
  lastEditedAt: string;
}

// --- Autonomous Adaptive Recalibration Diff ---
export interface RoadmapDiff {
  previousVersion: number;
  newVersion: number;
  injectedLevels: LevelNode[];
  modifiedLevelIds: string[];
  remedialTopic: string;
  summaryMessage: string;
  timestamp: string;
}

// --- Legacy Compatibility Types ---
export interface Profile extends Partial<LearnerProfile> {
  name: string;
  email: string;
  darkMode: boolean;
  reminders: boolean;
  role?: "learner" | "admin";
  current_streak?: number;
  last_active_date?: string | null;
  hasCompletedSetup?: boolean;
  dob?: string;
  mobileNo?: string;
  groqApiKey?: string;
}

export interface Problem {
  id?: string;
  name: string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  leetcodeUrl: string;
  youtubeUrl: string | null;
  gfgUrl: string | null;
  done: boolean;
  isMissingVideo?: boolean;
  dayId?: number;
  pattern?: string;
  problemIndex?: number;
}

export interface Day {
  id: number;
  pattern: string;
  topic: string;
  date?: string;
  youtubeId: string;
  problems: Problem[];
  done: boolean;
  notes: string;
  lastEdited?: string | null;
}
