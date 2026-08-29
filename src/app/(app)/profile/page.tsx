"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Envelope,
  CalendarBlank,
  Phone,
  Target,
  Clock,
  GithubLogo,
  Sparkle,
  CheckCircle,
  Trash,
  Warning,
  ArrowRight,
  Shield,
  Gear,
  SignOut,
  Trophy,
  Check,
} from "@phosphor-icons/react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { PRESEEDED_CAREER_ROLES } from "@/lib/data/roleTaxonomy";
import { mockStore } from "@/lib/services/mockStore";
import { LearnerProfile } from "@/types";

export default function ProfilePage() {
  const { profile: supabaseProfile, updateProfile, user, signOut } = useSupabase();

  // Personal information
  const [name, setName] = useState(() => mockStore.getProfile()?.name || "Alex Dev");
  const [email, setEmail] = useState(() => mockStore.getProfile()?.email || user?.email || "alex@example.com");
  const [dob, setDob] = useState(() => supabaseProfile?.dob || "2000-01-01");
  const [mobileNo, setMobileNo] = useState(() => supabaseProfile?.mobileNo || "9876543210");

  // Career & Learning Recommender fields
  const [targetRoleId, setTargetRoleId] = useState(() => mockStore.getProfile()?.targetRoleId || "data-analyst");
  const [weeklyHours, setWeeklyHours] = useState(() => mockStore.getProfile()?.weeklyHoursBudget || 10);
  const [githubUsername, setGithubUsername] = useState(() => mockStore.getProfile()?.githubStats?.username || "alex-dev");

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (supabaseProfile) {
      if (supabaseProfile.name) setName(supabaseProfile.name);
      if (supabaseProfile.email) setEmail(supabaseProfile.email);
      if (supabaseProfile.dob) setDob(supabaseProfile.dob);
      if (supabaseProfile.mobileNo) setMobileNo(supabaseProfile.mobileNo);
    } else if (user?.email) {
      setEmail((prev) => prev || user.email || "");
    }
  }, [supabaseProfile, user]);

  const selectedRole = PRESEEDED_CAREER_ROLES.find((r) => r.id === targetRoleId) || PRESEEDED_CAREER_ROLES[0];
  const learningPath = mockStore.getLearningPath();

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();

    try {
      await updateProfile({
        name,
        dob,
        mobileNo,
      });
    } catch (err) {
      console.warn("Supabase profile update warning:", err);
    }

    const existingProfile = mockStore.getProfile();
    const updatedLocal: LearnerProfile = {
      ...existingProfile,
      name,
      email,
      targetRoleId,
      weeklyHoursBudget: weeklyHours,
      githubStats: existingProfile.githubStats
        ? { ...existingProfile.githubStats, username: githubUsername }
        : {
            username: githubUsername,
            publicReposCount: 12,
            topLanguages: { Python: 60, SQL: 40 },
            detectedSkills: ["Python", "SQL", "Pandas"],
            recentRepos: [],
          },
    };
    mockStore.saveProfile(updatedLocal);

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetProgress = async () => {
    if (!confirm("Are you sure you want to reset all your roadmap progress? This will regenerate your learning path.")) {
      return;
    }

    const currentProf = mockStore.getProfile();
    const resetProf: LearnerProfile = {
      ...currentProf,
      hasCompletedOnboarding: false,
    };
    mockStore.saveProfile(resetProf);

    alert("Progress has been reset. Launching Onboarding Wizard...");
    window.location.href = "/onboarding";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 text-text-primary">
      {/* ── 1. Profile Hero Card ── */}
      <div className="p-6 sm:p-8 rounded-3xl border border-border bg-surface shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-focus/15 border-2 border-focus/30 flex items-center justify-center text-focus font-bold text-2xl shadow-xl shadow-focus/20">
              {name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "AD"}
            </div>
            <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-signal text-white ring-2 ring-surface">
              ACTIVE
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary">{name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-focus/10 text-focus border border-focus/20">
                {selectedRole.title}
              </span>
            </div>
            <p className="text-xs text-text-secondary font-mono flex items-center gap-1.5">
              <Envelope className="w-3.5 h-3.5" />
              <span>{email}</span>
            </p>
            <p className="text-[11px] text-text-secondary">
              Mastering Directed Acyclic Graph (DAG) Curriculum • {learningPath?.completionPercentage || 0}% Complete
            </p>
          </div>
        </div>

        <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
          <Link
            href="/settings"
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-paper hover:bg-border border border-border text-text-secondary hover:text-text-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <Gear className="w-4 h-4" />
            <span>App Preferences</span>
          </Link>
          <Link
            href="/roadmap"
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-focus hover:bg-focus/90 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-focus/25"
          >
            <span>View Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ── 2. Personal & Account Details ── */}
        <div className="p-6 sm:p-7 rounded-3xl border border-border bg-surface shadow-xl space-y-5">
          <div className="border-b border-border/70 pb-3">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <User className="w-4 h-4 text-focus" weight="bold" />
              <span>Personal & Contact Information</span>
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Your primary personal identifiers used for peer communication and account verification.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Dev"
                className="w-full p-3 rounded-xl bg-paper border border-border text-xs sm:text-sm text-text-primary focus:outline-none focus:border-focus/50 shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Email Address (Account ID)</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full p-3 rounded-xl bg-paper/50 border border-border text-xs sm:text-sm text-text-secondary cursor-not-allowed font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary flex items-center gap-1">
                <CalendarBlank className="w-3.5 h-3.5 text-text-secondary" />
                Date of Birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full p-3 rounded-xl bg-paper border border-border text-xs sm:text-sm text-text-primary focus:outline-none focus:border-focus/50 shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-text-secondary" />
                Mobile Number (Peer Audio/Video Verification)
              </label>
              <input
                type="tel"
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
                placeholder="e.g. +1 555 123 4567"
                className="w-full p-3 rounded-xl bg-paper border border-border text-xs sm:text-sm text-text-primary focus:outline-none focus:border-focus/50 shadow-sm font-mono"
              />
            </div>
          </div>
        </div>

        {/* ── 3. Career Path & Learning Commitment ── */}
        <div className="p-6 sm:p-7 rounded-3xl border border-border bg-surface shadow-xl space-y-5">
          <div className="border-b border-border/70 pb-3 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Target className="w-4 h-4 text-focus" weight="bold" />
                <span>Career Target & Weekly Learning Budget</span>
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                LearnPath AI personalizes your milestone topological sort based on your career targets and pace.
              </p>
            </div>

            <Link
              href="/onboarding"
              className="px-3 py-1.5 rounded-xl bg-focus/10 hover:bg-focus/20 text-focus border border-focus/30 text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <Sparkle className="w-3.5 h-3.5" />
              <span>Launch AI Onboarding</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Target Engineering Role</label>
              <select
                value={targetRoleId}
                onChange={(e) => setTargetRoleId(e.target.value)}
                className="w-full p-3 rounded-xl bg-paper border border-border text-xs sm:text-sm text-text-primary font-semibold focus:outline-none focus:border-focus/50 shadow-sm cursor-pointer"
              >
                {PRESEEDED_CAREER_ROLES.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.icon} {role.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-text-secondary flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-focus" />
                  Weekly Learning Commitment
                </span>
                <span className="font-mono text-focus font-bold">{weeklyHours} hours / week</span>
              </div>
              <input
                type="range"
                min={4}
                max={40}
                step={2}
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="w-full accent-focus cursor-pointer mt-3"
              />
              <span className="text-[10px] text-text-secondary block text-right font-mono">
                Estimated ~{Math.ceil(120 / (weeklyHours || 10))} weeks to target role readiness
              </span>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
                <GithubLogo className="w-3.5 h-3.5 text-text-primary" />
                Connected GitHub Username (Non-Fork Code Telemetry)
              </label>
              <input
                type="text"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="e.g. alex-dev"
                className="w-full p-3 rounded-xl bg-paper border border-border text-xs sm:text-sm text-text-primary focus:outline-none focus:border-focus/50 shadow-sm font-mono"
              />
              <span className="text-[11px] text-text-secondary block">
                LearnPath AI scans your GitHub repos to formulate your baseline skill delta (<strong>Δ = max(0, Target - Current)</strong>).
              </span>
            </div>
          </div>
        </div>

        {/* ── 4. Save Changes Bar ── */}
        <div className="flex items-center justify-between pt-2">
          {isSaved ? (
            <span className="text-xs font-bold text-signal flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle className="w-4 h-4" weight="fill" />
              Profile changes saved successfully!
            </span>
          ) : (
            <span className="text-xs text-text-secondary">
              Click save to sync changes with your active learning path.
            </span>
          )}

          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-focus hover:bg-focus/90 text-white font-bold text-xs sm:text-sm shadow-lg shadow-focus/25 transition-all cursor-pointer"
          >
            Save Profile
          </button>
        </div>

        {/* ── 5. Account Security & Danger Zone ── */}
        <div className="p-6 rounded-3xl border border-alert/30 bg-alert/5 space-y-4">
          <div className="border-b border-alert/20 pb-3">
            <h2 className="text-sm font-bold text-alert flex items-center gap-2">
              <Warning className="w-4 h-4" weight="bold" />
              <span>Danger Zone & Reset Actions</span>
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Caution: Resetting your learning path will clear your completed milestones and re-run baseline calibration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleResetProgress}
              className="px-4 py-2.5 rounded-xl bg-alert/15 hover:bg-alert/25 text-alert border border-alert/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash className="w-4 h-4" />
              <span>Reset Learning Path & Re-run Calibration</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                await signOut();
              }}
              className="px-4 py-2.5 rounded-xl bg-paper hover:bg-border text-text-secondary hover:text-text-primary border border-border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
            >
              <SignOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
