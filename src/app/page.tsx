"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkle,
  RocketLaunch,
  GameController,
  Brain,
  ArrowRight,
  Target,
  FileText,
  GithubLogo,
  CheckCircle,
  Trophy,
  ShieldCheck,
  Note,
  UsersThree,
} from "@phosphor-icons/react";

export default function LandingHeroPage() {
  return (
    <div className="min-h-screen bg-paper text-text-primary flex flex-col items-center justify-between selection:bg-focus/30 selection:text-focus">
      {/* Top Navbar */}
      <header className="w-full max-w-7xl px-6 py-5 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-focus flex items-center justify-center shadow-lg shadow-focus/25 text-white">
            <Sparkle className="w-5 h-5" weight="fill" />
          </div>
          <span className="font-bold text-lg tracking-tight text-text-primary flex items-center gap-1.5">
            LearnPath <span className="text-focus text-xs px-2 py-0.5 rounded-full bg-focus/10 border border-focus/20 font-mono font-bold">AI 2.0</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl bg-surface hover:bg-surface/80 text-text-secondary hover:text-text-primary text-xs font-semibold border border-border transition-colors"
          >
            Open Dashboard
          </Link>
          <Link
            href="/onboarding"
            className="px-4 py-2 rounded-xl bg-focus hover:bg-focus/90 text-white text-xs font-bold shadow-lg shadow-focus/25 transition-all flex items-center gap-1.5"
          >
            <span>Start Onboarding</span>
            <ArrowRight className="w-3.5 h-3.5" weight="bold" />
          </Link>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="w-full max-w-6xl px-6 py-12 sm:py-20 flex flex-col items-center text-center gap-8">
        {/* Hackathon Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-focus/10 border border-focus/30 text-focus shadow-lg shadow-focus/5">
          <Trophy className="w-4 h-4 text-warning" weight="fill" />
          <span>HCL Amplified Hackathon • AI-Powered Personalized Learning Path Recommender</span>
        </div>

        {/* Hero Title */}
        <div className="flex flex-col gap-4 max-w-4xl">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-text-primary leading-[1.1]">
            The Autonomous Learning Architect & <br className="hidden sm:inline" />
            <span className="text-focus">
              Adaptive Technical Upskilling Canvas
            </span>
          </h1>
          <p className="text-sm sm:text-base text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Eliminate rigid, one-size-fits-all 40-week syllabi. LearnPath AI 2.0 ingests your Resume and GitHub telemetry, calculates your exact <strong className="text-text-primary">Skill Delta (Delta = max(0, Required - Current))</strong>, and synthesizes a dynamic <strong className="text-text-primary">Candy Crush RPG DAG</strong> with psychometric CAT checkpoints and in-place adaptive re-routing.
          </p>
        </div>

        {/* Hero Call to Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/onboarding"
            className="px-8 py-4 rounded-2xl bg-focus hover:bg-focus/90 text-white font-bold text-sm flex items-center gap-2.5 shadow-2xl shadow-focus/30 transition-all cursor-pointer"
          >
            <RocketLaunch className="w-5 h-5" weight="fill" />
            <span>Launch Multi-Modal Onboarding</span>
          </Link>

          <Link
            href="/roadmap"
            className="px-7 py-4 rounded-2xl bg-surface hover:bg-surface/80 border border-border text-text-primary font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            <GameController className="w-5 h-5 text-focus" weight="fill" />
            <span>Explore Candy Crush DAG Map</span>
          </Link>
        </div>

        {/* 4 Foundation Pillars Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full text-left pt-10">
          <div className="p-6 rounded-3xl border border-border bg-surface flex flex-col gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-2xl bg-focus/10 border border-focus/20 text-focus flex items-center justify-center">
              <FileText className="w-5 h-5" weight="fill" />
            </div>
            <h3 className="text-sm font-bold text-text-primary">Multi-Modal Telemetry</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Resume PDF parsing and GitHub original commit telemetry filter out forked repos to establish verified baseline capability.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-border bg-surface flex flex-col gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-2xl bg-focus/10 border border-focus/20 text-focus flex items-center justify-center">
              <GameController className="w-5 h-5" weight="fill" />
            </div>
            <h3 className="text-sm font-bold text-text-primary">Kahn&apos;s Topological DAG</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Synthesizes linear S-curve levels with mathematical prerequisite sorting (O(|V| + |E|)) and 4-factor resource blending.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-border bg-surface flex flex-col gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-2xl bg-focus/10 border border-focus/20 text-focus flex items-center justify-center">
              <Brain className="w-5 h-5" weight="fill" />
            </div>
            <h3 className="text-sm font-bold text-text-primary">1-PL Rasch IRT CAT</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Psychometric computerized adaptive test adjusts question difficulty to learner latent ability $\theta$ in real time.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-border bg-surface flex flex-col gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-2xl bg-focus/10 border border-focus/20 text-focus flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" weight="fill" />
            </div>
            <h3 className="text-sm font-bold text-text-primary">Explainable AI (XAI)</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Every recommended video timestamp, documentation lab, and remedial sub-level includes transparent mathematical justification.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl px-6 py-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-text-secondary gap-4">
        <span>LearnPath AI 2.0 • HCL Amplified Hackathon (Round 2)</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hover:text-text-primary transition-colors">Sign In</Link>
          <Link href="/dashboard" className="hover:text-text-primary transition-colors">Dashboard</Link>
          <Link href="/roadmap" className="hover:text-text-primary transition-colors">Roadmap DAG</Link>
        </div>
      </footer>
    </div>
  );
}
