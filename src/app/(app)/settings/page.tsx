"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Envelope,
  Phone,
  CalendarBlank,
  Key,
  Moon,
  Bell,
  Trash,
  ArrowRight,
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
  const { profile: supabaseProfile, updateProfile, isMockMode, supabase, user } = useSupabase();

  // Profile fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [groqApiKey, setGroqApiKey] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [reminders, setReminders] = useState(true);

  // AI Recommender fields
  const [targetRoleId, setTargetRoleId] = useState("data-analyst");
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [githubUsername, setGithubUsername] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Load from local store profile if present
    const localProfile = mockStore.getProfile();
    if (localProfile) {
      setName(localProfile.name || "");
      setEmail(localProfile.email || user?.email || "");
      setTargetRoleId(localProfile.targetRoleId || "data-analyst");
      setWeeklyHours(localProfile.weeklyHoursBudget || 10);
      setGroqApiKey(localProfile.groqApiKey || "");
      if (localProfile.githubStats?.username) {
        setGithubUsername(localProfile.githubStats.username);
      }
    }

    if (supabaseProfile) {
      if (supabaseProfile.name) setName(supabaseProfile.name);
      if (supabaseProfile.email) setEmail(supabaseProfile.email);
      if (supabaseProfile.dob) setDob(supabaseProfile.dob);
      if (supabaseProfile.mobileNo) setMobileNo(supabaseProfile.mobileNo);
      if (supabaseProfile.groqApiKey) setGroqApiKey(supabaseProfile.groqApiKey);
      if (supabaseProfile.darkMode !== undefined) setDarkMode(supabaseProfile.darkMode);
      if (supabaseProfile.reminders !== undefined) setReminders(supabaseProfile.reminders);
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
    if (groqApiKey && !groqApiKey.startsWith("gsk_") && groqApiKey.trim() !== "") {
      alert("Invalid Groq API key format. Groq keys typically begin with 'gsk_'.");
      return;
    }

    // Update Supabase
    try {
      await updateProfile({
        name,
        dob,
        mobileNo,
        groqApiKey,
        darkMode,
        reminders,
      });
    } catch (e) {
      console.warn("Supabase profile update warning:", e);
    }

    // Update Local mock store profile
    const existingProfile = mockStore.getProfile();
    const updatedLocal: LearnerProfile = {
      ...existingProfile,
      name,
      email,
      targetRoleId,
      weeklyHoursBudget: weeklyHours,
      groqApiKey,
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

    if (supabase && user && !isMockMode) {
      try {
        await supabase.from("progress").delete().eq("user_id", user.id);
        await supabase.from("progress_days").delete().eq("user_id", user.id);
        await supabase.from("user_notes").delete().eq("user_id", user.id);
      } catch {}
    }

    alert("Progress has been reset. Launching Onboarding...");
    window.location.href = "/onboarding";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <User className="w-6 h-6 text-emerald-400" />
            Account & Recommender Settings
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your personal profile, AI API credentials, study pace, and target engineering role.
          </p>
        </div>

        <Link
          href="/onboarding"
          className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <Sparkle className="w-4 h-4" />
          <span>Re-run AI Goal Wizard</span>
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Details Card */}
        <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl space-y-4">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <User className="w-4 h-4 text-zinc-400" />
            Personal Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Dev"
                className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Email Address</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/60 text-xs text-zinc-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 flex items-center gap-1">
                <CalendarBlank className="w-3.5 h-3.5 text-zinc-500" />
                Date of Birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-zinc-500" />
                Mobile Number (Peer Search & Call Verification)
              </label>
              <input
                type="tel"
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>
        </div>

        {/* AI Path Recommender Preferences */}
        <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl space-y-4">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            AI Career Recommender & Pacing
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Target Role Curriculum</label>
              <select
                value={targetRoleId}
                onChange={(e) => setTargetRoleId(e.target.value)}
                className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500/50"
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
                <span className="font-medium text-zinc-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  Weekly Time Budget
                </span>
                <span className="font-mono text-emerald-400 font-bold">{weeklyHours}h / week</span>
              </div>
              <input
                type="range"
                min={4}
                max={40}
                step={2}
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer mt-3"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 flex items-center gap-1">
                <GithubLogo className="w-3.5 h-3.5 text-zinc-300" />
                Connected GitHub Username
              </label>
              <input
                type="text"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="e.g. alex-dev"
                className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                Groq LLaMA API Key (24/7 AI Copilot)
              </label>
              <input
                type="password"
                value={groqApiKey}
                onChange={(e) => setGroqApiKey(e.target.value)}
                placeholder="gsk_... (leave empty for default mock mode)"
                className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500/50 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Preferences Card */}
        <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl space-y-4">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-zinc-400" />
            System Preferences
          </h2>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-purple-400" />
                <div>
                  <span className="text-xs font-bold text-zinc-100 block">Dark Mode Aesthetic</span>
                  <span className="text-[11px] text-zinc-400">Zinc & Emerald high-contrast theme</span>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleDarkMode}
                className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                  darkMode ? "bg-emerald-500" : "bg-zinc-800"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-zinc-950 transition-transform ${
                    darkMode ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="text-xs font-bold text-zinc-100 block">Daily Study Notifications</span>
                  <span className="text-[11px] text-zinc-400">Streak reminders and milestone notifications</span>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleReminders}
                className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                  reminders ? "bg-emerald-500" : "bg-zinc-800"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-zinc-950 transition-transform ${
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
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle className="w-4 h-4" weight="fill" />
              Settings saved successfully!
            </span>
          )}
          <button
            type="submit"
            className="ml-auto px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            Save Changes
          </button>
        </div>

        {/* Danger Zone */}
        <div className="p-6 rounded-3xl border border-rose-500/30 bg-rose-950/10 space-y-3">
          <h2 className="text-sm font-bold text-rose-400 flex items-center gap-2">
            <Warning className="w-4 h-4" weight="bold" />
            Danger Zone
          </h2>
          <p className="text-xs text-zinc-400">
            Resetting your learning path will clear your completed milestones and restart the AI baseline calibration.
          </p>

          <button
            type="button"
            onClick={handleResetProgress}
            className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash className="w-4 h-4" />
            <span>Reset Learning Path & Re-run Onboarding</span>
          </button>
        </div>
      </form>
    </div>
  );
}
