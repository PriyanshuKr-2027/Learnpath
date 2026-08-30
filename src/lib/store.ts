"use client";

import { mockStore } from "./services/mockStore";

export interface UserProgressRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  completedDaysCount: number;
  totalDaysCount: number;
  progressPercentage: number;
  currentStreak: number;
  lastActiveDate: string;
}

export function getUserProgressList(): UserProgressRecord[] {
  if (typeof window !== "undefined") {
    const profile = mockStore.getProfile();
    const activePath = mockStore.getLearningPath();
    if (profile) {
      const completedLevels = activePath?.levels?.filter((l) => l.status === "completed").length || 0;
      const totalLevels = activePath?.levels?.length || 6;
      return [
        {
          id: profile.id || "current_user",
          name: profile.name || "Alex Dev",
          email: profile.email || "alex@example.com",
          role: "learner",
          completedDaysCount: completedLevels,
          totalDaysCount: totalLevels,
          progressPercentage: activePath?.completionPercentage || 0,
          currentStreak: (profile as any)?.currentStreak || 1,
          lastActiveDate: new Date().toISOString().split("T")[0],
        },
      ];
    }
  }
  return [];
}
