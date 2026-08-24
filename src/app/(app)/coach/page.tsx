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
    a: "Unlike traditional 40-week static courses, CogniPath AI calculates your exact Skill Delta (Δ = max(0, Required% - Current%)) using data extracted from your Resume and GitHub code activity. Mastered topics (like Excel at 80%) are completely skipped, while critical gaps (like Power BI DAX at 20%) receive dedicated sequenced modules.",
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
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2 p-6 sm:p-8 rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit">
          <Sparkle className="w-4 h-4" />
          <span>Explainable AI (XAI) Architecture Hub</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
          Algorithmic Transparency & Pedagogical Reasoning
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
          CogniPath AI operates on transparent, mathematical principles rather than black-box recommendations. Review the foundational reasoning behind your personalized curriculum.
        </p>
      </div>

      {/* 4 Architectural Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl border border-zinc-800 bg-zinc-950/80 flex flex-col gap-2.5 shadow-lg">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">
            01
          </div>
          <h3 className="text-sm font-bold text-zinc-100">Delta Gap Formulation</h3>
          <p className="text-xs text-zinc-400 leading-relaxed font-mono">
            Δ_i = max(0, RequiredProficiency_i - CurrentProficiency_i)
          </p>
          <span className="text-[11px] text-zinc-500">
            Roadmap length and intensity are strictly proportional to the verified skill delta.
          </span>
        </div>

        <div className="p-5 rounded-3xl border border-zinc-800 bg-zinc-950/80 flex flex-col gap-2.5 shadow-lg">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs">
            02
          </div>
          <h3 className="text-sm font-bold text-zinc-100">Topological Kahn&apos;s DAG</h3>
          <p className="text-xs text-zinc-400 leading-relaxed font-mono">
            Time: O(|V| + |E|) • Space: O(|V|)
          </p>
          <span className="text-[11px] text-zinc-500">
            Guarantees prerequisite compliance and allocates nodes into weekly workload buckets.
          </span>
        </div>

        <div className="p-5 rounded-3xl border border-zinc-800 bg-zinc-950/80 flex flex-col gap-2.5 shadow-lg">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-bold text-xs">
            03
          </div>
          <h3 className="text-sm font-bold text-zinc-100">1-PL Rasch Psychometrics</h3>
          <p className="text-xs text-zinc-400 leading-relaxed font-mono">
            P(correct | θ, D) = 1 / (1 + e^(-3.0 * (θ - D)))
          </p>
          <span className="text-[11px] text-zinc-500">
            Stochastically updates latent ability θ with learning rate α = 0.20 on each answer.
          </span>
        </div>

        <div className="p-5 rounded-3xl border border-zinc-800 bg-zinc-950/80 flex flex-col gap-2.5 shadow-lg">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-mono font-bold text-xs">
            04
          </div>
          <h3 className="text-sm font-bold text-zinc-100">4-Factor Resource Blending</h3>
          <p className="text-xs text-zinc-400 leading-relaxed font-mono">
            S = 0.45*S_rel + 0.25*S_rat + 0.15*S_diff + 0.15*S_fresh
          </p>
          <span className="text-[11px] text-zinc-500">
            Weighted ranking combining YouTube videos, official docs, and GitHub boilerplates.
          </span>
        </div>
      </div>

      {/* Interactive FAQ Accordion */}
      <div className="flex flex-col gap-3 p-6 sm:p-8 rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl shadow-xl">
        <h3 className="text-base font-bold text-zinc-100 mb-2 flex items-center gap-2">
          <Question className="w-5 h-5 text-emerald-400" />
          Frequently Asked Architectural Questions
        </h3>

        {XAI_QUESTIONS.map((item, idx) => {
          const isExpanded = expandedIdx === idx;
          return (
            <div
              key={idx}
              className={`flex flex-col rounded-2xl border transition-all overflow-hidden ${
                isExpanded ? "border-emerald-500/40 bg-zinc-950/80" : "border-zinc-800 bg-zinc-900/40"
              }`}
            >
              <button
                type="button"
                onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                className="flex items-center justify-between p-4 text-left cursor-pointer hover:text-emerald-300 transition-colors"
              >
                <span className="text-xs sm:text-sm font-bold text-zinc-100 pr-4">{item.q}</span>
                <span className="text-xs font-mono text-emerald-400">{isExpanded ? "−" : "+"}</span>
              </button>

              {isExpanded && (
                <div className="p-4 pt-0 text-xs text-zinc-300 leading-relaxed border-t border-zinc-800/60 mt-1">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Return to Map */}
      <div className="flex justify-center pt-2">
        <Link
          href="/roadmap"
          className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-emerald-500/20 transition-all"
        >
          <GameController className="w-4 h-4" weight="fill" />
          <span>Return to Candy Crush Level Map</span>
          <ArrowRight className="w-4 h-4" weight="bold" />
        </Link>
      </div>
    </div>
  );
}
