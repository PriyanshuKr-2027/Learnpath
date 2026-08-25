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
  signOut: () => Promise<void>;
  updateProfile: (profileData: Partial<Profile>) => Promise<void>;
  refreshProgress: () => Promise<void>;
  createPortalUser: (email: string, password: string, name: string) => Promise<void>;
  deletePortalUser: (userId: string) => Promise<void>;
  getChatHistory?: any;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Detect mock mode (if keys are missing)
  const isMockMode =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-id") ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("your-anon-public-key");

  const supabase = isMockMode ? null : createClient();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>({
    name: "Alex Dev",
    email: "alex@example.com",
    darkMode: true,
    reminders: true,
    role: "learner",
    current_streak: 5,
    last_active_date: "",
    hasCompletedSetup: false,
    dob: "2000-01-01",
    mobileNo: "9876543210",
    groqApiKey: "",
  });

  const [days, setDays] = useState<Day[]>([]);
  const [planProgress, setPlanProgress] = useState<Record<string, boolean>>({});
  const [dayManualDone, setDayManualDone] = useState<Record<number, boolean>>({});
  const [dayNotes, setDayNotes] = useState<Record<number, string>>({});
  const [completedProblems, setCompletedProblems] = useState<Record<string, boolean>>({});
  const [streak, setStreak] = useState(5);
  const [loading, setLoading] = useState(true);

  // Initialize data (Supabase or LocalStorage)
  useEffect(() => {
    async function init() {
      if (isMockMode) {
        const mockP = getMockProfile();
        setProfile(mockP);
        setStreak(5);
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase!.auth.getSession();
        if (!session) {
          setUser(null);
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
            current_streak: profData.current_streak || 5,
            last_active_date: profData.last_active_date,
            hasCompletedSetup: profData.has_completed_setup ?? false,
            dob: profData.dob || "",
            mobileNo: profData.mobile_no || "",
            groqApiKey: profData.groq_api_key || "",
          });
          setStreak(profData.current_streak || 5);
          if (profData.dark_mode) {
            document.documentElement.classList.add("dark");
          }
        }
      } catch (err) {
        console.error("Error initializing SupabaseProvider:", err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [isMockMode, supabase]);

  const updateProfile = async (profileData: Partial<Profile>) => {
    const updated = { ...profile, ...profileData };
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
      if (profileData.hasCompletedSetup !== undefined) updatePayload.has_completed_setup = profileData.hasCompletedSetup;
      if (profileData.dob !== undefined) updatePayload.dob = profileData.dob;
      if (profileData.mobileNo !== undefined) updatePayload.mobile_no = profileData.mobileNo;
      if (profileData.groqApiKey !== undefined) updatePayload.groq_api_key = profileData.groqApiKey;

      await supabase!
        .from("profiles")
        .update(updatePayload)
        .eq("id", user.id);
    } catch (e) {
      console.error("Error updating profile in Supabase:", e);
    }
  };

  const refreshProgress = async () => {};

  const createPortalUser = async (email: string, password: string, name: string) => {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to create user");
    }
  };

  const deletePortalUser = async (userId: string) => {
    const res = await fetch(`/api/admin/users?id=${userId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to delete user");
    }
  };

  const signIn = async (email: string, password: string) => {
    if (isMockMode) {
      const mockP = { ...profile, email, name: email.split("@")[0] };
      setProfile(mockP);
      saveMockProfile(mockP);
      setUser({ id: "mock-user-id", email } as User);
      return { error: null };
    }

    const res = await supabase!.auth.signInWithPassword({ email, password });
    if (!res.error && res.data.user) {
      setUser(res.data.user);
    }
    return { error: res.error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (isMockMode) {
      const mockP = { ...profile, email, name };
      setProfile(mockP);
      saveMockProfile(mockP);
      setUser({ id: "mock-user-id", email } as User);
      return { data: { user: { id: "mock-user-id", email } as User, session: null }, error: null };
    }

    const res = await supabase!.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    return res;
  };

  const signOut = async () => {
    if (isMockMode) {
      setUser(null);
      router.push("/auth/login");
      return;
    }

    await supabase!.auth.signOut();
    setUser(null);
    router.push("/auth/login");
  };

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
