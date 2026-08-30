"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Trophy,
  ArrowRight,
  ArrowsClockwise,
  Lightning,
  WarningCircle,
  Sparkle,
  Target,
  Handshake,
  BookOpen,
} from "@phosphor-icons/react";
import { CATAttempt, CATQuestion, LearningPath, LevelNode } from "@/types";
import { mockStore } from "@/lib/services/mockStore";
import { getOrCreateCuratedResource } from "@/lib/data/curatedCorpus";
import {
  updateLatentAbility,
  selectNextCalibratedQuestion,
  initializeThetaFromProfile,
  thetaToProficiencyDescription,
  DEFAULT_INITIAL_THETA,
} from "@/lib/algorithms/raschIRT";

function CATAssessmentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const skillParam = searchParams.get("skill") || "SQL";
  const levelIdParam = searchParams.get("levelId") || "lvl-1";

  const [path, setPath] = useState<LearningPath | null>(null);
  const [level, setLevel] = useState<LevelNode | null>(null);

  // CAT Testing State
  const [questionPool, setQuestionPool] = useState<CATQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<CATQuestion | null>(null);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<string[]>([]);
  const [attempts, setAttempts] = useState<CATAttempt[]>([]);
  const [currentTheta, setCurrentTheta] = useState<number>(DEFAULT_INITIAL_THETA);
  const [thetaHistory, setThetaHistory] = useState<number[]>([DEFAULT_INITIAL_THETA]);

  // Mistakes tracker for mistake-proportional sub-level scaling (.1 per mistake)
  const [missedQuestions, setMissedQuestions] = useState<CATQuestion[]>([]);

  // Active question interaction
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [subtopicScores, setSubtopicScores] = useState<Record<string, { correct: number; total: number }>>({});

  // Dynamic Remediation Trigger State
  const [isInjectingPath, setIsInjectingPath] = useState(false);
  const [remediationInjected, setRemediationInjected] = useState<boolean>(false);
  const [injectedSubLevelsCount, setInjectedSubLevelsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const TOTAL_QUESTIONS_IN_TEST = 5;

  // Initialize CAT Engine
  useEffect(() => {
    let mounted = true;

    async function initCAT() {
      setLoading(true);
      try {
        const activePath = await mockStore.hydrateLearningPath();
        const profile = await mockStore.hydrateProfile();

        if (!mounted) return;

        if (!activePath) {
          router.push("/onboarding");
          return;
        }

        setPath(activePath);

        const foundLevel =
          activePath.levels.find((l) => l.id === levelIdParam) ||
          activePath.levels.find((l) => l.skillName.toLowerCase() === skillParam.toLowerCase()) ||
          activePath.levels[0];

        setLevel(foundLevel || null);

        const targetSkill = foundLevel?.skillName || skillParam;
        const initialTheta = initializeThetaFromProfile(targetSkill, profile || undefined);
        setCurrentTheta(initialTheta);
        setThetaHistory([initialTheta]);

        const resource = getOrCreateCuratedResource(targetSkill);
        const pool = resource.catQuestions || [];
        setQuestionPool(pool);

        const firstQ = selectNextCalibratedQuestion(pool, initialTheta, []);
        setCurrentQuestion(firstQ);
      } catch (err) {
        console.error("[CAT Assessment] Init error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initCAT();

    return () => {
      mounted = false;
    };
  }, [skillParam, levelIdParam, router]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-text-secondary gap-3">
        <ArrowsClockwise className="w-6 h-6 animate-spin text-focus" />
        <span className="text-xs font-mono">Calibrating 1-PL Rasch Item-Response Diagnostic Pool...</span>
      </div>
    );
  }

  if (!currentQuestion && !isCompleted) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <div className="p-8 sm:p-10 rounded-3xl border border-warning/30 bg-surface text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-warning/15 border border-warning/30 text-warning flex items-center justify-center mx-auto">
            <Sparkle className="w-8 h-8" weight="duotone" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-text-primary">Diagnostic Pool Exhausted</h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              No additional calibrated item-response questions could be selected for this competency level.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => router.push(level ? `/learn/${level.id}` : "/roadmap")}
              className="px-5 py-2.5 rounded-xl bg-focus hover:bg-focus/90 text-white font-bold text-xs shadow-md shadow-focus/25 transition-all cursor-pointer"
            >
              <span>Return to Learning Canvas</span>
            </button>
          </div>
        </div>
      </div>
    );
  }


  const handleSubmitAnswer = () => {
    if (selectedOption === null || !currentQuestion || isAnswerSubmitted) return;

    const isCorrect = selectedOption === currentQuestion.correctOptionIndex;
    const thetaBefore = currentTheta;
    const thetaAfter = updateLatentAbility(currentTheta, isCorrect, currentQuestion.calibratedDifficulty);

    const attempt: CATAttempt = {
      questionId: currentQuestion.id,
      selectedOptionIndex: selectedOption,
      isCorrect,
      thetaBefore,
      thetaAfter,
      timeSpentSeconds: 15,
    };

    setAttempts((prev) => [...prev, attempt]);
    setCurrentTheta(thetaAfter);
    setThetaHistory((prev) => [...prev, thetaAfter]);
    const updatedAnswered = [...answeredQuestionIds, currentQuestion.id];
    setAnsweredQuestionIds(updatedAnswered);
    setIsAnswerSubmitted(true);

    // Track missed questions for mistake-proportional sub-levels
    if (!isCorrect) {
      setMissedQuestions((prev) => [...prev, currentQuestion]);
    }

    setSubtopicScores((prev) => {
      const currentSub = prev[currentQuestion.topic] || { correct: 0, total: 0 };
      return {
        ...prev,
        [currentQuestion.topic]: {
          correct: currentSub.correct + (isCorrect ? 1 : 0),
          total: currentSub.total + 1,
        },
      };
    });
  };

  const handleNextQuestion = () => {
    if (answeredQuestionIds.length >= TOTAL_QUESTIONS_IN_TEST) {
      setIsCompleted(true);
      return;
    }

    const nextQ = selectNextCalibratedQuestion(questionPool, currentTheta, answeredQuestionIds);
    if (!nextQ) {
      setIsCompleted(true);
      return;
    }

    setCurrentQuestion(nextQ);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
  };

  const handleContinueToBoosterLesson = async () => {
    if (!level) return;
    setIsInjectingPath(true);

    const weakSubtopicsList =
      missedQuestions.length > 0
        ? Array.from(new Set(missedQuestions.map((q) => q.topic)))
        : [currentQuestion?.topic || `${level.skillName} Sub-concept`];

    const countToInject = Math.max(1, missedQuestions.length || 1);
    const topicsToInject = weakSubtopicsList.slice(0, countToInject);

    // Fetch live YouTube videos for each missed topic before injection
    try {
      const ytKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || "";
      for (const subtopic of topicsToInject) {
        const query = encodeURIComponent(`${subtopic} ${level.skillName} tutorial beginners`);
        const ytUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&videoDuration=medium&maxResults=1&key=${ytKey}&relevanceLanguage=en`;
        if (ytKey) {
          const ytRes = await fetch(ytUrl);
          if (ytRes.ok) {
            const ytData = await ytRes.json();
            const item = ytData.items?.[0];
            if (item?.id?.videoId) {
              // Store prefetched video id in sessionStorage for mockStore to pick up
              sessionStorage.setItem(
                `remediation_video_${subtopic.replace(/\s+/g, "_")}`,
                JSON.stringify({
                  youtubeId: item.id.videoId,
                  title: item.snippet?.title || `${subtopic} Tutorial`,
                  channelTitle: item.snippet?.channelTitle || "Educational",
                })
              );
            }
          }
        }
      }
    } catch {}

    const result = mockStore.injectRemediation(
      level.id,
      topicsToInject
    );

    const diff = result?.diff;
    setInjectedSubLevelsCount(diff?.injectedLevels?.length || 0);
    setRemediationInjected(true);
    setIsInjectingPath(false);

    // Smoothly route to the newly injected booster lesson if available, or back to the roadmap
    const boosterLevel = diff?.injectedLevels?.[0];
    if (boosterLevel) {
      router.push(`/learn/${boosterLevel.id}`);
    } else {
      router.push("/roadmap");
    }
  };



  const correctCount = attempts.filter((a) => a.isCorrect).length;
  const isPassed = currentTheta >= 0.55 && correctCount >= 3;
  const masteryInfo = thetaToProficiencyDescription(currentTheta);
  const masteryPercentage = Math.round(currentTheta * 100);

  const missedTopics = Array.from(new Set(missedQuestions.map((q) => q.topic)));

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto pb-2 text-text-primary">
      {/*    1. Top Mastery Speedometer & Diagnostic Header    */}
      <div className="p-4 sm:p-5 rounded-2xl border border-border bg-surface shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-focus/10 text-focus border border-focus/20">
              ADAPTIVE DIAGNOSTIC
            </span>
            <span className="text-xs text-text-secondary font-mono">
              Level {level?.displayLevel || "1"}: {level?.skillName || skillParam}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-text-primary">
            {level?.title || `${skillParam} Core Diagnostic`}
          </h1>
          <p className="text-[11px] text-text-secondary">
            Question {Math.min(answeredQuestionIds.length + (isAnswerSubmitted ? 0 : 1), TOTAL_QUESTIONS_IN_TEST)} of {TOTAL_QUESTIONS_IN_TEST} • Dynamic difficulty calibrates to your mastery zone
          </p>
        </div>

        {/* Visual Mastery Meter (Novice -> Competent -> Expert) */}
        <div className="flex flex-col gap-1.5 min-w-[220px] p-3 rounded-xl bg-paper border border-border shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-text-secondary flex items-center gap-1.5 text-[11px]">
              <Target className="w-3.5 h-3.5 text-focus" />
              Skill Mastery Level
            </span>
            <span className="font-mono font-bold text-focus text-xs">{masteryPercentage}%</span>
          </div>

          {/* Meter Bar with 3 Visual Zones */}
          <div className="relative w-full h-2 bg-surface rounded-full overflow-hidden border border-border">
            <div
              style={{ width: `${Math.min(100, Math.max(8, masteryPercentage))}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                masteryPercentage >= 75
                  ? "bg-gradient-to-r from-teal-500 to-signal"
                  : masteryPercentage >= 45
                  ? "bg-gradient-to-r from-focus to-teal-400"
                  : "bg-gradient-to-r from-warning to-amber-500"
              }`}
            />
          </div>

          <div className="flex items-center justify-between text-[9px] text-text-secondary font-mono">
            <span className={masteryPercentage < 45 ? "text-warning font-bold" : ""}>Foundational</span>
            <span className={masteryPercentage >= 45 && masteryPercentage < 75 ? "text-focus font-bold" : ""}>Competent</span>
            <span className={masteryPercentage >= 75 ? "text-signal font-bold" : ""}>Role-Ready</span>
          </div>
        </div>
      </div>

      {/*    2. Main Question Arena    */}
      {!isCompleted && currentQuestion && (
        <div className="flex flex-col gap-4 p-4 sm:p-5 rounded-2xl border border-border bg-surface shadow-lg">
          <div>
            <div className="flex items-center justify-between text-[11px] text-text-secondary mb-1.5">
              <span className="font-mono font-semibold text-focus uppercase tracking-wider">
                Topic: {currentQuestion.topic}
              </span>
              <span className="font-mono text-text-secondary">
                Calibrated Level: Tier {currentQuestion.difficultyTier}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-text-primary leading-snug">
              {currentQuestion.question}
            </h3>
          </div>

          {/* Options List */}
          <div className="flex flex-col gap-2.5">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectOption = idx === currentQuestion.correctOptionIndex;

              let optionStyle = "border-border bg-paper text-text-primary hover:border-border/80 hover:bg-sidebar";
              if (isAnswerSubmitted) {
                if (isCorrectOption) {
                  optionStyle = "border-signal bg-signal/15 text-signal shadow-xs";
                } else if (isSelected && !isCorrectOption) {
                  optionStyle = "border-alert bg-alert/15 text-alert shadow-xs";
                } else {
                  optionStyle = "border-border/40 bg-paper/50 text-text-secondary";
                }
              } else if (isSelected) {
                optionStyle = "border-focus bg-focus/15 text-text-primary shadow-xs";
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isAnswerSubmitted}
                  onClick={() => setSelectedOption(idx)}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer text-xs sm:text-sm font-medium ${optionStyle}`}
                >
                  <span className="w-5 h-5 rounded-md bg-surface border border-border flex items-center justify-center text-[11px] font-mono font-bold flex-shrink-0 mt-0.5">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 leading-relaxed text-xs sm:text-sm">{option}</span>

                  {isAnswerSubmitted && isCorrectOption && (
                    <CheckCircle className="w-4 h-4 text-signal flex-shrink-0 mt-0.5" weight="fill" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrectOption && (
                    <XCircle className="w-4 h-4 text-alert flex-shrink-0 mt-0.5" weight="fill" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Answer Explanation */}
          {isAnswerSubmitted && (
            <div
              className={`p-3 rounded-xl border text-xs leading-relaxed animate-in fade-in duration-200 ${
                selectedOption === currentQuestion.correctOptionIndex
                  ? "border-signal/30 bg-signal/10 text-text-primary"
                  : "border-alert/30 bg-alert/10 text-text-primary"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-0.5">
                {selectedOption === currentQuestion.correctOptionIndex ? (
                  <span className="text-signal flex items-center gap-1 text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5" weight="fill" /> Correct Answer! (+Mastery Gain)
                  </span>
                ) : (
                  <span className="text-alert flex items-center gap-1 text-[11px]">
                    <WarningCircle className="w-3.5 h-3.5" weight="bold" /> Conceptual Gap Detected
                  </span>
                )}
              </div>
              <p className="text-[11px] text-text-secondary">{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Question Action Bar */}
          <div className="flex items-center justify-between pt-2.5 border-t border-border">
            <span className="text-[11px] text-text-secondary">
              {isAnswerSubmitted ? "Mastery score updated" : "Select an option and submit"}
            </span>

            {!isAnswerSubmitted ? (
              <button
                type="button"
                disabled={selectedOption === null}
                onClick={handleSubmitAnswer}
                className="px-5 py-2.5 rounded-xl bg-focus hover:bg-focus/90 text-white font-bold text-xs sm:text-sm shadow-md shadow-focus/25 transition-all cursor-pointer disabled:opacity-50"
              >
                Submit Answer
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-5 py-2.5 rounded-xl bg-focus hover:bg-focus/90 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-focus/25 transition-all cursor-pointer"
              >
                <span>{answeredQuestionIds.length >= TOTAL_QUESTIONS_IN_TEST ? "View Diagnostic Scorecard" : "Next Adaptive Question"}</span>
                <ArrowRight className="w-4 h-4" weight="bold" />
              </button>
            )}
          </div>
        </div>
      )}

      {/*    3. Completed Test Scorecard    */}
      {isCompleted && (
        <div className="flex flex-col gap-6 p-6 sm:p-8 rounded-3xl border border-border bg-surface shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center text-center gap-2">
            <div
              className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl ${
                isPassed
                  ? "bg-signal/15 border border-signal/30 text-signal shadow-signal/20"
                  : "bg-amber-500/15 border border-amber-500/30 text-amber-500 shadow-amber-500/20"
              }`}
            >
              {isPassed ? <Trophy className="w-8 h-8 text-warning" weight="fill" /> : <Handshake className="w-8 h-8 text-amber-400" weight="fill" />}
            </div>

            <h2 className="text-2xl font-bold text-text-primary mt-2">
              {isPassed ? "Boss Assessment Passed!" : "Diagnostic Complete"}
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary max-w-lg">
              {isPassed
                ? `Outstanding job! Your mastery score of ${masteryPercentage}% (${masteryInfo.label}) verifies readiness over ${level?.skillName}.`
                : `You scored ${masteryPercentage}% on ${level?.skillName}. We diagnosed your exact concept areas to get you up to speed fast.`}
            </p>
          </div>

          {/* Empathetic Remediation Flow (User's Vision) */}
          {!isPassed && (
            <div className="p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-surface to-surface flex flex-col gap-4 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 text-xl font-bold">
                    
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-text-primary">
                    Oh no, it seems you&apos;re having trouble with{" "}
                    <span className="text-amber-400 font-semibold">
                      {missedTopics.length > 0 ? missedTopics.join(" & ") : `${level?.skillName} core mechanics`}
                    </span>
                    , but don&apos;t worry  -  we&apos;ve got your back!
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    We&apos;ve generated a surgical booster lesson with interactive 3D flashcards and micro-drills to strengthen your foundation before moving forward.
                  </p>
                </div>
              </div>

              {/* Subtopic breakdown pills */}
              {missedTopics.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-xs font-semibold text-text-secondary py-1">Focus Topics for Booster:</span>
                  {missedTopics.map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1 rounded-xl text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      {topic}
                    </span>
                  ))}
                </div>
              )}

              {/* Single Clear CTA Button */}
              <div className="flex items-center justify-end pt-2 border-t border-amber-500/20">
                <button
                  type="button"
                  disabled={isInjectingPath}
                  onClick={handleContinueToBoosterLesson}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
                >
                  <Lightning className="w-4 h-4" weight="fill" />
                  <span>Continue to Booster Lesson</span>
                  <ArrowRight className="w-4 h-4" weight="bold" />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons for Passed State */}
          {isPassed && (
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Link
                href="/roadmap"
                className="px-5 py-2.5 rounded-xl bg-paper hover:bg-border border border-border text-text-secondary text-xs font-semibold transition-colors"
              >
                Back to Level Map
              </Link>

              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-2xl bg-focus hover:bg-focus/90 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-focus/25 transition-all"
              >
                <span>Go to Command Center</span>
                <ArrowRight className="w-4 h-4" weight="bold" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CATAssessmentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center text-text-secondary">
          <div className="flex items-center gap-2">
            <ArrowsClockwise className="w-5 h-5 animate-spin text-focus" />
            <span>Loading Adaptive Assessment...</span>
          </div>
        </div>
      }
    >
      <CATAssessmentContent />
    </Suspense>
  );
}
