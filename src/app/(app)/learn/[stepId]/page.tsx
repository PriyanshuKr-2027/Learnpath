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
      <div className="min-h-[70vh] flex items-center justify-center text-text-secondary">
        <div className="flex items-center gap-2">
          <ArrowsClockwise className="w-5 h-5 animate-spin text-focus" />
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
    <div className="flex flex-col gap-5 w-full max-w-7xl mx-auto pb-12 text-text-primary">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-surface shadow-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/roadmap"
            className="p-2 rounded-xl bg-paper hover:bg-border border border-border text-text-secondary hover:text-text-primary flex items-center gap-1.5 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Level Map</span>
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-black bg-focus/10 text-focus border border-focus/20 font-mono">
                LVL {level.displayLevel}
              </span>
              {isBoss && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-warning/15 text-warning border border-warning/30 flex items-center gap-1">
                  <Crown className="w-3 h-3" weight="fill" />
                  Boss Checkpoint
                </span>
              )}
              {isRemediation && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-alert/15 text-alert border border-alert/30 flex items-center gap-1">
                  <WarningCircle className="w-3 h-3" weight="bold" />
                  Remediation Lab
                </span>
              )}
              <h2 className="text-sm sm:text-base font-bold text-text-primary">{level.title}</h2>
            </div>
            <p className="text-[11px] text-text-secondary">
              Week {level.targetWeek} • {level.phase}
            </p>
          </div>
        </div>

        {/* Completion Action */}
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-signal/10 border border-signal/30 text-signal text-xs font-semibold">
              <CheckCircle className="w-4 h-4" weight="fill" />
              <span>Milestone Mastered</span>
              <div className="flex items-center text-warning ml-1">
                {[1, 2, 3].map((s) => (
                  <Star key={s} className="w-3 h-3 fill-warning text-warning" weight="fill" />
                ))}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleMarkComplete}
              className="px-4 py-2 rounded-xl bg-focus hover:bg-focus/90 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-focus/25 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" weight="bold" />
              <span>Mark Milestone Complete</span>
            </button>
          )}

          {nextLevel && (
            <Link
              href={`/learn/${nextLevel.id}`}
              className="px-3.5 py-2 rounded-xl bg-paper hover:bg-border border border-border text-text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors"
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

          {/* Documentation & GitHub Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {level.doc && (
              <a
                href={level.doc.url}
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl bg-surface border border-border hover:border-focus/50 flex flex-col gap-2 transition-all group shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-focus/15 text-focus flex items-center justify-center">
                      <BookOpen className="w-3.5 h-3.5" weight="fill" />
                    </div>
                    <span className="text-xs font-bold text-text-primary group-hover:text-focus transition-colors">
                      Interactive Docs
                    </span>
                  </div>
                  <span className="text-[10px] text-text-secondary font-mono">{level.doc.provider}</span>
                </div>
                <h4 className="text-xs font-bold text-text-primary line-clamp-1">{level.doc.title}</h4>
                <p className="text-[11px] text-text-secondary leading-snug line-clamp-2">{level.doc.summary}</p>
              </a>
            )}

            {level.githubRepo && (
              <a
                href={level.githubRepo.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl bg-surface border border-border hover:border-border/80 flex flex-col gap-2 transition-all group shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-paper text-text-primary flex items-center justify-center border border-border">
                      <GithubLogo className="w-3.5 h-3.5" weight="fill" />
                    </div>
                    <span className="text-xs font-bold text-text-primary">Hands-on Lab Repo</span>
                  </div>
                  <span className="text-[10px] font-mono text-warning font-bold">★ {level.githubRepo.starsCount}</span>
                </div>
                <h4 className="text-xs font-bold text-text-primary line-clamp-1">{level.githubRepo.repoName}</h4>
                <p className="text-[11px] text-text-secondary leading-snug line-clamp-2">{level.githubRepo.description}</p>
              </a>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (5 Cols): Sidecar Tabs (Socratic Copilot & Markdown Notes) */}
        <div className="lg:col-span-5 flex flex-col gap-3 sticky top-20">
          {/* Sidecar Tab Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-surface border border-border shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab("copilot")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === "copilot"
                  ? "bg-focus text-white shadow-md shadow-focus/25"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Sparkle className="w-4 h-4" weight="fill" />
              <span>Socratic AI Copilot</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("notes")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === "notes"
                  ? "bg-focus text-white shadow-md shadow-focus/25"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <span>Markdown Notes</span>
            </button>
          </div>

          {/* Active Tab Content */}
          <div className="min-h-[560px]">
            {activeTab === "copilot" ? (
              <SocraticCopilotSidecar
                level={level}
                onSeekRequested={(sec: number) => setSeekSeconds(sec)}
                onInsertToNotes={(snippet: string) => {
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

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface border border-border rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-focus/15 border border-focus/30 text-focus flex items-center justify-center mx-auto shadow-xl shadow-focus/20">
              <Trophy className="w-8 h-8 text-warning" weight="fill" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono text-focus font-bold uppercase tracking-wider">
                Level {level.displayLevel} Conquered
              </span>
              <h3 className="text-xl font-bold text-text-primary">Milestone Successfully Mastered!</h3>
              <p className="text-xs text-text-secondary">
                You closed the skill gap for <strong>{level.skillName}</strong>. Your competency score has updated.
              </p>
            </div>

            <div className="flex items-center justify-center gap-1.5 py-2">
              {[1, 2, 3].map((star) => (
                <Star key={star} className="w-7 h-7 text-warning fill-warning" weight="fill" />
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCompletionModal(false)}
                className="flex-1 py-3 rounded-2xl bg-paper hover:bg-border border border-border text-text-secondary font-semibold text-xs transition-colors cursor-pointer"
              >
                Stay on Canvas
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCompletionModal(false);
                  if (nextLevel) {
                    router.push(`/learn/${nextLevel.id}`);
                  } else {
                    router.push("/roadmap");
                  }
                }}
                className="flex-1 py-3 rounded-2xl bg-focus hover:bg-focus/90 text-white font-bold text-xs shadow-lg shadow-focus/25 transition-all cursor-pointer"
              >
                {nextLevel ? `Go to Level ${nextLevel.displayLevel}` : "View Level Map"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
