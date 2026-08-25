"use client";

export interface Profile {
  name: string;
  email: string;
  darkMode: boolean;
  reminders: boolean;
  role?: "learner" | "admin";
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
};

const isBrowser = () => typeof window !== "undefined";

export function getProfile(): Profile {
  if (!isBrowser()) return DEFAULT_PROFILE;
  const data = localStorage.getItem("learnpath_user_profile");
  if (!data) return DEFAULT_PROFILE;
  try {
    const parsed = JSON.parse(data);
    const email = parsed.email || "";
    const role = email.toLowerCase().includes("admin") ? "admin" : (parsed.role || "learner");
    return { ...DEFAULT_PROFILE, ...parsed, role };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: Profile): void {
  if (!isBrowser()) return;
  const email = profile.email || "";
  const role = email.toLowerCase().includes("admin") ? "admin" : (profile.role || "learner");
  const updatedProfile = { ...profile, role };
  localStorage.setItem("learnpath_user_profile", JSON.stringify(updatedProfile));
  window.dispatchEvent(new Event("storage"));
}

export function getStreakInfo(): StreakInfo {
  if (!isBrowser()) return { currentStreak: 5, lastActiveDate: new Date().toISOString().split("T")[0] };
  const data = localStorage.getItem("learnpath_streak_info");
  if (!data) return { currentStreak: 5, lastActiveDate: new Date().toISOString().split("T")[0] };
  try {
    return JSON.parse(data);
  } catch {
    return { currentStreak: 5, lastActiveDate: new Date().toISOString().split("T")[0] };
  }
}

export function saveStreakInfo(info: StreakInfo): void {
  if (!isBrowser()) return;
  localStorage.setItem("learnpath_streak_info", JSON.stringify(info));
  window.dispatchEvent(new Event("storage"));
}

export function getUserProgressList() {
  const profile = getProfile();
  const streak = getStreakInfo();

  return [
    {
      id: "alex_dev",
      name: profile.name,
      email: profile.email,
      role: profile.role || "learner",
      joinedDate: "Aug 15, 2026",
      lastActive: streak.lastActiveDate || new Date().toISOString().split("T")[0],
      solvedCount: 18,
      totalProblems: 24,
      percentage: 75,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.name}`,
    },
    {
      id: "priyanshu_kr",
      name: "Priyanshu Kumar",
      email: "priyanshu@example.com",
      role: "learner",
      joinedDate: "Aug 10, 2026",
      lastActive: "2026-08-25",
      solvedCount: 22,
      totalProblems: 24,
      percentage: 92,
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Priyanshu",
    },
  ];
}
