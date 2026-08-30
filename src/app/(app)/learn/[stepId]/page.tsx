"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  WarningOctagon,
  Compass,
} from "@phosphor-icons/react";
import { LevelNode, LearningPath } from "@/types";
import { mockStore } from "@/lib/services/mockStore";

import { VideoPlayerWithControls } from "@/components/canvas/VideoPlayerWithControls";
import { MarkdownNotesEditor } from "@/components/canvas/MarkdownNotesEditor";
import { SocraticCopilotSidecar } from "@/components/canvas/SocraticCopilotSidecar";

export default function LearningCanvasPage() {
  const params = useParams();
  const router = useRouter();
  const stepId = params?.stepId as string;

  const [path, setPath] = useState<LearningPath | null>(null);
  const [level, setLevel] = useState<LevelNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [seekSeconds, setSeekSeconds] = useState<number | null>(null);
  const [injectedSnippet, setInjectedSnippet] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"copilot" | "notes">("copilot");
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const activePath = await mockStore.hydrateLearningPath();
        if (!mounted) return;
        if (!activePath) {
          setPath(null);
          setLevel(null);
          return;
        }

        setPath(activePath);

        const foundLevel =
          activePath.levels.find((l) => l.id === stepId) ||
          activePath.levels.find((l) => l.displayLevel === stepId);

        setLevel(foundLevel || null);
      } catch (err) {
        console.error("[LearnPage] load error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [stepId, router]);

  const [liveCourses, setLiveCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [courseSearchError, setCourseSearchError] = useState<string | null>(null);

  const fetchCourses = useCallback((skill: string) => {
    if (!skill) return;
    setLoadingCourses(true);
    setCourseSearchError(null);
    fetch(`/api/ai/course-search?topic=${encodeURIComponent(skill)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (data?.courses) setLiveCourses(data.courses);
        else setLiveCourses([]);
      })
      .catch((err) => {
        console.warn("Live course fetch warning:", err);
        setCourseSearchError("Unable to reach course search index. Click to retry.");
      })
      .finally(() => setLoadingCourses(false));
  }, []);

  useEffect(() => {
    if (level?.skillName) {
      fetchCourses(level.skillName);
    }
  }, [level?.skillName, fetchCourses]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-text-secondary gap-3">
        <ArrowsClockwise className="w-6 h-6 animate-spin text-focus" />
        <span className="text-xs font-mono">Calibrating Learning Canvas & DAG Node...</span>
      </div>
    );
  }

  //    BLANK STATE: No Learning Path Synthesized Yet   
  if (!path) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <div className="p-8 sm:p-10 rounded-3xl border border-border bg-surface text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-focus/15 border border-focus/30 text-focus flex items-center justify-center mx-auto shadow-lg shadow-focus/15">
            <Compass className="w-8 h-8" weight="duotone" />
          </div>
          <div className="space-y-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-focus/10 text-focus border border-focus/20 inline-block">
              DAG Not Initialized
            </span>
            <h2 className="text-xl font-bold text-text-primary">No Active Learning Path Found</h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
              You haven&apos;t generated a personalized Kahn&apos;s DAG learning curriculum yet. Complete onboarding to analyze your target role and synthesize your path.
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <Link
              href="/onboarding"
              className="px-6 py-3 rounded-2xl bg-focus hover:bg-focus/90 text-white font-bold text-xs sm:text-sm shadow-lg shadow-focus/25 flex items-center gap-2 transition-all"
            >
              <span>Launch Onboarding Wizard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  //    ERROR STATE: Invalid Level ID / Step Not Found in Active Path   
  if (!level) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
        <div className="p-8 sm:p-10 rounded-3xl border border-warning/30 bg-surface text-center space-y-5 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-warning/15 border border-warning/30 text-warning flex items-center justify-center mx-auto shadow-lg shadow-warning/15">
            <WarningOctagon className="w-8 h-8" weight="duotone" />
          </div>

          <div className="space-y-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-warning/10 text-warning border border-warning/20 inline-block">
              Level ID #{stepId} Not Found
            </span>
            <h2 className="text-xl font-bold text-text-primary">Milestone Not In Active DAG</h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
              The milestone <strong>&quot;{stepId}&quot;</strong> could not be located in your current {path.totalLevelsCount}-level curriculum. Please jump to an available milestone below:
            </p>
          </div>

          {/* Quick Jump List to Available Levels */}
          <div className="space-y-2 text-left pt-2">
            <span className="text-[11px] font-mono font-bold uppercase text-text-secondary tracking-wider block text-center">
              Available DAG Milestones
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
              {path.levels.map((lvl) => (
                <Link
                  key={lvl.id}
                  href={`/learn/${lvl.id}`}
                  className="p-3 rounded-2xl bg-paper hover:bg-border/60 border border-border flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-focus/10 text-focus font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {lvl.displayLevel}
                    </span>
                    <span className="text-xs font-bold text-text-primary truncate group-hover:text-focus transition-colors">
                      {lvl.title}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-text-secondary group-hover:text-focus transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/roadmap"
              className="px-5 py-2.5 rounded-xl bg-focus hover:bg-focus/90 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-focus/25 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Candy Crush Roadmap</span>
            </Link>
          </div>
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
    <div className="flex flex-col gap-5 w-full max-w-7xl mx-auto pb-4 text-text-primary">
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
                  <WarningCircle className="w-3 h-3" weight="fill" />
                  Mistake Remediation
                </span>
              )}
              <h1 className="text-sm sm:text-base font-bold text-text-primary">{level.title}</h1>
            </div>
            <p className="text-xs text-text-secondary">
              Phase: {level.phase} * Target: Week {level.targetWeek} * {level.estimatedMinutes} Mins
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {nextLevel && isCompleted && (
            <Link
              href={`/learn/${nextLevel.id}`}
              className="px-4 py-2 rounded-xl bg-paper hover:bg-border border border-border text-xs font-semibold text-text-primary flex items-center gap-1.5 transition-colors"
            >
              <span>Next Level</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <button
            type="button"
            onClick={handleMarkComplete}
            disabled={isCompleted}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
              isCompleted
                ? "bg-signal/20 text-signal border border-signal/30 cursor-default"
                : "bg-focus hover:bg-focus/90 text-white shadow-focus/25"
            }`}
          >
            <CheckCircle className="w-4 h-4" weight={isCompleted ? "fill" : "bold"} />
            <span>{isCompleted ? "Completed (3  )" : "Mark Complete"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (7 Cols): Video Player & Curated Resources */}
        <div className="lg:col-span-7 flex flex-col gap-4">
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
                  <span className="text-[10px] font-mono text-warning font-bold">  {level.githubRepo.starsCount}</span>
                </div>
                <h4 className="text-xs font-bold text-text-primary line-clamp-1">{level.githubRepo.repoName}</h4>
                <p className="text-[11px] text-text-secondary leading-snug line-clamp-2">{level.githubRepo.description}</p>
              </a>
            )}
          </div>

          {/* Live Web Recommended Courses & Playlists (GFG, NPTEL, Swayam, Coursera, Udemy) */}
          <div className="p-4 rounded-2xl bg-surface border border-border shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkle className="w-4 h-4 text-focus" weight="fill" />
                <h3 className="text-xs font-bold text-text-primary">
                  Live Web Courses &amp; Reference Material
                </h3>
              </div>
              <span className="text-[10px] font-mono text-text-secondary">
                {loadingCourses ? "Searching Web..." : `${liveCourses.length} Sources`}
              </span>
            </div>

            {loadingCourses ? (
              <div className="flex items-center gap-2 py-4 justify-center text-xs text-text-secondary">
                <ArrowsClockwise className="w-4 h-4 animate-spin text-focus" />
                <span>Searching GeeksforGeeks, NPTEL, Swayam, Coursera...</span>
              </div>
            ) : courseSearchError ? (
              <div className="p-3.5 rounded-xl bg-alert/5 border border-alert/20 text-center space-y-2">
                <p className="text-xs text-alert">{courseSearchError}</p>
                <button
                  type="button"
                  onClick={() => level && fetchCourses(level.skillName)}
                  className="px-3 py-1.5 rounded-lg bg-paper hover:bg-border border border-border text-xs font-semibold text-text-primary inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowsClockwise className="w-3.5 h-3.5" />
                  <span>Retry Search</span>
                </button>
              </div>
            ) : liveCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {liveCourses.map((c, idx) => (
                  <a
                    key={idx}
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-paper hover:bg-surface border border-border hover:border-focus/50 flex flex-col gap-1 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-focus uppercase tracking-wider">
                        {c.platform}
                      </span>
                      {c.rating && (
                        <span className="text-[10px] text-warning font-mono font-bold">
                            {c.rating}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-text-primary group-hover:text-focus transition-colors line-clamp-1">
                      {c.title}
                    </h4>
                    <p className="text-[10px] text-text-secondary line-clamp-2">
                      {c.description || `${c.instructor || "Comprehensive"} guide to master ${level.skillName}.`}
                    </p>
                  </a>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-paper/60 border border-border text-center space-y-1 text-xs text-text-secondary">
                <span>No live courses indexed for &quot;{level.skillName}&quot;.</span>
                <button
                  type="button"
                  onClick={() => level && fetchCourses(level.skillName)}
                  className="block mx-auto text-focus hover:underline font-bold text-[11px] pt-1 cursor-pointer"
                >
                  Search Again
                </button>
              </div>
            )}
          </div>
        </div>


        {/* RIGHT COLUMN (5 Cols): Sidecar Tabs (Socratic Copilot & Markdown Notes) */}
        <div className="lg:col-span-5 flex flex-col gap-3 lg:sticky lg:top-20">
          {/* Sidecar Tab Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-surface border border-border shadow-sm shrink-0">
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
          <div className="h-[460px] lg:h-[480px] max-h-[calc(100vh-220px)] flex flex-col">
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
              {nextLevel?.isBossCheckpoint ? (
                <Crown className="w-8 h-8 text-warning" weight="fill" />
              ) : (
                <Trophy className="w-8 h-8 text-warning" weight="fill" />
              )}
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono text-focus font-bold uppercase tracking-wider">
                Level {level.displayLevel} Conquered
              </span>
              {nextLevel?.isBossCheckpoint ? (
                <>
                  <h3 className="text-xl font-bold text-text-primary">Boss Checkpoint Unlocked!</h3>
                  <p className="text-xs text-text-secondary">
                    You mastered <strong>{level.skillName}</strong>. A Boss-Level adaptive diagnostic is ready to verify your competency before you advance.
                  </p>
                  <div className="flex items-center justify-center gap-1.5 py-1">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-warning/15 text-warning border border-warning/30 flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5" weight="fill" />
                      Boss Level CAT Assessment
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-text-primary">Milestone Successfully Mastered!</h3>
                  <p className="text-xs text-text-secondary">
                    You closed the skill gap for <strong>{level.skillName}</strong>. Your competency score has updated.
                  </p>
                </>
              )}
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
                  if (nextLevel?.isBossCheckpoint) {
                    router.push(`/assessments/cat?skill=${encodeURIComponent(nextLevel.skillName)}&levelId=${nextLevel.id}`);
                  } else if (nextLevel) {
                    router.push(`/learn/${nextLevel.id}`);
                  } else {
                    router.push("/roadmap");
                  }
                }}
                className={`flex-1 py-3 rounded-2xl font-bold text-xs shadow-lg transition-all cursor-pointer ${
                  nextLevel?.isBossCheckpoint
                    ? "bg-gradient-to-r from-warning to-amber-500 hover:from-amber-400 text-zinc-950 shadow-warning/25"
                    : "bg-focus hover:bg-focus/90 text-white shadow-focus/25"
                }`}
              >
                {nextLevel?.isBossCheckpoint
                  ? "Take Boss CAT Assessment"
                  : nextLevel
                  ? `Go to Level ${nextLevel.displayLevel}`
                  : "View Level Map"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

