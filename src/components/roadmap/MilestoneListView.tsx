"use client";

import React from "react";
import {
  Play,
  CheckCircle,
  Lock,
  Crown,
  WarningCircle,
  Clock,
  Star,
  Sparkle,
  ArrowRight,
} from "@phosphor-icons/react";
import { LearningPath, LevelNode } from "@/types";

interface MilestoneListViewProps {
  path: LearningPath;
  onSelectNode: (node: LevelNode) => void;
}

export function MilestoneListView({ path, onSelectNode }: MilestoneListViewProps) {
  // Group levels by target week
  const weekGroups = React.useMemo(() => {
    const map = new Map<number, LevelNode[]>();
    for (const lvl of path.levels) {
      const week = lvl.targetWeek || 1;
      if (!map.has(week)) map.set(week, []);
      map.get(week)!.push(lvl);
    }
    return Array.from(map.entries()).sort(([wA], [wB]) => wA - wB);
  }, [path.levels]);

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto py-4">
      {weekGroups.map(([weekNum, levels]) => {
        const phaseTitle = levels[0]?.phase || `Phase ${weekNum}`;
        const totalMinutes = levels.reduce((sum, l) => sum + (l.estimatedMinutes || 60), 0);
        const completedCount = levels.filter((l) => l.status === "completed").length;

        return (
          <div
            key={weekNum}
            className="flex flex-col gap-4 p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md shadow-lg"
          >
            {/* Week Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm font-mono">
                  W{weekNum}
                </span>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">Week {weekNum} Milestone</h3>
                  <p className="text-xs text-zinc-400">{phaseTitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-zinc-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  {Math.round(totalMinutes / 60 * 10) / 10} Hours
                </span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {completedCount}/{levels.length} Done
                </span>
              </div>
            </div>

            {/* Level Cards List */}
            <div className="flex flex-col gap-3">
              {levels.map((lvl) => {
                const isCompleted = lvl.status === "completed";
                const isActive = lvl.status === "active";
                const isLocked = lvl.status === "locked";
                const isBoss = lvl.isBossCheckpoint;
                const isRemediation = lvl.isRemediation;

                return (
                  <div
                    key={lvl.id}
                    onClick={() => onSelectNode(lvl)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? "border-emerald-500/50 bg-emerald-950/20 shadow-md shadow-emerald-500/10 scale-[1.01]"
                        : isCompleted
                        ? "border-zinc-800/80 bg-zinc-950/40 hover:border-zinc-700"
                        : isLocked
                        ? "border-zinc-900 bg-zinc-950/20 opacity-60 hover:opacity-100 hover:border-zinc-800"
                        : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Status Icon Indicator */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                          isCompleted
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : isActive
                            ? isBoss
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                              : "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/30"
                            : isLocked
                            ? "bg-zinc-800 text-zinc-600"
                            : "bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" weight="bold" />
                        ) : isLocked ? (
                          <Lock className="w-4 h-4" weight="fill" />
                        ) : isBoss ? (
                          <Crown className="w-5 h-5" weight="fill" />
                        ) : (
                          <span>{lvl.displayLevel}</span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-zinc-100">{lvl.title}</h4>
                          {isBoss && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              👑 BOSS CHECKPOINT
                            </span>
                          )}
                          {isRemediation && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                              REMEDIATION
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{lvl.whyRecommended}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isCompleted && (
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[1, 2, 3].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= (lvl.starsEarned || 3) ? "fill-amber-400" : "text-zinc-700"
                              }`}
                              weight="fill"
                            />
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isActive
                            ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                            : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                        }`}
                      >
                        {isBoss ? (
                          <>
                            <Crown className="w-3.5 h-3.5" weight="fill" />
                            <span>Test Out</span>
                          </>
                        ) : (
                          <>
                            <span>Open</span>
                            <ArrowRight className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
