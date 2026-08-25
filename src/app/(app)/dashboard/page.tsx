"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkle,
  GameController,
  Target,
  Trophy,
  Fire,
  Clock,
  CheckCircle,
  ArrowRight,
  Sliders,
  WarningCircle,
  Play,
  Brain,
  RocketLaunch,
  Note,
  UsersThree,
  VideoCamera,
} from "@phosphor-icons/react";
import { LearnerProfile, LearningPath, LevelNode, SkillGap } from "@/types";
import { mockStore, computeSkillGaps } from "@/lib/services/mockStore";

export default function DashboardPage() {
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [path, setPath] = useState<LearningPath | null>(null);
  const [gaps, setGaps] = useState<SkillGap[]>([]);

  useEffect(() => {
    const p = mockStore.getProfile();
    const activePath = mockStore.getLearningPath();
    const computedGaps = computeSkillGaps(p);

    setProfile(p);
    setPath(activePath);
    setGaps(computedGaps);
  }, []);

  if (!profile || !path) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-zinc-400">
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
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-emerald-950/40 backdrop-blur-xl shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Sparkle className="w-3.5 h-3.5" />
                Active Career Acceleration
              </span>
              <span className="text-xs text-zinc-500">•</span>
              <span className="text-xs text-zinc-400 font-medium">{profile.targetRoleTitle}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
              Welcome back, <span className="text-emerald-400">{profile.name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed line-clamp-2">
              Goal: &ldquo;{profile.goalPrompt}&rdquo;
            </p>
          </div>

          {/* Quick Metrics Header Pill */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800">
              <Fire className="w-5 h-5 text-amber-400" weight="fill" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-100">{profile.currentStreak || 5} Days</span>
                <span className="text-[10px] text-zinc-500">Streak</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800">
              <Clock className="w-5 h-5 text-cyan-400" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-100">{path.weeklyHours}h / wk</span>
                <span className="text-[10px] text-zinc-500">Pacing</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800">
              <Trophy className="w-5 h-5 text-emerald-400" weight="fill" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-100">{path.completionPercentage}%</span>
                <span className="text-[10px] text-zinc-500">Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Next Recommended Action & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Next Recommended Action Card (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 p-6 rounded-3xl border border-emerald-500/30 bg-zinc-900/50 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 font-mono">
              <Play className="w-3 h-3" weight="fill" />
              NEXT RECOMMENDED ACTION
            </span>
            <span className="text-xs text-zinc-400 font-medium">Level {activeLevel.displayLevel}</span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-zinc-100">{activeLevel.title}</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Week {activeLevel.targetWeek} • {activeLevel.phase} • {activeLevel.estimatedMinutes} mins
            </p>
          </div>

          {/* Explainable AI snippet */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-zinc-300">
            <strong className="text-emerald-400">💡 Why this step now: </strong>
            {activeLevel.whyRecommended}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link
              href={`/learn/${activeLevel.id}`}
              className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Play className="w-4 h-4" weight="fill" />
              <span>Launch Learning Canvas (Level {activeLevel.displayLevel})</span>
            </Link>

            <Link
              href="/roadmap"
              className="py-3 px-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <GameController className="w-4 h-4" />
              <span>View Map</span>
            </Link>
          </div>
        </div>

        {/* Quick Launch Cards (5 Cols) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/roadmap"
            className="p-5 rounded-3xl border border-zinc-800 bg-zinc-900/40 hover:border-emerald-500/40 hover:bg-zinc-900/80 transition-all flex flex-col justify-between group shadow-lg"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <GameController className="w-6 h-6" weight="fill" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-100 group-hover:text-emerald-300 transition-colors">
                Candy Crush RPG Map
              </h4>
              <p className="text-xs text-zinc-400 mt-1">
                {path.completedLevelsCount}/{path.totalLevelsCount} Levels Mastered
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 mt-3 flex items-center gap-1">
              Explore S-Curve <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          {/* Live Social Study Room & Peer Calls */}
          <Link
            href="/social"
            className="p-5 rounded-3xl border border-teal-500/30 bg-teal-950/10 hover:border-teal-400/50 hover:bg-teal-950/20 transition-all flex flex-col justify-between group shadow-lg"
          >
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-3">
              <UsersThree className="w-6 h-6" weight="fill" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-zinc-100 group-hover:text-teal-300 transition-colors">
                  Social Study Room
                </h4>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-zinc-400 mt-1">Real-time chat & video study calls</p>
            </div>
            <span className="text-[11px] font-bold text-teal-400 mt-3 flex items-center gap-1">
              Join Live Room <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link
            href="/assessments/cat"
            className="p-5 rounded-3xl border border-zinc-800 bg-zinc-900/40 hover:border-amber-500/40 hover:bg-zinc-900/80 transition-all flex flex-col justify-between group shadow-lg"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <Brain className="w-6 h-6" weight="fill" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-100 group-hover:text-amber-300 transition-colors">
                CAT Adaptive Checkpoint
              </h4>
              <p className="text-xs text-zinc-400 mt-1">1-PL Rasch Item Response Theory</p>
            </div>
            <span className="text-[11px] font-bold text-amber-400 mt-3 flex items-center gap-1">
              Test Out <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link
            href="/notes"
            className="p-5 rounded-3xl border border-zinc-800 bg-zinc-900/40 hover:border-cyan-500/40 hover:bg-zinc-900/80 transition-all flex flex-col justify-between group shadow-lg"
          >
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
              <Note className="w-6 h-6" weight="fill" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-100 group-hover:text-cyan-300 transition-colors">
                Study Notes & Insights
              </h4>
              <p className="text-xs text-zinc-400 mt-1">Level canvas & DSA scratchpad</p>
            </div>
            <span className="text-[11px] font-bold text-cyan-400 mt-3 flex items-center gap-1">
              Open Notes <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        </div>
      </div>

      {/* Fine-Grained Skill Gap Delta Matrix (Mathematical Foundation) */}
      <div className="flex flex-col gap-4 p-6 sm:p-8 rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              Role Skill Gap Delta Analysis (Delta = max(0, Required - Current))
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              The curriculum is synthesized from the mathematical gap rather than a generic linear syllabus.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium">
              {criticalGapsCount} Critical Gaps
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
              {masteredCount} Mastered (Skipped)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
          {gaps.map((gap) => {
            const isNone = gap.deltaGap === 0;
            const isCritical = gap.severity === "critical";
            const isModerate = gap.severity === "moderate";

            return (
              <div
                key={gap.skillName}
                className={`flex flex-col gap-2 p-4 rounded-2xl border transition-all ${
                  isNone
                    ? "border-zinc-900 bg-zinc-950/30 opacity-70"
                    : isCritical
                    ? "border-rose-500/30 bg-rose-950/10"
                    : isModerate
                    ? "border-amber-500/30 bg-amber-950/10"
                    : "border-zinc-800 bg-zinc-900/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-100">{gap.skillName}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">[{gap.category}]</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      isNone
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : isCritical
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {isNone ? "✅ NO GAP (SKIPPED)" : `🔴 GAP: ${gap.deltaGap}%`}
                  </span>
                </div>

                {/* Progress Comparison Track */}
                <div className="flex items-center gap-3 text-xs pt-1">
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Current: <strong className="text-zinc-200">{gap.currentProficiency}%</strong></span>
                      <span>Required: <strong className="text-emerald-400">{gap.requiredProficiency}%</strong></span>
                    </div>
                    <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden flex border border-zinc-800">
                      <div
                        style={{ width: `${gap.currentProficiency}%` }}
                        className={`h-full ${isNone ? "bg-emerald-500" : "bg-cyan-500"}`}
                      />
                      {!isNone && (
                        <div
                          style={{ width: `${gap.deltaGap}%` }}
                          className="h-full bg-rose-500/60"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {!isNone && (
                  <span className="text-[11px] text-zinc-500">
                    ⏱️ Estimated time to close gap: <strong>{gap.estimatedHoursToClose} hours</strong>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
