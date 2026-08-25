"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getProfile as getMockProfile, saveProfile as saveMockProfile } from "@/lib/store";
import { Profile, Day } from "@/types";
import { SupabaseClient, User, AuthError, Session } from "@supabase/supabase-js";

interface SupabaseContextType {
  supabase: SupabaseClient | null;
  user: User | null;
  profile: Profile;
  days: Day[];
  planProgress: Record<string, boolean>;
  dayManualDone: Record<number, boolean>;
  dayNotes: Record<number, string>;
  completedProblems: Record<string, boolean>;
  streak: number;
  loading: boolean;
  isMockMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ data: { user: User | null; session: Session | null } | null; error: AuthError | Error | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: Partial<Profile>) => Promise<void>;
  refreshProgress: () => Promise<void>;
  createPortalUser: (email: string, password: string, name: string) => Promise<void>;
  deletePortalUser: (userId: string) => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

const MOCK_ACTIVE_USER: any = {
  id: "mock-alex-dev-id",
  email: "alex@example.com",
  user_metadata: { name: "Alex Dev" },
  app_metadata: { provider: "google" },
  created_at: "2026-01-01T00:00:00.000Z",
};

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Detect mock mode (if keys are missing or placeholders)
  const isMockMode =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-id") ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("deblsqilknaxulxqbmmm") ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("your-anon-public-key");

  const supabase = isMockMode ? null : createClient();

  const [user, setUser] = useState<User | null>(MOCK_ACTIVE_USER);
  const [profile, setProfile] = useState<Profile>({
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
  });

  const [days, setDays] = useState<Day[]>([]);
  const [planProgress, setPlanProgress] = useState<Record<string, boolean>>({});
  const [dayManualDone, setDayManualDone] = useState<Record<number, boolean>>({});
  const [dayNotes, setDayNotes] = useState<Record<number, string>>({});
  const [completedProblems, setCompletedProblems] = useState<Record<string, boolean>>({});
  const [streak, setStreak] = useState(6);
  const [loading, setLoading] = useState(false);

  // Initialize data (Supabase or LocalStorage)
  useEffect(() => {
    async function init() {
      if (isMockMode) {
        const mockP = getMockProfile();
        setProfile(mockP);
        setUser(MOCK_ACTIVE_USER);
        setStreak(mockP.current_streak || 6);
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase!.auth.getSession();
        if (!session) {
          // Keep mock user active for UI exploration
          setUser(MOCK_ACTIVE_USER);
          setLoading(false);
          return;
        }

        setUser(session.user);

        const { data: profData, error: profError } = await supabase!
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profError) {
          console.error("Error fetching profile:", profError);
        } else if (profData) {
          setProfile({
            name: profData.name,
            email: profData.email,
            darkMode: profData.dark_mode ?? true,
            reminders: profData.reminders ?? true,
            role: profData.role || "learner",
            current_streak: profData.current_streak || 6,
            last_active_date: profData.last_active_date,
            hasCompletedSetup: true,
            dob: profData.dob || "",
            mobileNo: profData.mobile_no || "",
          });
          setStreak(profData.current_streak || 6);
          if (profData.dark_mode) {
            document.documentElement.classList.add("dark");
          }
        }
      } catch (err) {
        console.warn("Supabase initialization using mock mode:", err);
        const mockP = getMockProfile();
        setProfile(mockP);
        setUser(MOCK_ACTIVE_USER);
        setStreak(6);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [isMockMode, supabase]);

  const updateProfile = async (profileData: Partial<Profile>) => {
    const updated = { ...profile, ...profileData, hasCompletedSetup: true };
    setProfile(updated);

    if (isMockMode) {
      saveMockProfile(updated);
      return;
    }

    if (!user) return;

    try {
      const updatePayload: any = {};
      if (profileData.name !== undefined) updatePayload.name = profileData.name;
      if (profileData.darkMode !== undefined) updatePayload.dark_mode = profileData.darkMode;
      if (profileData.reminders !== undefined) updatePayload.reminders = profileData.reminders;
      if (profileData.dob !== undefined) updatePayload.dob = profileData.dob;
      if (profileData.mobileNo !== undefined) updatePayload.mobile_no = profileData.mobileNo;
      updatePayload.has_completed_setup = true;

      await supabase!
        .from("profiles")
        .update(updatePayload)
        .eq("id", user.id);
    } catch (err) {
      console.error("Error updating profile in Supabase:", err);
    }
  };

  const refreshProgress = async () => {
    // Local mock state refresh
  };

  const signIn = async (email: string, password: string) => {
    if (isMockMode) {
      const role = email.toLowerCase().includes("admin") ? "admin" : "learner";
      const updated = { ...profile, email, role, hasCompletedSetup: true };
      setProfile(updated);
      setUser({ ...MOCK_ACTIVE_USER, email });
      saveMockProfile(updated);
      return { error: null };
    }

    try {
      const { error } = await supabase!.auth.signInWithPassword({ email, password });
      return { error };
    } catch (err) {
      return { error: err as AuthError };
    }
  };

  const signInWithGoogle = async () => {
    if (isMockMode) {
      setUser(MOCK_ACTIVE_USER);
      return { error: null };
    }

    try {
      const { error } = await supabase!.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
        },
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (isMockMode) {
      const updated = { ...profile, email, name, hasCompletedSetup: true };
      setProfile(updated);
      setUser({ ...MOCK_ACTIVE_USER, email, user_metadata: { name } });
      saveMockProfile(updated);
      return { data: { user: MOCK_ACTIVE_USER, session: null }, error: null };
    }

    try {
      const res = await supabase!.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      return res;
    } catch (err) {
      return { data: null, error: err as AuthError };
    }
  };

  const signOut = async () => {
    if (isMockMode) {
      router.push("/dashboard");
      return;
    }

    try {
      await supabase!.auth.signOut();
      setUser(MOCK_ACTIVE_USER);
      router.push("/dashboard");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const createPortalUser = async (email: string, password: string, name: string) => {};
  const deletePortalUser = async (userId: string) => {};

  return (
    <SupabaseContext.Provider
      value={{
        supabase,
        user,
        profile,
        days,
        planProgress,
        dayManualDone,
        dayNotes,
        completedProblems,
        streak,
        loading,
        isMockMode,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        updateProfile,
        refreshProgress,
        createPortalUser,
        deletePortalUser,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
}
