"use client";

import React, { useState, useEffect } from "react";
import Link from "next/navigation";
import {
  Sparkle,
  GameController,
  ListBullets,
  SlidersHorizontal,
  WarningCircle,
  X,
  Target,
  Trophy,
  ArrowRight,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import { LearningPath, LevelNode, RoadmapDiff } from "@/types";
import { mockStore } from "@/lib/services/mockStore";
import { CandyCrushMap } from "@/components/roadmap/CandyCrushMap";
import { MilestoneListView } from "@/components/roadmap/MilestoneListView";
import { LevelDetailsDrawer } from "@/components/roadmap/LevelDetailsDrawer";

export default function RoadmapPage() {
  const [path, setPath] = useState<LearningPath | null>(null);
  const [selectedNode, setSelectedNode] = useState<LevelNode | null>(null);
  const [viewMode, setViewMode] = useState<"candyCrush" | "timeline">("candyCrush");
  const [diffBanner, setDiffBanner] = useState<RoadmapDiff | null>(null);

  useEffect(() => {
    const loadedPath = mockStore.getLearningPath();
    setPath(loadedPath);

    const diff = mockStore.getLastDiff();
    if (diff) {
      setDiffBanner(diff);
    }
  }, []);

  if (!path) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-zinc-400">
        <div className="flex items-center gap-2">
          <ArrowsClockwise className="w-5 h-5 animate-spin text-emerald-400" />
          <span>Loading dynamic DAG roadmap...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Sparkle className="w-3.5 h-3.5" />
              Dynamic Kahn's DAG • Version {path.version}.0
            </span>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400 font-medium">
              {path.totalWeeks} Weeks ({path.weeklyHours}h/wk)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
            {path.title}
          </h1>
          <p className="text-xs text-zinc-400">
            Sequenced using topological sorting to ensure foundational prerequisites precede advanced modeling.
          </p>
        </div>

        {/* Progress Metrics & Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800">
            {/* Progress Circular Arc */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-zinc-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400 transition-all duration-1000"
                  strokeDasharray={`${path.completionPercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[11px] font-bold font-mono text-zinc-100">
                {path.completionPercentage}%
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-200">
                {path.completedLevelsCount} / {path.totalLevelsCount} Levels
              </span>
              <span className="text-[11px] text-zinc-500">Career Readiness</span>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-zinc-950 border border-zinc-800">
            <button
              type="button"
              onClick={() => setViewMode("candyCrush")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "candyCrush"
                  ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <GameController className="w-4 h-4" weight="fill" />
              <span>Candy Crush Map</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("timeline")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "timeline"
                  ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <ListBullets className="w-4 h-4" weight="bold" />
              <span>Weekly Timeline</span>
            </button>
          </div>
        </div>
      </div>

      {/* Animated Adaptive Diff Banner */}
      {diffBanner && (
        <div className="p-4 rounded-2xl border border-orange-500/30 bg-orange-950/20 flex items-start justify-between gap-3 animate-in slide-in-from-top duration-300">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <WarningCircle className="w-5 h-5" weight="bold" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-orange-300">
                Autonomous Adaptive Loop Recalibration (v{diffBanner.previousVersion} ➔ v{diffBanner.newVersion})
              </h4>
              <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">{diffBanner.summaryMessage}</p>
            </div>
          </div>

          <button
            onClick={() => setDiffBanner(null)}
            className="text-zinc-500 hover:text-zinc-200 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Roadmap Canvas / Timeline */}
      {viewMode === "candyCrush" ? (
        <CandyCrushMap path={path} onSelectNode={setSelectedNode} />
      ) : (
        <MilestoneListView path={path} onSelectNode={setSelectedNode} />
      )}

      {/* Level Details Slide-Over Drawer */}
      <LevelDetailsDrawer node={selectedNode} onClose={() => setSelectedNode(null)} />
    </div>
  );
}
