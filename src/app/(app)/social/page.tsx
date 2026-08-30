"use client";

import React, { useState, useEffect, useRef } from "react";
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
  SpeakerHigh,
  SpeakerSlash,
  X,
  Copy,
  Check,
  UserPlus,
  Play,
  Pause,
  ArrowClockwise,
  User,
  ShieldCheck,
  SignIn,
  SignOut,
} from "@phosphor-icons/react";
import {
  socialStore,
  StudyGroup,
  GroupMessage,
  DoubtItem,
  StudyChallenge,
  Friend,
} from "@/lib/services/socialStore";

type SocialTab = "chat" | "doubts" | "study-together" | "challenges";

export default function SocialStudyRoomPage() {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<SocialTab>("chat");

  // Friends & Search states
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendSearch, setFriendSearch] = useState("");
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [newFriendName, setNewFriendName] = useState("");
  const [newFriendSkill, setNewFriendSkill] = useState("");
  const [friendToast, setFriendToast] = useState<string | null>(null);

  // Group creation modal
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupTopic, setNewGroupTopic] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");

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
  const [newDoubtTopic, setNewDoubtTopic] = useState("");
  const [answeringDoubtId, setAnsweringDoubtId] = useState<string | null>(null);
  const [answerInput, setAnswerInput] = useState("");

  // Pomodoro Focus Timer states
  const [timerMode, setTimerMode] = useState<"25" | "50">("25");
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [sessionsCompleted, setSessionsCompleted] = useState<number>(1);
  const [ambientSound, setAmbientSound] = useState<"none" | "rain" | "lofi">("none");

  // Challenges
  const [challenges, setChallenges] = useState<StudyChallenge[]>([]);

  // Clipboard toast
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Load initial data
  const loadData = () => {
    const loadedGroups = socialStore.getGroups();
    setGroups(loadedGroups);
    if (loadedGroups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(loadedGroups[0].id);
    }
    setFriends(socialStore.getFriends());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("learnpath_social_updated", handleUpdate);
    window.addEventListener("learnpath_friends_updated", handleUpdate);
    return () => {
      window.removeEventListener("learnpath_social_updated", handleUpdate);
      window.removeEventListener("learnpath_friends_updated", handleUpdate);
    };
  }, []);

  // Update active group data
  useEffect(() => {
    if (!selectedGroupId) return;
    setMessages(socialStore.getMessages(selectedGroupId));
    setDoubts(socialStore.getDoubts(selectedGroupId));
    setChallenges(socialStore.getChallenges(selectedGroupId));
  }, [selectedGroupId]);

  // Auto-scroll chat
  useEffect(() => {
    if (activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  // Pomodoro Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setSessionsCompleted((prev) => prev + 1);
      setTimeLeft(timerMode === "25" ? 25 * 60 : 50 * 60);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft, timerMode]);

  const activeGroup = groups.find((g) => g.id === selectedGroupId) || groups[0];

  // Friend actions
  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;
    const added = socialStore.addFriend(newFriendName, newFriendSkill || "Data Science");
    setFriends(socialStore.getFriends());
    setNewFriendName("");
    setNewFriendSkill("");
    setIsAddFriendModalOpen(false);
    showFriendToast(`Added ${added.name} to study buddies!`);
  };

  const handleInviteFriend = (friendName: string) => {
    showFriendToast(`Invitation sent to ${friendName} for ${activeGroup?.name || "Study Circle"}!`);
  };

  const showFriendToast = (msg: string) => {
    setFriendToast(msg);
    setTimeout(() => setFriendToast(null), 3000);
  };

  // Group actions
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    const created = socialStore.createGroup({
      name: newGroupName,
      topic: newGroupTopic || "Engineering",
      description: newGroupDesc || "Collaborative study group.",
    });
    setGroups(socialStore.getGroups());
    setSelectedGroupId(created.id);
    setNewGroupName("");
    setNewGroupTopic("");
    setNewGroupDesc("");
    setIsCreateGroupModalOpen(false);
  };

  const handleToggleJoin = () => {
    if (!activeGroup) return;
    if (activeGroup.isMember) {
      socialStore.leaveGroup(activeGroup.id);
    } else {
      socialStore.joinGroup(activeGroup.id);
    }
    setGroups(socialStore.getGroups());
  };

  // Message actions
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() && !codeSnippetContent.trim()) return;
    const snippet =
      isCodeInputOpen && codeSnippetContent.trim()
        ? { code: codeSnippetContent.trim(), lang: codeSnippetLang }
        : undefined;

    socialStore.sendMessage(selectedGroupId, messageInput, snippet);
    setMessages(socialStore.getMessages(selectedGroupId));
    setMessageInput("");
    setCodeSnippetContent("");
    setIsCodeInputOpen(false);
  };

  // Doubt actions
  const handleCreateDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoubtTitle.trim()) return;
    socialStore.createDoubt(
      selectedGroupId,
      newDoubtTitle,
      newDoubtDesc,
      newDoubtTopic || activeGroup?.topic || "General"
    );
    setDoubts(socialStore.getDoubts(selectedGroupId));
    setNewDoubtTitle("");
    setNewDoubtDesc("");
    setNewDoubtTopic("");
    setIsAskDoubtModalOpen(false);
  };

  const handleAnswerDoubt = (doubtId: string) => {
    if (!answerInput.trim()) return;
    socialStore.answerDoubt(selectedGroupId, doubtId, answerInput);
    setDoubts(socialStore.getDoubts(selectedGroupId));
    setAnswerInput("");
    setAnsweringDoubtId(null);
  };

  // Filtered lists
  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(friendSearch.toLowerCase()) ||
    f.currentSkill.toLowerCase().includes(friendSearch.toLowerCase())
  );

  const filteredDoubts = doubts.filter((d) => {
    const matchQuery =
      d.title.toLowerCase().includes(doubtSearch.toLowerCase()) ||
      d.description.toLowerCase().includes(doubtSearch.toLowerCase()) ||
      d.topicTag.toLowerCase().includes(doubtSearch.toLowerCase());
    if (selectedDoubtFilter === "resolved") return matchQuery && d.isResolved;
    if (selectedDoubtFilter === "unresolved") return matchQuery && !d.isResolved;
    return matchQuery;
  });

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-5xl xl:max-w-6xl mx-auto pb-3 text-text-primary min-w-0 overflow-hidden">
      {/* Toast Notification */}
      {friendToast && (
        <div className="fixed top-20 right-8 z-50 px-3.5 py-2 rounded-xl bg-surface border border-signal/30 text-signal shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top duration-300">
          <CheckCircle className="w-4 h-4 text-signal" weight="fill" />
          <span>{friendToast}</span>
        </div>
      )}

      {/* 1. Header Bar: Hub Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 sm:p-4 rounded-xl border border-border bg-surface shadow-xs">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-text-primary flex items-center gap-2">
            <Users className="w-4 h-4 text-focus" weight="fill" />
            <span>Social Study & Collaboration Hub</span>
          </h1>
          <p className="text-[11px] text-text-secondary mt-0.5">
            Collaborate with peers, solve doubts, and join live focus sessions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsAddFriendModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-paper hover:bg-sidebar border border-border text-text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-focus" />
            <span>Add Friend</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateGroupModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-focus hover:bg-focus/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs shadow-focus/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" weight="bold" />
            <span>Create Study Group</span>
          </button>
        </div>
      </div>

      {/* 2. Group Switcher Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs font-bold text-text-secondary shrink-0 uppercase tracking-wider pl-1">
          Active Circles:
        </span>
        {groups.map((grp) => {
          const isSelected = grp.id === selectedGroupId;
          return (
            <button
              key={grp.id}
              type="button"
              onClick={() => setSelectedGroupId(grp.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? "bg-focus text-white shadow-xs shadow-focus/25 font-bold"
                  : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-border/80"
              }`}
            >
              <span>{grp.name}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                  isSelected ? "bg-white/20 text-white" : "bg-paper text-text-secondary"
                }`}
              >
                {grp.membersCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start w-full min-w-0">
        {/* LEFT COLUMN (4 Cols): Active Circle Overview & Friends List */}
        <div className="lg:col-span-4 flex flex-col gap-3 min-w-0">
          {/* Active Circle Card */}
          <div className="p-3.5 rounded-xl border border-border bg-surface shadow-xs flex flex-col gap-2.5">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-focus/10 text-focus border border-focus/20">
                  {activeGroup?.topic || "Engineering"}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-text-primary mt-1">
                  {activeGroup?.name}
                </h3>
              </div>

              <button
                type="button"
                onClick={handleToggleJoin}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  activeGroup?.isMember
                    ? "bg-paper border border-border text-text-secondary hover:text-alert"
                    : "bg-focus text-white shadow-xs"
                }`}
              >
                {activeGroup?.isMember ? (
                  <>
                    <SignOut className="w-3.5 h-3.5" />
                    <span>Leave</span>
                  </>
                ) : (
                  <>
                    <SignIn className="w-3.5 h-3.5" />
                    <span>Join Circle</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              {activeGroup?.description}
            </p>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border text-center">
              <div className="p-2 rounded-xl bg-paper">
                <span className="text-xs font-bold text-text-primary block">{activeGroup?.membersCount}</span>
                <span className="text-[10px] text-text-secondary">Members</span>
              </div>
              <div className="p-2 rounded-xl bg-paper">
                <span className="text-xs font-bold text-signal flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse" />
                  {activeGroup?.activeNowCount}
                </span>
                <span className="text-[10px] text-text-secondary">Online</span>
              </div>
              <div className="p-2 rounded-xl bg-paper">
                <span className="text-xs font-bold text-text-primary block">{activeGroup?.solvedDoubtsCount}</span>
                <span className="text-[10px] text-text-secondary">Solved</span>
              </div>
            </div>
          </div>

          {/* Friends & Online Study Buddies Section */}
          <div className="p-3.5 rounded-xl border border-border bg-surface shadow-xs flex flex-col gap-2.5 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-focus" weight="bold" />
                <h3 className="text-xs font-bold text-text-primary">Study Buddies & Friends</h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-signal px-2 py-0.5 rounded-md bg-signal/10 border border-signal/20">
                {friends.filter((f) => f.status !== "offline").length} Active
              </span>
            </div>

            {/* Friend Search Bar */}
            <div className="relative">
              <MagnifyingGlass className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-text-secondary" />
              <input
                type="text"
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
                placeholder="Search friends by name or skill..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-paper border border-border text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-focus/50 transition-colors"
              />
            </div>

            {/* Friends List */}
            <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
              {filteredFriends.length === 0 ? (
                <div className="p-4 text-center text-xs text-text-secondary bg-paper rounded-xl">
                  No friends found. Click &quot;Add Friend&quot; to connect with peers!
                </div>
              ) : (
                filteredFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="p-2 rounded-xl bg-paper hover:bg-sidebar border border-border/80 transition-colors flex items-center justify-between gap-2 min-w-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-7 h-7 rounded-full bg-surface border border-border"
                        />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-surface ${
                            friend.status === "in_session"
                              ? "bg-warning"
                              : friend.status === "online"
                              ? "bg-signal"
                              : "bg-border"
                          }`}
                        />
                      </div>

                      <div className="min-w-0">
                        <span className="text-xs font-bold text-text-primary block truncate">
                          {friend.name}
                        </span>
                        <span className="text-[10px] text-text-secondary truncate block">
                          {friend.currentSkill}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleInviteFriend(friend.name)}
                      className="px-2 py-1 rounded-lg bg-surface hover:bg-focus hover:text-white border border-border text-[10px] font-semibold text-text-secondary transition-colors shrink-0 cursor-pointer"
                      title="Invite to active study group"
                    >
                      Invite
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mini Pomodoro Focus Widget */}
          <div className="p-3 rounded-xl border border-border bg-surface shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-focus/15 border border-focus/30 text-focus flex items-center justify-center shrink-0">
                <Timer className="w-4 h-4" weight="fill" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold font-mono text-text-primary">
                    {formatTimer(timeLeft)}
                  </span>
                  {isTimerRunning && (
                    <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] text-text-secondary truncate block">
                  {isTimerRunning ? "Focus Sprint Active" : "Sprint Paused"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="px-2.5 py-1 rounded-lg bg-focus hover:bg-focus/90 text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
              >
                {isTimerRunning ? "Pause" : "Start"}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("study-together")}
                className="p-1 rounded-lg bg-paper hover:bg-sidebar border border-border text-text-secondary hover:text-text-primary text-[10px] transition-colors cursor-pointer"
                title="Expand full focus timer"
              >
                Expand
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (8 Cols): Tabs (Live Discussion, Doubt Board, Study Together, Challenges) */}
        <div className="lg:col-span-8 flex flex-col gap-2.5 min-w-0">
          {/* Tab Navigation */}
          <div className="flex items-center p-1 rounded-xl bg-surface border border-border shadow-xs overflow-x-auto">
            {[
              { id: "chat", label: "Live Discussion", icon: ChatCircleText, count: messages.length },
              { id: "doubts", label: "Doubt Board", icon: Question, count: doubts.length },
              { id: "study-together", label: "Pomodoro Focus", icon: Timer, isLive: true },
              { id: "challenges", label: "Group Challenges", icon: Trophy, count: challenges.length },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as SocialTab)}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? "bg-focus text-white shadow-xs shadow-focus/25 font-bold"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" weight={isActive ? "fill" : "regular"} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
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

          {/* TAB 1: Live Discussion */}
          {activeTab === "chat" && (
            <div className="flex flex-col h-[460px] max-h-[calc(100vh-250px)] min-h-[360px] rounded-xl border border-border bg-surface shadow-xs overflow-hidden min-w-0">
              {/* Chat Header */}
              <div className="px-4 py-2.5 border-b border-border bg-surface flex items-center justify-between shrink-0">
                <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                  <ChatCircleText className="w-4 h-4 text-focus" weight="fill" />
                  <span>{activeGroup?.name} Stream</span>
                </span>
                <span className="text-[10px] text-text-secondary font-mono">
                  {messages.length} messages
                </span>
              </div>

              {/* Chat Message List */}
              <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 min-h-0 bg-paper/30">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-2.5 text-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={msg.authorAvatar}
                      alt={msg.authorName}
                      className="w-7 h-7 rounded-full bg-surface border border-border mt-0.5 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text-primary">{msg.authorName}</span>
                        <span className="text-[10px] text-text-secondary">{msg.timestamp}</span>
                      </div>
                      <p className="text-text-primary mt-1 leading-relaxed">{msg.content}</p>
                      {msg.codeSnippet && (
                        <div className="mt-2 p-2.5 rounded-xl bg-paper border border-border font-mono text-[11px]">
                          <pre className="overflow-x-auto">{msg.codeSnippet.code}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-2.5 sm:p-3 border-t border-border bg-surface flex flex-col gap-2 shrink-0"
              >
                {isCodeInputOpen && (
                  <textarea
                    value={codeSnippetContent}
                    onChange={(e) => setCodeSnippetContent(e.target.value)}
                    placeholder="Paste code snippet here..."
                    rows={3}
                    className="w-full p-2.5 rounded-xl bg-paper border border-border text-xs font-mono text-text-primary focus:outline-none focus:border-focus/50"
                  />
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCodeInputOpen(!isCodeInputOpen)}
                    className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                      isCodeInputOpen
                        ? "bg-focus/15 border-focus/40 text-focus"
                        : "bg-paper border-border text-text-secondary hover:text-text-primary"
                    }`}
                    title="Toggle code snippet input"
                  >
                    <Code className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 rounded-xl bg-paper border border-border text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-focus/50"
                  />

                  <button
                    type="submit"
                    disabled={!messageInput.trim() && !codeSnippetContent.trim()}
                    className="p-2 rounded-xl bg-focus hover:bg-focus/90 text-white disabled:opacity-40 transition-all cursor-pointer shadow-xs"
                  >
                    <PaperPlaneTilt className="w-4 h-4" weight="fill" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Doubt Board */}
          {activeTab === "doubts" && (
            <div className="flex flex-col gap-3">
              {/* Doubt Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 rounded-2xl border border-border bg-surface">
                <div className="relative flex-1 w-full">
                  <MagnifyingGlass className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-secondary" />
                  <input
                    type="text"
                    value={doubtSearch}
                    onChange={(e) => setDoubtSearch(e.target.value)}
                    placeholder="Search doubts..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-paper border border-border text-xs text-text-primary focus:outline-none focus:border-focus/50"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex items-center p-0.5 rounded-xl bg-paper border border-border text-xs">
                    {(["all", "unresolved", "resolved"] as const).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setSelectedDoubtFilter(filter)}
                        className={`px-2.5 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                          selectedDoubtFilter === filter
                            ? "bg-surface font-bold text-text-primary shadow-xs"
                            : "text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAskDoubtModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-focus text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" weight="bold" />
                    <span>Ask Doubt</span>
                  </button>
                </div>
              </div>

              {/* Doubt List */}
              <div className="flex flex-col gap-2.5 max-h-[460px] overflow-y-auto">
                {filteredDoubts.length === 0 ? (
                  <div className="p-8 text-center bg-surface border border-border rounded-2xl text-xs text-text-secondary">
                    No doubts found in this circle. Click &quot;Ask Doubt&quot; to post the first question!
                  </div>
                ) : (
                  filteredDoubts.map((doubt) => (
                    <div
                      key={doubt.id}
                      className="p-4 rounded-2xl border border-border bg-surface shadow-xs flex flex-col gap-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-paper border border-border text-text-secondary">
                              {doubt.topicTag}
                            </span>
                            {doubt.isResolved && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-signal/15 text-signal border border-signal/30 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" weight="fill" />
                                Resolved
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-text-primary mt-1">{doubt.title}</h4>
                        </div>

                        <button
                          type="button"
                          onClick={() => socialStore.upvoteDoubt(selectedGroupId, doubt.id)}
                          className={`px-2.5 py-1 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                            doubt.hasUpvoted
                              ? "bg-focus/15 border-focus/30 text-focus"
                              : "bg-paper border-border text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" weight={doubt.hasUpvoted ? "fill" : "regular"} />
                          <span>{doubt.upvotes}</span>
                        </button>
                      </div>

                      <p className="text-xs text-text-secondary leading-relaxed">{doubt.description}</p>

                      {doubt.codeSnippet && (
                        <div className="p-2.5 rounded-xl bg-paper border border-border font-mono text-[11px]">
                          <pre className="overflow-x-auto">{doubt.codeSnippet.code}</pre>
                        </div>
                      )}

                      {/* Answers Count & Action */}
                      <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                        <span className="text-text-secondary font-mono text-[11px]">
                          {doubt.answers.length} {doubt.answers.length === 1 ? "answer" : "answers"}
                        </span>

                        <button
                          type="button"
                          onClick={() => setAnsweringDoubtId(answeringDoubtId === doubt.id ? null : doubt.id)}
                          className="text-focus font-bold hover:underline cursor-pointer"
                        >
                          {answeringDoubtId === doubt.id ? "Cancel Answer" : "Write Answer"}
                        </button>
                      </div>

                      {/* Inline Answer Input */}
                      {answeringDoubtId === doubt.id && (
                        <div className="mt-2 flex gap-2">
                          <input
                            type="text"
                            value={answerInput}
                            onChange={(e) => setAnswerInput(e.target.value)}
                            placeholder="Type your explanation or solution..."
                            className="flex-1 px-3 py-1.5 rounded-xl bg-paper border border-border text-xs text-text-primary focus:outline-none focus:border-focus/50"
                          />
                          <button
                            type="button"
                            onClick={() => handleAnswerDoubt(doubt.id)}
                            className="px-3 py-1.5 rounded-xl bg-focus text-white text-xs font-bold shadow-xs cursor-pointer"
                          >
                            Post
                          </button>
                        </div>
                      )}

                      {/* Answers List */}
                      {doubt.answers.length > 0 && (
                        <div className="mt-1 flex flex-col gap-2 pl-3 border-l-2 border-focus/30">
                          {doubt.answers.map((ans) => (
                            <div key={ans.id} className="p-2.5 rounded-xl bg-paper text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-text-primary">{ans.authorName}</span>
                                {ans.isAccepted && (
                                  <span className="text-signal font-bold text-[10px] flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" weight="fill" /> Accepted Solution
                                  </span>
                                )}
                              </div>
                              <p className="text-text-secondary mt-1">{ans.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Study Together (Pomodoro) */}
          {activeTab === "study-together" && (
            <div className="p-6 sm:p-8 rounded-2xl border border-border bg-surface shadow-md flex flex-col items-center text-center gap-6">
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-focus/10 text-focus border border-focus/20">
                  SYNCHRONIZED FOCUS ROOM
                </span>
                <h3 className="text-xl font-bold text-text-primary mt-2">
                  Study Sprint with {activeGroup?.name}
                </h3>
              </div>

              {/* Timer Dial */}
              <div className="w-48 h-48 rounded-full border-4 border-focus/30 bg-paper flex flex-col items-center justify-center shadow-inner">
                <span className="text-4xl font-black font-mono text-text-primary tracking-tight">
                  {formatTimer(timeLeft)}
                </span>
                <span className="text-[11px] font-semibold text-text-secondary mt-1">
                  {timerMode}-Minute Sprint
                </span>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="px-6 py-2.5 rounded-xl bg-focus hover:bg-focus/90 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-focus/25 cursor-pointer"
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" weight="fill" /> : <Play className="w-4 h-4" weight="fill" />}
                  <span>{isTimerRunning ? "Pause Sprint" : "Start Sprint"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimeLeft(timerMode === "25" ? 25 * 60 : 50 * 60);
                  }}
                  className="p-2.5 rounded-xl bg-paper hover:bg-border border border-border text-text-secondary cursor-pointer"
                  title="Reset Timer"
                >
                  <ArrowClockwise className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Group Challenges */}
          {activeTab === "challenges" && (
            <div className="flex flex-col gap-3">
              {challenges.map((ch) => (
                <div key={ch.id} className="p-4 rounded-2xl border border-border bg-surface shadow-xs flex flex-col gap-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase">
                        {ch.type} Challenge
                      </span>
                      <h4 className="text-sm font-bold text-text-primary mt-1">{ch.title}</h4>
                    </div>
                    <span className="text-xs font-bold text-focus font-mono">+{ch.xpReward} XP</span>
                  </div>

                  <p className="text-xs text-text-secondary">{ch.description}</p>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] text-text-secondary font-mono">
                      <span>Progress</span>
                      <span>{ch.progress} / {ch.target}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-paper overflow-hidden border border-border">
                      <div
                        className="h-full bg-focus rounded-full"
                        style={{ width: `${Math.min(100, (ch.progress / ch.target) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Add Friend */}
      {isAddFriendModalOpen && (
        <div
          onClick={() => setIsAddFriendModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-text-primary"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-focus" />
                <span>Add Study Buddy / Friend</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddFriendModalOpen(false)}
                className="p-1 rounded-lg text-text-secondary hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddFriend} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Friend&apos;s Name</label>
                <input
                  type="text"
                  required
                  value={newFriendName}
                  onChange={(e) => setNewFriendName(e.target.value)}
                  placeholder="e.g. Liam Cooper"
                  className="w-full px-3 py-2 rounded-xl bg-paper border border-border text-xs text-text-primary focus:outline-none focus:border-focus/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Primary Skill Focus</label>
                <input
                  type="text"
                  value={newFriendSkill}
                  onChange={(e) => setNewFriendSkill(e.target.value)}
                  placeholder="e.g. Distributed Systems, SQL, Machine Learning"
                  className="w-full px-3 py-2 rounded-xl bg-paper border border-border text-xs text-text-primary focus:outline-none focus:border-focus/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddFriendModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-paper hover:bg-border text-text-secondary text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-focus hover:bg-focus/90 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Add Friend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Study Group */}
      {isCreateGroupModalOpen && (
        <div
          onClick={() => setIsCreateGroupModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-text-primary"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-focus" />
                <span>Create New Study Circle</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateGroupModalOpen(false)}
                className="p-1 rounded-lg text-text-secondary hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. LeetCode Hard Sprint Cohort"
                  className="w-full px-3 py-2 rounded-xl bg-paper border border-border text-xs text-text-primary focus:outline-none focus:border-focus/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Skill / Domain</label>
                <input
                  type="text"
                  required
                  value={newGroupTopic}
                  onChange={(e) => setNewGroupTopic(e.target.value)}
                  placeholder="e.g. Algorithms, Data Analytics, Python"
                  className="w-full px-3 py-2 rounded-xl bg-paper border border-border text-xs text-text-primary focus:outline-none focus:border-focus/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="What is the goal of this study circle?"
                  className="w-full px-3 py-2 rounded-xl bg-paper border border-border text-xs text-text-primary focus:outline-none focus:border-focus/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border mt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateGroupModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-paper hover:bg-border text-text-secondary text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-focus hover:bg-focus/90 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
