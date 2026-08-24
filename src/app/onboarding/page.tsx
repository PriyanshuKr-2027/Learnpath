"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkle,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  FileText,
  GithubLogo,
  Sliders,
  Clock,
  Target,
  RocketLaunch,
  SpinnerGap,
  Lightning,
} from "@phosphor-icons/react";
import { LearnerProfile, ProjectEntry, SkillEntry } from "@/types";
import { PRESEEDED_CAREER_ROLES } from "@/lib/data/roleTaxonomy";
import { ResumeDropzone } from "@/components/onboarding/ResumeDropzone";
import { GitHubTelemetryCard } from "@/components/onboarding/GitHubTelemetryCard";
import { SkillSliderMatrix } from "@/components/onboarding/SkillSliderMatrix";
import { mockStore } from "@/lib/services/mockStore";

const QUICK_GOAL_PRESETS = [
  {
    title: "Data Analyst (Power BI & SQL)",
    roleId: "data-analyst",
    prompt: "I want to transition into a Data Analyst role mastering SQL, Power BI DAX, and Data Modeling in 10 weeks with 10 hrs/week.",
  },
  {
    title: "Generative AI & RAG Engineer",
    roleId: "ai-engineer",
    prompt: "I want to master PyTorch, Transformers, Vector Databases, and production RAG agents in 12 weeks with 12 hrs/week.",
  },
  {
    title: "Full-Stack AI App Developer",
    roleId: "fullstack-ai-dev",
    prompt: "I want to build modern fullstack AI applications using Next.js 16, TypeScript, Supabase, and real-time LLM streaming.",
  },
  {
    title: "FAANG DSA & Algorithmic Patterns",
    roleId: "dsa-faang",
    prompt: "Master FAANG interview patterns including Sliding Window, Trees, Graphs, Dynamic Programming, and Topological Sort.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 State
  const [name, setName] = useState("Alex Dev");
  const [goalPrompt, setGoalPrompt] = useState(QUICK_GOAL_PRESETS[0].prompt);
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [totalWeeks, setTotalWeeks] = useState(10);
  const [isAnalyzingGoal, setIsAnalyzingGoal] = useState(false);
  const [extractedRole, setExtractedRole] = useState<string>("data-analyst");
  const [extractedTech, setExtractedTech] = useState<string[]>(["SQL", "Power BI", "Python", "Data Modeling"]);

  // Step 2 State
  const [skills, setSkills] = useState<SkillEntry[]>([
    { name: "SQL", source: "resume", currentProficiency: 40, evidence: "Basic querying experience" },
    { name: "Excel & Advanced Formulas", source: "resume", currentProficiency: 80, evidence: "VLOOKUP, Pivot tables" },
    { name: "Python for Data Analysis", source: "github", currentProficiency: 60, evidence: "Demonstrated in public repos" },
    { name: "Power BI & DAX", source: "inferred", currentProficiency: 20, evidence: "Identified role prerequisite" },
    { name: "Applied Business Statistics", source: "resume", currentProficiency: 30, evidence: "Foundational coursework" },
  ]);
  const [certifications, setCertifications] = useState<string[]>(["Google Data Analytics Certificate"]);
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  const [githubTelemetry, setGithubTelemetry] = useState<any>(null);

  // Step 3 State
  const [isGeneratingPath, setIsGeneratingPath] = useState(false);

  // Analyze Goal with AI
  const handleAnalyzeGoal = async () => {
    if (!goalPrompt.trim()) return;
    setIsAnalyzingGoal(true);

    try {
      const res = await fetch("/api/ai/goal-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          goalPrompt,
          timeBudgetWeeks: totalWeeks,
          weeklyHours,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setExtractedRole(data.targetRoleId || "data-analyst");
        if (data.relevantTech) setExtractedTech(data.relevantTech);
        if (data.timeframeWeeks) setTotalWeeks(data.timeframeWeeks);
        if (data.weeklyHoursBudget) setWeeklyHours(data.weeklyHoursBudget);
      }
    } catch (e) {
      console.error("Goal analysis error:", e);
    } finally {
      setIsAnalyzingGoal(false);
    }
  };

  // Resume Handler
  const handleResumeParsed = (data: { skills: SkillEntry[]; certifications: string[]; projects: ProjectEntry[] }) => {
    // Merge skills avoiding duplicates
    const merged = [...skills];
    for (const newSkill of data.skills) {
      const existingIdx = merged.findIndex((s) => s.name.toLowerCase() === newSkill.name.toLowerCase());
      if (existingIdx !== -1) {
        merged[existingIdx] = {
          ...merged[existingIdx],
          source: "resume",
          currentProficiency: Math.max(merged[existingIdx].currentProficiency, newSkill.currentProficiency),
          evidence: newSkill.evidence,
        };
      } else {
        merged.push(newSkill);
      }
    }
    setSkills(merged);
    if (data.certifications) setCertifications((prev) => Array.from(new Set([...prev, ...data.certifications])));
    if (data.projects) setProjects((prev) => [...prev, ...data.projects]);
  };

  // GitHub Handler
  const handleGitHubSynced = (data: { telemetry: any; skills: SkillEntry[] }) => {
    setGithubTelemetry(data.telemetry);
    const merged = [...skills];
    for (const ghSkill of data.skills) {
      const existingIdx = merged.findIndex((s) => s.name.toLowerCase() === ghSkill.name.toLowerCase());
      if (existingIdx !== -1) {
        merged[existingIdx] = {
          ...merged[existingIdx],
          source: merged[existingIdx].source === "resume" ? "resume" : "github",
          currentProficiency: Math.max(merged[existingIdx].currentProficiency, ghSkill.currentProficiency),
          evidence: ghSkill.evidence,
        };
      } else {
        merged.push(ghSkill);
      }
    }
    setSkills(merged);
  };

  // Final Submission & Path Generation
  const handleGeneratePath = async () => {
    setIsGeneratingPath(true);

    const selectedRole = PRESEEDED_CAREER_ROLES.find((r) => r.id === extractedRole) || PRESEEDED_CAREER_ROLES[0];

    const profile: LearnerProfile = {
      name,
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      goalPrompt,
      targetRoleId: selectedRole.id,
      targetRoleTitle: selectedRole.title,
      weeklyHoursBudget: weeklyHours,
      totalWeeksBudget: totalWeeks,
      skills,
      certifications,
      pastProjects: projects,
      githubStats: githubTelemetry,
      hasCompletedOnboarding: true,
      currentStreak: 1,
      lastActiveDate: new Date().toISOString(),
      darkMode: true,
    };

    // Save profile and generate versioned DAG path
    mockStore.saveProfile(profile);
    const path = mockStore.getLearningPath(); // Auto-generates and caches in mockStore

    setTimeout(() => {
      setIsGeneratingPath(false);
      router.push("/roadmap");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Header Badge */}
      <div className="w-full max-w-3xl flex flex-col items-center text-center gap-2 mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Sparkle className="w-4 h-4" />
          <span>CogniPath AI 2.0 • Autonomous Career Architect</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
          Personalized Learning Path Onboarding
        </h1>
        <p className="text-sm text-zinc-400 max-w-xl">
          We synthesize an adaptive, DAG-sequenced roadmap based on the delta between what your target role requires and what you already know.
        </p>

        {/* Stepper Indicator */}
        <div className="flex items-center gap-3 mt-4">
          <div
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
              step === 1
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/10"
                : "bg-zinc-900 text-zinc-400 border-zinc-800"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[11px]">1</span>
            <span>Goal & Budget</span>
          </div>
          <div className="w-6 h-[1px] bg-zinc-800" />
          <div
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
              step === 2
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/10"
                : "bg-zinc-900 text-zinc-400 border-zinc-800"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[11px]">2</span>
            <span>Resume & GitHub</span>
          </div>
          <div className="w-6 h-[1px] bg-zinc-800" />
          <div
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
              step === 3
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/10"
                : "bg-zinc-900 text-zinc-400 border-zinc-800"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[11px]">3</span>
            <span>Skill Delta Matrix</span>
          </div>
        </div>
      </div>

      {/* Main Wizard Container */}
      <div className="w-full max-w-3xl rounded-3xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
        {/* STEP 1: Basic Info & AI Goal Analysis */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Learner Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full mt-1.5 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-400" />
                  What is your learning goal? (Describe in natural language)
                </label>
              </div>
              <textarea
                rows={3}
                value={goalPrompt}
                onChange={(e) => setGoalPrompt(e.target.value)}
                placeholder="e.g. I am a frontend developer wanting to break into AI Engineering in 12 weeks with 10 hours a week..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 resize-none"
              />

              {/* Quick Goal Presets */}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-[11px] text-zinc-500 py-1">Quick Presets:</span>
                {QUICK_GOAL_PRESETS.map((preset) => (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => {
                      setGoalPrompt(preset.prompt);
                      setExtractedRole(preset.roleId);
                    }}
                    className="text-[11px] font-medium text-zinc-300 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Budget Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/60">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    Weekly Hours Budget
                  </span>
                  <strong className="text-emerald-400 font-mono font-bold">{weeklyHours} hrs/wk</strong>
                </div>
                <input
                  type="range"
                  min="4"
                  max="35"
                  step="1"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg cursor-pointer accent-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-cyan-400" />
                    Target Timeline
                  </span>
                  <strong className="text-cyan-400 font-mono font-bold">{totalWeeks} Weeks</strong>
                </div>
                <input
                  type="range"
                  min="4"
                  max="24"
                  step="2"
                  value={totalWeeks}
                  onChange={(e) => setTotalWeeks(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg cursor-pointer accent-cyan-500"
                />
              </div>
            </div>

            {/* Navigation Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={async () => {
                  await handleAnalyzeGoal();
                  setStep(2);
                }}
                disabled={isAnalyzingGoal || !goalPrompt.trim()}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
              >
                {isAnalyzingGoal ? (
                  <>
                    <SpinnerGap className="w-4 h-4 animate-spin" />
                    <span>Analyzing Goal with AI...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Multi-Modal Ingestion</span>
                    <ArrowRight className="w-4 h-4" weight="bold" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Resume & GitHub Ingestion */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                <Lightning className="w-5 h-5 text-emerald-400" weight="fill" />
                Multi-Modal Knowledge Ingestion
              </h3>
              <p className="text-xs text-zinc-400">
                Upload your resume or connect GitHub so the AI can detect past verified experience and skip redundant topics.
              </p>
            </div>

            {/* Resume Upload */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                1. Upload Resume PDF (Optional)
              </label>
              <ResumeDropzone onParsed={handleResumeParsed} />
            </div>

            {/* GitHub Profile */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <GithubLogo className="w-4 h-4 text-cyan-400" />
                2. Connect GitHub Profile (Optional)
              </label>
              <GitHubTelemetryCard onSynced={handleGitHubSynced} />
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <span>Review & Calibrate Skills ({skills.length} Detected)</span>
                <ArrowRight className="w-4 h-4" weight="bold" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Skill Confirmation & Path Generation */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-400" />
                Confirm Your Ground-Truth Skill Proficiency
              </h3>
              <p className="text-xs text-zinc-400">
                Verify the detected baseline skills. The recommendation engine uses these exact percentages to calculate your learning delta.
              </p>
            </div>

            {/* Target Role Selector */}
            <div className="flex flex-col gap-1.5 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/10">
              <label className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                Target Engineering Role
              </label>
              <select
                value={extractedRole}
                onChange={(e) => setExtractedRole(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 font-medium focus:outline-none focus:border-emerald-500/50 cursor-pointer"
              >
                {PRESEEDED_CAREER_ROLES.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.icon} {role.title} ({role.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Interactive Skill Sliders */}
            <SkillSliderMatrix skills={skills} onChange={setSkills} />

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={isGeneratingPath || skills.length === 0}
                onClick={handleGeneratePath}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:opacity-90 text-zinc-950 font-bold text-sm flex items-center gap-2.5 transition-all shadow-xl shadow-emerald-500/25 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingPath ? (
                  <>
                    <SpinnerGap className="w-5 h-5 animate-spin" />
                    <span>Synthesizing Kahn's Topological DAG...</span>
                  </>
                ) : (
                  <>
                    <RocketLaunch className="w-5 h-5" weight="fill" />
                    <span>Generate My Personalized Dynamic Roadmap</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
