"use client";

import React, { useEffect } from "react";
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
  CheckCircle,
  WarningCircle,
  Cards,
} from "@phosphor-icons/react";
import { LevelNode } from "@/types";

interface LevelDetailsModalProps {
  node: LevelNode | null;
  onClose: () => void;
}

export function LevelDetailsDrawer({ node, onClose }: LevelDetailsModalProps) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (node) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [node, onClose]);

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
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[85vh] bg-surface border border-border rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-text-primary"
      >
        {/* Pinned Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-surface shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-paper border border-border text-text-primary font-mono">
              LEVEL {node.displayLevel}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono ${
                isCompleted
                  ? "bg-signal/15 text-signal border border-signal/30"
                  : isBoss
                  ? "bg-warning/15 text-warning border border-warning/30"
                  : isRemediation
                  ? "bg-alert/15 text-alert border border-alert/30"
                  : isLocked
                  ? "bg-paper text-text-secondary border border-border"
                  : "bg-focus/15 text-focus border border-focus/30"
              }`}
            >
              {node.status.toUpperCase()}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-paper text-text-secondary hover:text-text-primary transition-colors cursor-pointer border border-transparent hover:border-border"
            title="Close modal (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-paper/30 min-h-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-text-primary leading-snug">{node.title}</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Phase: {node.phase} • Estimated time: {node.estimatedMinutes} mins
            </p>
          </div>

          {/* Quick Metrics Tag Row */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface border border-border text-text-secondary">
              <Calendar className="w-3.5 h-3.5 text-focus" />
              <span>Week {node.targetWeek}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface border border-border text-text-secondary">
              <Clock className="w-3.5 h-3.5 text-focus" />
              <span>{node.estimatedMinutes} mins</span>
            </div>
            {node.flashcards && node.flashcards.length > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-focus/15 border border-focus/30 text-focus font-bold">
                <Cards className="w-3.5 h-3.5" />
                <span>{node.flashcards.length} Flashcards</span>
              </div>
            )}
          </div>

          {/* XAI Recommendation Rationale Box */}
          {node.whyRecommended && (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-focus/5 border border-focus/20 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-focus">
                <Sparkle className="w-3.5 h-3.5" weight="fill" />
                <span>Explainable AI (XAI) Justification</span>
              </div>
              <p className="text-xs text-text-primary leading-relaxed">
                {node.whyRecommended}
              </p>
            </div>
          )}

          {/* Curated Resources Section */}
          <div className="flex flex-col gap-2.5 pt-1">
            <h3 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
              Curated Multimodal Learning Content
            </h3>

            {/* Video Card */}
            {node.video && (
              <div className="p-3 rounded-2xl bg-surface border border-border flex flex-col gap-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg bg-alert/20 text-alert flex items-center justify-center">
                      <Play className="w-3 h-3" weight="fill" />
                    </div>
                    <span className="text-xs font-bold text-text-primary line-clamp-1">
                      {node.video.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-text-secondary shrink-0 ml-2">
                    {node.video.durationFormatted}
                  </span>
                </div>
                {node.video.pruningReason && (
                  <p className="text-[11px] text-text-secondary italic line-clamp-2">
                    {node.video.pruningReason}
                  </p>
                )}
              </div>
            )}

            {/* Documentation Card */}
            {node.doc && (
              <a
                href={node.doc.url}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-2xl bg-surface border border-border hover:border-focus/50 flex flex-col gap-1 transition-colors group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg bg-focus/20 text-focus flex items-center justify-center">
                      <BookOpen className="w-3 h-3" weight="fill" />
                    </div>
                    <span className="text-xs font-bold text-text-primary group-hover:text-focus transition-colors line-clamp-1">
                      {node.doc.title}
                    </span>
                  </div>
                  <ArrowSquareOut className="w-3.5 h-3.5 text-text-secondary group-hover:text-focus shrink-0 ml-2" />
                </div>
                <span className="text-[11px] text-text-secondary line-clamp-1">
                  {node.doc.provider} • {node.doc.summary}
                </span>
              </a>
            )}

            {/* GitHub Lab Repo Card */}
            {node.githubRepo && (
              <a
                href={node.githubRepo.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-2xl bg-surface border border-border hover:border-text-secondary flex flex-col gap-1 transition-colors group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg bg-paper text-text-primary flex items-center justify-center border border-border">
                      <GithubLogo className="w-3 h-3" weight="fill" />
                    </div>
                    <span className="text-xs font-bold text-text-primary group-hover:text-text-primary transition-colors line-clamp-1">
                      {node.githubRepo.repoName}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-warning shrink-0 ml-2 font-bold">
                    ★ {node.githubRepo.starsCount}
                  </span>
                </div>
                <span className="text-[11px] text-text-secondary line-clamp-1">
                  {node.githubRepo.description}
                </span>
              </a>
            )}
          </div>
        </div>

        {/* Pinned Bottom CTA Action Button */}
        <div className="p-3.5 sm:p-4 border-t border-border bg-surface flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-paper hover:bg-border border border-border text-text-secondary text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleLaunch}
            disabled={isLocked}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
              isLocked
                ? "bg-paper border border-border text-text-secondary cursor-not-allowed"
                : isBoss
                ? "bg-warning hover:bg-warning/90 text-paper"
                : isRemediation
                ? "bg-alert hover:bg-alert/90 text-white"
                : "bg-focus hover:bg-focus/90 text-white"
            }`}
          >
            {isLocked ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Prerequisites Incomplete (Locked)</span>
              </>
            ) : isBoss ? (
              <>
                <Crown className="w-4 h-4" weight="fill" />
                <span>Launch 1-PL Rasch CAT Boss Level</span>
              </>
            ) : isCompleted ? (
              <>
                <CheckCircle className="w-4 h-4" weight="fill" />
                <span>Review Completed Canvas</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" weight="fill" />
                <span>Launch CourseOs Split-Screen Canvas</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
