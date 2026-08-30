"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";

import {
  Sparkle,
  GameController,
  Target,
  Trophy,
  Fire,
  Clock,
  ArrowRight,
  Play,
  Brain,
  Note,
  UsersThree,
  ChartBar,
  FolderSimple,
} from "@phosphor-icons/react";
import { LearnerProfile, LearningPath, SkillGap } from "@/types";
import { mockStore, computeSkillGaps } from "@/lib/services/mockStore";

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [path, setPath] = useState<LearningPath | null>(null);
  const [gaps, setGaps] = useState<SkillGap[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [activityLog, setActivityLog] = useState<Array<{ day: string; shortDay: string; hours: number; completedLessons: number; streakActive: boolean }>>([]);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const p = await mockStore.hydrateProfile();
        const lp = await mockStore.hydrateLearningPath();

        if (mounted) {
          if (!p || !lp) {
            router.push("/onboarding");
            return;
          }
          setProfile(p);
          setPath(lp);
          setGaps(computeSkillGaps(p));
          // Real 14-day activity from localStorage
          setActivityLog(mockStore.getActivityLog(14));
        }
      } catch (err) {
        console.error("[DashboardPage] load error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [router]);

  // Group skill gaps by category clusters
  const groupedGaps = useMemo(() => {
    const groups: Record<string, SkillGap[]> = {};
    gaps.forEach((g) => {
      const cat = g.category || "Core & Architecture";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(g);
    });
    return groups;
  }, [gaps]);

  const categoriesList = useMemo(() => Object.keys(groupedGaps), [groupedGaps]);
  const totalLoggedHours14Days = useMemo(
    () => activityLog.reduce((acc, d) => acc + d.hours, 0).toFixed(1),
    [activityLog]
  );

  if (loading || !profile || !path) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-text-secondary">
        <span>Loading LearnPath AI Dashboard...</span>
      </div>
    );
  }

  // Find active focus node
  const activeLevel =
    path.levels.find((l) => l.status === "active") ||
    path.levels.find((l) => l.status !== "completed") ||
    path.levels[0];

  const criticalGapsCount = gaps.filter((g) => g.severity === "critical").length;
  const masteredCount = gaps.filter((g) => g.deltaGap === 0).length;

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-4 text-text-primary">
      {/*    1. Top Greeting Banner    */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-border bg-surface shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-focus/10 text-focus border border-focus/20 flex items-center gap-1">
                <Sparkle className="w-3.5 h-3.5" />
                Active Career Acceleration
              </span>
              <span className="text-xs text-text-secondary">*</span>
              <span className="text-xs text-text-secondary font-medium">{profile.targetRoleTitle}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Welcome back, <span className="text-focus">{profile.name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed line-clamp-2">
              Goal: &ldquo;{profile.goalPrompt}&rdquo;
            </p>
          </div>

          {/* Quick Metrics Header Pill */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-paper border border-border shadow-xs">
              <Fire className="w-5 h-5 text-warning" weight="fill" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-text-primary">{profile.currentStreak || 5} Days</span>
                <span className="text-[10px] text-text-secondary">Active Streak</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-2xl bg-paper border border-border shadow-xs">
              <Clock className="w-5 h-5 text-focus" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-text-primary">{path.weeklyHours}h / wk</span>
                <span className="text-[10px] text-text-secondary">Study Budget</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-2xl bg-paper border border-border shadow-xs">
              <Trophy className="w-5 h-5 text-signal" weight="fill" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-text-primary">{path.completionPercentage}%</span>
                <span className="text-[10px] text-text-secondary">Curriculum Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*    2. 14-Day Study Consistency & Activity Velocity Chart    */}
      <div className="p-6 rounded-3xl border border-border bg-surface shadow-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-focus/10 border border-focus/20 text-focus flex items-center justify-center">
              <ChartBar className="w-4 h-4" weight="bold" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <span>14-Day Study Velocity & Consistency</span>
                <span className="text-[10px] font-mono text-signal bg-signal/10 px-2 py-0.5 rounded-full border border-signal/20 font-semibold">
                     Active Rhythm
                </span>
              </h3>
              <p className="text-xs text-text-secondary">
                {totalLoggedHours14Days} hours studied across the last 14 days * Daily pace target: 1.5h/day
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-text-secondary">
              Total Lessons: <strong className="text-text-primary">{path.levels.filter((l) => l.status === "completed").length} Completed</strong>
            </span>
          </div>
        </div>

        {/* 14-Day Bar Graph */}
        <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 pt-2 items-end min-h-[140px]">
          {activityLog.map((act, i) => {
            const heightPercent = act.hours > 0
              ? Math.min(100, Math.max(12, Math.round((act.hours / 4.0) * 100)))
              : 6;
            const isToday = i === activityLog.length - 1;

            return (
              <div key={act.day} className="flex flex-col items-center gap-1.5 group cursor-pointer">
                {/* Tooltip on hover */}
                <div className="text-[10px] font-mono font-bold text-focus opacity-0 group-hover:opacity-100 transition-opacity">
                  {act.hours > 0 ? `${act.hours}h` : " - "}
                </div>

                {/* Vertical Bar */}
                <div className="w-full max-w-[28px] h-24 bg-paper rounded-xl overflow-hidden flex flex-col justify-end p-0.5 border border-border group-hover:border-focus/50 transition-colors">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-lg transition-all duration-300 ${
                      isToday && act.hours > 0
                        ? "bg-focus shadow-md shadow-focus/30 animate-pulse"
                        : act.hours > 0
                        ? "bg-gradient-to-t from-focus/70 to-focus"
                        : "bg-border/20"
                    }`}
                  />
                </div>

                {/* Day Label */}
                <span className={`text-[10px] font-mono truncate ${isToday ? "text-focus font-bold" : "text-text-secondary"}`}>
                  {act.shortDay}
                </span>
              </div>
            );
          })}
          {activityLog.length === 0 && (
            <div className="col-span-14 flex items-center justify-center h-24 text-xs text-text-secondary">
              Complete your first lesson to see your study activity graph.
            </div>
          )}
        </div>
      </div>


      {/*    3. Main Grid: Next Recommended Action & Quick Links    */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Next Recommended Action Card (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 p-6 rounded-3xl border border-focus/30 bg-surface shadow-xl">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-focus/15 text-focus border border-focus/30 flex items-center gap-1.5 font-mono">
              <Play className="w-3 h-3" weight="fill" />
              NEXT RECOMMENDED ACTION
            </span>
            <span className="text-xs text-text-secondary font-medium">Level {activeLevel.displayLevel}</span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-text-primary">{activeLevel.title}</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Week {activeLevel.targetWeek} * {activeLevel.phase} * {activeLevel.estimatedMinutes} mins
            </p>
          </div>

          {/* Explainable AI snippet */}
          <div className="p-3.5 rounded-2xl bg-focus/5 border border-focus/20 text-xs text-text-primary">
            <strong className="text-focus">   Why this step now: </strong>
            {activeLevel.whyRecommended}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link
              href={`/learn/${activeLevel.id}`}
              className="flex-1 py-3 rounded-2xl bg-focus hover:bg-focus/90 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-focus/25 cursor-pointer"
            >
              <Play className="w-4 h-4" weight="fill" />
              <span>Launch Learning Canvas (Level {activeLevel.displayLevel})</span>
            </Link>

            <Link
              href="/roadmap"
              className="py-3 px-4 rounded-2xl bg-paper hover:bg-border border border-border text-text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <GameController className="w-4 h-4 text-focus" />
              <span>View Map</span>
            </Link>
          </div>
        </div>

        {/* Quick Launch Cards (5 Cols) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/roadmap"
            className="p-5 rounded-3xl border border-border bg-surface hover:border-focus/50 transition-all flex flex-col justify-between group shadow-lg"
          >
            <div className="w-10 h-10 rounded-2xl bg-focus/10 border border-focus/20 text-focus flex items-center justify-center mb-3">
              <GameController className="w-6 h-6" weight="fill" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary group-hover:text-focus transition-colors">
                Candy Crush RPG Map
              </h4>
              <p className="text-xs text-text-secondary mt-1">
                {path.completedLevelsCount}/{path.totalLevelsCount} Levels Mastered
              </p>
            </div>
            <span className="text-[11px] font-bold text-focus mt-3 flex items-center gap-1">
              Explore S-Curve <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link
            href="/social"
            className="p-5 rounded-3xl border border-border bg-surface hover:border-focus/50 transition-all flex flex-col justify-between group shadow-lg"
          >
            <div className="w-10 h-10 rounded-2xl bg-focus/10 border border-focus/20 text-focus flex items-center justify-center mb-3">
              <UsersThree className="w-6 h-6" weight="fill" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-text-primary group-hover:text-focus transition-colors">
                  Social Study Room
                </h4>
                <span className="w-2 h-2 rounded-full bg-signal animate-pulse" />
              </div>
              <p className="text-xs text-text-secondary mt-1">Real-time chat & video study calls</p>
            </div>
            <span className="text-[11px] font-bold text-focus mt-3 flex items-center gap-1">
              Join Live Room <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link
            href="/assessments/cat"
            className="p-5 rounded-3xl border border-border bg-surface hover:border-warning/50 transition-all flex flex-col justify-between group shadow-lg"
          >
            <div className="w-10 h-10 rounded-2xl bg-warning/10 border border-warning/20 text-warning flex items-center justify-center mb-3">
              <Brain className="w-6 h-6" weight="fill" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary group-hover:text-warning transition-colors">
                CAT Adaptive Checkpoint
              </h4>
              <p className="text-xs text-text-secondary mt-1">1-PL Rasch Adaptive Engine</p>
            </div>
            <span className="text-[11px] font-bold text-warning mt-3 flex items-center gap-1">
              Test Out <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link
            href="/notes"
            className="p-5 rounded-3xl border border-border bg-surface hover:border-focus/50 transition-all flex flex-col justify-between group shadow-lg"
          >
            <div className="w-10 h-10 rounded-2xl bg-focus/10 border border-focus/20 text-focus flex items-center justify-center mb-3">
              <Note className="w-6 h-6" weight="fill" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary group-hover:text-focus transition-colors">
                Study Notes & Insights
              </h4>
              <p className="text-xs text-text-secondary mt-1">Level canvas scratchpad</p>
            </div>
            <span className="text-[11px] font-bold text-focus mt-3 flex items-center gap-1">
              Open Notes <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        </div>
      </div>

      {/*    4. Categorized Skill Gap Delta Matrix    */}
      <div className="flex flex-col gap-5 p-6 sm:p-8 rounded-3xl border border-border bg-surface shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Target className="w-5 h-5 text-focus" />
              Role Skill Gap Delta Matrix (&Delta; = max(0, Required - Current))
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Personalized curriculum synthesized directly from your verified gaps instead of generic playlists.
            </p>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-alert/10 border border-alert/20 text-alert font-bold">
              {criticalGapsCount} Critical Gaps
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-signal/10 border border-signal/20 text-signal font-bold">
              {masteredCount} Mastered (Skipped)
            </span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-focus text-white shadow-md shadow-focus/25"
                : "bg-paper hover:bg-surface border border-border text-text-secondary"
            }`}
          >
            All Categories ({gaps.length})
          </button>
          {categoriesList.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? "bg-focus text-white shadow-md shadow-focus/25"
                  : "bg-paper hover:bg-surface border border-border text-text-secondary"
              }`}
            >
              <FolderSimple className="w-3.5 h-3.5" />
              <span>{cat}</span>
              <span className="font-mono text-[10px]">({groupedGaps[cat].length})</span>
            </button>
          ))}
        </div>

        {/* Grouped Category Sections */}
        <div className="space-y-6 pt-2">
          {categoriesList
            .filter((cat) => selectedCategory === "all" || selectedCategory === cat)
            .map((cat) => {
              const catGaps = groupedGaps[cat] || [];
              const catMastered = catGaps.filter((g) => g.deltaGap === 0).length;

              return (
                <div key={cat} className="space-y-3">
                  {/* Category Header Bar */}
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                      <FolderSimple className="w-4 h-4 text-focus" weight="bold" />
                      <span>{cat}</span>
                    </h4>
                    <span className="text-[11px] font-mono text-text-secondary font-medium">
                      {catMastered}/{catGaps.length} Mastered
                    </span>
                  </div>

                  {/* Skill Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {catGaps.map((gap) => {
                      const isNone = gap.deltaGap === 0;
                      const isCritical = gap.severity === "critical";
                      const isModerate = gap.severity === "moderate";

                      return (
                        <div
                          key={gap.skillName}
                          className={`flex flex-col gap-2.5 p-4 rounded-2xl border transition-all ${
                            isNone
                              ? "border-border bg-paper/60 opacity-80"
                              : isCritical
                              ? "border-alert/30 bg-alert/5"
                              : isModerate
                              ? "border-warning/30 bg-warning/5"
                              : "border-border bg-paper"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-text-primary">{gap.skillName}</span>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                isNone
                                  ? "bg-signal/10 text-signal border border-signal/20"
                                  : isCritical
                                  ? "bg-alert/10 text-alert border border-alert/20"
                                  : "bg-warning/10 text-warning border border-warning/20"
                              }`}
                            >
                              {isNone ? "  NO GAP (SKIPPED)" : `   GAP: ${gap.deltaGap}%`}
                            </span>
                          </div>

                          {/* Progress Comparison Track */}
                          <div className="flex flex-col gap-1 text-xs pt-1">
                            <div className="flex items-center justify-between text-[11px] text-text-secondary">
                              <span>Current: <strong className="text-text-primary">{gap.currentProficiency}%</strong></span>
                              <span>Target: <strong className="text-focus font-bold">{gap.requiredProficiency}%</strong></span>
                            </div>
                            <div className="w-full h-2 bg-surface rounded-full overflow-hidden flex border border-border">
                              <div
                                style={{ width: `${gap.currentProficiency}%` }}
                                className={`h-full ${isNone ? "bg-signal" : "bg-focus"}`}
                              />
                              {!isNone && (
                                <div
                                  style={{ width: `${gap.deltaGap}%` }}
                                  className="h-full bg-alert/70"
                                />
                              )}
                            </div>
                          </div>

                          {!isNone && (
                            <span className="text-[11px] text-text-secondary pt-0.5">
                                 Estimated time to close: <strong>{gap.estimatedHoursToClose} hours</strong>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
