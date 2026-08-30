"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Profile, Day } from "@/types";
import { SupabaseClient, User, AuthError, Session } from "@supabase/supabase-js";

interface SupabaseContextType {
  supabase: SupabaseClient | null;
  user: User | null;
  profile: Profile | null;
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

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [days] = useState<Day[]>([]);
  const [planProgress] = useState<Record<string, boolean>>({});
  const [dayManualDone] = useState<Record<number, boolean>>({});
  const [dayNotes] = useState<Record<number, string>>({});
  const [completedProblems] = useState<Record<string, boolean>>({});
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (userId: string, userEmail?: string, userName?: string) => {
    try {
      const res = await fetch("/api/learner/profile");
      if (res.ok) {
        const data = await res.json();
        if (data?.profile) {
          const lp = data.profile;
          setProfile({
            name: lp.name || userName || "Learner",
            email: lp.email || userEmail || "",
            darkMode: lp.darkMode ?? true,
            reminders: true,
            role: "learner",
            current_streak: lp.currentStreak || 0,
            last_active_date: new Date().toISOString().split("T")[0],
            hasCompletedSetup: lp.hasCompletedOnboarding ?? false,
          });
          setStreak(lp.currentStreak || 0);
          return;
        }
      }

      setProfile({
        name: userName || userEmail?.split("@")[0] || "Learner",
        email: userEmail || "",
        darkMode: true,
        reminders: true,
        role: "learner",
        current_streak: 0,
        last_active_date: new Date().toISOString().split("T")[0],
        hasCompletedSetup: false,
      });
    } catch (err) {
      console.error("[SupabaseProvider] profile load error:", err);
      setProfile({
        name: userName || "Learner",
        email: userEmail || "",
        darkMode: true,
        reminders: true,
        role: "learner",
        current_streak: 0,
        last_active_date: new Date().toISOString().split("T")[0],
        hasCompletedSetup: false,
      });
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (!supabase) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("[SupabaseProvider] getSession error:", error.message);
        }

        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            await fetchUserProfile(
              session.user.id,
              session.user.email,
              session.user.user_metadata?.name || session.user.user_metadata?.full_name
            );
          } else {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error("[SupabaseProvider] auth init exception:", err);
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(
          session.user.id,
          session.user.email,
          session.user.user_metadata?.name || session.user.user_metadata?.full_name
        );
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [supabase, fetchUserProfile]);

  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!profile) return;
    const updated = { ...profile, ...profileData };
    setProfile(updated);

    try {
      await fetch("/api/learner/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            name: updated.name,
            email: updated.email,
            darkMode: updated.darkMode,
            hasCompletedOnboarding: updated.hasCompletedSetup,
            currentStreak: updated.current_streak,
          },
        }),
      });
    } catch (err) {
      console.error("[SupabaseProvider] updateProfile error:", err);
    }
  };

  const refreshProgress = async () => {
    if (user) {
      await fetchUserProfile(user.id, user.email, profile?.name);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: new Error("Supabase client not initialized") };
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error };
      if (data?.user) {
        setUser(data.user);
        await fetchUserProfile(
          data.user.id,
          data.user.email,
          data.user.user_metadata?.name
        );
      }
      return { error: null };
    } catch (err) {
      return { error: err as AuthError };
    }
  };

  const signInWithGoogle = async () => {
    if (!supabase) return { error: new Error("Supabase client not initialized") };
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      return { error };
    } catch (err) {
      return { error: err as AuthError };
    }
  };


  const signUp = async (email: string, password: string, name: string) => {
    if (!supabase) return { data: null, error: new Error("Supabase client not initialized") };
    try {
      const res = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (res.data?.user) {
        setUser(res.data.user);
        await fetchUserProfile(res.data.user.id, email, name);
      }
      return res;
    } catch (err) {
      return { data: null, error: err as AuthError };
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      if (typeof window !== "undefined") {
        localStorage.clear();
      }
      router.push("/login");
    } catch (err) {

      console.error("[SupabaseProvider] signOut error:", err);
      setUser(null);
      setProfile(null);
      router.push("/login");
    }
  };

  const createPortalUser = async () => {};
  const deletePortalUser = async () => {};

  return (
    <SupabaseContext.Provider
      value={{
        supabase,
        user,
        profile: profile || {
          name: "Guest",
          email: "",
          darkMode: true,
          reminders: true,
          role: "learner",
          current_streak: 0,
          last_active_date: "",
          hasCompletedSetup: false,
        },
        days,
        planProgress,
        dayManualDone,
        dayNotes,
        completedProblems,
        streak,
        loading,
        isMockMode: false,
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

