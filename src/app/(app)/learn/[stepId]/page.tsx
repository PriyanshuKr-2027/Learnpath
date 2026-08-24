"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  Play,
  BookOpen,
  GithubLogo,
  Star,
  Sparkle,
  Crown,
  Trophy,
  ArrowRight,
  ArrowsClockwise,
  WarningCircle,
  Cards,
} from "@phosphor-icons/react";
import { LevelNode, LearningPath } from "@/types";
import { mockStore } from "@/lib/services/mockStore";
import { VideoPlayerWithControls } from "@/components/canvas/VideoPlayerWithControls";
import { MarkdownNotesEditor } from "@/components/canvas/MarkdownNotesEditor";
import { SocraticCopilotSidecar } from "@/components/canvas/SocraticCopilotSidecar";
import { FlashcardDeck } from "@/components/canvas/FlashcardDeck";

export default function LearningCanvasPage() {
  const params = useParams();
  const router = useRouter();
  const stepId = params?.stepId as string;

  const [path, setPath] = useState<LearningPath | null>(null);
  const [level, setLevel] = useState<LevelNode | null>(null);
  const [seekSeconds, setSeekSeconds] = useState<number | null>(null);
  const [injectedSnippet, setInjectedSnippet] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"copilot" | "notes">("copilot");
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  useEffect(() => {
    const activePath = mockStore.getLearningPath();
    setPath(activePath);

    const foundLevel =
      activePath.levels.find((l) => l.id === stepId) ||
      activePath.levels.find((l) => l.displayLevel === stepId) ||
      activePath.levels[0];

    setLevel(foundLevel || null);
  }, [stepId]);

  if (!level || !path) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-zinc-400">
        <div className="flex items-center gap-2">
          <ArrowsClockwise className="w-5 h-5 animate-spin text-emerald-400" />
          <span>Loading CourseOs Learning Canvas...</span>
        </div>
      </div>
    );
  }

  const isCompleted = level.status === "completed";
  const isBoss = level.isBossCheckpoint;
  const isRemediation = level.isRemediation;

  const handleMarkComplete = () => {
    const updated = mockStore.updateLevelProgress(level.id, {
      status: "completed",
      starsEarned: 3,
    });
    setPath(updated);
    setLevel((prev) => (prev ? { ...prev, status: "completed", starsEarned: 3 } : null));
    setShowCompletionModal(true);
  };

  const currentIdx = path.levels.findIndex((l) => l.id === level.id);
  const nextLevel = currentIdx !== -1 && currentIdx + 1 < path.levels.length ? path.levels[currentIdx + 1] : null;

  return (
    <div className="flex flex-col gap-5 w-full max-w-7xl mx-auto pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/roadmap"
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 flex items-center gap-1.5 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Level Map</span>
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                LVL {level.displayLevel}
              </span>
              {isBoss && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <Crown className="w-3 h-3" weight="fill" />
                  Boss Checkpoint
                </span>
              )}
              {isRemediation && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center gap-1">
                  <WarningCircle className="w-3 h-3" weight="bold" />
                  Remediation Lab
                </span>
              )}
              <h2 className="text-sm sm:text-base font-bold text-zinc-100">{level.title}</h2>
            </div>
            <p className="text-[11px] text-zinc-400">
              Week {level.targetWeek} • {level.phase}
            </p>
          </div>
        </div>

        {/* Completion Action */}
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <CheckCircle className="w-4 h-4" weight="fill" />
              <span>Milestone Mastered</span>
              <div className="flex items-center text-amber-400 ml-1">
                {[1, 2, 3].map((s) => (
                  <Star key={s} className="w-3 h-3 fill-amber-400" weight="fill" />
                ))}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleMarkComplete}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" weight="bold" />
              <span>Mark Milestone Complete</span>
            </button>
          )}

          {nextLevel && (
            <Link
              href={`/learn/${nextLevel.id}`}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Main Split-Screen Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (7 Cols): Flashcards + Video & Documentation */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Interactive Flashcard Deck (Rendered prominently for remediation and core levels) */}
          {level.flashcards && level.flashcards.length > 0 && (
            <FlashcardDeck
              flashcards={level.flashcards}
              title={
                isRemediation
                  ? `Level ${level.displayLevel} Remedial Flashcards`
                  : `${level.skillName} High-Yield Flashcards`
              }
            />
          )}

          <VideoPlayerWithControls
            video={level.video}
            seekSeconds={seekSeconds}
            onSeekRequested={(s) => setSeekSeconds(s)}
          />

          {/* Official Documentation & GitHub Repository Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {level.doc && (
              <a
                href={level.doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900 transition-all flex flex-col justify-between group"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5">
                    <BookOpen className="w-4 h-4" weight="fill" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100 group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {level.doc.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{level.doc.summary}</p>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-500 font-medium mt-3">{level.doc.provider} ↗</span>
              </a>
            )}

            {level.githubRepo && (
              <a
                href={level.githubRepo.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900 transition-all flex flex-col justify-between group"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-200 flex-shrink-0 mt-0.5">
                    <GithubLogo className="w-4 h-4" weight="fill" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-zinc-100 group-hover:text-emerald-300 transition-colors font-mono line-clamp-1">
                        {level.githubRepo.repoName}
                      </h4>
                      <span className="text-[10px] font-bold text-amber-400">⭐ {level.githubRepo.starsCount}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{level.githubRepo.description}</p>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-500 font-medium mt-3">Clone Starter Repo ↗</span>
              </a>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (5 Cols): Split Notes & 24/7 AI Copilot */}
        <div className="lg:col-span-5 flex flex-col gap-3 min-h-[580px]">
          {/* View Tab Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 self-start">
            <button
              type="button"
              onClick={() => setActiveTab("copilot")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "copilot"
                  ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Sparkle className="w-3.5 h-3.5" weight="fill" />
              <span>24/7 AI Copilot & RAG</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("notes")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "notes"
                  ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>Personal Study Notes</span>
            </button>
          </div>

          <div className="flex-1">
            {activeTab === "copilot" ? (
              <SocraticCopilotSidecar
                level={level}
                onSeekRequested={(s) => setSeekSeconds(s)}
                onInsertToNotes={(snippet) => {
                  setInjectedSnippet(snippet);
                  setActiveTab("notes");
                }}
              />
            ) : (
              <MarkdownNotesEditor
                levelId={level.id}
                injectedSnippet={injectedSnippet}
              />
            )}
          </div>
        </div>
      </div>

      {/* Milestone Completion Celebration Modal */}
      {showCompletionModal && (
        <div
          onClick={() => setShowCompletionModal(false)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md p-6 rounded-3xl border border-emerald-500/30 bg-zinc-950 text-center shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200"
          >
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-zinc-950 shadow-xl shadow-emerald-500/30">
              <Trophy className="w-8 h-8" weight="fill" />
            </div>

            <div>
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                {[1, 2, 3].map((s) => (
                  <Star key={s} className="w-5 h-5 fill-amber-400" weight="fill" />
                ))}
              </div>
              <h3 className="text-xl font-bold text-zinc-100">Milestone Mastered!</h3>
              <p className="text-xs text-zinc-400 mt-1">
                You earned 3 Stars for completing <strong className="text-zinc-200">{level.title}</strong>. Your next DAG node is unlocked!
              </p>
            </div>

            <div className="flex items-center gap-3 w-full pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCompletionModal(false);
                  router.push("/roadmap");
                }}
                className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Back to Level Map
              </button>

              {nextLevel && (
                <button
                  type="button"
                  onClick={() => {
                    setShowCompletionModal(false);
                    router.push(`/learn/${nextLevel.id}`);
                  }}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <span>Next Level ({nextLevel.displayLevel})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
