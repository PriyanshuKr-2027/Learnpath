"use client";

export interface Profile {
  name: string;
  email: string;
  darkMode: boolean;
  reminders: boolean;
  role?: "learner" | "admin";
  current_streak?: number;
  last_active_date?: string | null;
  hasCompletedSetup?: boolean;
  dob?: string;
  mobileNo?: string;
  [key: string]: any;
}

export interface StreakInfo {
  currentStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
}

const DEFAULT_PROFILE: Profile = {
  name: "Alex Dev",
  email: "alex@example.com",
  darkMode: true,
  reminders: true,
  role: "learner",
  current_streak: 6,
  last_active_date: new Date().toISOString().split("T")[0],
  hasCompletedSetup: true,
  dob: "2000-01-01",
  mobileNo: "9876543210",
};

const isBrowser = () => typeof window !== "undefined";

export function getProfile(): Profile {
  if (!isBrowser()) return DEFAULT_PROFILE;
  const data = localStorage.getItem("learnpath_user_profile");
  if (!data) return DEFAULT_PROFILE;
  try {
    const parsed = JSON.parse(data);
    const email = parsed.email || "";
    const role: "learner" | "admin" = email.toLowerCase().includes("admin") ? "admin" : (parsed.role || "learner");
    return { ...DEFAULT_PROFILE, ...parsed, role, hasCompletedSetup: true };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: Profile): void {
  if (!isBrowser()) return;
  const email = profile.email || "";
  const role: "learner" | "admin" = email.toLowerCase().includes("admin") ? "admin" : (profile.role || "learner");
  const updatedProfile = { ...profile, role, hasCompletedSetup: true };
  localStorage.setItem("learnpath_user_profile", JSON.stringify(updatedProfile));
  window.dispatchEvent(new Event("storage"));
}

export function getStreakInfo(): StreakInfo {
  if (!isBrowser()) return { currentStreak: 6, lastActiveDate: new Date().toISOString().split("T")[0] };
  const data = localStorage.getItem("learnpath_streak_info");
  if (!data) return { currentStreak: 6, lastActiveDate: new Date().toISOString().split("T")[0] };
  try {
    return JSON.parse(data);
  } catch {
    return { currentStreak: 6, lastActiveDate: new Date().toISOString().split("T")[0] };
  }
}

export function saveStreakInfo(info: StreakInfo): void {
  if (!isBrowser()) return;
  localStorage.setItem("learnpath_streak_info", JSON.stringify(info));
  window.dispatchEvent(new Event("storage"));
}

export function getUserProgressList(): any[] {
  return [
    {
      id: "user-1",
      name: "Alex Dev",
      email: "alex@example.com",
      role: "learner",
      completedDaysCount: 4,
      totalDaysCount: 6,
      progressPercentage: 67,
      currentStreak: 6,
      lastActiveDate: new Date().toISOString().split("T")[0],
    },
    {
      id: "user-2",
      name: "Priyanshu Kumar",
      email: "priyanshu@example.com",
      role: "learner",
      completedDaysCount: 6,
      totalDaysCount: 6,
      progressPercentage: 100,
      currentStreak: 14,
      lastActiveDate: new Date().toISOString().split("T")[0],
    },
    {
      id: "user-3",
      name: "Elena Rostova",
      email: "elena@example.com",
      role: "learner",
      completedDaysCount: 5,
      totalDaysCount: 6,
      progressPercentage: 83,
      currentStreak: 9,
      lastActiveDate: new Date().toISOString().split("T")[0],
    },
  ];
}
