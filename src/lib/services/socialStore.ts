"use client";

import { mockStore } from "./mockStore";

export interface StudyGroup {
  id: string;
  name: string;
  topic: string;
  description: string;
  icon: string;
  bannerColor: string;
  membersCount: number;
  activeNowCount: number;
  solvedDoubtsCount: number;
  progressPercentage: number;
  isMember: boolean;
  levelBadge: string;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: "learner" | "mentor" | "admin";
  content: string;
  codeSnippet?: {
    code: string;
    lang: string;
  };
  timestamp: string;
  reactions: Record<string, number>;
}

export interface DoubtAnswer {
  id: string;
  doubtId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  content: string;
  codeSnippet?: {
    code: string;
    lang: string;
  };
  upvotes: number;
  isAccepted: boolean;
  timestamp: string;
  hasUpvoted?: boolean;
}

export interface DoubtItem {
  id: string;
  groupId: string;
  title: string;
  description: string;
  topicTag: string;
  authorName: string;
  authorAvatar: string;
  codeSnippet?: {
    code: string;
    lang: string;
  };
  upvotes: number;
  hasUpvoted?: boolean;
  isResolved: boolean;
  answers: DoubtAnswer[];
  createdAt: string;
}

export interface StudyParticipant {
  id: string;
  name: string;
  avatar: string;
  status: string;
  minutesStudied: number;
  isSelf?: boolean;
}

export interface StudyChallenge {
  id: string;
  groupId: string;
  title: string;
  description: string;
  xpReward: number;
  target: number;
  progress: number;
  type: "daily" | "weekly";
  isCompleted: boolean;
}

export interface Contributor {
  id: string;
  name: string;
  avatar: string;
  role: string;
  points: number;
  doubtsAnswered: number;
  upvotesReceived: number;
  studyMinutes: number;
  badge: string;
  rank: number;
}

const SOCIAL_STORAGE_KEY = "learnpath_social_store_v4";

function generateDynamicGroups(): StudyGroup[] {
  if (typeof window !== "undefined") {
    const path = mockStore.getLearningPath();
    if (path && path.levels && path.levels.length > 0) {
      // Group levels by skillName
      const groupsMap = new Map<string, typeof path.levels>();
      path.levels.forEach((lvl) => {
        const key = lvl.skillName;
        if (!groupsMap.has(key)) groupsMap.set(key, []);
        groupsMap.get(key)!.push(lvl);
      });

      const colors = [
        "from-blue-600/20 via-emerald-600/10 to-transparent",
        "from-teal-600/20 via-cyan-600/10 to-transparent",
        "from-purple-600/20 via-indigo-600/10 to-transparent",
        "from-amber-600/20 via-orange-600/10 to-transparent",
        "from-rose-600/20 via-pink-600/10 to-transparent",
      ];

      const icons = ["shield", "terminal", "cpu", "code", "database"];

      let idx = 0;
      const result: StudyGroup[] = [];
      groupsMap.forEach((lvls, skillName) => {
        const completedCount = lvls.filter((l) => l.status === "completed").length;
        const progress = Math.round((completedCount / lvls.length) * 100);
        const levelNumbers = lvls.map((l) => l.displayLevel).join(" & ");

        result.push({
          id: `grp-${skillName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
          name: `${skillName} Study Circle`,
          topic: skillName,
          description: `Collaborative study circle for mastering ${skillName} milestones and DAG challenges.`,
          icon: icons[idx % icons.length],
          bannerColor: colors[idx % colors.length],
          membersCount: 1,
          activeNowCount: 1,
          solvedDoubtsCount: 0,
          progressPercentage: progress,
          isMember: true,
          levelBadge: `Level ${levelNumbers}`,
        });
        idx++;
      });

      if (result.length > 0) return result;
    }
  }

  // Fallback defaults if no path exists yet
  return [
    {
      id: "grp-core",
      name: "Core Engineering Study Circle",
      topic: "Core Engineering",
      description: "Collaborative study circle for algorithms, distributed systems, and core architecture.",
      icon: "cpu",
      bannerColor: "from-blue-600/20 via-emerald-600/10 to-transparent",
      membersCount: 1,
      activeNowCount: 1,
      solvedDoubtsCount: 0,
      progressPercentage: 0,
      isMember: true,
      levelBadge: "Foundations",
    },
  ];
}

export interface SocialStoreState {
  groups: StudyGroup[];
  messages: Record<string, GroupMessage[]>;
  doubts: Record<string, DoubtItem[]>;
  challenges: Record<string, StudyChallenge[]>;
  contributors: Contributor[];
  activeStudiers: StudyParticipant[];
  studyTimer: {
    isRunning: boolean;
    timeLeft: number;
    mode: "25" | "50" | "custom";
    completedSessions: number;
  };
}

export const socialStore = {
  getState(): SocialStoreState {
    const dynamicGroups = generateDynamicGroups();

    if (typeof window === "undefined") {
      return {
        groups: dynamicGroups,
        messages: {},
        doubts: {},
        challenges: {},
        contributors: [],
        activeStudiers: [],
        studyTimer: {
          isRunning: false,
          timeLeft: 25 * 60,
          mode: "25",
          completedSessions: 0,
        },
      };
    }

    try {
      const stored = localStorage.getItem(SOCIAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.groups) && parsed.groups.length > 0) {
          return parsed;
        }
      }
    } catch {}

    const initial: SocialStoreState = {
      groups: dynamicGroups,
      messages: {},
      doubts: {},
      challenges: {},
      contributors: [],
      activeStudiers: [],
      studyTimer: {
        isRunning: false,
        timeLeft: 25 * 60,
        mode: "25",
        completedSessions: 0,
      },
    };

    try {
      localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(initial));
    } catch {}

    return initial;
  },

  saveState(state: SocialStoreState) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(state));
      window.dispatchEvent(new Event("learnpath_social_updated"));
    } catch {}
  },

  getGroups(): StudyGroup[] {
    const state = this.getState();
    const dynamic = generateDynamicGroups();
    // Refresh groups when dynamic path changes or if on stale defaults
    if (dynamic.length > 0 && (!state.groups || state.groups.length === 0 || state.groups[0].id === "grp-python")) {
      state.groups = dynamic;
      this.saveState(state);
    }
    return state.groups;
  },

  joinGroup(groupId: string) {
    const state = this.getState();
    state.groups = state.groups.map((g) =>
      g.id === groupId
        ? { ...g, isMember: true, membersCount: g.membersCount + 1 }
        : g
    );
    this.saveState(state);
  },

  leaveGroup(groupId: string) {
    const state = this.getState();
    state.groups = state.groups.map((g) =>
      g.id === groupId
        ? { ...g, isMember: false, membersCount: Math.max(1, g.membersCount - 1) }
        : g
    );
    this.saveState(state);
  },

  createGroup(group: Partial<StudyGroup>): StudyGroup {
    const state = this.getState();
    const newGroup: StudyGroup = {
      id: `grp-${Date.now()}`,
      name: group.name || "New Study Circle",
      topic: group.topic || "General",
      description: group.description || "A collaborative study space.",
      icon: group.icon || "code",
      bannerColor: "from-emerald-600/20 via-teal-600/10 to-transparent",
      membersCount: 1,
      activeNowCount: 1,
      solvedDoubtsCount: 0,
      progressPercentage: 0,
      isMember: true,
      levelBadge: "Active Cohort",
    };

    state.groups.unshift(newGroup);
    state.messages[newGroup.id] = [];
    state.doubts[newGroup.id] = [];
    this.saveState(state);
    return newGroup;
  },

  getMessages(groupId: string): GroupMessage[] {
    const state = this.getState();
    return state.messages[groupId] || [];
  },

  sendMessage(
    groupId: string,
    content: string,
    codeSnippet?: { code: string; lang: string }
  ) {
    const state = this.getState();
    const selfName = typeof window !== "undefined"
      ? (() => { try { const p = JSON.parse(localStorage.getItem("learnpath_profile_v2") || "{}"); return p?.name || "You"; } catch { return "You"; } })()
      : "You";
    const newMsg: GroupMessage = {
      id: `msg-${Date.now()}`,
      groupId,
      authorId: "u-self",
      authorName: `${selfName} (You)`,
      authorAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(selfName)}`,
      authorRole: "learner",
      content,
      codeSnippet,
      timestamp: "Just now",
      reactions: {},
    };

    if (!state.messages[groupId]) {
      state.messages[groupId] = [];
    }
    state.messages[groupId].push(newMsg);
    this.saveState(state);
    return newMsg;
  },

  toggleReaction(groupId: string, messageId: string, emojiKey: string) {
    const state = this.getState();
    const msgs = state.messages[groupId];
    if (!msgs) return;
    const msg = msgs.find((m) => m.id === messageId);
    if (!msg) return;
    if (!msg.reactions) msg.reactions = {};
    if (msg.reactions[emojiKey]) {
      delete msg.reactions[emojiKey];
    } else {
      msg.reactions[emojiKey] = 1;
    }
    this.saveState(state);
  },

  getDoubts(groupId: string): DoubtItem[] {
    const state = this.getState();
    return state.doubts[groupId] || [];
  },

  createDoubt(
    groupId: string,
    title: string,
    description: string,
    topicTag: string,
    codeSnippet?: { code: string; lang: string }
  ): DoubtItem {
    const state = this.getState();
    const selfName = typeof window !== "undefined"
      ? (() => { try { const p = JSON.parse(localStorage.getItem("learnpath_profile_v2") || "{}"); return p?.name || "You"; } catch { return "You"; } })()
      : "You";
    const newDoubt: DoubtItem = {
      id: `dbt-${Date.now()}`,
      groupId,
      title,
      description,
      topicTag,
      authorName: `${selfName} (You)`,
      authorAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(selfName)}`,
      codeSnippet,
      upvotes: 1,
      hasUpvoted: true,
      isResolved: false,
      answers: [],
      createdAt: "Just now",
    };

    if (!state.doubts[groupId]) {
      state.doubts[groupId] = [];
    }
    state.doubts[groupId].unshift(newDoubt);
    this.saveState(state);
    return newDoubt;
  },

  answerDoubt(
    groupId: string,
    doubtId: string,
    content: string,
    codeSnippet?: { code: string; lang: string }
  ) {
    const state = this.getState();
    const doubts = state.doubts[groupId] || [];
    const doubt = doubts.find((d) => d.id === doubtId);
    if (!doubt) return;

    const selfName = typeof window !== "undefined"
      ? (() => { try { const p = JSON.parse(localStorage.getItem("learnpath_profile_v2") || "{}"); return p?.name || "You"; } catch { return "You"; } })()
      : "You";

    const answer: DoubtAnswer = {
      id: `ans-${Date.now()}`,
      doubtId,
      authorName: `${selfName} (You)`,
      authorAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(selfName)}`,
      authorRole: "Learner",
      content,
      codeSnippet,
      upvotes: 0,
      isAccepted: false,
      timestamp: "Just now",
    };

    doubt.answers.push(answer);
    this.saveState(state);
  },

  upvoteDoubt(groupId: string, doubtId: string) {
    const state = this.getState();
    const doubts = state.doubts[groupId] || [];
    const doubt = doubts.find((d) => d.id === doubtId);
    if (!doubt) return;
    if (doubt.hasUpvoted) {
      doubt.upvotes = Math.max(0, doubt.upvotes - 1);
      doubt.hasUpvoted = false;
    } else {
      doubt.upvotes += 1;
      doubt.hasUpvoted = true;
    }
    this.saveState(state);
  },

  acceptAnswer(groupId: string, doubtId: string, answerId: string) {
    const state = this.getState();
    const doubts = state.doubts[groupId] || [];
    const doubt = doubts.find((d) => d.id === doubtId);
    if (!doubt) return;
    doubt.answers.forEach((a) => {
      a.isAccepted = a.id === answerId;
    });
    doubt.isResolved = true;
    this.saveState(state);
  },

  getActiveStudiers(): StudyParticipant[] {
    const state = this.getState();
    const selfName = typeof window !== "undefined"
      ? (() => { try { const p = JSON.parse(localStorage.getItem("learnpath_profile_v2") || "{}"); return p?.name || "You"; } catch { return "You"; } })()
      : "You";

    if (state.studyTimer.isRunning) {
      return [
        {
          id: "u-self",
          name: `${selfName} (You)`,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(selfName)}`,
          status: "Deep Focus Session Active",
          minutesStudied: Math.max(1, state.studyTimer.completedSessions * 25),
          isSelf: true,
        },
      ];
    }
    return [];
  },

  getChallenges(groupId: string): StudyChallenge[] {
    const state = this.getState();
    const path = typeof window !== "undefined" ? mockStore.getLearningPath() : null;
    const completedLevels = path?.levels.filter((l) => l.status === "completed").length || 0;

    return [
      {
        id: "ch-1",
        groupId,
        title: "Sprint Pioneer: Complete 3 DAG Milestones",
        description: "Master 3 consecutive milestones in your curriculum path.",
        xpReward: 300,
        target: 3,
        progress: Math.min(3, completedLevels),
        type: "weekly",
        isCompleted: completedLevels >= 3,
      },
      {
        id: "ch-2",
        groupId,
        title: "Diagnostic Ace: Pass a Boss Level Checkpoint",
        description: "Score theta >= 0.55 on any 1-PL Rasch CAT assessment.",
        xpReward: 250,
        target: 1,
        progress: completedLevels > 0 ? 1 : 0,
        type: "weekly",
        isCompleted: completedLevels > 0,
      },
      {
        id: "ch-3",
        groupId,
        title: "Focus Master: Log 50 Minutes of Deep Work",
        description: "Complete two 25-minute Pomodoro sprints in the live focus room.",
        xpReward: 150,
        target: 2,
        progress: state.studyTimer.completedSessions,
        type: "daily",
        isCompleted: state.studyTimer.completedSessions >= 2,
      },
    ];
  },

  getContributors(): Contributor[] {
    const selfName = typeof window !== "undefined"
      ? (() => { try { const p = JSON.parse(localStorage.getItem("learnpath_profile_v2") || "{}"); return p?.name || "You"; } catch { return "You"; } })()
      : "You";
    const path = typeof window !== "undefined" ? mockStore.getLearningPath() : null;
    const completedLevels = path?.levels.filter((l) => l.status === "completed").length || 0;
    const points = completedLevels * 150;

    return [
      {
        id: "u-self",
        name: `${selfName} (You)`,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(selfName)}`,
        role: "Active Learner",
        points: points > 0 ? points : 100,
        doubtsAnswered: 0,
        upvotesReceived: 0,
        studyMinutes: 25,
        badge: "Pioneer",
        rank: 1,
      },
    ];
  },

  postDoubt(
    groupId: string,
    title: string,
    description: string,
    topicTag: string,
    codeSnippet?: { code: string; lang: string }
  ): DoubtItem {
    return this.createDoubt(groupId, title, description, topicTag, codeSnippet);
  },

  upvoteAnswer(groupId: string, doubtId: string, answerId: string) {
    const state = this.getState();
    const doubts = state.doubts[groupId] || [];
    const doubt = doubts.find((d) => d.id === doubtId);
    if (!doubt) return;
    const answer = doubt.answers.find((a) => a.id === answerId);
    if (!answer) return;
    if (answer.hasUpvoted) {
      answer.upvotes = Math.max(0, answer.upvotes - 1);
      answer.hasUpvoted = false;
    } else {
      answer.upvotes += 1;
      answer.hasUpvoted = true;
    }
    this.saveState(state);
  },

  completeChallenge(groupId: string, challengeId: string) {
    const state = this.getState();
    const list = state.challenges[groupId] || [];
    const ch = list.find((c) => c.id === challengeId);
    if (ch) {
      ch.isCompleted = true;
      ch.progress = ch.target;
      this.saveState(state);
    }
  },

  logStudyMinutes(mins: number) {
    const state = this.getState();
    const sessions = Math.ceil(mins / 25);
    state.studyTimer.completedSessions += sessions;
    this.saveState(state);
  },

  getTimerState() {
    return this.getState().studyTimer;
  },

  updateTimerState(timer: Partial<SocialStoreState["studyTimer"]>) {
    const state = this.getState();
    state.studyTimer = { ...state.studyTimer, ...timer };
    this.saveState(state);
  },

  completePomodoroSession() {
    const state = this.getState();
    state.studyTimer.completedSessions += 1;
    this.saveState(state);
  },
};

