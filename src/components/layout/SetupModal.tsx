"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkle,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  FileText,
  GithubLogo,
  SpinnerGap,
  RocketLaunch,
  Sliders,
  Target,
  Clock,
  Key,
} from "@phosphor-icons/react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { PRESEEDED_CAREER_ROLES } from "@/lib/data/roleTaxonomy";
import { ResumeDropzone } from "@/components/onboarding/ResumeDropzone";
import { GitHubTelemetryCard } from "@/components/onboarding/GitHubTelemetryCard";
import { SkillSliderMatrix } from "@/components/onboarding/SkillSliderMatrix";
import { mockStore, generateLearningPathFromProfile } from "@/lib/services/mockStore";
import { GitHubTelemetry, LearnerProfile, ProjectEntry, SkillEntry } from "@/types";

export function SetupModal() {
  const { profile, updateProfile, user } = useSupabase();

  // If user is not loaded or has already completed setup, do not render
  if (!profile || profile.hasCompletedSetup || !user) {
    return null;
  }

  return <UnifiedOnboardingModalContent profile={profile} updateProfile={updateProfile} user={user} />;
}

function UnifiedOnboardingModalContent({
  profile,
  updateProfile,
  user,
}: {
  profile: any;
  updateProfile: any;
  user: any;
}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1 State
  const [name, setName] = useState(profile?.name || "Alex Dev");
  const [goalPrompt, setGoalPrompt] = useState(
    "Transition from Junior Developer to Senior Data Analyst with strong Power BI and SQL expertise in 10 weeks."
  );
  const [targetRoleId, setTargetRoleId] = useState("data-analyst");
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [groqApiKey, setGroqApiKey] = useState(profile?.groqApiKey || "");
  const [mobileNo, setMobileNo] = useState(profile?.mobileNo || "");

  // Step 2 State (AI Extraction)
  const [isAnalyzingGoal, setIsAnalyzingGoal] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState<{
    targetRoleTitle: string;
    identifiedSkills: string[];
    reasoning: string;
  } | null>(null);

  // Step 3 State (Resume & GitHub)
  const [resumeSkills, setResumeSkills] = useState<SkillEntry[]>([]);
  const [githubTelemetry, setGithubTelemetry] = useState<GitHubTelemetry | null>(null);
  const [githubSkills, setGithubSkills] = useState<SkillEntry[]>([]);

  // Step 4 State (Skill Matrix)
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [isGeneratingPath, setIsGeneratingPath] = useState(false);

  // Prefill profile data if available
  useEffect(() => {
    if (profile?.name) setName(profile.name);
    if (profile?.groqApiKey) setGroqApiKey(profile.groqApiKey);
    if (profile?.mobileNo) setMobileNo(profile.mobileNo);
  }, [profile]);

  // Handle Step 1 -> Step 2
  const handleAnalyzeGoal = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim() || !goalPrompt.trim()) return;

    setIsAnalyzingGoal(true);
    try {
      const res = await fetch("/api/ai/goal-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalPrompt, weeklyHoursBudget: weeklyHours, apiKey: groqApiKey }),
      });

      const data = await res.json();
      setExtractedInfo({
        targetRoleTitle: data.targetRoleTitle || "Data Analyst & BI Specialist",
        identifiedSkills: data.identifiedSkills || ["SQL", "Power BI & DAX", "Python", "Data Modeling"],
        reasoning: data.reasoning || "Optimized 10-week path bridging SQL, DAX, and Modeling.",
      });

      if (data.targetRoleId) setTargetRoleId(data.targetRoleId);
      setCurrentStep(2);
    } catch {
      setExtractedInfo({
        targetRoleTitle: "Data Analyst & Business Intelligence Specialist",
        identifiedSkills: ["SQL", "Power BI & DAX", "Python for Data Analysis", "Pandas", "Star Schema"],
        reasoning: "Extracted focus on SQL, DAX measures, and dashboard engineering.",
      });
      setCurrentStep(2);
    } finally {
      setIsAnalyzingGoal(false);
    }
  };

  // Handle Resume Parsed
  const handleResumeParsed = (data: { skills: SkillEntry[]; certifications: string[]; projects: ProjectEntry[] }) => {
    setResumeSkills(data.skills || []);
  };

  // Handle GitHub Synced
  const handleGithubSynced = (data: { telemetry: GitHubTelemetry; skills: SkillEntry[] }) => {
    setGithubTelemetry(data.telemetry);
    setGithubSkills(data.skills || []);
  };

  // Build Skill Baseline Matrix for Step 4
  const handleProceedToMatrix = () => {
    const selectedRole = PRESEEDED_CAREER_ROLES.find((r) => r.id === targetRoleId) || PRESEEDED_CAREER_ROLES[0];
    const initialSkills: SkillEntry[] = selectedRole.skills.map((req) => {
      const resumeMatch = resumeSkills.find((s) => s.name.toLowerCase() === req.skillName.toLowerCase());
      const githubMatch = githubSkills.find((s) => s.name.toLowerCase() === req.skillName.toLowerCase());

      let currentProficiency = 15;
      let source: SkillEntry["source"] = "inferred";
      let evidence = "Baseline prerequisite assumption";

      if (resumeMatch && githubMatch) {
        currentProficiency = Math.max(resumeMatch.currentProficiency, githubMatch.currentProficiency, 60);
        source = "resume";
        evidence = "Verified in Resume & GitHub commits";
      } else if (resumeMatch) {
        currentProficiency = resumeMatch.currentProficiency || (req.skillName.includes("Excel") ? 80 : 45);
        source = "resume";
        evidence = resumeMatch.evidence || "Stated in uploaded resume";
      } else if (githubMatch) {
        currentProficiency = githubMatch.currentProficiency || 55;
        source = "github";
        evidence = githubMatch.evidence || "Demonstrated in original GitHub repos";
      }

      return {
        name: req.skillName,
        source,
        currentProficiency,
        evidence,
      };
    });

    setSkills(initialSkills);
    setCurrentStep(4);
  };

  // Step 4 -> Finish: Generate Path and Save Profile
  const handleGenerateFinalPath = async () => {
    setIsGeneratingPath(true);
    const selectedRole = PRESEEDED_CAREER_ROLES.find((r) => r.id === targetRoleId) || PRESEEDED_CAREER_ROLES[0];

    const finalProfile: LearnerProfile = {
      name,
      email: user?.email || profile?.email || "alex@example.com",
      goalPrompt,
      targetRoleId,
      targetRoleTitle: selectedRole.title,
      weeklyHoursBudget: weeklyHours,
      totalWeeksBudget: 10,
      skills,
      certifications: ["Data Analytics Certified"],
      pastProjects: [],
      githubStats: githubTelemetry || undefined,
      hasCompletedOnboarding: true,
      groqApiKey,
      currentStreak: 5,
      darkMode: true,
    };

    // Save to local mock store
    mockStore.saveProfile(finalProfile);
    const newPath = generateLearningPathFromProfile(finalProfile);
    mockStore.saveLearningPath(newPath);

    // Save to Supabase
    try {
      await updateProfile({
        name,
        dob: profile?.dob || "2000-01-01",
        mobileNo: mobileNo || "9876543210",
        groqApiKey,
        hasCompletedSetup: true,
      });
    } catch (e) {
      console.warn("Supabase update skipped in local mode:", e);
    }

    setTimeout(() => {
      setIsGeneratingPath(false);
      router.push("/roadmap");
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-zinc-950 font-bold shadow-md shadow-emerald-500/20">
              <Sparkle className="w-4 h-4" weight="fill" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                LearnPath AI 2.0 • Autonomous Onboarding
              </h2>
              <span className="text-[11px] text-zinc-400">Step {currentStep} of 4</span>
            </div>
          </div>

          {/* Stepper Progress Badges */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  step === currentStep
                    ? "w-7 bg-emerald-500"
                    : step < currentStep
                    ? "bg-emerald-500/60"
                    : "bg-zinc-800"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Modal Content Scroll Body */}
        <div className="flex-1 p-6 overflow-y-auto max-h-[calc(92vh-140px)]">
          {/* STEP 1: Basic Profile & Goal Ingestion */}
          {currentStep === 1 && (
            <form onSubmit={handleAnalyzeGoal} className="flex flex-col gap-5 max-w-2xl mx-auto">
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-zinc-100">Welcome! Let&apos;s Build Your Learning Path</h3>
                <p className="text-xs text-zinc-400">
                  Tell us your career goal, weekly time budget, and baseline details.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Kumar"
                    className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Target Career Role</label>
                  <select
                    value={targetRoleId}
                    onChange={(e) => setTargetRoleId(e.target.value)}
                    className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500/50"
                  >
                    {PRESEEDED_CAREER_ROLES.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                  <span>Describe Your Career Goal or Transition</span>
                  <span className="text-[10px] text-zinc-500">AI will analyze required skills</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={goalPrompt}
                  onChange={(e) => setGoalPrompt(e.target.value)}
                  placeholder="e.g. I want to transition from Junior Developer to Senior Data Analyst in 10 weeks..."
                  className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500/50 resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                    <span>Weekly Study Budget</span>
                    <span className="font-mono text-emerald-400 text-xs font-bold">{weeklyHours}h / week</span>
                  </label>
                  <input
                    type="range"
                    min={4}
                    max={40}
                    step={2}
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(Number(e.target.value))}
                    className="accent-emerald-500 w-full cursor-pointer mt-2"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>Groq API Key (Optional)</span>
                  </label>
                  <input
                    type="password"
                    value={groqApiKey}
                    onChange={(e) => setGroqApiKey(e.target.value)}
                    placeholder="gsk_... (leave empty for mock mode)"
                    className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500/50 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isAnalyzingGoal}
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  {isAnalyzingGoal ? (
                    <>
                      <SpinnerGap className="w-4 h-4 animate-spin" />
                      <span>AI Analyzing Goal...</span>
                    </>
                  ) : (
                    <>
                      <span>Next: AI Goal Analysis</span>
                      <ArrowRight className="w-4 h-4" weight="bold" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: AI Goal Analysis Confirmation */}
          {currentStep === 2 && extractedInfo && (
            <div className="flex flex-col gap-5 max-w-2xl mx-auto">
              <div className="text-center space-y-1">
                <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-bold">
                  AI Goal Extraction Complete
                </span>
                <h3 className="text-xl font-bold text-zinc-100">{extractedInfo.targetRoleTitle}</h3>
                <p className="text-xs text-zinc-400">{extractedInfo.reasoning}</p>
              </div>

              <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 space-y-2">
                <span className="text-xs font-bold text-emerald-400">Identified Key Competencies:</span>
                <div className="flex flex-wrap gap-2">
                  {extractedInfo.identifiedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-200"
                    >
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <span>Next: Ingest Resume & GitHub</span>
                  <ArrowRight className="w-4 h-4" weight="bold" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Multi-Modal Ingestion (Resume & GitHub) */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-6 max-w-3xl mx-auto">
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-zinc-100">Multi-Modal Baseline Ingestion</h3>
                <p className="text-xs text-zinc-400">
                  Upload your Resume PDF and enter your GitHub profile to calibrate your demonstrated baseline.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Resume Dropzone */}
                <ResumeDropzone onParsed={handleResumeParsed} apiKey={groqApiKey} />

                {/* GitHub Telemetry Card */}
                <GitHubTelemetryCard onSynced={handleGithubSynced} />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleProceedToMatrix}
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <span>Next: Review Skill Matrix</span>
                  <ArrowRight className="w-4 h-4" weight="bold" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Interactive Skill Matrix (0% - 100%) */}
          {currentStep === 4 && (
            <div className="flex flex-col gap-6 max-w-3xl mx-auto">
              <div className="text-center space-y-1">
                <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-bold">
                  Final Calibration
                </span>
                <h3 className="text-xl font-bold text-zinc-100">Review Your Skill Proficiency Matrix</h3>
                <p className="text-xs text-zinc-400">
                  Fine-tune your verified baseline. Topics at &gt;75% will be skipped, while gaps will generate your Candy Crush DAG.
                </p>
              </div>

              <SkillSliderMatrix
                skills={skills}
                onChange={(updated) => setSkills(updated)}
              />

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  disabled={isGeneratingPath}
                  onClick={handleGenerateFinalPath}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-90 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-2.5 shadow-xl shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  {isGeneratingPath ? (
                    <>
                      <SpinnerGap className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Candy Crush DAG...</span>
                    </>
                  ) : (
                    <>
                      <RocketLaunch className="w-4 h-4" weight="fill" />
                      <span>Generate My Personalized Learning Path</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
