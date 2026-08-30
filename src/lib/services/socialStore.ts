"use client";

import { mockStore } from "./mockStore";

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  role: string;
  currentSkill: string;
  currentLevel: string;
  status: "online" | "in_session" | "offline";
  statusText?: string;
  minutesToday: number;
  streakDays: number;
}

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
  isCustom?: boolean;
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

const SOCIAL_STORAGE_KEY = "learnpath_social_store_v5";
const FRIENDS_STORAGE_KEY = "learnpath_friends_v2";

const DEFAULT_FRIENDS: Friend[] = [
  {
    id: "f-1",
    name: "Elena Rostova",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Elena",
    role: "Full-Stack Engineer",
    currentSkill: "PostgreSQL & Query Plans",
    currentLevel: "Level 4",
    status: "in_session",
    statusText: "Focus Sprint: Indexing optimizations",
    minutesToday: 75,
    streakDays: 14,
  },
  {
    id: "f-2",
    name: "Marcus Vance",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Marcus",
    role: "Data Analyst",
    currentSkill: "DAX Time Intelligence",
    currentLevel: "Level 3",
    status: "online",
    statusText: "Practicing Power BI data models",
    minutesToday: 45,
    streakDays: 8,
  },
  {
    id: "f-3",
    name: "Aisha Patel",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Aisha",
    role: "ML Engineer",
    currentSkill: "Applied Business Statistics",
    currentLevel: "Level 5",
    status: "online",
    statusText: "Solving Hypothesis Testing quizzes",
    minutesToday: 110,
    streakDays: 21,
  },
  {
    id: "f-4",
    name: "Devansh Sharma",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Devansh",
    role: "Software Architect",
    currentSkill: "System Architecture",
    currentLevel: "Level 6",
    status: "offline",
    statusText: "Last seen 2 hours ago",
    minutesToday: 30,
    streakDays: 5,
  },
];

function generateDynamicGroups(): StudyGroup[] {
  if (typeof window !== "undefined") {
    const path = mockStore.getLearningPath();
    if (path && path.levels && path.levels.length > 0) {
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
          description: `Collaborative circle for mastering ${skillName} milestones and sharing solutions.`,
          icon: icons[idx % icons.length],
          bannerColor: colors[idx % colors.length],
          membersCount: 12 + idx * 3,
          activeNowCount: 2 + idx,
          solvedDoubtsCount: 8 + idx * 2,
          progressPercentage: progress || 25,
          isMember: true,
          levelBadge: `Level ${levelNumbers}`,
        });
        idx++;
      });

      if (result.length > 0) return result;
    }
  }

  return [
    {
      id: "grp-core",
      name: "Core Engineering Study Circle",
      topic: "Core Engineering",
      description: "Collaborative study circle for algorithms, distributed systems, and core architecture.",
      icon: "cpu",
      bannerColor: "from-blue-600/20 via-emerald-600/10 to-transparent",
      membersCount: 15,
      activeNowCount: 4,
      solvedDoubtsCount: 12,
      progressPercentage: 40,
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
  // Friends API
  getFriends(): Friend[] {
    if (typeof window === "undefined") return DEFAULT_FRIENDS;
    try {
      const stored = localStorage.getItem(FRIENDS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    try {
      localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(DEFAULT_FRIENDS));
    } catch {}
    return DEFAULT_FRIENDS;
  },

  addFriend(name: string, skillFocus?: string): Friend {
    const friends = this.getFriends();
    const newFriend: Friend = {
      id: `f-${Date.now()}`,
      name: name.trim(),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      role: "Learner",
      currentSkill: skillFocus || "Data Structures & Algorithms",
      currentLevel: "Level 1",
      status: "online",
      statusText: "Just connected on LearnPath AI",
      minutesToday: 0,
      streakDays: 1,
    };
    friends.unshift(newFriend);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(friends));
        window.dispatchEvent(new Event("learnpath_friends_updated"));
      } catch {}
    }
    return newFriend;
  },

  removeFriend(friendId: string) {
    const friends = this.getFriends().filter((f) => f.id !== friendId);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(friends));
        window.dispatchEvent(new Event("learnpath_friends_updated"));
      } catch {}
    }
  },

  // State & Groups API
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
    if (dynamic.length > 0 && (!state.groups || state.groups.length === 0)) {
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

  createGroup(group: { name: string; topic: string; description: string; isPrivate?: boolean }): StudyGroup {
    const state = this.getState();
    const newGroup: StudyGroup = {
      id: `grp-${Date.now()}`,
      name: group.name.trim() || "New Study Circle",
      topic: group.topic.trim() || "General Engineering",
      description: group.description.trim() || "Collaborative peer learning circle.",
      icon: "code",
      bannerColor: "from-teal-600/20 via-emerald-600/10 to-transparent",
      membersCount: 1,
      activeNowCount: 1,
      solvedDoubtsCount: 0,
      progressPercentage: 0,
      isMember: true,
      levelBadge: "Custom Cohort",
      isCustom: true,
    };

    state.groups.unshift(newGroup);
    state.messages[newGroup.id] = [];
    state.doubts[newGroup.id] = [];
    this.saveState(state);
    return newGroup;
  },

  getMessages(groupId: string): GroupMessage[] {
    const state = this.getState();
    if (!state.messages[groupId] || state.messages[groupId].length === 0) {
      // Default initial welcome message
      const defaultMsgs: GroupMessage[] = [
        {
          id: `msg-init-${groupId}`,
          groupId,
          authorId: "u-elena",
          authorName: "Elena Rostova",
          authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Elena",
          authorRole: "mentor",
          content: "Welcome everyone! Feel free to share code snippets or post questions in the Doubt Board.",
          timestamp: "10 mins ago",
          reactions: { "👍": 3 },
        },
      ];
      state.messages[groupId] = defaultMsgs;
      this.saveState(state);
      return defaultMsgs;
    }
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
    if (!state.doubts[groupId] || state.doubts[groupId].length === 0) {
      const defaultDoubts: DoubtItem[] = [
        {
          id: `dbt-init-${groupId}`,
          groupId,
          title: "How do I optimize window functions in PostgreSQL?",
          description: "When running ROW_NUMBER() over large partitions, what index configuration gives O(1) partition lookups?",
          topicTag: "SQL & Query Plans",
          authorName: "Marcus Vance",
          authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Marcus",
          codeSnippet: {
            code: "SELECT id, category, ROW_NUMBER() OVER (PARTITION BY category ORDER BY created_at DESC) FROM events;",
            lang: "sql",
          },
          upvotes: 4,
          hasUpvoted: false,
          isResolved: false,
          answers: [
            {
              id: `ans-init-${groupId}`,
              doubtId: `dbt-init-${groupId}`,
              authorName: "Elena Rostova",
              authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Elena",
              authorRole: "Mentor",
              content: "Create a composite B-Tree index on (category, created_at DESC). PostgreSQL will perform an index-only scan avoiding full table sort.",
              upvotes: 3,
              isAccepted: true,
              timestamp: "15 mins ago",
            },
          ],
          createdAt: "20 mins ago",
        },
      ];
      state.doubts[groupId] = defaultDoubts;
      this.saveState(state);
      return defaultDoubts;
    }
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
      topicTag: topicTag || "General",
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

  getChallenges(groupId: string): StudyChallenge[] {
    return [
      {
        id: `ch-1-${groupId}`,
        groupId,
        title: "Daily Socratic Sprint",
        description: "Complete 2 diagnostic quizzes and solve 1 cohort doubt.",
        xpReward: 150,
        target: 2,
        progress: 1,
        type: "daily",
        isCompleted: false,
      },
      {
        id: `ch-2-${groupId}`,
        groupId,
        title: "100-Minute Deep Focus Sprint",
        description: "Log at least 100 minutes of synchronized Pomodoro focus sessions this week.",
        xpReward: 300,
        target: 100,
        progress: 60,
        type: "weekly",
        isCompleted: false,
      },
    ];
  },
};
