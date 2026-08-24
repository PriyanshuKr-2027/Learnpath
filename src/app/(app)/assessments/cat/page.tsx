"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Target,
  Brain,
  Sparkle,
  CheckCircle,
  XCircle,
  Crown,
  Trophy,
  ArrowRight,
  ArrowsClockwise,
  Gauge,
  Lightning,
  WarningCircle,
  ArrowLeft,
  Question,
  Cards,
} from "@phosphor-icons/react";
import { CATAttempt, CATQuestion, LearningPath, LevelNode } from "@/types";
import { mockStore } from "@/lib/services/mockStore";
import { getOrCreateCuratedResource, PRESEEDED_CURATED_CORPUS } from "@/lib/data/curatedCorpus";
import {
  calculateProbabilityOfSuccess,
  updateLatentAbility,
  thetaToProficiencyDescription,
  selectNextCalibratedQuestion,
  DEFAULT_INITIAL_THETA,
} from "@/lib/algorithms/raschIRT";

export default function CATAssessmentPage() {
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

  const TOTAL_QUESTIONS_IN_TEST = 4;

  useEffect(() => {
    const loadedPath = mockStore.getLearningPath();
    setPath(loadedPath);

    const foundLevel =
      loadedPath.levels.find((l) => l.id === levelIdParam) ||
      loadedPath.levels.find((l) => l.skillName.toLowerCase() === skillParam.toLowerCase()) ||
      loadedPath.levels[0];

    setLevel(foundLevel || null);

    const targetSkill = foundLevel?.skillName || skillParam;
    const curated = getOrCreateCuratedResource(targetSkill);
    const pool = curated.catQuestions && curated.catQuestions.length > 0
      ? curated.catQuestions
      : PRESEEDED_CURATED_CORPUS["sql"].catQuestions;

    setQuestionPool(pool);

    // Select initial intermediate question
    const firstQ = selectNextCalibratedQuestion(pool, DEFAULT_INITIAL_THETA, []);
    setCurrentQuestion(firstQ || pool[0]);
  }, [skillParam, levelIdParam]);

  if (!level || !currentQuestion) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-zinc-400">
        <div className="flex items-center gap-2">
          <ArrowsClockwise className="w-5 h-5 animate-spin text-emerald-400" />
          <span>Calibrating Psychometric 1-PL IRT Assessment Engine...</span>
        </div>
      </div>
    );
  }

  const proficiency = thetaToProficiencyDescription(currentTheta);
  const currentProbability = calculateProbabilityOfSuccess(currentTheta, currentQuestion.calibratedDifficulty);

  // Submit Active Answer
  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;

    const isCorrect = selectedOption === currentQuestion.correctOptionIndex;
    const newTheta = updateLatentAbility(currentTheta, isCorrect, currentQuestion.calibratedDifficulty);

    const attempt: CATAttempt = {
      questionId: currentQuestion.id,
      selectedOptionIndex: selectedOption,
      isCorrect,
      thetaBefore: currentTheta,
      thetaAfter: newTheta,
      timeSpentSeconds: 15,
    };

    setAttempts((prev) => [...prev, attempt]);
    setThetaHistory((prev) => [...prev, newTheta]);
    setCurrentTheta(newTheta);
    setIsAnswerSubmitted(true);

    if (!isCorrect) {
      setMissedQuestions((prev) => [...prev, currentQuestion]);
    }

    // Update subtopic diagnostics
    const topic = currentQuestion.topic || "Core Fundamentals";
    setSubtopicScores((prev) => {
      const existing = prev[topic] || { correct: 0, total: 0 };
      return {
        ...prev,
        [topic]: {
          correct: existing.correct + (isCorrect ? 1 : 0),
          total: existing.total + 1,
        },
      };
    });
  };

  // Move to Next Calibrated Question or Finish
  const handleNextQuestion = () => {
    const updatedAnswered = [...answeredQuestionIds, currentQuestion.id];
    setAnsweredQuestionIds(updatedAnswered);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);

    if (updatedAnswered.length >= TOTAL_QUESTIONS_IN_TEST) {
      setIsCompleted(true);
    } else {
      const nextQ = selectNextCalibratedQuestion(questionPool, currentTheta, updatedAnswered);
      if (nextQ) {
        setCurrentQuestion(nextQ);
      } else {
        setIsCompleted(true);
      }
    }
  };

  // Outcome 1: Complete and claim verified badge (if 0 mistakes or >= 70%)
  const handleClaimBadge = () => {
    mockStore.updateLevelProgress(level.id, {
      status: "completed",
      starsEarned: currentTheta >= 0.75 ? 3 : 2,
    });
    router.push("/roadmap");
  };

  // Outcome 2: Autonomous Adaptive In-Place Remediation (Mistake-Proportional: .1 per mistake)
  const handleTriggerAdaptiveRecalibration = (forcedTopics?: string[]) => {
    let topicsToRemediate: string[] = [];

    if (forcedTopics && forcedTopics.length > 0) {
      topicsToRemediate = forcedTopics;
    } else if (missedQuestions.length > 0) {
      // Unique list of missed subtopics
      topicsToRemediate = Array.from(new Set(missedQuestions.map((q) => q.topic)));
    } else {
      topicsToRemediate = ["DAX Measures & Context Transition", "Star Schema Relationships"];
    }

    mockStore.injectRemediation(level.id, topicsToRemediate);
    router.push("/roadmap");
  };

  const totalMistakesCount = missedQuestions.length;

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/roadmap"
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 flex items-center gap-1.5 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Map</span>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" weight="fill" />
                Boss Checkpoint
              </span>
              <h1 className="text-lg font-bold text-zinc-100">
                Psychometric CAT Adaptive Checkpoint: {level.skillName}
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              1-Parameter Logistic (Rasch) IRT Engine • Calibrated Difficulty Tiers (1–5)
            </p>
          </div>
        </div>

        {/* 1-Click Judge Simulator Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleTriggerAdaptiveRecalibration(["DAX Context Transition"])}
            className="px-2.5 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            title="Inject Level 5.1 for 1 Mistake"
          >
            <Lightning className="w-3.5 h-3.5" weight="fill" />
            <span>⚡ 1 Mistake (5.1)</span>
          </button>
          <button
            type="button"
            onClick={() => handleTriggerAdaptiveRecalibration(["DAX Context Transition", "Multi-Table Joins"])}
            className="px-2.5 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            title="Inject Level 5.1 & Level 5.2 for 2 Mistakes"
          >
            <Cards className="w-3.5 h-3.5" weight="fill" />
            <span>⚡ 2 Mistakes (5.1 + 5.2)</span>
          </button>
        </div>
      </div>

      {/* Real-time Latent Ability (θ) Gauge Panel */}
      <div className="p-5 rounded-3xl border border-zinc-800 bg-zinc-950/80 shadow-2xl flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
            <Gauge className="w-4 h-4 text-emerald-400" weight="fill" />
            <span>Live Latent Ability Gauge (θ)</span>
            <span className="font-mono text-emerald-400 text-sm">{(currentTheta * 100).toFixed(1)}%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {proficiency.badge}
            </span>
            <span className="text-xs text-zinc-400">
              Question {Math.min(TOTAL_QUESTIONS_IN_TEST, answeredQuestionIds.length + 1)} of {TOTAL_QUESTIONS_IN_TEST}
            </span>
          </div>
        </div>

        {/* Dynamic Ability Meter Gradient Track */}
        <div className="relative w-full h-4 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
          <div
            style={{ width: `${Math.round(currentTheta * 100)}%` }}
            className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-700 shadow-md"
          />
        </div>

        {/* Formula Math Transparency Pill */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-zinc-500 pt-1">
          <span className="font-mono">
            Rasch 1-PL: P(correct | θ={currentTheta.toFixed(2)}, D={currentQuestion.calibratedDifficulty.toFixed(2)}) = <strong>{(currentProbability * 100).toFixed(0)}%</strong>
          </span>
          <span className="font-mono text-zinc-400">
            Current Tier: <strong className="text-zinc-200">Tier {currentQuestion.difficultyTier} ({currentQuestion.topic})</strong>
          </span>
        </div>
      </div>

      {/* Main Question & Answer Arena */}
      {!isCompleted ? (
        <div className="flex flex-col gap-5 p-6 sm:p-8 rounded-3xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shadow-2xl">
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
              <span className="font-mono font-semibold text-emerald-400 uppercase tracking-wider">
                Subtopic: {currentQuestion.topic}
              </span>
              <span className="font-mono text-zinc-500">
                Calibrated Difficulty D = {currentQuestion.calibratedDifficulty.toFixed(2)}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-100 leading-snug">
              {currentQuestion.question}
            </h3>
          </div>

          {/* Options List */}
          <div className="flex flex-col gap-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectOption = idx === currentQuestion.correctOptionIndex;

              let optionStyle = "border-zinc-800 bg-zinc-950/60 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900";
              if (isAnswerSubmitted) {
                if (isCorrectOption) {
                  optionStyle = "border-emerald-500 bg-emerald-950/40 text-emerald-200 shadow-md shadow-emerald-500/10";
                } else if (isSelected && !isCorrectOption) {
                  optionStyle = "border-rose-500 bg-rose-950/40 text-rose-200 shadow-md shadow-rose-500/10";
                } else {
                  optionStyle = "border-zinc-900 bg-zinc-950/20 text-zinc-600";
                }
              } else if (isSelected) {
                optionStyle = "border-emerald-500/60 bg-emerald-950/20 text-zinc-100 shadow-md shadow-emerald-500/10";
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isAnswerSubmitted}
                  onClick={() => setSelectedOption(idx)}
                  className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all cursor-pointer text-xs sm:text-sm font-medium ${optionStyle}`}
                >
                  <span className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 mt-0.5">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 leading-relaxed">{option}</span>

                  {isAnswerSubmitted && isCorrectOption && (
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" weight="fill" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrectOption && (
                    <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" weight="fill" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Answer Diagnostic Explanation */}
          {isAnswerSubmitted && (
            <div
              className={`p-4 rounded-2xl border text-xs leading-relaxed animate-in fade-in duration-200 ${
                selectedOption === currentQuestion.correctOptionIndex
                  ? "border-emerald-500/30 bg-emerald-950/20 text-zinc-200"
                  : "border-rose-500/30 bg-rose-950/20 text-zinc-200"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1">
                {selectedOption === currentQuestion.correctOptionIndex ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" weight="fill" /> Correct Answer! (+θ calibration)
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1">
                    <WarningCircle className="w-4 h-4" weight="fill" /> Incorrect. (-θ calibration ➔ Sub-level scheduled)
                  </span>
                )}
              </div>
              <p className="text-zinc-300">{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-end pt-2">
            {!isAnswerSubmitted ? (
              <button
                type="button"
                disabled={selectedOption === null}
                onClick={handleSubmitAnswer}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-40 cursor-pointer"
              >
                <span>Submit Answer</span>
                <ArrowRight className="w-4 h-4" weight="bold" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-90 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <span>
                  {answeredQuestionIds.length + 1 >= TOTAL_QUESTIONS_IN_TEST ? "View Diagnostic Results" : "Next Calibrated Question"}
                </span>
                <ArrowRight className="w-4 h-4" weight="bold" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Diagnostic Results Screen */
        <div className="flex flex-col gap-6 p-6 sm:p-8 rounded-3xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl shadow-2xl text-center items-center">
          <div
            className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl ${
              totalMistakesCount === 0 && currentTheta >= 0.65
                ? "bg-gradient-to-tr from-emerald-500 to-teal-400 text-zinc-950 shadow-emerald-500/30"
                : "bg-gradient-to-tr from-amber-500 to-orange-500 text-zinc-950 shadow-orange-500/30"
            }`}
          >
            {totalMistakesCount === 0 && currentTheta >= 0.65 ? (
              <Trophy className="w-10 h-10" weight="fill" />
            ) : (
              <Brain className="w-10 h-10" weight="fill" />
            )}
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
              CAT Diagnostic Complete
            </span>
            <h2 className="text-2xl font-bold text-zinc-100 mt-1">
              Calibrated Ability: {proficiency.label} ({(currentTheta * 100).toFixed(0)}%)
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
              {totalMistakesCount === 0
                ? "Zero errors detected! Your mastery is verified across all sub-dimensions."
                : `Detected ${totalMistakesCount} question mistake(s). Autonomous adaptive loop will inject .1 sub-levels for each mistake.`}
            </p>
          </div>

          {/* Subtopic Accuracy Breakdown */}
          <div className="w-full max-w-md flex flex-col gap-2 p-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 text-left">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Subtopic Diagnostics</span>
            {Object.entries(subtopicScores).map(([subtopic, score]) => {
              const pct = Math.round((score.correct / score.total) * 100);
              return (
                <div key={subtopic} className="flex items-center justify-between text-xs py-1 border-b border-zinc-800/60 last:border-0">
                  <span className="text-zinc-300">{subtopic}</span>
                  <span
                    className={`font-mono font-bold ${
                      pct >= 70 ? "text-emerald-400" : pct >= 50 ? "text-amber-400" : "text-rose-400"
                    }`}
                  >
                    {score.correct}/{score.total} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>

          {/* Decision Outcome */}
          {totalMistakesCount === 0 && currentTheta >= 0.65 ? (
            <div className="flex flex-col gap-3 w-full max-w-md">
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300">
                🎉 <strong>Perfect Mastery Verified!</strong> Prerequisite roadblocks cleared. Next 5 levels unlocked.
              </div>
              <button
                type="button"
                onClick={handleClaimBadge}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Trophy className="w-5 h-5" weight="fill" />
                <span>Claim Verified Badge & Return to Map</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 w-full max-w-md">
              <div className="p-3.5 rounded-xl bg-orange-950/30 border border-orange-500/30 text-xs text-orange-300 text-left">
                ⚠️ <strong>Mistake-Proportional Adaptive Recalibration:</strong>
                <ul className="list-disc list-inside mt-1.5 space-y-1 text-[11px] text-zinc-300">
                  {missedQuestions.map((q, idx) => (
                    <li key={idx}>
                      Mistake #{idx + 1} in <strong>{q.topic}</strong> ➔ Injecting <strong>Level {level.levelNumber}.{idx + 1} Flashcard Lab</strong>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => handleTriggerAdaptiveRecalibration()}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-zinc-950 font-bold text-sm shadow-xl shadow-orange-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Cards className="w-5 h-5" weight="fill" />
                <span>
                  Inject {totalMistakesCount || 1} Sub-Level(s) & Open Flashcards
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
