"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Users,
  ChatCircleText,
  Question,
  Timer,
  Trophy,
  Plus,
  MagnifyingGlass,
  CheckCircle,
  ThumbsUp,
  Code,
  PaperPlaneTilt,
  Sparkle,
  Fire,
  Crown,
  SpeakerHigh,
  SpeakerSlash,
  X,
  Copy,
  Check,
  ArrowsClockwise,
  UserPlus,
  UserCheck,
} from "@phosphor-icons/react";
import {
  socialStore,
  StudyGroup,
  GroupMessage,
  DoubtItem,
  StudyChallenge,
  Contributor,
  StudyParticipant,
} from "@/lib/services/socialStore";

type SocialTab = "chat" | "doubts" | "study-together" | "challenges" | "leaderboard";

export default function SocialStudyRoomPage() {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<SocialTab>("chat");

  // Chat states
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isCodeInputOpen, setIsCodeInputOpen] = useState(false);
  const [codeSnippetContent, setCodeSnippetContent] = useState("");
  const [codeSnippetLang, setCodeSnippetLang] = useState("python");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Doubt states
  const [doubts, setDoubts] = useState<DoubtItem[]>([]);
  const [doubtSearch, setDoubtSearch] = useState("");
  const [selectedDoubtFilter, setSelectedDoubtFilter] = useState<"all" | "resolved" | "unresolved">("all");
  const [isAskDoubtModalOpen, setIsAskDoubtModalOpen] = useState(false);
  const [newDoubtTitle, setNewDoubtTitle] = useState("");
  const [newDoubtDesc, setNewDoubtDesc] = useState("");
  const [newDoubtTag, setNewDoubtTag] = useState("Python");
  const [newDoubtCode, setNewDoubtCode] = useState("");
  const [answeringDoubtId, setAnsweringDoubtId] = useState<string | null>(null);
  const [answerInput, setAnswerInput] = useState("");
  const [answerCodeInput, setAnswerCodeInput] = useState("");

  // Study Together (Focus Timer) states
  const [activeStudiers, setActiveStudiers] = useState<StudyParticipant[]>([]);
  const [timerMode, setTimerMode] = useState<"25" | "50">("25");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  // Challenges & Leaderboard states
  const [challenges, setChallenges] = useState<StudyChallenge[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);

  // Create Group Modal
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupTopic, setNewGroupTopic] = useState("General");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [newGroupIcon, setNewGroupIcon] = useState("code");

  // Load state from socialStore
  const refreshData = useCallback(() => {
    const grps = socialStore.getGroups();
    setGroups(grps);

    let activeGId = selectedGroupId;
    if (grps.length > 0 && (!activeGId || !grps.some((g) => g.id === activeGId))) {
      activeGId = grps[0].id;
      setSelectedGroupId(activeGId);
    }

    const msgs = socialStore.getMessages(activeGId);
    setMessages(msgs);

    const dbts = socialStore.getDoubts(activeGId);
    setDoubts(dbts);

    const chs = socialStore.getChallenges(activeGId);
    setChallenges(chs);

    const cnts = socialStore.getContributors();
    setContributors(cnts);

    const stds = socialStore.getActiveStudiers();
    setActiveStudiers(stds);

    const timer = socialStore.getTimerState();
    setSessionsCompleted(timer.completedSessions);
  }, [selectedGroupId]);


  useEffect(() => {
    const timer = setTimeout(() => {
      refreshData();
    }, 0);

    const handleSocialUpdate = () => {
      refreshData();
    };

    window.addEventListener("learnpath_social_updated", handleSocialUpdate);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("learnpath_social_updated", handleSocialUpdate);
    };
  }, [refreshData]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            const minutes = timerMode === "25" ? 25 : 50;
            socialStore.logStudyMinutes(minutes);
            setSessionsCompleted((s) => s + 1);
            alert(`   Awesome! You completed a ${minutes}-minute collaborative focus session and earned +${minutes * 2} XP!`);
            refreshData();
            return timerMode === "25" ? 25 * 60 : 50 * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft, timerMode, refreshData]);

  const activeGroup = groups.find((g) => g.id === selectedGroupId) || groups[0];

  const handleSendMessage = () => {
    if (!messageInput.trim() && !codeSnippetContent.trim()) return;

    socialStore.sendMessage(
      selectedGroupId,
      messageInput.trim(),
      codeSnippetContent.trim()
        ? { code: codeSnippetContent.trim(), lang: codeSnippetLang }
        : undefined
    );

    setMessageInput("");
    setCodeSnippetContent("");
    setIsCodeInputOpen(false);
    refreshData();
  };

  const handlePostDoubt = () => {
    if (!newDoubtTitle.trim() || !newDoubtDesc.trim()) return;

    socialStore.postDoubt(
      selectedGroupId,
      newDoubtTitle.trim(),
      newDoubtDesc.trim(),
      newDoubtTag.trim(),
      newDoubtCode.trim()
        ? { code: newDoubtCode.trim(), lang: "python" }
        : undefined
    );

    setNewDoubtTitle("");
    setNewDoubtDesc("");
    setNewDoubtCode("");
    setIsAskDoubtModalOpen(false);
    refreshData();
  };

  const handlePostAnswer = (doubtId: string) => {
    if (!answerInput.trim()) return;

    socialStore.answerDoubt(
      selectedGroupId,
      doubtId,
      answerInput.trim(),
      answerCodeInput.trim()
        ? { code: answerCodeInput.trim(), lang: "python" }
        : undefined
    );

    setAnswerInput("");
    setAnswerCodeInput("");
    setAnsweringDoubtId(null);
    refreshData();
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    const created = socialStore.createGroup({
      name: newGroupName.trim(),
      topic: newGroupTopic,
      description: newGroupDesc.trim() || "Collaborative study cohort for mastering concepts together.",
      icon: newGroupIcon,
    });
    setNewGroupName("");
    setNewGroupDesc("");
    setIsCreateGroupModalOpen(false);
    setSelectedGroupId(created.id);
    refreshData();
  };

  const formatTimerDisplay = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const filteredDoubts = doubts.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(doubtSearch.toLowerCase()) ||
      d.description.toLowerCase().includes(doubtSearch.toLowerCase()) ||
      d.topicTag.toLowerCase().includes(doubtSearch.toLowerCase());

    if (selectedDoubtFilter === "resolved") return matchesSearch && d.isResolved;
    if (selectedDoubtFilter === "unresolved") return matchesSearch && !d.isResolved;
    return matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 text-text-primary">
      {/* ── 1. Top Header & Active Group Banner ── */}
      <div className="p-6 sm:p-7 rounded-3xl border border-border bg-surface shadow-xl flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-focus/15 border border-focus/30 text-focus flex items-center justify-center shadow-lg shadow-focus/20 shrink-0">
              <Users className="w-6 h-6" weight="duotone" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-text-primary flex items-center gap-2">
                  {activeGroup?.name || "Social Study Room"}
                </h1>
                {activeGroup?.levelBadge && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-focus/10 text-focus border border-focus/20">
                    {activeGroup.levelBadge}
                  </span>
                )}
                {activeGroup?.isMember ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-signal/15 text-signal border border-signal/30 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> Member
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeGroup) socialStore.joinGroup(activeGroup.id);
                      refreshData();
                    }}
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-focus text-white hover:bg-focus/90 flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                  >
                    <UserPlus className="w-3 h-3" /> Join Circle
                  </button>
                )}
              </div>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                {activeGroup?.description || "Collaborative study room for peer discussions and focus sprints."}
              </p>
            </div>
          </div>

          {/* Group Switcher & CTAs */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-paper border border-border text-xs text-text-primary font-semibold focus:outline-none focus:border-focus/50 cursor-pointer shadow-sm"
            >
              {groups.map((grp) => (
                <option key={grp.id} value={grp.id}>
                  {grp.name} ({grp.membersCount})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setIsCreateGroupModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-paper hover:bg-border border border-border text-text-primary text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" weight="bold" />
              <span>Create Circle</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("study-together")}
              className="px-3.5 py-2 rounded-xl bg-focus hover:bg-focus/90 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-focus/25 cursor-pointer"
            >
              <Timer className="w-4 h-4" weight="fill" />
              <span>Join Live Focus</span>
              <span className="w-2 h-2 rounded-full bg-signal animate-pulse ml-0.5" />
            </button>
          </div>
        </div>

        {/* Real-time Group Health & Progress Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/70">
          <div className="p-3 rounded-2xl bg-paper/60 border border-border flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-signal/15 text-signal flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" weight="bold" />
            </div>
            <div>
              <span className="text-xs font-bold text-text-primary block">
                {activeGroup?.activeNowCount || 1} Online Now
              </span>
              <span className="text-[10px] text-text-secondary font-mono">
                {activeGroup?.membersCount || 1} Total Members
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-paper/60 border border-border flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-focus/15 text-focus flex items-center justify-center shrink-0">
              <CheckCircle className="w-4 h-4" weight="fill" />
            </div>
            <div>
              <span className="text-xs font-bold text-text-primary block">
                {activeGroup?.solvedDoubtsCount || 0} Doubts Solved
              </span>
              <span className="text-[10px] text-text-secondary font-mono">Q&A Verified</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-paper/60 border border-border flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
              <Fire className="w-4 h-4" weight="fill" />
            </div>
            <div>
              <span className="text-xs font-bold text-text-primary block">
                {sessionsCompleted * 25} Mins Focused
              </span>
              <span className="text-[10px] text-text-secondary font-mono">Today&apos;s Sprint</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-paper/60 border border-border flex flex-col justify-center gap-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-text-secondary">Cohort Velocity</span>
              <span className="font-bold text-focus font-mono">{activeGroup?.progressPercentage || 0}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-border overflow-hidden">
              <div
                className="h-full bg-focus rounded-full transition-all duration-500"
                style={{ width: `${activeGroup?.progressPercentage || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>


      {/*    2. Tab Switcher Navigation Bar    */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface border border-border shadow-sm overflow-x-auto">
        {[
          { id: "chat", label: "Live Discussion", icon: ChatCircleText, count: messages.length },
          { id: "doubts", label: "Doubt Board", icon: Question, count: doubts.length },
          { id: "study-together", label: "Study Together", icon: Timer, count: activeStudiers.length, isLive: true },
          { id: "challenges", label: "Study Challenges", icon: Trophy, count: challenges.length },
          { id: "leaderboard", label: "Leaderboard", icon: Crown },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SocialTab)}
              className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? "bg-focus text-white shadow-md shadow-focus/25"
                  : "text-text-secondary hover:text-text-primary hover:bg-paper/50"
              }`}
            >
              <Icon className="w-4 h-4" weight={isActive ? "fill" : "regular"} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-paper text-text-secondary"
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {tab.isLive && (
                <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/*    3. TAB 1: Live Discussion    */}
      {activeTab === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Chat Stream (8 cols) */}
          <div className="lg:col-span-8 flex flex-col h-[600px] rounded-3xl border border-border bg-surface shadow-xl overflow-hidden">
            {/* Chat Messages */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
              {messages.length === 0 ? (

                <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4 my-auto">
                  <div className="w-14 h-14 rounded-2xl bg-focus/10 border border-focus/25 text-focus flex items-center justify-center mx-auto shadow-md">
                    <ChatCircleText className="w-7 h-7" weight="duotone" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <h4 className="text-sm font-bold text-text-primary">No Messages in this Study Circle</h4>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Be the first to kick off the discussion or ask for help on a milestone.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    {[
                      "   Hi everyone! Working on today's milestones.",
                      "   Anyone have tips for optimizing these exercises?",
                      "   Starting a 25m Pomodoro focus session now!",
                    ].map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setMessageInput(prompt)}
                        className="px-3 py-1.5 rounded-xl bg-paper hover:bg-border border border-border text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer text-left"
                      >
                        &ldquo;{prompt}&rdquo;
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-3 group">
                    <Image
                      src={msg.authorAvatar}
                      alt=""
                      width={36}
                      height={36}
                      unoptimized
                      className="w-9 h-9 rounded-2xl bg-paper p-0.5 border border-border shrink-0 shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-primary">{msg.authorName}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full font-mono uppercase ${
                            msg.authorRole === "mentor"
                              ? "bg-focus/15 text-focus border border-focus/30"
                              : "bg-paper text-text-secondary"
                          }`}
                        >
                          {msg.authorRole}
                        </span>
                        <span className="text-[10px] text-text-secondary font-mono">{msg.timestamp}</span>
                      </div>

                      <div className="mt-1 p-3 rounded-2xl bg-paper border border-border text-xs sm:text-sm text-text-primary leading-relaxed break-words space-y-2">
                        <p>{msg.content}</p>

                        {/* Code Snippet Box */}
                        {msg.codeSnippet && (
                          <div className="rounded-xl border border-border bg-surface overflow-hidden font-mono text-xs shadow-inner">
                            <div className="flex items-center justify-between px-3 py-1.5 bg-paper border-b border-border text-[10px] text-text-secondary">
                              <span className="font-semibold uppercase font-mono">{msg.codeSnippet.lang}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(msg.codeSnippet!.code);
                                  setCopiedSnippetId(msg.id);
                                  setTimeout(() => setCopiedSnippetId(null), 2000);
                                }}
                                className="hover:text-text-primary flex items-center gap-1 text-[10px] cursor-pointer"
                              >
                                {copiedSnippetId === msg.id ? (
                                  <Check className="w-3 h-3 text-signal" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                                <span>{copiedSnippetId === msg.id ? "Copied" : "Copy"}</span>
                              </button>
                            </div>
                            <pre className="p-3 text-text-primary overflow-x-auto whitespace-pre leading-relaxed">
                              {msg.codeSnippet.code}
                            </pre>
                          </div>
                        )}
                      </div>

                      {/* Emoji Reactions */}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {[
                          { key: "+1", label: "👍" },
                          { key: "fire", label: "🔥" },
                          { key: "rocket", label: "🚀" },
                          { key: "heart", label: "❤️" },
                        ].map((rx) => {
                          const count = msg.reactions?.[rx.key] || 0;
                          return (
                            <button
                              key={rx.key}
                              type="button"
                              onClick={() => {
                                socialStore.toggleReaction(selectedGroupId, msg.id, rx.key);
                                refreshData();
                              }}
                              className={`px-2 py-0.5 rounded-lg text-xs flex items-center gap-1 border transition-colors cursor-pointer ${
                                count > 0
                                  ? "bg-focus/10 border-focus/30 text-text-primary"
                                  : "bg-transparent border-transparent hover:bg-paper text-text-secondary"
                              }`}
                            >
                              <span>{rx.label}</span>
                              {count > 0 && <span className="font-mono text-[10px] font-bold">{count}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}

              <div ref={messagesEndRef} />
            </div>


            {/* Code Attachment Drawer */}
            {isCodeInputOpen && (
              <div className="p-3.5 bg-paper border-t border-border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center gap-1 text-focus">
                    <Code className="w-4 h-4" /> Attach Code Snippet
                  </span>
                  <select
                    value={codeSnippetLang}
                    onChange={(e) => setCodeSnippetLang(e.target.value)}
                    className="px-2 py-1 rounded bg-surface border border-border text-[11px] font-mono"
                  >
                    <option value="python">Python</option>
                    <option value="sql">SQL</option>
                    <option value="typescript">TypeScript</option>
                  </select>
                </div>
                <textarea
                  rows={3}
                  placeholder="# Type or paste reproducible code..."
                  value={codeSnippetContent}
                  onChange={(e) => setCodeSnippetContent(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface border border-border font-mono text-xs text-text-primary focus:outline-none focus:border-focus/50"
                />
              </div>
            )}

            {/* Chat Composer */}
            <div className="p-3.5 sm:p-4 border-t border-border bg-surface flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCodeInputOpen(!isCodeInputOpen)}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  isCodeInputOpen
                    ? "bg-focus text-white border-focus"
                    : "bg-paper hover:bg-border border-border text-text-secondary hover:text-text-primary"
                }`}
                title="Attach code snippet"
              >
                <Code className="w-4 h-4" />
              </button>

              <input
                type="text"
                placeholder="Message cohort or ask a quick question (press Enter to send)..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-paper border border-border text-xs sm:text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-focus/50 shadow-inner"
              />

              <button
                type="button"
                onClick={handleSendMessage}
                className="p-2.5 rounded-xl bg-focus hover:bg-focus/90 text-white transition-all shadow-md shadow-focus/25 cursor-pointer"
              >
                <PaperPlaneTilt className="w-4 h-4" weight="fill" />
              </button>
            </div>
          </div>

          {/* Sidebar Active Members & Quick Prompts (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Active Study Partners */}
            <div className="p-5 rounded-3xl border border-border bg-surface shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
                  <Users className="w-4 h-4 text-focus" weight="fill" />
                  <span>Active Cohort Members</span>
                </h3>
                <span className="text-[10px] font-mono bg-signal/15 text-signal px-2 py-0.5 rounded-full font-bold">
                  {activeStudiers.length} Live
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {activeStudiers.map((learner) => (
                  <div
                    key={learner.id}
                    className="p-2.5 rounded-2xl bg-paper/60 border border-border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <Image
                          src={learner.avatar}
                          alt=""
                          width={32}
                          height={32}
                          unoptimized
                          className="w-8 h-8 rounded-full bg-surface"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-signal ring-2 ring-paper" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-text-primary block truncate">
                          {learner.name}
                        </span>
                        <span className="text-[10px] text-text-secondary truncate block font-mono">
                          {learner.status}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-focus font-bold shrink-0">
                      {learner.minutesStudied}m
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Discussion Prompts */}
            <div className="p-5 rounded-3xl border border-border bg-surface shadow-xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
                <Sparkle className="w-4 h-4 text-focus" weight="fill" />
                <span>Quick Prompt Starters</span>
              </h3>
              <div className="space-y-1.5">
                {[
                  "Why use vectorized NumPy operations over iterrows()?",
                  "What is the difference between ROW_NUMBER() vs DENSE_RANK()?",
                  "Anyone free to study together for a 25m Focus Session?",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      setMessageInput(prompt);
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-paper/60 hover:bg-paper border border-border text-[11px] text-text-secondary hover:text-text-primary transition-colors cursor-pointer line-clamp-2"
                  >
                       {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/*    4. TAB 2: Doubt Board (Q&A with Upvoting & Solutions)    */}
      {activeTab === "doubts" && (
        <div className="space-y-5">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center relative w-full sm:max-w-md">
              <MagnifyingGlass className="absolute left-3.5 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Search doubts by title, question, or tag..."
                value={doubtSearch}
                onChange={(e) => setDoubtSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-border text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-focus/50 shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <div className="flex items-center p-1 rounded-xl bg-surface border border-border text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedDoubtFilter("all")}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedDoubtFilter === "all" ? "bg-focus text-white" : "text-text-secondary"
                  }`}
                >
                  All ({doubts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDoubtFilter("unresolved")}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedDoubtFilter === "unresolved" ? "bg-focus text-white" : "text-text-secondary"
                  }`}
                >
                  Unsolved
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDoubtFilter("resolved")}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedDoubtFilter === "resolved" ? "bg-focus text-white" : "text-text-secondary"
                  }`}
                >
                  Resolved
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsAskDoubtModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-focus hover:bg-focus/90 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-focus/25 cursor-pointer"
              >
                <Question className="w-4 h-4" weight="bold" />
                <span>Ask a Doubt</span>
              </button>
            </div>
          </div>

          {/* Doubt Cards List */}
          <div className="space-y-4">
            {filteredDoubts.map((doubt) => (
              <div
                key={doubt.id}
                className="p-6 rounded-3xl border border-border bg-surface hover:border-focus/40 transition-all flex flex-col gap-4 shadow-lg"
              >
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Upvote Button */}
                    <button
                      type="button"
                      onClick={() => {
                        socialStore.upvoteDoubt(selectedGroupId, doubt.id);
                        refreshData();
                      }}
                      className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center min-w-[50px] transition-all cursor-pointer ${
                        doubt.hasUpvoted
                          ? "bg-focus/15 border-focus text-focus font-bold shadow-sm"
                          : "bg-paper border-border text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" weight={doubt.hasUpvoted ? "fill" : "regular"} />
                      <span className="text-xs font-mono font-bold mt-1">{doubt.upvotes}</span>
                    </button>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-focus/10 text-focus border border-focus/20">
                          {doubt.topicTag}
                        </span>
                        {doubt.isResolved ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-signal/15 text-signal border border-signal/30 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" weight="fill" /> Solution Verified
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                            Open for Answers
                          </span>
                        )}
                        <span className="text-[10px] text-text-secondary font-mono">
                          Asked by {doubt.authorName} * {doubt.createdAt}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-text-primary leading-snug">
                        {doubt.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                        {doubt.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Question Code Snippet */}
                {doubt.codeSnippet && (
                  <div className="rounded-2xl border border-border bg-paper overflow-hidden font-mono text-xs">
                    <div className="px-3 py-1.5 bg-surface border-b border-border text-[10px] text-text-secondary font-mono uppercase font-bold">
                      {doubt.codeSnippet.lang}
                    </div>
                    <pre className="p-3.5 text-text-primary overflow-x-auto whitespace-pre leading-relaxed">
                      {doubt.codeSnippet.code}
                    </pre>
                  </div>
                )}

                {/* Answers Section */}
                <div className="space-y-3 pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                      Answers ({doubt.answers.length})
                    </h4>
                    <button
                      type="button"
                      onClick={() => setAnsweringDoubtId(answeringDoubtId === doubt.id ? null : doubt.id)}
                      className="text-xs font-bold text-focus hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" weight="bold" />
                      <span>Answer This Doubt</span>
                    </button>
                  </div>

                  {/* Existing Answers */}
                  {doubt.answers.map((ans) => (
                    <div
                      key={ans.id}
                      className={`p-4 rounded-2xl border flex flex-col gap-2.5 ${
                        ans.isAccepted
                          ? "bg-signal/5 border-signal/40 shadow-sm"
                          : "bg-paper/80 border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Image
                            src={ans.authorAvatar}
                            alt=""
                            width={24}
                            height={24}
                            unoptimized
                            className="w-6 h-6 rounded-full bg-surface"
                          />
                          <span className="text-xs font-bold text-text-primary">{ans.authorName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface border border-border text-text-secondary font-mono">
                            {ans.authorRole}
                          </span>
                          <span className="text-[10px] text-text-secondary font-mono">* {ans.timestamp}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {ans.isAccepted && (
                            <span className="px-2 py-0.5 rounded-full bg-signal/15 text-signal border border-signal/30 text-[10px] font-bold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" weight="fill" /> Accepted Answer
                            </span>
                          )}

                          {!ans.isAccepted && (
                            <button
                              type="button"
                              onClick={() => {
                                socialStore.acceptAnswer(selectedGroupId, doubt.id, ans.id);
                                refreshData();
                              }}
                              className="px-2.5 py-1 rounded-lg bg-paper hover:bg-signal/10 text-text-secondary hover:text-signal border border-border text-[11px] font-bold transition-colors cursor-pointer"
                              title="Mark as accepted solution"
                            >
                              Accept Solution
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              socialStore.upvoteAnswer(selectedGroupId, doubt.id, ans.id);
                              refreshData();
                            }}
                            className={`px-2 py-1 rounded-lg border text-xs flex items-center gap-1 font-mono cursor-pointer ${
                              ans.hasUpvoted
                                ? "bg-focus/15 border-focus text-focus font-bold"
                                : "bg-paper border-border text-text-secondary"
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>{ans.upvotes}</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-text-primary leading-relaxed">
                        {ans.content}
                      </p>

                      {ans.codeSnippet && (
                        <div className="rounded-xl border border-border bg-surface overflow-hidden font-mono text-xs">
                          <pre className="p-3 text-text-primary overflow-x-auto whitespace-pre leading-relaxed">
                            {ans.codeSnippet.code}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Inline Answer Composer */}
                  {answeringDoubtId === doubt.id && (
                    <div className="p-4 rounded-2xl bg-paper border border-focus/40 space-y-3 animate-in fade-in duration-200">
                      <h5 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                        <Sparkle className="w-3.5 h-3.5 text-focus" weight="fill" />
                        <span>Write your verified answer & explanation:</span>
                      </h5>
                      <textarea
                        rows={3}
                        placeholder="Explain the solution step-by-step with reasons..."
                        value={answerInput}
                        onChange={(e) => setAnswerInput(e.target.value)}
                        className="w-full p-3 rounded-xl bg-surface border border-border text-xs sm:text-sm text-text-primary focus:outline-none focus:border-focus/50 leading-relaxed"
                      />
                      <textarea
                        rows={2}
                        placeholder="(Optional) Add code snippet to reproduce fix..."
                        value={answerCodeInput}
                        onChange={(e) => setAnswerCodeInput(e.target.value)}
                        className="w-full p-3 rounded-xl bg-surface border border-border text-xs font-mono text-text-primary focus:outline-none focus:border-focus/50 leading-relaxed"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setAnsweringDoubtId(null)}
                          className="px-3 py-1.5 rounded-xl text-xs text-text-secondary hover:bg-surface cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePostAnswer(doubt.id)}
                          className="px-4 py-1.5 rounded-xl bg-focus hover:bg-focus/90 text-white text-xs font-bold shadow-md shadow-focus/25 cursor-pointer"
                        >
                          Post Answer (+50 XP)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredDoubts.length === 0 && (
              <div className="p-12 rounded-3xl border border-border bg-surface text-center space-y-3 shadow-sm">
                <Question className="w-12 h-12 text-text-secondary mx-auto" />
                <h3 className="text-base font-bold text-text-primary">No Doubts Found</h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  Have a question about code or concepts? Click <strong>&quot;Ask a Doubt&quot;</strong> to get help from your peers and mentors.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/*    5. TAB 3: Study Together (Live Collaborative Focus Room)    */}
      {activeTab === "study-together" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Focus Timer Arena (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl border border-border bg-surface shadow-2xl flex flex-col items-center text-center gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-focus/10 text-focus border border-focus/20 text-xs font-bold">
              <Timer className="w-4 h-4" weight="fill" />
              <span>Collaborative Focus Timer</span>
            </div>

            {/* Big Timer Clock Display */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-8 border-paper bg-surface flex flex-col items-center justify-center shadow-2xl">
              <div className="absolute inset-0 rounded-full border-4 border-focus/30 animate-pulse pointer-events-none" />
              <span className="text-5xl sm:text-6xl font-black font-mono tracking-tighter text-text-primary">
                {formatTimerDisplay(timeLeft)}
              </span>
              <span className="text-xs font-semibold text-text-secondary mt-1 uppercase tracking-wider">
                {isTimerRunning ? "Focus Sprint Active" : "Paused"}
              </span>
            </div>

            {/* Mode Controls */}
            <div className="flex items-center gap-2 p-1 rounded-2xl bg-paper border border-border text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setTimerMode("25");
                  setTimeLeft(25 * 60);
                  setIsTimerRunning(false);
                }}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  timerMode === "25" ? "bg-focus text-white shadow-md shadow-focus/25" : "text-text-secondary"
                }`}
              >
                25 Min Pomodoro
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimerMode("50");
                  setTimeLeft(50 * 60);
                  setIsTimerRunning(false);
                }}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  timerMode === "50" ? "bg-focus text-white shadow-md shadow-focus/25" : "text-text-secondary"
                }`}
              >
                50 Min Deep Work
              </button>
            </div>

            {/* Timer Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl transition-all cursor-pointer ${
                  isTimerRunning
                    ? "bg-amber-500 hover:bg-amber-600 text-zinc-950 shadow-amber-500/25"
                    : "bg-focus hover:bg-focus/90 text-white shadow-focus/30"
                }`}
              >
                {isTimerRunning ? "Pause Sprint" : "Start Focus Session"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimeLeft(timerMode === "25" ? 25 * 60 : 50 * 60);
                }}
                className="p-3.5 rounded-2xl bg-paper hover:bg-border border border-border text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                title="Reset timer"
              >
                <ArrowsClockwise className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setIsSoundOn(!isSoundOn)}
                className={`p-3.5 rounded-2xl border transition-colors cursor-pointer ${
                  isSoundOn
                    ? "bg-focus/15 border-focus/40 text-focus"
                    : "bg-paper border-border text-text-secondary"
                }`}
                title={isSoundOn ? "Ambient sound on" : "Ambient sound muted"}
              >
                {isSoundOn ? <SpeakerHigh className="w-5 h-5" /> : <SpeakerSlash className="w-5 h-5" />}
              </button>
            </div>

            {isSoundOn && (
              <p className="text-[11px] text-focus font-mono animate-pulse">
                   Simulating Lo-Fi Study Ambience (Binaural Beats for Deep Flow)
              </p>
            )}
          </div>

          {/* Who is Studying Right Now (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-3xl border border-border bg-surface shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Users className="w-4 h-4 text-focus" weight="fill" />
                <span>Studying With You Right Now</span>
              </h3>
              <span className="text-xs font-mono font-bold text-signal bg-signal/15 px-2.5 py-0.5 rounded-full">
                {activeStudiers.length} Active
              </span>
            </div>

            <div className="space-y-3">
              {activeStudiers.length === 0 ? (
                <div className="p-8 rounded-2xl bg-paper/60 border border-border text-center space-y-3">
                  <Timer className="w-8 h-8 text-text-secondary mx-auto" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-text-primary">No Active Studiers In This Room</p>
                    <p className="text-[11px] text-text-secondary">
                      Start your focus timer on the left to log your session and invite peers.
                    </p>
                  </div>
                </div>
              ) : (
                activeStudiers.map((learner) => (
                  <div
                    key={learner.id}
                    className="p-3.5 rounded-2xl bg-paper border border-border flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Image
                          src={learner.avatar}
                          alt=""
                          width={40}
                          height={40}
                          unoptimized
                          className="w-10 h-10 rounded-2xl bg-surface p-0.5 border border-border"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-signal ring-2 ring-paper" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                          <span>{learner.name}</span>
                          {learner.isSelf && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-focus/10 text-focus border border-focus/20">
                              YOU
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-text-secondary line-clamp-1 font-mono">
                          {learner.status}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-focus block">
                        {learner.minutesStudied}m
                      </span>
                      <span className="text-[9px] text-text-secondary uppercase">logged</span>
                    </div>
                  </div>
                ))
              )}
            </div>


            <div className="p-4 rounded-2xl bg-focus/5 border border-focus/20 space-y-1">
              <h4 className="text-xs font-bold text-focus">  Focus Rewards</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Completing a 25-minute Pomodoro earns <strong>+50 XP</strong> and raises your ranking on the contributor leaderboard.
              </p>
            </div>
          </div>
        </div>
      )}

      {/*    6. TAB 4: Study Challenges & Group Velocity    */}
      {activeTab === "challenges" && (
        <div className="space-y-6">
          {challenges.length === 0 ? (
            <div className="p-12 rounded-3xl border border-border bg-surface text-center space-y-3">
              <Trophy className="w-10 h-10 text-text-secondary mx-auto" />
              <h3 className="text-base font-bold text-text-primary">No Active Challenges in this Circle</h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Challenges are posted weekly to boost cohort velocity. Check back tomorrow or switch to another study circle.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.map((ch) => {
                const pct = Math.round((ch.progress / ch.target) * 100);
                return (
                  <div
                    key={ch.id}
                    className={`p-6 rounded-3xl border transition-all flex flex-col justify-between gap-4 shadow-lg ${
                      ch.isCompleted
                        ? "bg-signal/5 border-signal/30"
                        : "bg-surface border-border hover:border-focus/40"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full font-mono ${
                            ch.type === "daily"
                              ? "bg-focus/10 text-focus border border-focus/20"
                              : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          }`}
                        >
                          {ch.type} challenge
                        </span>
                        <span className="text-xs font-bold text-focus font-mono">
                          +{ch.xpReward} XP
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-text-primary">{ch.title}</h3>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {ch.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border/60">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-text-secondary">Progress</span>
                        <span className="font-bold text-text-primary font-mono">
                          {ch.progress} / {ch.target} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-paper overflow-hidden border border-border">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            ch.isCompleted ? "bg-signal" : "bg-focus"
                          }`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>

                      <div className="flex justify-end pt-1">
                        {ch.isCompleted ? (
                          <span className="text-xs font-bold text-signal flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" weight="fill" /> Claimed Reward
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              socialStore.completeChallenge(selectedGroupId, ch.id);
                              refreshData();
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-focus hover:bg-focus/90 text-white text-xs font-bold transition-all shadow-md shadow-focus/25 cursor-pointer"
                          >
                            Mark Done (+{ch.xpReward} XP)
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/*    7. TAB 5: Contributor Leaderboard    */}
      {activeTab === "leaderboard" && (
        <div className="p-6 sm:p-8 rounded-3xl border border-border bg-surface shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-text-primary flex items-center gap-2">
                <Crown className="w-6 h-6 text-amber-500" weight="fill" />
                <span>Cohort Top Contributors</span>
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                Rankings calculated from verified doubt answers, focus minutes logged, and study challenges completed.
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-paper border border-border text-xs font-mono font-bold text-focus">
              Weekly Reset in 3 Days
            </div>
          </div>

          <div className="space-y-3">
            {contributors.length === 0 ? (
              <div className="p-12 rounded-2xl bg-paper/60 border border-border text-center space-y-3">
                <Crown className="w-10 h-10 text-text-secondary mx-auto" />
                <h3 className="text-base font-bold text-text-primary">No Contributors Ranked Yet</h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  Be the first learner in this cohort to log study minutes or answer peer doubts to claim #1 rank!
                </p>
              </div>
            ) : (
              contributors.map((contrib) => (
                <div
                  key={contrib.id}
                  className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    contrib.rank === 1
                      ? "bg-amber-500/10 border-amber-500/40 shadow-md"
                      : contrib.rank === 2
                      ? "bg-zinc-200/10 border-zinc-400/30"
                      : "bg-paper/70 border-border"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        contrib.rank === 1
                          ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/30"
                          : contrib.rank === 2
                          ? "bg-zinc-300 text-zinc-900"
                          : contrib.rank === 3
                          ? "bg-amber-700 text-white"
                          : "bg-surface text-text-secondary border border-border"
                      }`}
                    >
                      #{contrib.rank}
                    </div>

                    <Image
                      src={contrib.avatar}
                      alt=""
                      width={40}
                      height={40}
                      unoptimized
                      className="w-10 h-10 rounded-2xl bg-surface p-0.5 border border-border shrink-0"
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-text-primary">{contrib.name}</h4>
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-surface border border-border text-text-secondary font-mono">
                          {contrib.badge}
                        </span>
                      </div>
                      <span className="text-[11px] text-text-secondary font-mono">{contrib.role}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-auto text-xs font-mono">
                    <div className="text-right">
                      <span className="text-text-secondary block text-[10px]">Answers</span>
                      <span className="font-bold text-text-primary">{contrib.doubtsAnswered}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-text-secondary block text-[10px]">Upvotes</span>
                      <span className="font-bold text-signal">+{contrib.upvotesReceived}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-text-secondary block text-[10px]">Focus Time</span>
                      <span className="font-bold text-focus">{contrib.studyMinutes}m</span>
                    </div>
                    <div className="text-right pl-2 border-l border-border">
                      <span className="text-text-secondary block text-[10px]">Points</span>
                      <span className="font-bold text-base text-text-primary">{contrib.points}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}


      {/*    Modal: Ask a Doubt    */}
      {isAskDoubtModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl p-6 rounded-3xl bg-surface border border-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Question className="w-5 h-5 text-focus" weight="bold" />
                <span>Post a Learning Doubt to {activeGroup?.name}</span>
              </h3>
              <button
                onClick={() => setIsAskDoubtModalOpen(false)}
                className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-paper"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Doubt Title</label>
                <input
                  type="text"
                  placeholder="e.g. Why does groupby aggregate with as_index=False reset the index?"
                  value={newDoubtTitle}
                  onChange={(e) => setNewDoubtTitle(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-paper border border-border text-xs sm:text-sm text-text-primary focus:outline-none focus:border-focus/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase">Topic Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Pandas, SQL, DAX..."
                    value={newDoubtTag}
                    onChange={(e) => setNewDoubtTag(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-paper border border-border text-xs text-text-primary focus:outline-none focus:border-focus/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase">Cohort Circle</label>
                  <input
                    type="text"
                    disabled
                    value={activeGroup?.name}
                    className="w-full mt-1 p-2.5 rounded-xl bg-paper/50 border border-border text-xs text-text-secondary font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Detailed Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe where you are stuck, expected vs actual behavior..."
                  value={newDoubtDesc}
                  onChange={(e) => setNewDoubtDesc(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-paper border border-border text-xs sm:text-sm text-text-primary focus:outline-none focus:border-focus/50 leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Reproducible Code (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="# Minimal code snippet to test..."
                  value={newDoubtCode}
                  onChange={(e) => setNewDoubtCode(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-paper border border-border font-mono text-xs text-text-primary focus:outline-none focus:border-focus/50 leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setIsAskDoubtModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-text-secondary hover:bg-paper cursor-pointer font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePostDoubt}
                className="px-5 py-2 rounded-xl bg-focus hover:bg-focus/90 text-white text-xs font-bold shadow-md shadow-focus/25 cursor-pointer"
              >
                Post Doubt
              </button>
            </div>
          </div>
        </div>
      )}

      {/*    Modal: Create Study Group    */}
      {isCreateGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-surface border border-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Users className="w-5 h-5 text-focus" weight="bold" />
                <span>Create a New Study Circle</span>
              </h3>
              <button
                onClick={() => setIsCreateGroupModalOpen(false)}
                className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-paper"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Circle Name</label>
                <input
                  type="text"
                  placeholder="e.g. Deep Learning & Computer Vision Sprint"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-paper border border-border text-xs sm:text-sm text-text-primary focus:outline-none focus:border-focus/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase">Topic</label>
                  <input
                    type="text"
                    placeholder="e.g. PyTorch / ML"
                    value={newGroupTopic}
                    onChange={(e) => setNewGroupTopic(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-paper border border-border text-xs text-text-primary focus:outline-none focus:border-focus/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase">Icon Emoji</label>
                  <input
                    type="text"
                    value={newGroupIcon}
                    onChange={(e) => setNewGroupIcon(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-paper border border-border text-xs text-center text-text-primary focus:outline-none focus:border-focus/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Description & Goal</label>
                <textarea
                  rows={3}
                  placeholder="What is the goal of this study group? (e.g., Solving LeetCode SQL challenges together)..."
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-paper border border-border text-xs sm:text-sm text-text-primary focus:outline-none focus:border-focus/50 leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setIsCreateGroupModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-text-secondary hover:bg-paper cursor-pointer font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateGroup}
                className="px-5 py-2 rounded-xl bg-focus hover:bg-focus/90 text-white text-xs font-bold shadow-md shadow-focus/25 cursor-pointer"
              >
                Launch Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
