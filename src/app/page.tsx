"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkle,
  RocketLaunch,
  GameController,
  Brain,
  Play,
  ArrowRight,
  Target,
  FileText,
  GithubLogo,
  CheckCircle,
  Trophy,
  ShieldCheck,
} from "@phosphor-icons/react";

export default function LandingHeroPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-between selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navbar */}
      <header className="w-full max-w-7xl px-6 py-5 flex items-center justify-between border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkle className="w-5 h-5 text-zinc-950" weight="fill" />
          </div>
          <span className="font-bold text-lg tracking-tight text-zinc-100 flex items-center gap-1.5">
            LearnPath <span className="text-emerald-400 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-mono">AI 2.0</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-800 transition-colors"
          >
            Open Dashboard
          </Link>
          <Link
            href="/onboarding"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
          >
            <span>Start Onboarding</span>
            <ArrowRight className="w-3.5 h-3.5" weight="bold" />
          </Link>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="w-full max-w-6xl px-6 py-12 sm:py-20 flex flex-col items-center text-center gap-8">
        {/* Hackathon Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/30 text-emerald-300 shadow-xl shadow-emerald-500/5 animate-pulse">
          <Trophy className="w-4 h-4 text-amber-400" weight="fill" />
          <span>HCL Amplified Hackathon • AI-Powered Personalized Learning Path Recommender</span>
        </div>

        {/* Hero Title */}
        <div className="flex flex-col gap-4 max-w-4xl">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-100 leading-[1.1]">
            The Autonomous Learning Architect & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Adaptive Technical Upskilling Canvas
            </span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate rigid, one-size-fits-all 40-week syllabi. LearnPath AI 2.0 ingests your Resume and GitHub telemetry, calculates your exact <strong className="text-zinc-200">Skill Delta (Delta = max(0, Required - Current))</strong>, and synthesizes a dynamic <strong className="text-zinc-200">Candy Crush RPG DAG</strong> with psychometric CAT checkpoints and in-place adaptive re-routing.
          </p>
        </div>

        {/* Hero Call to Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/onboarding"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:opacity-90 text-zinc-950 font-bold text-sm flex items-center gap-2.5 shadow-2xl shadow-emerald-500/25 transition-all cursor-pointer"
          >
            <RocketLaunch className="w-5 h-5" weight="fill" />
            <span>Launch 3-Step Multi-Modal Wizard</span>
          </Link>

          <Link
            href="/roadmap"
            className="px-7 py-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            <GameController className="w-5 h-5 text-emerald-400" weight="fill" />
            <span>Explore Candy Crush DAG Map</span>
          </Link>
        </div>

        {/* 4 Championship Pillars Showcase Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full text-left pt-12">
          <div className="p-5 rounded-3xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl flex flex-col gap-2.5 shadow-xl">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileText className="w-5 h-5" weight="fill" />
            </div>
            <h3 className="text-sm font-bold text-zinc-100">Multi-Modal Ingestion</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              PDF Resume parsing + GitHub non-fork repo telemetry to calibrate your true baseline.
            </p>
          </div>

          <div className="p-5 rounded-3xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl flex flex-col gap-2.5 shadow-xl">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <GameController className="w-5 h-5" weight="fill" />
            </div>
            <h3 className="text-sm font-bold text-zinc-100">Candy Crush RPG DAG</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Kahn&apos;s Topological Sort O(|V| + |E|) with weekly workload balancing and React Flow.
            </p>
          </div>

          <div className="p-5 rounded-3xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl flex flex-col gap-2.5 shadow-xl">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Brain className="w-5 h-5" weight="fill" />
            </div>
            <h3 className="text-sm font-bold text-zinc-100">1-PL Rasch IRT Testing</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Psychometric Computerized Adaptive Testing with real-time ability meter (θ) calibration.
            </p>
          </div>

          <div className="p-5 rounded-3xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl flex flex-col gap-2.5 shadow-xl">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Play className="w-5 h-5" weight="fill" />
            </div>
            <h3 className="text-sm font-bold text-zinc-100">CourseOs Learning Canvas</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Split-screen YouTube video player, auto-saving Markdown notes, and 24/7 AI Copilot with Video RAG.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl px-6 py-6 border-t border-zinc-900 flex flex-wrap items-center justify-between text-xs text-zinc-500">
        <span>LearnPath AI 2.0 • Built for HCL Amplified Hackathon</span>
        <div className="flex items-center gap-4">
          <Link href="/coach" className="hover:text-zinc-300 transition-colors">
            Explainable AI (XAI)
          </Link>
          <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">
            Dashboard
          </Link>
          <Link href="/roadmap" className="hover:text-zinc-300 transition-colors">
            Candy Crush DAG
          </Link>
        </div>
      </footer>
    </div>
  );
}
