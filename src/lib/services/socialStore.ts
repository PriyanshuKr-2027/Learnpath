"use client";

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

const SOCIAL_STORAGE_KEY = "learnpath_social_store_v1";

const DEFAULT_GROUPS: StudyGroup[] = [
  {
    id: "grp-python",
    name: "Python for Data Science & AI",
    topic: "Python",
    description: "Algorithmic scripting, vector manipulation with NumPy, and automating analytical pipelines.",
    icon: "🐍",
    bannerColor: "from-blue-600/20 via-emerald-600/10 to-transparent",
    membersCount: 48,
    activeNowCount: 14,
    solvedDoubtsCount: 86,
    progressPercentage: 68,
    isMember: true,
    levelBadge: "Levels 2 & 3",
  },
  {
    id: "grp-sql",
    name: "SQL & Relational Engineering",
    topic: "SQL",
    description: "Complex window functions, CTEs, indexing, query optimization, and OLAP star schemas.",
    icon: "🗄️",
    bannerColor: "from-teal-600/20 via-cyan-600/10 to-transparent",
    membersCount: 56,
    activeNowCount: 19,
    solvedDoubtsCount: 124,
    progressPercentage: 82,
    isMember: true,
    levelBadge: "Level 1",
  },
  {
    id: "grp-stats",
    name: "Applied Business Statistics Guild",
    topic: "Statistics",
    description: "Hypothesis testing, p-values, ANOVA, Bayesian inference, and psychometric IRT models.",
    icon: "📊",
    bannerColor: "from-amber-600/20 via-orange-600/10 to-transparent",
    membersCount: 32,
    activeNowCount: 8,
    solvedDoubtsCount: 52,
    progressPercentage: 45,
    isMember: false,
    levelBadge: "Level 5",
  },
  {
    id: "grp-bi",
    name: "Power BI & Executive Storytelling",
    topic: "Power BI",
    description: "DAX calculations, time intelligence, data modeling, and KPI dashboard architectures.",
    icon: "📈",
    bannerColor: "from-yellow-600/20 via-amber-600/10 to-transparent",
    membersCount: 41,
    activeNowCount: 11,
    solvedDoubtsCount: 67,
    progressPercentage: 54,
    isMember: false,
    levelBadge: "Level 4 & 6",
  },
];

const DEFAULT_MESSAGES: Record<string, GroupMessage[]> = {
  "grp-python": [
    {
      id: "msg-p1",
      groupId: "grp-python",
      authorId: "u-marcus",
      authorName: "Marcus Vance",
      authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Marcus",
      authorRole: "mentor",
      content: "Welcome everyone! Today we are discussing optimizing Pandas vectorized operations over iterative `.iterrows()`. Notice the 100x speedup when using numpy underlying arrays.",
      codeSnippet: {
        lang: "python",
        code: "# Vectorized speedup\ndf['tax'] = np.where(df['amount'] > 1000, df['amount'] * 0.18, df['amount'] * 0.05)",
      },
      timestamp: "10:15 AM",
      reactions: { "🔥": 8, "👏": 5 },
    },
    {
      id: "msg-p2",
      groupId: "grp-python",
      authorId: "u-elena",
      authorName: "Elena Rostova",
      authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Elena",
      authorRole: "learner",
      content: "That `.where` pattern solved my timeout on large datasets! Are we covering list comprehensions vs map() next?",
      timestamp: "10:22 AM",
      reactions: { "💡": 4 },
    },
    {
      id: "msg-p3",
      groupId: "grp-python",
      authorId: "u-alex",
      authorName: "Alex Dev (You)",
      authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Alex",
      authorRole: "learner",
      content: "Working through the Level 2 Python milestones right now. Joining the 25m Focus Timer room if anyone wants to study together!",
      timestamp: "Just now",
      reactions: { "🚀": 3 },
    },
  ],
  "grp-sql": [
    {
      id: "msg-s1",
      groupId: "grp-sql",
      authorId: "u-priya",
      authorName: "Priya Sharma",
      authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Priya",
      authorRole: "mentor",
      content: "Remember for Level 1 boss challenge: `DENSE_RANK()` does NOT skip ranks on ties, whereas `RANK()` will skip. Here is a quick reference query:",
      codeSnippet: {
        lang: "sql",
        code: "SELECT employee_id, department_id, salary,\n       DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as rank_no\nFROM employees;",
      },
      timestamp: "09:40 AM",
      reactions: { "🎯": 12, "⭐": 7 },
    },
  ],
};

const DEFAULT_DOUBTS: Record<string, DoubtItem[]> = {
  "grp-python": [
    {
      id: "dbt-1",
      groupId: "grp-python",
      title: "How to handle SettingWithCopyWarning in nested Pandas indexing?",
      description: "When filtering rows and attempting to assign values to a new column, Pandas throws `SettingWithCopyWarning`. What is the canonical idiom to avoid this?",
      topicTag: "Pandas",
      authorName: "Devon Clark",
      authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Devon",
      codeSnippet: {
        lang: "python",
        code: "# Throws warning:\nsubset = df[df['status'] == 'active']\nsubset['discount'] = 0.15",
      },
      upvotes: 14,
      isResolved: true,
      createdAt: "2 hours ago",
      answers: [
        {
          id: "ans-1",
          doubtId: "dbt-1",
          authorName: "Marcus Vance",
          authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Marcus",
          authorRole: "Mentor",
          content: "Use `.loc` directly on the parent DataFrame or explicitly call `.copy()` on the subset:",
          codeSnippet: {
            lang: "python",
            code: "# Method 1: In-place with .loc\ndf.loc[df['status'] == 'active', 'discount'] = 0.15\n\n# Method 2: Explicit deep copy\nsubset = df[df['status'] == 'active'].copy()\nsubset['discount'] = 0.15",
          },
          upvotes: 21,
          isAccepted: true,
          timestamp: "1 hour ago",
        },
      ],
    },
    {
      id: "dbt-2",
      groupId: "grp-python",
      title: "Difference between `pd.merge()` and `pd.concat()` in complex joins?",
      description: "I have 3 CSV tables with varying foreign keys. Should I use merge on keys or concat along axis=1?",
      topicTag: "ETL / DataFrames",
      authorName: "Samantha Reed",
      authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Samantha",
      upvotes: 7,
      isResolved: false,
      createdAt: "35 mins ago",
      answers: [],
    },
  ],
  "grp-sql": [
    {
      id: "dbt-3",
      groupId: "grp-sql",
      title: "When to use CTEs vs Temporary Tables for recursive tree queries?",
      description: "When traversing hierarchical org charts, CTEs work well with `WITH RECURSIVE`. Is there any memory overhead difference compared to indexed temp tables?",
      topicTag: "Recursive SQL",
      authorName: "Kenji Sato",
      authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Kenji",
      upvotes: 9,
      isResolved: false,
      createdAt: "1 hour ago",
      answers: [],
    },
  ],
};

const DEFAULT_CHALLENGES: StudyChallenge[] = [
  {
    id: "ch-1",
    groupId: "grp-python",
    title: "Vectorization Sprint",
    description: "Write 3 vectorized pandas transformations without iterative for-loops.",
    xpReward: 150,
    target: 3,
    progress: 2,
    type: "daily",
    isCompleted: false,
  },
  {
    id: "ch-2",
    groupId: "grp-python",
    title: "Focus Master",
    description: "Complete two 25-minute collaborative study timer sessions.",
    xpReward: 200,
    target: 2,
    progress: 1,
    type: "daily",
    isCompleted: false,
  },
  {
    id: "ch-3",
    groupId: "grp-python",
    title: "Community Peer Helper",
    description: "Post a verified or upvoted answer on the Doubt Board.",
    xpReward: 300,
    target: 1,
    progress: 1,
    type: "weekly",
    isCompleted: true,
  },
  {
    id: "ch-4",
    groupId: "grp-sql",
    title: "Window Function Marathon",
    description: "Solve 5 SQL queries utilizing ROW_NUMBER, RANK, and DENSE_RANK.",
    xpReward: 250,
    target: 5,
    progress: 4,
    type: "weekly",
    isCompleted: false,
  },
];

const DEFAULT_CONTRIBUTORS: Contributor[] = [
  {
    id: "c-1",
    name: "Marcus Vance",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Marcus",
    role: "Senior Data Mentor",
    points: 1420,
    doubtsAnswered: 38,
    upvotesReceived: 184,
    studyMinutes: 720,
    badge: "🏆 Top Mentor",
    rank: 1,
  },
  {
    id: "c-2",
    name: "Priya Sharma",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Priya",
    role: "SQL Lead",
    points: 1180,
    doubtsAnswered: 29,
    upvotesReceived: 142,
    studyMinutes: 560,
    badge: "⚡ Query Master",
    rank: 2,
  },
  {
    id: "c-3",
    name: "Elena Rostova",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Elena",
    role: "Active Learner",
    points: 920,
    doubtsAnswered: 18,
    upvotesReceived: 88,
    studyMinutes: 490,
    badge: "🌟 Focus Champion",
    rank: 3,
  },
  {
    id: "c-4",
    name: "Alex Dev (You)",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Alex",
    role: "Learner",
    points: 680,
    doubtsAnswered: 11,
    upvotesReceived: 54,
    studyMinutes: 340,
    badge: "🚀 Rising Star",
    rank: 4,
  },
  {
    id: "c-5",
    name: "Kenji Sato",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Kenji",
    role: "Data Analyst",
    points: 540,
    doubtsAnswered: 8,
    upvotesReceived: 36,
    studyMinutes: 280,
    badge: "🎯 Solver",
    rank: 5,
  },
];

const DEFAULT_ACTIVE_STUDIERS: StudyParticipant[] = [
  {
    id: "st-alex",
    name: "Alex Dev (You)",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Alex",
    status: "Solving SQL Window Exercises",
    minutesStudied: 35,
    isSelf: true,
  },
  {
    id: "st-elena",
    name: "Elena Rostova",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Elena",
    status: "Reviewing Pandas Vectorization",
    minutesStudied: 45,
  },
  {
    id: "st-marcus",
    name: "Marcus Vance",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Marcus",
    status: "Building Power BI Tabular Models",
    minutesStudied: 80,
  },
  {
    id: "st-devon",
    name: "Devon Clark",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Devon",
    status: "Hypothesis Testing with p-values",
    minutesStudied: 20,
  },
];

interface SocialStoreState {
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
    if (typeof window === "undefined") {
      return {
        groups: DEFAULT_GROUPS,
        messages: DEFAULT_MESSAGES,
        doubts: DEFAULT_DOUBTS,
        challenges: { "grp-python": DEFAULT_CHALLENGES },
        contributors: DEFAULT_CONTRIBUTORS,
        activeStudiers: DEFAULT_ACTIVE_STUDIERS,
        studyTimer: {
          isRunning: false,
          timeLeft: 25 * 60,
          mode: "25",
          completedSessions: 3,
        },
      };
    }

    try {
      const stored = localStorage.getItem(SOCIAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}

    const initial: SocialStoreState = {
      groups: DEFAULT_GROUPS,
      messages: DEFAULT_MESSAGES,
      doubts: DEFAULT_DOUBTS,
      challenges: { "grp-python": DEFAULT_CHALLENGES },
      contributors: DEFAULT_CONTRIBUTORS,
      activeStudiers: DEFAULT_ACTIVE_STUDIERS,
      studyTimer: {
        isRunning: false,
        timeLeft: 25 * 60,
        mode: "25",
        completedSessions: 3,
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
    return this.getState().groups;
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
      icon: group.icon || "📚",
      bannerColor: "from-emerald-600/20 via-teal-600/10 to-transparent",
      membersCount: 1,
      activeNowCount: 1,
      solvedDoubtsCount: 0,
      progressPercentage: 0,
      isMember: true,
      levelBadge: "Active Cohort",
    };

    state.groups.unshift(newGroup);
    state.messages[newGroup.id] = [
      {
        id: `msg-${Date.now()}`,
        groupId: newGroup.id,
        authorId: "u-self",
        authorName: "Alex Dev (You)",
        authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Alex",
        authorRole: "learner",
        content: `🎉 Created study group "${newGroup.name}"! Welcome study partners.`,
        timestamp: "Just now",
        reactions: { "👋": 1 },
      },
    ];
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
    const newMsg: GroupMessage = {
      id: `msg-${Date.now()}`,
      groupId,
      authorId: "u-self",
      authorName: "Alex Dev (You)",
      authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Alex",
      authorRole: "learner",
      content,
      codeSnippet,
      timestamp: "Just now",
      reactions: {},
    };

    if (!state.messages[groupId]) state.messages[groupId] = [];
    state.messages[groupId].push(newMsg);
    this.saveState(state);
  },

  toggleReaction(groupId: string, msgId: string, emoji: string) {
    const state = this.getState();
    const msgs = state.messages[groupId] || [];
    const target = msgs.find((m) => m.id === msgId);
    if (target) {
      if (!target.reactions) target.reactions = {};
      target.reactions[emoji] = (target.reactions[emoji] || 0) + 1;
      this.saveState(state);
    }
  },

  getDoubts(groupId: string): DoubtItem[] {
    const state = this.getState();
    return state.doubts[groupId] || [];
  },

  postDoubt(
    groupId: string,
    title: string,
    description: string,
    topicTag: string,
    codeSnippet?: { code: string; lang: string }
  ) {
    const state = this.getState();
    const newDoubt: DoubtItem = {
      id: `dbt-${Date.now()}`,
      groupId,
      title,
      description,
      topicTag: topicTag || "General",
      authorName: "Alex Dev (You)",
      authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Alex",
      codeSnippet,
      upvotes: 1,
      hasUpvoted: true,
      isResolved: false,
      answers: [],
      createdAt: "Just now",
    };

    if (!state.doubts[groupId]) state.doubts[groupId] = [];
    state.doubts[groupId].unshift(newDoubt);
    this.saveState(state);
  },

  upvoteDoubt(groupId: string, doubtId: string) {
    const state = this.getState();
    const doubts = state.doubts[groupId] || [];
    const d = doubts.find((item) => item.id === doubtId);
    if (d) {
      if (d.hasUpvoted) {
        d.upvotes = Math.max(0, d.upvotes - 1);
        d.hasUpvoted = false;
      } else {
        d.upvotes += 1;
        d.hasUpvoted = true;
      }
      this.saveState(state);
    }
  },

  answerDoubt(
    groupId: string,
    doubtId: string,
    content: string,
    codeSnippet?: { code: string; lang: string }
  ) {
    const state = this.getState();
    const doubts = state.doubts[groupId] || [];
    const d = doubts.find((item) => item.id === doubtId);
    if (d) {
      const newAnswer: DoubtAnswer = {
        id: `ans-${Date.now()}`,
        doubtId,
        authorName: "Alex Dev (You)",
        authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Alex",
        authorRole: "Learner",
        content,
        codeSnippet,
        upvotes: 1,
        isAccepted: false,
        timestamp: "Just now",
        hasUpvoted: true,
      };
      d.answers.push(newAnswer);
      this.saveState(state);
    }
  },

  upvoteAnswer(groupId: string, doubtId: string, answerId: string) {
    const state = this.getState();
    const doubts = state.doubts[groupId] || [];
    const d = doubts.find((item) => item.id === doubtId);
    if (d) {
      const ans = d.answers.find((a) => a.id === answerId);
      if (ans) {
        if (ans.hasUpvoted) {
          ans.upvotes = Math.max(0, ans.upvotes - 1);
          ans.hasUpvoted = false;
        } else {
          ans.upvotes += 1;
          ans.hasUpvoted = true;
        }
        this.saveState(state);
      }
    }
  },

  acceptAnswer(groupId: string, doubtId: string, answerId: string) {
    const state = this.getState();
    const doubts = state.doubts[groupId] || [];
    const d = doubts.find((item) => item.id === doubtId);
    if (d) {
      d.isResolved = true;
      d.answers.forEach((ans) => {
        ans.isAccepted = ans.id === answerId;
      });
      // Increment group resolved doubts
      const grp = state.groups.find((g) => g.id === groupId);
      if (grp) grp.solvedDoubtsCount += 1;
      this.saveState(state);
    }
  },

  getChallenges(groupId: string): StudyChallenge[] {
    const state = this.getState();
    return state.challenges[groupId] || DEFAULT_CHALLENGES;
  },

  completeChallenge(groupId: string, challengeId: string) {
    const state = this.getState();
    const challenges = state.challenges[groupId] || DEFAULT_CHALLENGES;
    const ch = challenges.find((c) => c.id === challengeId);
    if (ch && !ch.isCompleted) {
      ch.progress = ch.target;
      ch.isCompleted = true;
      state.challenges[groupId] = challenges;
      this.saveState(state);
    }
  },

  getContributors(): Contributor[] {
    return this.getState().contributors;
  },

  getActiveStudiers(): StudyParticipant[] {
    return this.getState().activeStudiers;
  },

  updateStudyTimer(timer: Partial<SocialStoreState["studyTimer"]>) {
    const state = this.getState();
    state.studyTimer = { ...state.studyTimer, ...timer };
    this.saveState(state);
  },

  logStudyMinutes(minutes: number) {
    const state = this.getState();
    const self = state.activeStudiers.find((s) => s.isSelf);
    if (self) {
      self.minutesStudied += minutes;
    }
    const selfContrib = state.contributors.find((c) => c.id === "c-4");
    if (selfContrib) {
      selfContrib.studyMinutes += minutes;
      selfContrib.points += minutes * 2;
    }
    this.saveState(state);
  },
};
