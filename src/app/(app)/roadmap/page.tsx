"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  GitFork,
  List,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";
import { LearningPath, LevelNode, RoadmapDiff } from "@/types";
import { mockStore } from "@/lib/services/mockStore";
import { CandyCrushMap } from "@/components/roadmap/CandyCrushMap";
import { MilestoneListView } from "@/components/roadmap/MilestoneListView";
import { LevelDetailsDrawer } from "@/components/roadmap/LevelDetailsDrawer";

import { useRouter } from "next/navigation";

export default function RoadmapPage() {
  const router = useRouter();
  const [path, setPath] = useState<LearningPath | null>(null);
  const [selectedNode, setSelectedNode] = useState<LevelNode | null>(null);
  const [viewMode, setViewMode] = useState<"candyCrush" | "timeline">("candyCrush");
  const [diffBanner, setDiffBanner] = useState<RoadmapDiff | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const hydPath = await mockStore.hydrateLearningPath();
        if (mounted) {
          if (hydPath) {
            setPath(hydPath);
          } else {
            setPath(null);
          }
          const diff = mockStore.getLastDiff();
          if (diff) setDiffBanner(diff);
        }
      } catch (err) {
        console.error("[RoadmapPage] load error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-text-secondary">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-focus" />
          <span>Loading dynamic DAG roadmap...</span>
        </div>
      </div>
    );
  }

  //    BLANK STATE: No Learning Path Generated Yet   
  if (!path) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
        <div className="p-8 sm:p-12 rounded-3xl border border-border bg-surface text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-focus/15 border border-focus/30 text-focus flex items-center justify-center mx-auto shadow-xl shadow-focus/20">
            <GitFork className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-focus/10 text-focus border border-focus/25 inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Dynamic DAG Architecture
            </span>
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">
              No Learning Path Synthesized Yet
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
              Your Candy Crush DAG roadmap sequences technical competencies using Kahn&apos;s topological sort based on your exact skill gaps. Complete the quick onboarding to synthesize your first path.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/onboarding")}
              className="px-6 py-3 rounded-2xl bg-focus hover:bg-focus/90 text-white font-bold text-xs sm:text-sm shadow-lg shadow-focus/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Launch Curriculum Synthesizer</span>
            </button>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-4">
      {/* Top Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl border border-border bg-surface shadow-xl">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-focus/10 text-focus border border-focus/20 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Adaptive Roadmap • Version {path.version}.0
            </span>
            <span className="text-xs text-text-secondary">•</span>
            <span className="text-xs text-text-secondary font-medium">
              {path.totalWeeks} Weeks ({path.weeklyHours}h/wk)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            {path.title}
          </h1>
          <p className="text-xs text-text-secondary">
            Structured with prerequisite sequencing so foundational concepts naturally build toward advanced milestones.
          </p>
        </div>

        {/* Progress Metrics & Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-paper border border-border shadow-sm">
            {/* Progress Circular Arc */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-border"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-signal transition-all duration-1000"
                  strokeDasharray={`${path.completionPercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[11px] font-bold font-mono text-text-primary">
                {path.completionPercentage}%
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-bold text-text-primary">
                {path.completedLevelsCount} / {path.totalLevelsCount} Milestones
              </span>
              <span className="text-[11px] text-text-secondary">Path Progress</span>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-paper border border-border">
            <button
              type="button"
              onClick={() => setViewMode("candyCrush")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "candyCrush"
                  ? "bg-focus text-white shadow-md shadow-focus/25"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <GitFork className="w-4 h-4" />
              <span>Interactive Map</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("timeline")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "timeline"
                  ? "bg-focus text-white shadow-md shadow-focus/25"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <List className="w-4 h-4" />
              <span>Timeline List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Animated Adaptive Diff Banner */}
      {diffBanner && (
        <div className="p-4 rounded-2xl border border-warning/30 bg-warning/10 flex items-start justify-between gap-3 animate-in slide-in-from-top duration-300">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-warning/20 text-warning flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary">
                Autonomous Adaptive Loop Recalibration (v{diffBanner.previousVersion} &rarr; v{diffBanner.newVersion})
              </h4>
              <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{diffBanner.summaryMessage}</p>
            </div>
          </div>

          <button
            onClick={() => setDiffBanner(null)}
            className="text-text-secondary hover:text-text-primary p-1 rounded-lg transition-colors cursor-pointer"
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
