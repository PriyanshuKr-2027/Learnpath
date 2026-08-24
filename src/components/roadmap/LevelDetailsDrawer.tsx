"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Play,
  BookOpen,
  GithubLogo,
  Sparkle,
  Crown,
  Clock,
  Calendar,
  Lock,
  ArrowSquareOut,
  Star,
  CheckCircle,
  WarningCircle,
} from "@phosphor-icons/react";
import { LevelNode } from "@/types";

interface LevelDetailsDrawerProps {
  node: LevelNode | null;
  onClose: () => void;
}

export function LevelDetailsDrawer({ node, onClose }: LevelDetailsDrawerProps) {
  const router = useRouter();

  if (!node) return null;

  const isCompleted = node.status === "completed";
  const isLocked = node.status === "locked";
  const isBoss = node.isBossCheckpoint;
  const isRemediation = node.isRemediation;

  const handleLaunch = () => {
    if (isBoss) {
      router.push(`/assessments/cat?levelId=${node.id}&skill=${encodeURIComponent(node.skillName)}`);
    } else {
      router.push(`/learn/${node.id}`);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-zinc-950 border-l border-zinc-800 h-full flex flex-col justify-between shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300"
      >
        {/* Top Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-zinc-800 text-zinc-100 font-mono">
                LEVEL {node.displayLevel}
              </span>
              {isBoss && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" weight="fill" />
                  Boss Checkpoint
                </span>
              )}
              {isRemediation && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30 flex items-center gap-1">
                  <WarningCircle className="w-3.5 h-3.5" weight="bold" />
                  Remediation Lab
                </span>
              )}
              {isCompleted && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" weight="fill" />
                  Completed
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h2 className="text-xl font-bold text-zinc-100">{node.title}</h2>
            <p className="text-xs text-zinc-400 mt-0.5">{node.phase}</p>
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-400 py-2 border-y border-zinc-800/80">
            <span className="flex items-center gap-1.5 font-medium text-zinc-300">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Target Week {node.targetWeek}
            </span>
            <span className="flex items-center gap-1.5 font-medium text-zinc-300">
              <Clock className="w-4 h-4 text-cyan-400" />
              {node.estimatedMinutes} Minutes
            </span>
            {isCompleted && (
              <div className="flex items-center gap-1 text-amber-400 ml-auto font-semibold">
                <Star className="w-4 h-4" weight="fill" />
                <span>{node.starsEarned || 3} / 3 Stars</span>
              </div>
            )}
          </div>

          {/* Explainable AI (XAI) Reasoning Card */}
          <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Sparkle className="w-4 h-4" weight="fill" />
              Why this step was recommended
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">{node.whyRecommended}</p>
          </div>

          {/* Pruned Video Card */}
          {node.video && (
            <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-rose-500" weight="fill" />
                  Curated Video Lecture
                </span>
                <span className="text-[11px] font-mono text-zinc-400">{node.video.durationFormatted}</span>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-zinc-100">{node.video.title}</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Channel: {node.video.channelTitle}</p>
              </div>

              {node.video.pruningReason && (
                <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-[11px] text-zinc-400">
                  <strong className="text-zinc-200">🔍 AI Pruning Filter: </strong>
                  {node.video.pruningReason}
                </div>
              )}
            </div>
          )}

          {/* Documentation Link */}
          {node.doc && (
            <a
              href={node.doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all flex items-start justify-between group"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-cyan-400 mt-0.5">
                  <BookOpen className="w-4 h-4" weight="fill" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-cyan-300 transition-colors">
                      {node.doc.title}
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{node.doc.summary}</p>
                  <span className="text-[10px] text-zinc-500 mt-1 inline-block">{node.doc.provider}</span>
                </div>
              </div>
              <ArrowSquareOut className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
            </a>
          )}

          {/* GitHub Starter Repository */}
          {node.githubRepo && (
            <a
              href={node.githubRepo.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all flex items-start justify-between group"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-100 mt-0.5">
                  <GithubLogo className="w-4 h-4" weight="fill" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-emerald-300 transition-colors font-mono">
                      {node.githubRepo.repoName}
                    </h4>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      ⭐ {node.githubRepo.starsCount}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{node.githubRepo.description}</p>
                </div>
              </div>
              <ArrowSquareOut className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
            </a>
          )}
        </div>

        {/* Bottom CTA Action Button */}
        <div className="pt-6 border-t border-zinc-800 flex flex-col gap-2">
          {isLocked ? (
            <div className="flex flex-col gap-2">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2">
                <Lock className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                <span>Prerequisites not yet met. Complete previous levels to unlock this milestone.</span>
              </div>
              <button
                type="button"
                onClick={handleLaunch}
                className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-sm transition-colors cursor-pointer"
              >
                Preview Lesson Materials
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLaunch}
              className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl cursor-pointer ${
                isBoss
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 hover:opacity-90 text-zinc-950 shadow-amber-500/20"
                  : isRemediation
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-zinc-950 shadow-orange-500/20"
                  : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20"
              }`}
            >
              {isBoss ? (
                <>
                  <Crown className="w-5 h-5" weight="fill" />
                  <span>Launch CAT Boss Checkpoint</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" weight="fill" />
                  <span>Launch CourseOs Split Canvas</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
