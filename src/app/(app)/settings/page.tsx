"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Gear,
  Moon,
  Sun,
  Bell,
  Globe,
  ShieldCheck,
  SpeakerHigh,
  SpeakerSlash,
  CheckCircle,
  User,
  ArrowRight,
  Sparkle,
  Eye,
  Sliders,
} from "@phosphor-icons/react";
import { useSupabase } from "@/components/providers/SupabaseProvider";

export default function SettingsPage() {
  const { profile: supabaseProfile, updateProfile } = useSupabase();

  // Appearance preferences
  const [darkMode, setDarkMode] = useState(true);
  const [accentColor, setAccentColor] = useState("indigo");
  const [uiDensity, setUiDensity] = useState<"spacious" | "compact">("spacious");

  // Notification preferences
  const [dailyReminders, setDailyReminders] = useState(true);
  const [bossAlerts, setBossAlerts] = useState(true);
  const [socialPings, setSocialPings] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  // Language & Regional
  const [language, setLanguage] = useState("en");
  const [weekStart, setWeekStart] = useState("monday");

  // Privacy & Community
  const [publicPresence, setPublicPresence] = useState(true);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);
  const [telemetryOptIn, setTelemetryOptIn] = useState(true);

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (supabaseProfile?.darkMode !== undefined) {
      setDarkMode(supabaseProfile.darkMode);
    }
    if (supabaseProfile?.reminders !== undefined) {
      setDailyReminders(supabaseProfile.reminders);
    }

    try {
      const stored = localStorage.getItem("learnpath_app_settings");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.accentColor) setAccentColor(parsed.accentColor);
        if (parsed.uiDensity) setUiDensity(parsed.uiDensity);
        if (parsed.bossAlerts !== undefined) setBossAlerts(parsed.bossAlerts);
        if (parsed.socialPings !== undefined) setSocialPings(parsed.socialPings);
        if (parsed.soundEffects !== undefined) setSoundEffects(parsed.soundEffects);
        if (parsed.language) setLanguage(parsed.language);
        if (parsed.weekStart) setWeekStart(parsed.weekStart);
        if (parsed.publicPresence !== undefined) setPublicPresence(parsed.publicPresence);
        if (parsed.showOnLeaderboard !== undefined) setShowOnLeaderboard(parsed.showOnLeaderboard);
        if (parsed.telemetryOptIn !== undefined) setTelemetryOptIn(parsed.telemetryOptIn);
      }
    } catch {}
  }, [supabaseProfile]);

  const toggleDarkMode = () => {
    const updated = !darkMode;
    setDarkMode(updated);
    document.documentElement.classList.toggle("dark", updated);
    updateProfile({ darkMode: updated });
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();

    try {
      await updateProfile({
        darkMode,
        reminders: dailyReminders,
      });
    } catch (err) {
      console.warn("Supabase update error:", err);
    }

    const settingsData = {
      darkMode,
      accentColor,
      uiDensity,
      dailyReminders,
      bossAlerts,
      socialPings,
      soundEffects,
      language,
      weekStart,
      publicPresence,
      showOnLeaderboard,
      telemetryOptIn,
    };

    try {
      localStorage.setItem("learnpath_app_settings", JSON.stringify(settingsData));
    } catch {}

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 text-text-primary">
      {/* ── Top Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl border border-border bg-surface shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-focus/15 border border-focus/30 text-focus flex items-center justify-center shadow-lg shadow-focus/20 shrink-0">
            <Gear className="w-6 h-6" weight="fill" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary flex items-center gap-2">
              Application Preferences
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Customize theme appearance, notifications, study audio, and privacy controls.
            </p>
          </div>
        </div>

        <Link
          href="/profile"
          className="px-4 py-2.5 rounded-xl bg-focus/10 hover:bg-focus/20 border border-focus/30 text-focus text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <User className="w-4 h-4" weight="bold" />
          <span>Edit Profile & Account</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ── Quick Profile Link Notice ── */}
      <div className="p-4 rounded-2xl bg-paper/60 border border-border flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="text-focus text-base">💡</span>
          <p className="text-xs text-text-secondary">
            Looking to update your <strong>Name, Date of Birth, GitHub stats</strong>, or <strong>Target Career Role</strong>?
          </p>
        </div>
        <Link
          href="/profile"
          className="text-xs font-bold text-focus hover:underline flex items-center gap-1 shrink-0"
        >
          <span>Go to Profile</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ── 1. Appearance & Theme ── */}
        <div className="p-6 sm:p-7 rounded-3xl border border-border bg-surface shadow-xl space-y-4">
          <div className="border-b border-border/70 pb-3">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Sliders className="w-4 h-4 text-focus" weight="bold" />
              <span>Appearance & Theme</span>
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Control the visual styling and layout density of the LearnPath interface.
            </p>
          </div>

          <div className="space-y-3">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-paper border border-border">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon className="w-5 h-5 text-focus" weight="fill" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" weight="fill" />
                )}
                <div>
                  <span className="text-xs font-bold text-text-primary block">
                    Dark Mode Aesthetic
                  </span>
                  <span className="text-[11px] text-text-secondary">
                    {darkMode ? "Signature sleek dark mode enabled" : "Standard light mode theme"}
                  </span>
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

            {/* Layout Density */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-paper border border-border">
              <div>
                <span className="text-xs font-bold text-text-primary block">Layout Density</span>
                <span className="text-[11px] text-text-secondary">Adjust card spacing and content padding</span>
              </div>
              <div className="flex items-center p-1 rounded-xl bg-surface border border-border text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setUiDensity("spacious")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    uiDensity === "spacious" ? "bg-focus text-white" : "text-text-secondary"
                  }`}
                >
                  Comfortable
                </button>
                <button
                  type="button"
                  onClick={() => setUiDensity("compact")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    uiDensity === "compact" ? "bg-focus text-white" : "text-text-secondary"
                  }`}
                >
                  Compact
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Notifications & Alerts ── */}
        <div className="p-6 sm:p-7 rounded-3xl border border-border bg-surface shadow-xl space-y-4">
          <div className="border-b border-border/70 pb-3">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Bell className="w-4 h-4 text-warning" weight="bold" />
              <span>Notifications & Study Alerts</span>
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Select which notifications you would like to receive during your learning sessions.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-paper border border-border">
              <div>
                <span className="text-xs font-bold text-text-primary block">
                  Daily Study Streak Protection
                </span>
                <span className="text-[11px] text-text-secondary">
                  Remind me if I haven&apos;t logged any study sessions today
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDailyReminders(!dailyReminders)}
                className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                  dailyReminders ? "bg-focus" : "bg-border"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-paper transition-transform ${
                    dailyReminders ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-paper border border-border">
              <div>
                <span className="text-xs font-bold text-text-primary block">
                  Boss Level & Diagnostic CAT Alerts
                </span>
                <span className="text-[11px] text-text-secondary">
                  Notify me when an adaptive competency checkpoint is ready
                </span>
              </div>
              <button
                type="button"
                onClick={() => setBossAlerts(!bossAlerts)}
                className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                  bossAlerts ? "bg-focus" : "bg-border"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-paper transition-transform ${
                    bossAlerts ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-paper border border-border">
              <div>
                <span className="text-xs font-bold text-text-primary block">
                  Social Study Room & Doubt Mentions
                </span>
                <span className="text-[11px] text-text-secondary">
                  Alert me when a peer answers or upvotes my doubts
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSocialPings(!socialPings)}
                className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                  socialPings ? "bg-focus" : "bg-border"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-paper transition-transform ${
                    socialPings ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-paper border border-border">
              <div className="flex items-center gap-3">
                {soundEffects ? (
                  <SpeakerHigh className="w-5 h-5 text-focus" />
                ) : (
                  <SpeakerSlash className="w-5 h-5 text-text-secondary" />
                )}
                <div>
                  <span className="text-xs font-bold text-text-primary block">
                    Audio Chimes & Focus Bells
                  </span>
                  <span className="text-[11px] text-text-secondary">
                    Play celebratory sound effect upon completing Pomodoro focus timer
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSoundEffects(!soundEffects)}
                className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                  soundEffects ? "bg-focus" : "bg-border"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-paper transition-transform ${
                    soundEffects ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ── 3. Language & Regional ── */}
        <div className="p-6 sm:p-7 rounded-3xl border border-border bg-surface shadow-xl space-y-4">
          <div className="border-b border-border/70 pb-3">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Globe className="w-4 h-4 text-signal" weight="bold" />
              <span>Language & Regional</span>
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Customize language localization and calendar week display.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Display Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-3 rounded-xl bg-paper border border-border text-xs sm:text-sm text-text-primary font-semibold focus:outline-none focus:border-focus/50 shadow-sm cursor-pointer"
              >
                <option value="en">English (US)</option>
                <option value="es">Español (Spanish)</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="fr">Français (French)</option>
                <option value="de">Deutsch (German)</option>
                <option value="zh">中文 (Mandarin)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">First Day of Week</label>
              <select
                value={weekStart}
                onChange={(e) => setWeekStart(e.target.value)}
                className="w-full p-3 rounded-xl bg-paper border border-border text-xs sm:text-sm text-text-primary font-semibold focus:outline-none focus:border-focus/50 shadow-sm cursor-pointer"
              >
                <option value="monday">Monday (Recommended for study plans)</option>
                <option value="sunday">Sunday</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── 4. Privacy & Community Visibility ── */}
        <div className="p-6 sm:p-7 rounded-3xl border border-border bg-surface shadow-xl space-y-4">
          <div className="border-b border-border/70 pb-3">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-focus" weight="bold" />
              <span>Privacy & Social Visibility</span>
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Choose what information is visible to other learners across the Social Study Room.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-paper border border-border">
              <div>
                <span className="text-xs font-bold text-text-primary block">
                  Public Study Presence
                </span>
                <span className="text-[11px] text-text-secondary">
                  Show my avatar in the &quot;Active Learners Online&quot; bar in the Study Together room
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPublicPresence(!publicPresence)}
                className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                  publicPresence ? "bg-focus" : "bg-border"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-paper transition-transform ${
                    publicPresence ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-paper border border-border">
              <div>
                <span className="text-xs font-bold text-text-primary block">
                  Leaderboard Participation
                </span>
                <span className="text-[11px] text-text-secondary">
                  Include my completed focus hours and verified doubt answers on the Contributor Leaderboard
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowOnLeaderboard(!showOnLeaderboard)}
                className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                  showOnLeaderboard ? "bg-focus" : "bg-border"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-paper transition-transform ${
                    showOnLeaderboard ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-paper border border-border">
              <div>
                <span className="text-xs font-bold text-text-primary block">
                  Anonymous Learning Telemetry
                </span>
                <span className="text-[11px] text-text-secondary">
                  Allow LearnPath AI to anonymously benchmark DAG traversal times to improve path generation
                </span>
              </div>
              <button
                type="button"
                onClick={() => setTelemetryOptIn(!telemetryOptIn)}
                className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                  telemetryOptIn ? "bg-focus" : "bg-border"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-paper transition-transform ${
                    telemetryOptIn ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ── Save Bar ── */}
        <div className="flex items-center justify-between pt-2">
          {isSaved && (
            <span className="text-xs font-bold text-signal flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle className="w-4 h-4" weight="fill" />
              Preferences saved successfully!
            </span>
          )}

          <button
            type="submit"
            className="ml-auto px-6 py-3 rounded-2xl bg-focus hover:bg-focus/90 text-white font-bold text-xs sm:text-sm shadow-lg shadow-focus/25 transition-all cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
