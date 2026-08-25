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
  Cards,
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
        className="w-full max-w-lg bg-surface border-l border-border h-full flex flex-col justify-between shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300 text-text-primary"
      >
        {/* Top Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-paper border border-border text-text-primary font-mono">
                LEVEL {node.displayLevel}
              </span>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
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
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-paper text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <h2 className="text-xl font-bold text-text-primary">{node.title}</h2>
            <p className="text-xs text-text-secondary mt-1">
              Phase: {node.phase} • Estimated time: {node.estimatedMinutes} mins
            </p>
          </div>

          {/* Quick Metrics Tag Row */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-paper border border-border text-text-secondary">
              <Calendar className="w-4 h-4 text-focus" />
              <span>Week {node.targetWeek}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-paper border border-border text-text-secondary">
              <Clock className="w-4 h-4 text-focus" />
              <span>{node.estimatedMinutes} mins</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-paper border border-border text-text-secondary font-mono">
              <span>{node.phase}</span>
            </div>
            {node.flashcards && node.flashcards.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-focus/15 border border-focus/30 text-focus font-bold">
                <Cards className="w-4 h-4" />
                <span>{node.flashcards.length} 3D Flashcards</span>
              </div>
            )}
          </div>

          {/* XAI Recommendation Rationale Box */}
          <div className="p-4 rounded-2xl bg-focus/5 border border-focus/20 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-focus">
              <Sparkle className="w-4 h-4" weight="fill" />
              <span>Explainable AI (XAI) Justification</span>
            </div>
            <p className="text-xs text-text-primary leading-relaxed">
              {node.whyRecommended}
            </p>
          </div>

          {/* Curated Resources Section */}
          <div className="flex flex-col gap-3 pt-2">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Curated Multimodal Learning Content
            </h3>

            {/* Video Card */}
            {node.video && (
              <div className="p-3.5 rounded-2xl bg-paper border border-border flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-alert/20 text-alert flex items-center justify-center">
                      <Play className="w-3.5 h-3.5" weight="fill" />
                    </div>
                    <span className="text-xs font-bold text-text-primary">
                      {node.video.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-text-secondary">
                    {node.video.durationFormatted}
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary italic">
                  💡 {node.video.pruningReason}
                </p>
              </div>
            )}

            {/* Documentation Card */}
            {node.doc && (
              <a
                href={node.doc.url}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-2xl bg-paper border border-border hover:border-focus/50 flex flex-col gap-1.5 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-focus/20 text-focus flex items-center justify-center">
                      <BookOpen className="w-3.5 h-3.5" weight="fill" />
                    </div>
                    <span className="text-xs font-bold text-text-primary group-hover:text-focus transition-colors">
                      {node.doc.title}
                    </span>
                  </div>
                  <ArrowSquareOut className="w-4 h-4 text-text-secondary group-hover:text-focus" />
                </div>
                <span className="text-[11px] text-text-secondary">
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
                className="p-3.5 rounded-2xl bg-paper border border-border hover:border-text-secondary flex flex-col gap-1.5 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-paper text-text-primary flex items-center justify-center border border-border">
                      <GithubLogo className="w-3.5 h-3.5" weight="fill" />
                    </div>
                    <span className="text-xs font-bold text-text-primary group-hover:text-text-primary transition-colors">
                      {node.githubRepo.repoName}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-warning">
                    ★ {node.githubRepo.starsCount}
                  </span>
                </div>
                <span className="text-[11px] text-text-secondary">
                  {node.githubRepo.description}
                </span>
              </a>
            )}
          </div>
        </div>

        {/* Bottom CTA Action Button */}
        <div className="pt-6 border-t border-border flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 rounded-2xl bg-paper hover:bg-border border border-border text-text-secondary text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleLaunch}
            disabled={isLocked}
            className={`flex-1 py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
              isLocked
                ? "bg-paper border border-border text-text-secondary cursor-not-allowed"
                : isBoss
                ? "bg-warning hover:bg-warning/90 text-paper shadow-warning/25"
                : isRemediation
                ? "bg-alert hover:bg-alert/90 text-white shadow-alert/25"
                : "bg-focus hover:bg-focus/90 text-white shadow-focus/25"
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
