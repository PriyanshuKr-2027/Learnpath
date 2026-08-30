"use client";

import React, { useState, useEffect } from "react";
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
import { LearnerProfile, LearningPath, ProjectEntry, SkillEntry } from "@/types";

import { PRESEEDED_CAREER_ROLES } from "@/lib/data/roleTaxonomy";
import { ResumeDropzone } from "@/components/onboarding/ResumeDropzone";
import { GitHubTelemetryCard } from "@/components/onboarding/GitHubTelemetryCard";
import { SkillSliderMatrix } from "@/components/onboarding/SkillSliderMatrix";
import { mockStore, generateLearningPathFromProfile } from "@/lib/services/mockStore";

const QUICK_GOAL_PRESETS = [
  {
    title: "Cybersecurity & Pentesting",
    roleId: "cybersecurity-engineer",
    prompt: "I want to master Cybersecurity, network protocols, Wireshark, Linux hardening, and web penetration testing in 10 weeks.",
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
  {
    title: "Data Analyst (Power BI & SQL)",
    roleId: "data-analyst",
    prompt: "I want to transition into a Data Analyst role mastering SQL, Power BI DAX, and Data Modeling in 10 weeks with 10 hrs/week.",
  },
];


import { useSupabase } from "@/components/providers/SupabaseProvider";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile: authProfile, updateProfile } = useSupabase();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 State
  const [name, setName] = useState(authProfile?.name || user?.user_metadata?.name || "");
  const [goalPrompt, setGoalPrompt] = useState("");
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [totalWeeks, setTotalWeeks] = useState(10);
  const [isAnalyzingGoal, setIsAnalyzingGoal] = useState(false);
  const [extractedRole, setExtractedRole] = useState<string>("data-analyst");
  const [extractedRoleTitle, setExtractedRoleTitle] = useState<string>("Data Analyst & Business Intelligence Specialist");
  const [extractedTech, setExtractedTech] = useState<string[]>(["SQL", "Power BI", "Python", "Data Modeling"]);

  // Step 2 State - initialized from role taxonomy
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  const [githubTelemetry, setGithubTelemetry] = useState<any>(null);

  // Step 3 State
  const [isGeneratingPath, setIsGeneratingPath] = useState(false);
  const [generationStepText, setGenerationStepText] = useState("Initializing path synthesis...");
  const [generationProgress, setGenerationProgress] = useState(0);

  // Auto-analyze Goal with AI
  const executeGoalAnalysis = async (promptText: string) => {
    if (!promptText.trim()) return;
    setIsAnalyzingGoal(true);

    try {
      const res = await fetch("/api/ai/goal-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText, goalPrompt: promptText, name }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.targetRoleId) {
          setExtractedRole(data.targetRoleId);
        }
        if (data.targetRoleTitle) {
          setExtractedRoleTitle(data.targetRoleTitle);
        }
        if (data.extractedSkills?.length) {
          setExtractedTech(data.relevantTech || data.extractedSkills.slice(0, 4));
          // Update default skills to match this newly extracted role
          setSkills(
            data.extractedSkills.map((s: string) => ({
              name: s,
              source: "inferred",
              currentProficiency: 20,
              evidence: "Target curriculum requirement",
            }))
          );
        }
        if (data.timeframeWeeks) setTotalWeeks(data.timeframeWeeks);
        if (data.weeklyHoursBudget) setWeeklyHours(data.weeklyHoursBudget);
      }
    } catch (e) {
      console.error("AI goal analysis error:", e);
    } finally {
      setIsAnalyzingGoal(false);
    }
  };

  // Debounced auto-analysis when typing goal
  useEffect(() => {
    if (!goalPrompt.trim() || goalPrompt.length < 5) return;
    const timeout = setTimeout(() => {
      executeGoalAnalysis(goalPrompt);
    }, 600);
    return () => clearTimeout(timeout);
  }, [goalPrompt]);

  // When target role is manually selected
  const handleRoleChange = (roleId: string) => {
    setExtractedRole(roleId);
    const role = PRESEEDED_CAREER_ROLES.find((r) => r.id === roleId);
    if (role) {
      setExtractedRoleTitle(role.title);
      setExtractedTech(role.skills.slice(0, 4).map((s) => s.skillName));
      setSkills(
        role.skills.map((s) => ({
          name: s.skillName,
          source: "inferred",
          currentProficiency: 20,
          evidence: "Self-assessed baseline",
        }))
      );
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

  // Final Submission & Live Path Generation
  const handleGeneratePath = async () => {
    setIsGeneratingPath(true);
    setGenerationProgress(15);
    setGenerationStepText("  Analyzing Skill Gaps & Kahn's Topological Sort...");

    const selectedRole = PRESEEDED_CAREER_ROLES.find((r) => r.id === extractedRole);
    const roleTitle = selectedRole?.title || extractedRoleTitle || "Engineering Specialist";
    const learnerName = name.trim() || authProfile?.name || "Learner";
    const learnerEmail = user?.email || authProfile?.email || "";

    const profile: LearnerProfile = {
      name: learnerName,
      email: learnerEmail,
      goalPrompt: goalPrompt.trim() || `Master ${roleTitle} in ${totalWeeks} weeks`,
      targetRoleId: extractedRole,
      targetRoleTitle: roleTitle,
      weeklyHoursBudget: weeklyHours,
      totalWeeksBudget: totalWeeks,
      skills: skills.length > 0 ? skills : (selectedRole?.skills.map((s) => ({
        name: s.skillName,
        source: "inferred",
        currentProficiency: 20,
        evidence: "Self-assessed baseline",
      })) || []),
      certifications,
      pastProjects: projects,
      githubStats: githubTelemetry,
      hasCompletedOnboarding: true,
      currentStreak: 0,
      darkMode: true,
    };

    try {
      mockStore.saveProfile(profile);

      setGenerationProgress(40);
      setGenerationStepText("   Executing Live YouTube Data API v3 Search for Active Video Lectures...");

      const synthRes = await fetch("/api/learner/synthesize-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });

      setGenerationProgress(75);
      setGenerationStepText("   Synthesizing Web Courses & Practice Labs across GFG, NPTEL, Coursera...");

      let newPath: LearningPath;
      if (synthRes.ok) {
        const synthData = await synthRes.json();
        newPath = synthData.path;
      } else {
        newPath = generateLearningPathFromProfile(profile);
      }

      mockStore.saveLearningPath(newPath);

      setGenerationProgress(90);
      setGenerationStepText("   Persisting Roadmap to Supabase & Initializing DAG Canvas...");

      // Save to Supabase backend API
      try {
        await fetch("/api/learner/path", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: newPath }),
        });
      } catch (saveErr) {
        console.warn("Supabase path save warning:", saveErr);
      }

      await updateProfile({
        name: learnerName,
        hasCompletedSetup: true,
      });

      setGenerationProgress(100);
      setGenerationStepText("  Roadmap Synthesis Complete! Launching Canvas...");

      setTimeout(() => {
        setIsGeneratingPath(false);
        router.push("/roadmap");
      }, 700);
    } catch (err) {
      console.error("Path generation error:", err);
      const fallbackPath = generateLearningPathFromProfile(profile);
      mockStore.saveLearningPath(fallbackPath);
      setIsGeneratingPath(false);
      router.push("/roadmap");
    }
  };



  return (
    <div className="min-h-screen bg-paper text-text-primary flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-focus/30 selection:text-focus">
      {/* Header Badge */}
      <div className="w-full max-w-3xl flex flex-col items-center text-center gap-2 mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-focus/10 text-focus border border-focus/20 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>LearnPath AI * Autonomous Career Architect</span>
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
                {isAnalyzingGoal && (
                  <span className="text-xs font-semibold text-focus flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>AI auto-identifying curriculum...</span>
                  </span>
                )}
              </div>

              <textarea
                rows={3}
                value={goalPrompt}
                onChange={(e) => setGoalPrompt(e.target.value)}
                placeholder="e.g. I want to master Cybersecurity in the next 10 weeks, or Become an AI Engineer..."
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
                      executeGoalAnalysis(preset.prompt);
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
                  {extractedRoleTitle || PRESEEDED_CAREER_ROLES.find((r) => r.id === extractedRole)?.title || "Custom Career Track"}
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
                <span className="text-[10px] text-text-secondary">Calibrates total duration of your roadmap.</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-end pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-2xl bg-focus hover:bg-focus/90 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-focus/25 cursor-pointer"
              >
                <span>Next: Ingest Verified Background</span>
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
        {step === 3 && (() => {
          const masteredSkills = skills.filter((s) => s.currentProficiency >= 75);
          const savedHours = masteredSkills.length * 8;
          const savedWeeks = Math.max(1, Math.ceil(savedHours / (weeklyHours || 10)));

          return (
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

              {/* Real-Time Live Path Delta Savings Preview */}
              <div className="p-4 rounded-2xl border border-signal/30 bg-signal/5 flex items-center justify-between flex-wrap gap-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-signal/15 border border-signal/30 text-signal flex items-center justify-center font-bold">
                     
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-text-primary">
                      {masteredSkills.length > 0
                        ? `  ~${savedWeeks} Weeks Saved * ${masteredSkills.length} Foundational Modules Bypassed`
                        : "Full Comprehensive Roadmap (0 Bypassed)"}
                    </h4>
                    <p className="text-[11px] text-text-secondary">
                      {masteredSkills.length > 0
                        ? `Your verified proficiency in ${masteredSkills.map((m) => m.name).slice(0, 3).join(", ")}${masteredSkills.length > 3 ? "..." : ""} skips redundant beginner lessons.`
                        : "Slide any mastered skills to 75%+ to automatically skip foundational lessons."}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-signal px-2.5 py-1 rounded-lg bg-surface border border-border">
                  {masteredSkills.length}/{skills.length} Mastered
                </span>
              </div>

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
                      <span>Generating your personalized step-by-step roadmap...</span>
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
          );
        })()}
      </div>

      {/* Live AI Path Generation Fullscreen Overlay */}
      {isGeneratingPath && (
        <div className="fixed inset-0 bg-paper/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
          <div className="max-w-lg w-full bg-surface border border-border rounded-3xl p-8 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-focus/10 border border-focus/20 text-focus mx-auto flex items-center justify-center shadow-inner">
              <Rocket className="w-8 h-8 animate-bounce text-focus" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-text-primary tracking-tight">
                Synthesizing Your Dynamic DAG Roadmap
              </h3>
              <p className="text-xs text-text-secondary font-medium px-4 min-h-[32px] flex items-center justify-center">
                {generationStepText}
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-paper rounded-full h-3 overflow-hidden border border-border">
                <div
                  className="bg-focus h-full transition-all duration-500 rounded-full shadow-sm"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-text-secondary font-mono">
                <span>Live YouTube Data API & Grounded Web Search</span>
                <span className="font-bold text-focus">{generationProgress}%</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-paper border border-border text-left space-y-1.5">
              <div className="text-[11px] font-semibold text-text-primary flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-focus" />
                <span>Active Synthesis Pipelines:</span>
              </div>
              <ul className="text-[10px] text-text-secondary space-y-1 pl-5 list-disc">
                <li>Topological dependency resolution (Kahn&apos;s algorithm)</li>
                <li>Live YouTube video ID verification &amp; high-yield timestamp pruning</li>
                <li>Course recommendations from GeeksforGeeks, NPTEL, Swayam, Coursera</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

