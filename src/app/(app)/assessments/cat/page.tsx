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
import { getOrCreateCuratedResource } from "@/lib/data/curatedCorpus";
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

  // Dynamic Remediation Trigger State
  const [isInjectingPath, setIsInjectingPath] = useState(false);
  const [remediationInjected, setRemediationInjected] = useState<boolean>(false);
  const [injectedSubLevelsCount, setInjectedSubLevelsCount] = useState<number>(0);

  const TOTAL_QUESTIONS_IN_TEST = 5;

  // Initialize CAT Engine
  useEffect(() => {
    const activePath = mockStore.getLearningPath();
    setPath(activePath);

    const foundLevel =
      activePath.levels.find((l) => l.id === levelIdParam) ||
      activePath.levels.find((l) => l.skillName.toLowerCase() === skillParam.toLowerCase()) ||
      activePath.levels[0];

    setLevel(foundLevel || null);

    const resource = getOrCreateCuratedResource(foundLevel?.skillName || skillParam);
    const pool = resource.catQuestions || [];
    setQuestionPool(pool);

    const firstQ = selectNextCalibratedQuestion(pool, DEFAULT_INITIAL_THETA, []);
    setCurrentQuestion(firstQ);
  }, [skillParam, levelIdParam]);

  if (!currentQuestion && !isCompleted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-text-secondary">
        <div className="flex items-center gap-2">
          <ArrowsClockwise className="w-5 h-5 animate-spin text-focus" />
          <span>Calibrating Rasch IRT Adaptive Question Pool...</span>
        </div>
      </div>
    );
  }

  const currentProbability = currentQuestion
    ? calculateProbabilityOfSuccess(currentTheta, currentQuestion.calibratedDifficulty)
    : 0.5;

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

  const handleTriggerRemediation = (simulatedMistakesCount?: number) => {
    if (!level) return;
    setIsInjectingPath(true);

    const weakSubtopicsList =
      missedQuestions.length > 0
        ? Array.from(new Set(missedQuestions.map((q) => q.topic)))
        : [currentQuestion?.topic || `${level.skillName} Sub-concept`];

    const countToInject = simulatedMistakesCount || Math.max(1, missedQuestions.length || 1);

    const { diff } = mockStore.injectRemediation(
      level.id,
      weakSubtopicsList.slice(0, countToInject)
    );

    setInjectedSubLevelsCount(diff.injectedLevels.length);
    setRemediationInjected(true);
    setIsInjectingPath(false);
  };

  const correctCount = attempts.filter((a) => a.isCorrect).length;
  const isPassed = currentTheta >= 0.55 && correctCount >= 3;

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-16 text-text-primary">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-surface shadow-xl">
        <Link
          href="/roadmap"
          className="p-2 rounded-xl bg-paper hover:bg-border border border-border text-text-secondary hover:text-text-primary flex items-center gap-1.5 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Level Map</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-warning/15 text-warning border border-warning/30 font-mono flex items-center gap-1">
            <Crown className="w-3.5 h-3.5" weight="fill" />
            1-PL RASCH IRT CHECKPOINT
          </span>
          <span className="text-xs font-bold text-text-primary hidden sm:inline">
            {level?.title || skillParam}
          </span>
        </div>

        <div className="text-xs text-text-secondary font-mono">
          Theta: <strong className="text-focus">{currentTheta.toFixed(2)}</strong>
        </div>
      </div>

      {/* Latent Ability HUD Gauge Card */}
      <div className="p-6 sm:p-7 rounded-3xl border border-border bg-surface shadow-2xl flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-focus/15 border border-focus/30 text-focus flex items-center justify-center">
              <Brain className="w-5 h-5" weight="fill" />
            </div>
            <div>
              <span className="text-xs font-bold text-text-secondary block">
                Estimated Latent Ability Metric (&theta;)
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-black font-mono text-text-primary">
                  {currentTheta.toFixed(2)}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-paper border border-border text-text-secondary">
                  {thetaToProficiencyDescription(currentTheta).label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-text-secondary font-mono">
              Progress: <strong className="text-text-primary">{correctCount}/{answeredQuestionIds.length} Correct</strong>
            </span>
            <span className="text-xs text-text-secondary">
              Question {Math.min(TOTAL_QUESTIONS_IN_TEST, answeredQuestionIds.length + 1)} of {TOTAL_QUESTIONS_IN_TEST}
            </span>
          </div>
        </div>

        {/* Dynamic Ability Meter Gradient Track */}
        <div className="relative w-full h-4 bg-paper rounded-full overflow-hidden p-0.5 border border-border">
          <div
            style={{ width: `${Math.round(currentTheta * 100)}%` }}
            className="h-full bg-gradient-to-r from-alert via-warning to-signal rounded-full transition-all duration-700 shadow-md"
          />
        </div>

        {/* Formula Math Transparency Pill */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-text-secondary pt-1">
          <span className="font-mono">
            Rasch 1-PL: P(correct | &theta;={currentTheta.toFixed(2)}, D={currentQuestion?.calibratedDifficulty.toFixed(2)}) = <strong>{(currentProbability * 100).toFixed(0)}%</strong>
          </span>
          <span className="font-mono text-text-secondary">
            Current Tier: <strong className="text-text-primary">Tier {currentQuestion?.difficultyTier} ({currentQuestion?.topic})</strong>
          </span>
        </div>
      </div>

      {/* Main Question Arena */}
      {!isCompleted && currentQuestion && (
        <div className="flex flex-col gap-5 p-6 sm:p-8 rounded-3xl border border-border bg-surface shadow-2xl">
          <div>
            <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
              <span className="font-mono font-semibold text-focus uppercase tracking-wider">
                Subtopic: {currentQuestion.topic}
              </span>
              <span className="font-mono text-text-secondary">
                Calibrated Difficulty D = {currentQuestion.calibratedDifficulty.toFixed(2)}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-text-primary leading-snug">
              {currentQuestion.question}
            </h3>
          </div>

          {/* Options List */}
          <div className="flex flex-col gap-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectOption = idx === currentQuestion.correctOptionIndex;

              let optionStyle = "border-border bg-paper text-text-primary hover:border-border/80 hover:bg-sidebar";
              if (isAnswerSubmitted) {
                if (isCorrectOption) {
                  optionStyle = "border-signal bg-signal/15 text-signal shadow-md shadow-signal/10";
                } else if (isSelected && !isCorrectOption) {
                  optionStyle = "border-alert bg-alert/15 text-alert shadow-md shadow-alert/10";
                } else {
                  optionStyle = "border-border/40 bg-paper/50 text-text-secondary";
                }
              } else if (isSelected) {
                optionStyle = "border-focus bg-focus/15 text-text-primary shadow-md shadow-focus/10";
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isAnswerSubmitted}
                  onClick={() => setSelectedOption(idx)}
                  className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all cursor-pointer text-xs sm:text-sm font-medium ${optionStyle}`}
                >
                  <span className="w-6 h-6 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 mt-0.5">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 leading-relaxed">{option}</span>

                  {isAnswerSubmitted && isCorrectOption && (
                    <CheckCircle className="w-5 h-5 text-signal flex-shrink-0" weight="fill" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrectOption && (
                    <XCircle className="w-5 h-5 text-alert flex-shrink-0" weight="fill" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Answer Explanation */}
          {isAnswerSubmitted && (
            <div
              className={`p-4 rounded-2xl border text-xs leading-relaxed animate-in fade-in duration-200 ${
                selectedOption === currentQuestion.correctOptionIndex
                  ? "border-signal/30 bg-signal/10 text-text-primary"
                  : "border-alert/30 bg-alert/10 text-text-primary"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1">
                {selectedOption === currentQuestion.correctOptionIndex ? (
                  <span className="text-signal flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" weight="fill" /> Correct Answer! (+&theta; calibration)
                  </span>
                ) : (
                  <span className="text-alert flex items-center gap-1">
                    <WarningCircle className="w-4 h-4" weight="bold" /> Conceptual Gap Detected (-&theta; calibration)
                  </span>
                )}
              </div>
              <p className="text-text-secondary">{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Question Action Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-xs text-text-secondary">
              {isAnswerSubmitted ? "Latent parameter &theta; updated" : "Select an option and submit to calibrate"}
            </span>

            {!isAnswerSubmitted ? (
              <button
                type="button"
                disabled={selectedOption === null}
                onClick={handleSubmitAnswer}
                className="px-6 py-3 rounded-2xl bg-focus hover:bg-focus/90 text-white font-bold text-xs sm:text-sm shadow-lg shadow-focus/25 transition-all cursor-pointer disabled:opacity-50"
              >
                Submit Answer
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-6 py-3 rounded-2xl bg-focus hover:bg-focus/90 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-focus/25 transition-all cursor-pointer"
              >
                <span>{answeredQuestionIds.length >= TOTAL_QUESTIONS_IN_TEST ? "View Diagnostic Scorecard" : "Next Adaptive Question"}</span>
                <ArrowRight className="w-4 h-4" weight="bold" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Completed Test Scorecard */}
      {isCompleted && (
        <div className="flex flex-col gap-6 p-6 sm:p-8 rounded-3xl border border-border bg-surface shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center text-center gap-2">
            <div
              className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl ${
                isPassed
                  ? "bg-signal/15 border border-signal/30 text-signal shadow-signal/20"
                  : "bg-alert/15 border border-alert/30 text-alert shadow-alert/20"
              }`}
            >
              {isPassed ? <Trophy className="w-8 h-8 text-warning" weight="fill" /> : <WarningCircle className="w-8 h-8" weight="fill" />}
            </div>

            <h2 className="text-2xl font-bold text-text-primary mt-2">
              {isPassed ? "Boss Assessment Passed!" : "Diagnostic Remediation Triggered"}
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary max-w-lg">
              {isPassed
                ? `Congratulations! Your latent competency score of θ = ${currentTheta.toFixed(2)} verifies mastery over ${level?.skillName}.`
                : `Your latent competency θ = ${currentTheta.toFixed(2)} indicates specific concept gaps in ${missedQuestions.map((q) => q.topic).join(", ") || "subtopics"}.`}
            </p>
          </div>

          {/* Remediation Injection Trigger Card */}
          {!isPassed && (
            <div className="p-5 rounded-2xl border border-alert/30 bg-alert/5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <WarningCircle className="w-5 h-5 text-alert" weight="fill" />
                  <span className="text-sm font-bold text-text-primary">
                    Mistake-Proportional Sub-Level Scaling ({missedQuestions.length} Mistake{missedQuestions.length === 1 ? "" : "s"} &rarr; {missedQuestions.length} Remedial Level{missedQuestions.length === 1 ? "" : "s"})
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-alert">
                  +{missedQuestions.length * 0.1 > 0 ? (missedQuestions.length * 0.1).toFixed(1) : "0.1"} Levels
                </span>
              </div>

              <p className="text-xs text-text-secondary">
                To master these weak spots, LearnPath AI injects {missedQuestions.length > 0 ? missedQuestions.length : 1} micro-remediation sub-level(s) (e.g. 5.1, 5.2...) equipped with 3D flashcard decks into your active Candy Crush DAG.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  disabled={isInjectingPath || remediationInjected}
                  onClick={() => handleTriggerRemediation()}
                  className="px-5 py-2.5 rounded-xl bg-alert hover:bg-alert/90 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-alert/20 cursor-pointer disabled:opacity-50"
                >
                  <Lightning className="w-4 h-4" weight="fill" />
                  <span>
                    {remediationInjected
                      ? `✅ Injected ${injectedSubLevelsCount} Remedial Sub-Levels`
                      : `Inject ${missedQuestions.length || 1} Remediation Level(s)`}
                  </span>
                </button>

                {remediationInjected && (
                  <Link
                    href="/roadmap"
                    className="px-5 py-2.5 rounded-xl bg-focus hover:bg-focus/90 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-focus/25"
                  >
                    <span>View Injected S-Curve in DAG Map</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
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
        </div>
      )}
    </div>
  );
}
