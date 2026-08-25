"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkle,
  Brain,
  Question,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  GameController,
  Target,
} from "@phosphor-icons/react";

const XAI_QUESTIONS = [
  {
    q: "Why was this specific learning path generated instead of a generic syllabus?",
    a: "Unlike traditional 40-week static courses, LearnPath AI calculates your exact Skill Delta (Δ = max(0, Required% - Current%)) using data extracted from your Resume and GitHub code activity. Mastered topics (like Excel at 80%) are completely skipped, while critical gaps (like Power BI DAX at 20%) receive dedicated sequenced modules.",
  },
  {
    q: "Why are YouTube playlists pruned rather than embedded completely?",
    a: "Full online playlists often waste 30% of their runtime on software installation and generic introductions that you already know. Our AI Pruning Filter inspects individual video chapters, filtering out redundant introductory lessons and keeping only the core technical chapters that bridge your specific skill gap.",
  },
  {
    q: "How does Kahn's Topological Sort guarantee no circular dependencies?",
    a: "We model software engineering topics as a Directed Acyclic Graph (DAG) G = (V, E). Kahn's algorithm computes in-degree for each topic, ensuring foundational prerequisites (e.g. SQL Fundamentals) always precede downstream topics (e.g. Relational Data Modeling and DAX), while strictly respecting your weekly study hour constraints in O(|V| + |E|) time.",
  },
  {
    q: "What is the 1-PL Rasch IRT model in the Level 5 Boss Checkpoint?",
    a: "Item Response Theory (IRT) is a psychometric framework used in GRE/GMAT adaptive exams. It models the probability of answering a question correctly as a logistic function of your latent ability (θ) and the question's calibrated difficulty (D). It accurately converges to your true competency within 4-5 adaptive questions.",
  },
  {
    q: "What happens if I fail a subtopic in an adaptive assessment?",
    a: "The Autonomous Adaptive Loop dynamically injects a surgical micro-remediation node (Level 5.1) directly into the active path without resetting your previous progress. Downstream milestones are automatically re-balanced to ensure you master the prerequisite before moving forward.",
  },
];

export default function CoachPage() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-12 text-text-primary">
      {/* Header */}
      <div className="flex flex-col gap-2 p-6 sm:p-8 rounded-3xl border border-border bg-surface shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-focus/10 text-focus border border-focus/20 w-fit">
          <Sparkle className="w-4 h-4" />
          <span>Explainable AI (XAI) Architecture Hub</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          Algorithmic Transparency & Pedagogical Reasoning
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary max-w-2xl leading-relaxed">
          LearnPath AI operates on transparent, mathematical principles rather than black-box recommendations. Review the foundational reasoning behind your personalized curriculum.
        </p>
      </div>

      {/* 4 Architectural Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl border border-border bg-surface shadow-lg flex flex-col gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-focus/10 text-focus flex items-center justify-center">
            <Target className="w-4 h-4" weight="bold" />
          </div>
          <h2 className="text-sm font-bold text-text-primary">1. Skill Delta Formulation</h2>
          <p className="text-xs text-text-secondary leading-relaxed font-mono">
            Delta = max(0, Target_Required - Ingested_Baseline)
          </p>
          <p className="text-xs text-text-secondary">
            Ground-truth calibration prevents wasteful repetition of known skills.
          </p>
        </div>

        <div className="p-5 rounded-3xl border border-border bg-surface shadow-lg flex flex-col gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-focus/10 text-focus flex items-center justify-center">
            <GameController className="w-4 h-4" weight="bold" />
          </div>
          <h2 className="text-sm font-bold text-text-primary">2. Kahn&apos;s Topological DAG</h2>
          <p className="text-xs text-text-secondary leading-relaxed font-mono">
            Time Complexity: O(|V| + |E|)
          </p>
          <p className="text-xs text-text-secondary">
            Guarantees strict acyclic dependency resolution for prerequisite ordering.
          </p>
        </div>

        <div className="p-5 rounded-3xl border border-border bg-surface shadow-lg flex flex-col gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-focus/10 text-focus flex items-center justify-center">
            <Brain className="w-4 h-4" weight="bold" />
          </div>
          <h2 className="text-sm font-bold text-text-primary">3. 1-PL Rasch IRT Testing</h2>
          <p className="text-xs text-text-secondary leading-relaxed font-mono">
            P(Correct) = 1 / (1 + e^(-(theta - D_i)))
          </p>
          <p className="text-xs text-text-secondary">
            Dynamically adapts item difficulty to learner latent competency theta.
          </p>
        </div>

        <div className="p-5 rounded-3xl border border-border bg-surface shadow-lg flex flex-col gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-focus/10 text-focus flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" weight="bold" />
          </div>
          <h2 className="text-sm font-bold text-text-primary">4. 4-Factor Resource Blending</h2>
          <p className="text-xs text-text-secondary leading-relaxed font-mono">
            Score = 0.40(R) + 0.30(Q) + 0.15(A) + 0.15(P)
          </p>
          <p className="text-xs text-text-secondary">
            Ranks video chapters, documentation, and GitHub labs for each module.
          </p>
        </div>
      </div>

      {/* Interactive FAQ Accordion */}
      <div className="p-6 sm:p-8 rounded-3xl border border-border bg-surface shadow-xl space-y-4">
        <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-warning" weight="fill" />
          Frequently Asked Questions & Explanations
        </h2>

        <div className="space-y-3">
          {XAI_QUESTIONS.map((item, idx) => {
            const isExpanded = expandedIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-paper overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-text-primary hover:text-focus transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Question className="w-4 h-4 text-focus shrink-0" />
                    <span>{item.q}</span>
                  </span>
                  <span className="font-mono text-xs text-text-secondary">{isExpanded ? "−" : "+"}</span>
                </button>
                {isExpanded && (
                  <div className="p-4 pt-0 text-xs text-text-secondary leading-relaxed border-t border-border/40 mt-1">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Back to Map CTA */}
      <div className="flex justify-end">
        <Link
          href="/roadmap"
          className="px-6 py-3 rounded-2xl bg-focus hover:bg-focus/90 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-focus/25 transition-all"
        >
          <span>Return to Candy Crush DAG Map</span>
          <ArrowRight className="w-4 h-4" weight="bold" />
        </Link>
      </div>
    </div>
  );
}
