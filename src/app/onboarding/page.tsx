"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Check,
  FileText,
  Sliders,
  Clock,
  Target,
  Rocket,
  Loader2,
  Zap,
} from "lucide-react";
import { LearnerProfile, ProjectEntry, SkillEntry } from "@/types";
import { PRESEEDED_CAREER_ROLES } from "@/lib/data/roleTaxonomy";
import { ResumeDropzone } from "@/components/onboarding/ResumeDropzone";
import { GitHubTelemetryCard } from "@/components/onboarding/GitHubTelemetryCard";
import { SkillSliderMatrix } from "@/components/onboarding/SkillSliderMatrix";
import { mockStore, generateLearningPathFromProfile } from "@/lib/services/mockStore";

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
    title: "FAANG System Design & Backend",
    roleId: "system-design-backend",
    prompt: "Master distributed systems, microservices, Kafka event pipelines, and scalable database sharding.",
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
      const res = await fetch("/api/ai/analyze-goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: goalPrompt }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.matchedRoleId) setExtractedRole(data.matchedRoleId);
        if (data.targetSkills) setExtractedTech(data.targetSkills);
        if (data.recommendedWeeklyHours) setWeeklyHours(data.recommendedWeeklyHours);
        if (data.recommendedTotalWeeks) setTotalWeeks(data.recommendedTotalWeeks);
      }
    } catch (e) {
      console.error("AI goal analysis error:", e);
    } finally {
      setIsAnalyzingGoal(false);
    }
  };

  // Resume Ingestion Handler
  const handleResumeParsed = (data: { skills: SkillEntry[]; certifications: string[]; projects: ProjectEntry[] }) => {
    if (data.skills && data.skills.length > 0) {
      mergeSkills(data.skills);
    }
    if (data.certifications) setCertifications((prev) => Array.from(new Set([...prev, ...data.certifications])));
    if (data.projects) setProjects((prev) => [...prev, ...data.projects]);
  };

  // GitHub Telemetry Handler
  const handleGithubSynced = (data: { telemetry: any; skills: SkillEntry[] }) => {
    setGithubTelemetry(data.telemetry);
    if (data.skills && data.skills.length > 0) {
      mergeSkills(data.skills);
    }
  };

  const mergeSkills = (incoming: SkillEntry[]) => {
    const map = new Map<string, SkillEntry>();
    skills.forEach((s) => map.set(s.name.toLowerCase(), s));

    const merged = [...skills];
    for (const newSkill of incoming) {
      const key = newSkill.name.toLowerCase();
      const existingIdx = merged.findIndex((s) => s.name.toLowerCase() === key);
      if (existingIdx !== -1) {
        merged[existingIdx] = {
          ...merged[existingIdx],
          currentProficiency: Math.max(merged[existingIdx].currentProficiency, newSkill.currentProficiency),
          source: newSkill.source,
          evidence: newSkill.evidence,
        };
      } else {
        merged.push(newSkill);
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
      currentStreak: 5,
      darkMode: true,
    };

    mockStore.saveProfile(profile);
    const newPath = generateLearningPathFromProfile(profile);
    mockStore.saveLearningPath(newPath);

    setTimeout(() => {
      setIsGeneratingPath(false);
      router.push("/roadmap");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-paper text-text-primary flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-focus/30 selection:text-focus">
      {/* Header Badge */}
      <div className="w-full max-w-3xl flex flex-col items-center text-center gap-2 mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-focus/10 text-focus border border-focus/20 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>LearnPath AI • Autonomous Career Architect</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          Personalized Learning Path Onboarding
        </h1>
        <p className="text-sm text-text-secondary max-w-xl">
          Synthesize an adaptive, DAG-sequenced roadmap based on the delta between what your target role requires and what you already know.
        </p>

        {/* Stepper Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 mt-4">
          {/* Step 1 */}
          <div
            className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all ${
              step === 1
                ? "bg-focus text-white border-focus shadow-lg shadow-focus/25"
                : step > 1
                ? "bg-surface text-signal border-signal/30 shadow-sm"
                : "bg-surface text-text-secondary border-border"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step === 1
                  ? "bg-white/20 text-white"
                  : step > 1
                  ? "bg-signal/15 text-signal"
                  : "bg-paper text-text-secondary"
              }`}
            >
              {step > 1 ? <Check className="w-3 h-3" /> : "1"}
            </span>
            <span>Goal & Budget</span>
          </div>

          <div className="w-6 sm:w-8 h-[1px] bg-border" />

          {/* Step 2 */}
          <div
            className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all ${
              step === 2
                ? "bg-focus text-white border-focus shadow-lg shadow-focus/25"
                : step > 2
                ? "bg-surface text-signal border-signal/30 shadow-sm"
                : "bg-surface text-text-secondary border-border"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step === 2
                  ? "bg-white/20 text-white"
                  : step > 2
                  ? "bg-signal/15 text-signal"
                  : "bg-paper text-text-secondary"
              }`}
            >
              {step > 2 ? <Check className="w-3 h-3" /> : "2"}
            </span>
            <span>Resume & GitHub</span>
          </div>

          <div className="w-6 sm:w-8 h-[1px] bg-border" />

          {/* Step 3 */}
          <div
            className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all ${
              step === 3
                ? "bg-focus text-white border-focus shadow-lg shadow-focus/25"
                : "bg-surface text-text-secondary border-border"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step === 3
                  ? "bg-white/20 text-white"
                  : "bg-paper text-text-secondary"
              }`}
            >
              3
            </span>
            <span>Skill Delta Matrix</span>
          </div>
        </div>
      </div>

      {/* Main Wizard Container */}
      <div className="w-full max-w-3xl rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-xl">
        {/* STEP 1: Basic Info & AI Goal Analysis */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Learner Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full mt-1.5 bg-paper border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-focus/50 shadow-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Target Goal or Career Transition Prompt
                </label>
                <button
                  type="button"
                  onClick={handleAnalyzeGoal}
                  disabled={isAnalyzingGoal || !goalPrompt.trim()}
                  className="text-xs font-semibold text-focus hover:underline flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isAnalyzingGoal ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>AI Semantic Role Extraction</span>
                </button>
              </div>

              <textarea
                rows={3}
                value={goalPrompt}
                onChange={(e) => setGoalPrompt(e.target.value)}
                placeholder="e.g. I want to transition into an AI Engineer role specializing in RAG architectures..."
                className="w-full mt-1.5 bg-paper border border-border rounded-xl p-3.5 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-focus/50 resize-none leading-relaxed shadow-sm"
              />

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-2 mt-2.5">
                <span className="text-[11px] text-text-secondary py-1 font-medium">Quick Presets:</span>
                {QUICK_GOAL_PRESETS.map((preset) => (
                  <button
                    key={preset.roleId}
                    type="button"
                    onClick={() => {
                      setGoalPrompt(preset.prompt);
                      setExtractedRole(preset.roleId);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs bg-paper hover:bg-surface border border-border text-text-secondary hover:text-text-primary transition-colors cursor-pointer shadow-sm"
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Extracted Role Feedback Box */}
            <div className="p-4 rounded-2xl border border-focus/20 bg-focus/5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-focus flex items-center gap-1.5">
                  <Target className="w-4 h-4" />
                  Target Role Curriculum Identified:
                </span>
                <span className="text-xs font-bold text-text-primary bg-surface px-2.5 py-1 rounded-lg border border-border shadow-sm">
                  {PRESEEDED_CAREER_ROLES.find((r) => r.id === extractedRole)?.title || "Data Analyst"}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {extractedTech.map((t) => (
                  <span key={t} className="px-2.5 py-0.5 rounded-md text-[11px] bg-surface text-text-primary border border-border font-medium shadow-sm">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Time & Pacing Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl border border-border bg-paper flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-text-secondary flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-focus" />
                    Weekly Study Budget
                  </span>
                  <span className="font-mono text-focus font-bold text-sm">{weeklyHours} hrs/week</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={40}
                  step={2}
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="accent-focus w-full cursor-pointer mt-1"
                />
                <span className="text-[10px] text-text-secondary">Paces node density and daily workload.</span>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-paper flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-text-secondary flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-warning" />
                    Target Timeline
                  </span>
                  <span className="font-mono text-warning font-bold text-sm">{totalWeeks} Weeks</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={24}
                  step={2}
                  value={totalWeeks}
                  onChange={(e) => setTotalWeeks(Number(e.target.value))}
                  className="accent-warning w-full cursor-pointer mt-1"
                />
                <span className="text-[10px] text-text-secondary">Calibrates total weeks for the S-curve DAG.</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-end pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-2xl bg-focus hover:bg-focus/90 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-focus/25 cursor-pointer"
              >
                <span>Next: Ingest Multi-Modal Telemetry</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Resume PDF & GitHub Telemetry Ingestion */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <FileText className="w-5 h-5 text-focus" />
                Ingest Verified Background & Ground-Truth Skills
              </h3>
              <p className="text-xs text-text-secondary">
                Upload your resume PDF and enter your GitHub username. We filter out forked repositories and analyze original commit history.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResumeDropzone onParsed={handleResumeParsed} />
              <GitHubTelemetryCard onSynced={handleGithubSynced} />
            </div>

            {/* Currently Detected Skills Summary */}
            <div className="p-4 rounded-2xl border border-border bg-paper space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-secondary">
                  Detected Baseline Ground-Truth Skills ({skills.length}):
                </span>
                <span className="text-[11px] font-mono text-focus font-bold">
                  {skills.filter((s) => s.currentProficiency >= 75).length} Mastered (Will Be Skipped)
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span
                    key={s.name}
                    className="px-2.5 py-1 rounded-lg text-xs bg-surface border border-border flex items-center gap-1.5 text-text-primary shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-signal" />
                    <span>{s.name}</span>
                    <span className="font-mono text-[10px] text-text-secondary">({s.currentProficiency}%)</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl bg-paper hover:bg-surface border border-border text-text-secondary text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-2xl bg-focus hover:bg-focus/90 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-focus/25 cursor-pointer"
              >
                <span>Review & Calibrate Skills ({skills.length} Detected)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Skill Confirmation & Path Generation */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <Sliders className="w-5 h-5 text-focus" />
                Confirm Your Ground-Truth Skill Proficiency
              </h3>
              <p className="text-xs text-text-secondary">
                Verify the detected baseline skills. The recommendation engine uses these exact percentages to calculate your learning delta.
              </p>
            </div>

            {/* Target Role Selector */}
            <div className="flex flex-col gap-1.5 p-4 rounded-2xl border border-focus/20 bg-focus/5">
              <label className="text-xs font-semibold text-focus uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                Target Engineering Role
              </label>
              <select
                value={extractedRole}
                onChange={(e) => setExtractedRole(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary font-medium focus:outline-none focus:border-focus/50 cursor-pointer shadow-sm"
              >
                {PRESEEDED_CAREER_ROLES.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.title} ({role.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Interactive Skill Sliders */}
            <SkillSliderMatrix skills={skills} onChange={setSkills} />

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl bg-paper hover:bg-surface border border-border text-text-secondary text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={isGeneratingPath || skills.length === 0}
                onClick={handleGeneratePath}
                className="px-8 py-3.5 rounded-2xl bg-focus hover:bg-focus/90 text-white font-bold text-sm flex items-center gap-2.5 transition-all shadow-xl shadow-focus/30 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingPath ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Synthesizing Kahn&apos;s Topological DAG...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5" />
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
