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

  const currentUserName = profile?.name || user?.user_metadata?.name || "Learner";

  useEffect(() => {
    const localProfile = mockStore.getProfile();
    const activePath = mockStore.getLearningPath();

    const levelsCompleted = activePath?.levels?.filter((l) => l.status === "completed").length || 0;
    const points = levelsCompleted * 150 + (localProfile?.currentStreak || 0) * 20;

    const currentUserObj: LeaderboardUser = {
      id: user?.id || "current_user",
      name: `${currentUserName} (You)`,
      roleTitle: localProfile?.targetRoleTitle || "Learner",
      streak: localProfile?.currentStreak || 0,
      levelsMastered: levelsCompleted,
      thetaAbility: 1.45,
      totalPoints: points > 0 ? points : 150,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUserName)}`,
      isCurrentUser: true,
    };



    // Only show the current user  -  leaderboard populates as more users join
    const combined = [currentUserObj];
    setLeaderboard(combined);

    // Real activity from completed levels
    const completedLevels = activePath?.levels?.filter((l) => l.status === "completed") || [];
    const realActivities: ActivityItem[] = completedLevels.slice(-5).reverse().map((lvl, idx) => ({
      id: `act_real_${idx}`,
      userName: `${currentUserName} (You)`,
      userAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUserName)}`,
      activityTitle: `Mastered Level ${lvl.displayLevel}: ${lvl.skillName}`,
      category: "DAG Milestone",
      points: 150,
      solvedAt: idx === 0 ? "Recently" : `${idx + 1} levels ago`,
      isCurrentUser: true,
    }));

    if (realActivities.length === 0) {
      realActivities.push({
        id: "act_onboarding",
        userName: `${currentUserName} (You)`,
        userAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUserName)}`,
        activityTitle: "Calibrated Ground-Truth Skill Matrix",
        category: "Onboarding",
        points: 100,
        solvedAt: "Session start",
        isCurrentUser: true,
      });
    }

    setActivities(realActivities);
  }, [user, currentUserName, profile]);



  const topThree = leaderboard.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 text-text-primary">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl border border-border bg-surface shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-warning/10 text-warning border border-warning/20 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" />
              Global Cohort Rankings
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
            Career Readiness Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Learners ranked by levels conquered, Rasch item-response theta proficiency, and continuous study streaks.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-paper border border-border">
          <button
            type="button"
            onClick={() => setTimeframe("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              timeframe === "all" ? "bg-focus text-white shadow-md shadow-focus/25" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            All-Time
          </button>
          <button
            type="button"
            onClick={() => setTimeframe("weekly")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              timeframe === "weekly" ? "bg-focus text-white shadow-md shadow-focus/25" : "text-text-secondary hover:text-text-primary"
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
          <div className="order-2 md:order-1 p-6 rounded-3xl border border-border bg-surface flex flex-col items-center text-center relative group shadow-lg">
            <div className="w-8 h-8 rounded-full bg-paper text-text-secondary font-bold flex items-center justify-center text-sm absolute -top-3 shadow-lg border border-border">
              2
            </div>
            <img
              src={topThree[1].avatarUrl}
              alt={topThree[1].name}
              className="w-16 h-16 rounded-full border-2 border-border mb-3"
            />
            <h3 className="text-sm font-bold text-text-primary">{topThree[1].name}</h3>
            <span className="text-[11px] text-text-secondary">{topThree[1].roleTitle}</span>
            <div className="mt-4 px-3 py-1.5 rounded-xl bg-paper border border-border font-mono font-bold text-xs text-text-primary">
              {topThree[1].totalPoints} XP
            </div>
          </div>

          {/* #1 Rank (Gold) */}
          <div className="order-1 md:order-2 p-7 rounded-3xl border border-warning/40 bg-surface flex flex-col items-center text-center relative group shadow-2xl shadow-warning/10">
            <div className="w-10 h-10 rounded-full bg-warning text-paper font-black flex items-center justify-center text-base absolute -top-4 shadow-xl border-2 border-warning">
              <Crown className="w-5 h-5" weight="fill" />
            </div>
            <img
              src={topThree[0].avatarUrl}
              alt={topThree[0].name}
              className="w-20 h-20 rounded-full border-2 border-warning mb-3 shadow-lg"
            />
            <h3 className="text-base font-bold text-text-primary">{topThree[0].name}</h3>
            <span className="text-xs text-warning font-medium">{topThree[0].roleTitle}</span>
            <div className="mt-4 px-4 py-2 rounded-xl bg-warning/20 border border-warning/30 font-mono font-bold text-sm text-warning">
              {topThree[0].totalPoints} XP
            </div>
          </div>

          {/* #3 Rank (Bronze) */}
          <div className="order-3 md:order-3 p-6 rounded-3xl border border-border bg-surface flex flex-col items-center text-center relative group shadow-lg">
            <div className="w-8 h-8 rounded-full bg-paper text-alert font-bold flex items-center justify-center text-sm absolute -top-3 shadow-lg border border-border">
              3
            </div>
            <img
              src={topThree[2].avatarUrl}
              alt={topThree[2].name}
              className="w-16 h-16 rounded-full border-2 border-border mb-3"
            />
            <h3 className="text-sm font-bold text-text-primary">{topThree[2].name}</h3>
            <span className="text-[11px] text-text-secondary">{topThree[2].roleTitle}</span>
            <div className="mt-4 px-3 py-1.5 rounded-xl bg-paper border border-border font-mono font-bold text-xs text-text-primary">
              {topThree[2].totalPoints} XP
            </div>
          </div>
        </div>
      )}

      {/* Main Split: Leaderboard Table & Live Cohort Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Full Roster (8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl border border-border bg-surface shadow-xl space-y-4">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Medal className="w-5 h-5 text-focus" />
            Rankings & Competency Metrics
          </h2>

          <div className="space-y-2">
            {leaderboard.length === 0 ? (
              <div className="p-8 rounded-2xl bg-paper/60 border border-border text-center space-y-3">
                <Medal className="w-8 h-8 text-text-secondary mx-auto" />
                <p className="text-xs font-bold text-text-primary">No Ranking Data Recorded Yet</p>
                <p className="text-[11px] text-text-secondary">
                  Complete your first milestone in the Learning Canvas to earn ranking points.
                </p>
              </div>
            ) : (
              leaderboard.map((u, idx) => (
                <div
                  key={u.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    u.isCurrentUser
                      ? "border-focus/40 bg-focus/5 shadow-md"
                      : "border-border bg-paper hover:border-border/80"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-6 text-center font-mono font-bold text-xs text-text-secondary">
                      #{idx + 1}
                    </span>
                    <img src={u.avatarUrl} alt={u.name} className="w-9 h-9 rounded-full border border-border" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs sm:text-sm font-bold ${u.isCurrentUser ? "text-focus" : "text-text-primary"}`}>
                          {u.name}
                        </span>
                        {u.isCurrentUser && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-focus/20 text-focus font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-text-secondary block">{u.roleTitle}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="hidden sm:flex items-center gap-1 text-warning">
                      <Fire className="w-4 h-4" weight="fill" />
                      <span>{u.streak}d</span>
                    </div>

                    <div className="hidden sm:flex items-center gap-1 text-focus">
                      <GameController className="w-4 h-4" weight="fill" />
                      <span>{u.levelsMastered} Lvls</span>
                    </div>

                    <span className="px-3 py-1.5 rounded-xl bg-surface border border-border text-text-primary font-bold">
                      {u.totalPoints} XP
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>


        {/* Live Cohort Activity (4 Cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl border border-border bg-surface shadow-xl space-y-4">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Sparkle className="w-5 h-5 text-focus" />
            Live Cohort Activity
          </h2>

          <div className="space-y-3">
            {activities.map((act) => (
              <div key={act.id} className="p-3.5 rounded-2xl bg-paper border border-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-primary">{act.userName}</span>
                  <span className="text-[10px] text-text-secondary">{act.solvedAt}</span>
                </div>
                <p className="text-xs text-text-secondary leading-snug">{act.activityTitle}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-mono text-signal font-medium">+{act.points} XP</span>
                  <span className="text-[10px] text-text-secondary font-mono">[{act.category}]</span>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/social"
            className="w-full py-3 rounded-2xl bg-focus/10 hover:bg-focus/20 border border-focus/30 text-focus text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Join Peer Study Room</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
