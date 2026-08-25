"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Phone,
  CalendarBlank,
  Moon,
  Bell,
  Trash,
  CheckCircle,
  Sparkle,
  GithubLogo,
  Clock,
  Target,
  Sliders,
  Warning,
} from "@phosphor-icons/react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { PRESEEDED_CAREER_ROLES } from "@/lib/data/roleTaxonomy";
import { mockStore } from "@/lib/services/mockStore";
import { LearnerProfile } from "@/types";

export default function SettingsPage() {
  const { profile: supabaseProfile, updateProfile, user } = useSupabase();

  // Profile fields
  const [name, setName] = useState(() => mockStore.getProfile()?.name || "");
  const [email, setEmail] = useState(() => mockStore.getProfile()?.email || user?.email || "");
  const [dob, setDob] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [reminders, setReminders] = useState(true);

  // AI Recommender fields
  const [targetRoleId, setTargetRoleId] = useState(() => mockStore.getProfile()?.targetRoleId || "data-analyst");
  const [weeklyHours, setWeeklyHours] = useState(() => mockStore.getProfile()?.weeklyHoursBudget || 10);
  const [githubUsername, setGithubUsername] = useState(() => mockStore.getProfile()?.githubStats?.username || "");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (supabaseProfile) {
      if (supabaseProfile.name) setName(supabaseProfile.name);
      if (supabaseProfile.email) setEmail(supabaseProfile.email);
      if (supabaseProfile.dob) setDob(supabaseProfile.dob);
      if (supabaseProfile.mobileNo) setMobileNo(supabaseProfile.mobileNo);
      if (supabaseProfile.darkMode !== undefined) setDarkMode(supabaseProfile.darkMode);
      if (supabaseProfile.reminders !== undefined) setReminders(supabaseProfile.reminders);
    } else if (user?.email) {
      setEmail((prev) => prev || user.email || "");
    }
  }, [supabaseProfile, user]);

  const toggleDarkMode = () => {
    const updated = !darkMode;
    setDarkMode(updated);
    document.documentElement.classList.toggle("dark", updated);
    updateProfile({ darkMode: updated });
  };

  const toggleReminders = () => {
    const updated = !reminders;
    setReminders(updated);
    updateProfile({ reminders: updated });
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();

    try {
      await updateProfile({
        name,
        dob,
        mobileNo,
        darkMode,
        reminders,
      });
    } catch (e) {
      console.warn("Supabase profile update warning:", e);
    }

    const existingProfile = mockStore.getProfile();
    const updatedLocal: LearnerProfile = {
      ...existingProfile,
      name,
      email,
      targetRoleId,
      weeklyHoursBudget: weeklyHours,
      darkMode,
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

    alert("Progress has been reset. Launching Onboarding...");
    window.location.href = "/onboarding";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 text-text-primary">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl border border-border bg-surface shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <User className="w-6 h-6 text-focus" />
            Account & Recommender Settings
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Manage your personal profile, study pace, connected GitHub telemetry, and target engineering role.
          </p>
        </div>

        <Link
          href="/onboarding"
          className="px-4 py-2 rounded-xl bg-focus/10 hover:bg-focus/20 border border-focus/30 text-focus text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <Sparkle className="w-4 h-4" />
          <span>Re-run AI Goal Wizard</span>
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Details Card */}
        <div className="p-6 rounded-3xl border border-border bg-surface shadow-xl space-y-4">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <User className="w-4 h-4 text-text-secondary" />
            Personal Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Dev"
                className="w-full p-3 rounded-xl bg-paper border border-border text-xs text-text-primary focus:outline-none focus:border-focus/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Email Address</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full p-3 rounded-xl bg-paper/50 border border-border/60 text-xs text-text-secondary cursor-not-allowed"
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
                className="w-full p-3 rounded-xl bg-paper border border-border text-xs text-text-primary focus:outline-none focus:border-focus/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-text-secondary" />
                Mobile Number (Peer Search & Call Verification)
              </label>
              <input
                type="tel"
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full p-3 rounded-xl bg-paper border border-border text-xs text-text-primary focus:outline-none focus:border-focus/50"
              />
            </div>
          </div>
        </div>

        {/* AI Path Recommender Preferences */}
        <div className="p-6 rounded-3xl border border-border bg-surface shadow-xl space-y-4">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Target className="w-4 h-4 text-focus" />
            AI Career Recommender & Pacing
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Target Role Curriculum</label>
              <select
                value={targetRoleId}
                onChange={(e) => setTargetRoleId(e.target.value)}
                className="w-full p-3 rounded-xl bg-paper border border-border text-xs text-text-primary focus:outline-none focus:border-focus/50"
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
                  Weekly Time Commitment
                </span>
                <span className="font-mono text-focus font-bold">{weeklyHours}h / week</span>
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
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-text-secondary flex items-center gap-1">
                <GithubLogo className="w-3.5 h-3.5 text-text-primary" />
                Connected GitHub Username (Non-Fork Code Telemetry)
              </label>
              <input
                type="text"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="e.g. alex-dev"
                className="w-full p-3 rounded-xl bg-paper border border-border text-xs text-text-primary focus:outline-none focus:border-focus/50"
              />
            </div>
          </div>
        </div>

        {/* Preferences Card */}
        <div className="p-6 rounded-3xl border border-border bg-surface shadow-xl space-y-4">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Sliders className="w-4 h-4 text-text-secondary" />
            System Preferences
          </h2>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-paper border border-border">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-focus" />
                <div>
                  <span className="text-xs font-bold text-text-primary block">Dark Mode Aesthetic</span>
                  <span className="text-[11px] text-text-secondary">Signature high-contrast theme</span>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleDarkMode}
                className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                  darkMode ? "bg-focus" : "bg-border"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-paper transition-transform ${
                    darkMode ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-paper border border-border">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-warning" />
                <div>
                  <span className="text-xs font-bold text-text-primary block">Daily Study Notifications</span>
                  <span className="text-[11px] text-text-secondary">Streak reminders and milestone notifications</span>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleReminders}
                className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                  reminders ? "bg-focus" : "bg-border"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-paper transition-transform ${
                    reminders ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {isSaved && (
            <span className="text-xs font-bold text-signal flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle className="w-4 h-4" weight="fill" />
              Settings saved successfully!
            </span>
          )}
          <button
            type="submit"
            className="ml-auto px-6 py-3 rounded-2xl bg-focus hover:bg-focus/90 text-white font-bold text-xs sm:text-sm shadow-lg shadow-focus/25 transition-all cursor-pointer"
          >
            Save Changes
          </button>
        </div>

        {/* Danger Zone */}
        <div className="p-6 rounded-3xl border border-alert/30 bg-alert/5 space-y-3">
          <h2 className="text-sm font-bold text-alert flex items-center gap-2">
            <Warning className="w-4 h-4" weight="bold" />
            Danger Zone
          </h2>
          <p className="text-xs text-text-secondary">
            Resetting your learning path will clear your completed milestones and restart the AI baseline calibration.
          </p>

          <button
            type="button"
            onClick={handleResetProgress}
            className="px-4 py-2.5 rounded-xl bg-alert/20 hover:bg-alert/30 text-alert border border-alert/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash className="w-4 h-4" />
            <span>Reset Learning Path & Re-run Onboarding</span>
          </button>
        </div>
      </form>
    </div>
  );
}
