"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { 
  Trophy, 
  Fire, 
  TrendUp, 
  Medal, 
  CheckCircle,
  Crown,
  Sparkle,
  Target,
  Brain,
  GameController,
} from "@phosphor-icons/react";
import Link from "next/link";
import { mockStore } from "@/lib/services/mockStore";

interface LeaderboardUser {
  id: string;
  name: string;
  roleTitle: string;
  streak: number;
  levelsMastered: number;
  thetaAbility: number;
  totalPoints: number;
  avatarUrl: string;
  isCurrentUser: boolean;
}

interface ActivityItem {
  id: string;
  userName: string;
  userAvatar: string;
  activityTitle: string;
  category: string;
  points: number;
  solvedAt: string;
  isCurrentUser: boolean;
}

export default function LeaderboardPage() {
  const { user, profile } = useSupabase();

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [timeframe, setTimeframe] = useState<"all" | "weekly">("all");

  const currentUserName = profile?.name || "Alex Dev";

  useEffect(() => {
    const localProfile = mockStore.getProfile();
    const activePath = mockStore.getLearningPath();

    const levelsCompleted = activePath.levels.filter((l) => l.status === "completed").length;
    const points = levelsCompleted * 150 + (localProfile.currentStreak || 5) * 20;

    const currentUserObj: LeaderboardUser = {
      id: user?.id || "current_user",
      name: `${currentUserName} (You)`,
      roleTitle: localProfile.targetRoleTitle || "Data Analyst & BI",
      streak: localProfile.currentStreak || 5,
      levelsMastered: levelsCompleted,
      thetaAbility: 1.45,
      totalPoints: points > 0 ? points : 450,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUserName)}`,
      isCurrentUser: true,
    };

    const mockPeers: LeaderboardUser[] = [
      {
        id: "peer_1",
        name: "Priyanshu Kumar",
        roleTitle: "Generative AI & RAG Engineer",
        streak: 14,
        levelsMastered: 12,
        thetaAbility: 2.1,
        totalPoints: 1850,
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=priyanshu",
        isCurrentUser: false,
      },
      {
        id: "peer_2",
        name: "Elena Rostova",
        roleTitle: "Fullstack AI Engineer",
        streak: 9,
        levelsMastered: 8,
        thetaAbility: 1.8,
        totalPoints: 1240,
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=elena",
        isCurrentUser: false,
      },
      {
        id: "peer_3",
        name: "Marcus Vance",
        roleTitle: "Cloud & DevOps Architect",
        streak: 6,
        levelsMastered: 6,
        thetaAbility: 1.2,
        totalPoints: 920,
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=marcus",
        isCurrentUser: false,
      },
      {
        id: "peer_4",
        name: "Aarav Sharma",
        roleTitle: "System Design & Distributed Systems",
        streak: 3,
        levelsMastered: 4,
        thetaAbility: 0.9,
        totalPoints: 610,
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=aarav",
        isCurrentUser: false,
      },
    ];

    const combined = [currentUserObj, ...mockPeers].sort((a, b) => b.totalPoints - a.totalPoints);
    setLeaderboard(combined);

    setActivities([
      {
        id: "act_1",
        userName: "Priyanshu Kumar",
        userAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=priyanshu",
        activityTitle: "Passed CAT Adaptive Checkpoint (Theta: +2.1)",
        category: "Adaptive Testing",
        points: 200,
        solvedAt: "5 mins ago",
        isCurrentUser: false,
      },
      {
        id: "act_2",
        userName: "Elena Rostova",
        userAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=elena",
        activityTitle: "Mastered Level 4: DAX Filter Context",
        category: "DAG Milestone",
        points: 150,
        solvedAt: "25 mins ago",
        isCurrentUser: false,
      },
      {
        id: "act_3",
        userName: currentUserName,
        userAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUserName)}`,
        activityTitle: "Calibrated Ground-Truth Skill Matrix",
        category: "Onboarding",
        points: 100,
        solvedAt: "1 hour ago",
        isCurrentUser: true,
      },
    ]);
  }, [user, currentUserName, profile]);

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" />
              Global Cohort Rankings
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100">
            Career Readiness Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Learners ranked by levels conquered, Rasch item-response theta proficiency, and continuous study streaks.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-950 border border-zinc-800">
          <button
            type="button"
            onClick={() => setTimeframe("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              timeframe === "all" ? "bg-emerald-500 text-zinc-950" : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            All-Time
          </button>
          <button
            type="button"
            onClick={() => setTimeframe("weekly")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              timeframe === "weekly" ? "bg-emerald-500 text-zinc-950" : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            This Week
          </button>
        </div>
      </div>

      {/* Podium for Top 3 */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4">
          {/* #2 Rank (Silver) */}
          <div className="order-2 md:order-1 p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 flex flex-col items-center text-center relative group hover:border-zinc-700 transition-all">
            <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center text-sm absolute -top-3 shadow-lg border border-zinc-700">
              2
            </div>
            <img
              src={topThree[1].avatarUrl}
              alt={topThree[1].name}
              className="w-16 h-16 rounded-full border-2 border-zinc-700 mb-3"
            />
            <h3 className="text-sm font-bold text-zinc-100">{topThree[1].name}</h3>
            <span className="text-[11px] text-zinc-400">{topThree[1].roleTitle}</span>
            <div className="mt-4 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono font-bold text-xs text-zinc-200">
              {topThree[1].totalPoints} XP
            </div>
          </div>

          {/* #1 Rank (Gold) */}
          <div className="order-1 md:order-2 p-7 rounded-3xl border border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-zinc-900/60 to-zinc-900/40 flex flex-col items-center text-center relative group shadow-2xl shadow-amber-500/10">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-zinc-950 font-black flex items-center justify-center text-base absolute -top-4 shadow-xl border-2 border-amber-400">
              <Crown className="w-5 h-5" weight="fill" />
            </div>
            <img
              src={topThree[0].avatarUrl}
              alt={topThree[0].name}
              className="w-20 h-20 rounded-full border-2 border-amber-400 mb-3 shadow-lg"
            />
            <h3 className="text-base font-bold text-zinc-100">{topThree[0].name}</h3>
            <span className="text-xs text-amber-400 font-medium">{topThree[0].roleTitle}</span>
            <div className="mt-4 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 font-mono font-bold text-sm text-amber-300">
              {topThree[0].totalPoints} XP
            </div>
          </div>

          {/* #3 Rank (Bronze) */}
          <div className="order-3 md:order-3 p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 flex flex-col items-center text-center relative group hover:border-zinc-700 transition-all">
            <div className="w-8 h-8 rounded-full bg-amber-900/40 text-amber-500 font-bold flex items-center justify-center text-sm absolute -top-3 shadow-lg border border-amber-800/40">
              3
            </div>
            <img
              src={topThree[2].avatarUrl}
              alt={topThree[2].name}
              className="w-16 h-16 rounded-full border-2 border-amber-800/50 mb-3"
            />
            <h3 className="text-sm font-bold text-zinc-100">{topThree[2].name}</h3>
            <span className="text-[11px] text-zinc-400">{topThree[2].roleTitle}</span>
            <div className="mt-4 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono font-bold text-xs text-zinc-200">
              {topThree[2].totalPoints} XP
            </div>
          </div>
        </div>
      )}

      {/* Main Split: Leaderboard Table & Live Cohort Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Full Roster (8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl shadow-xl space-y-4">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Medal className="w-5 h-5 text-emerald-400" />
            Rankings & Competency Metrics
          </h2>

          <div className="space-y-2">
            {leaderboard.map((u, idx) => (
              <div
                key={u.id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  u.isCurrentUser
                    ? "border-emerald-500/40 bg-emerald-950/20 shadow-md"
                    : "border-zinc-800/70 bg-zinc-950/60 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="w-6 text-center font-mono font-bold text-xs text-zinc-400">
                    #{idx + 1}
                  </span>
                  <img src={u.avatarUrl} alt={u.name} className="w-9 h-9 rounded-full border border-zinc-800" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs sm:text-sm font-bold ${u.isCurrentUser ? "text-emerald-300" : "text-zinc-200"}`}>
                        {u.name}
                      </span>
                      {u.isCurrentUser && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-400 block">{u.roleTitle}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="hidden sm:flex items-center gap-1 text-amber-400">
                    <Fire className="w-4 h-4" weight="fill" />
                    <span>{u.streak}d</span>
                  </div>

                  <div className="hidden sm:flex items-center gap-1 text-cyan-400">
                    <GameController className="w-4 h-4" weight="fill" />
                    <span>{u.levelsMastered} Lvls</span>
                  </div>

                  <span className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 font-bold">
                    {u.totalPoints} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Cohort Activity (4 Cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl shadow-xl space-y-4">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Sparkle className="w-5 h-5 text-teal-400" />
            Live Cohort Activity
          </h2>

          <div className="space-y-3">
            {activities.map((act) => (
              <div key={act.id} className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200">{act.userName}</span>
                  <span className="text-[10px] text-zinc-500">{act.solvedAt}</span>
                </div>
                <p className="text-xs text-zinc-400 leading-snug">{act.activityTitle}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-mono text-emerald-400 font-medium">+{act.points} XP</span>
                  <span className="text-[10px] text-zinc-500 font-mono">[{act.category}]</span>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/social"
            className="w-full py-3 rounded-2xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Join Peer Study Room</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
