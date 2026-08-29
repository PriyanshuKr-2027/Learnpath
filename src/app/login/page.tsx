"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  ArrowRight,
  User,
  Sparkles,
  Loader2,
  Zap,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { mockStore, DEMO_DATA_ANALYST_PROFILE } from "@/lib/services/mockStore";

const emptySubscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle, updateProfile } = useSupabase();
  const mounted = useIsMounted();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("Alex Dev");
  const [email, setEmail] = useState("alex@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        const signUpResult = await signUp(email, password, name);
        if (signUpResult.error) {
          setError(signUpResult.error.message || "Sign up failed.");
        } else {
          router.push("/onboarding");
        }
      } else {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          setError(signInError.message || "Invalid login credentials.");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const { error: gError } = await signInWithGoogle();
      if (gError) {
        setError(gError.message || "Google authentication failed.");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google authentication failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  // 1-Click Mock Logins for Testing & Evaluation
  const handleQuickMockLogin = async (type: "active-dashboard" | "new-onboarding" | "admin") => {
    setLoading(true);
    setError("");

    if (type === "active-dashboard") {
      mockStore.saveProfile(DEMO_DATA_ANALYST_PROFILE);
      await signIn("alex@example.com", "password123");
      await updateProfile({
        name: "Alex Dev",
        email: "alex@example.com",
        role: "learner",
        hasCompletedSetup: true,
      });
      router.push("/dashboard");
    } else if (type === "new-onboarding") {
      const freshProf = {
        ...DEMO_DATA_ANALYST_PROFILE,
        name: "Alex Learner",
        email: "alex.learner@example.com",
        hasCompletedOnboarding: false,
      };
      mockStore.saveProfile(freshProf);
      await signIn("alex.learner@example.com", "password123");
      await updateProfile({
        name: "Alex Learner",
        email: "alex.learner@example.com",
        role: "learner",
        hasCompletedSetup: false,
      });
      router.push("/onboarding");
    } else if (type === "admin") {
      await signIn("admin@learnpath.ai", "admin123");
      await updateProfile({
        name: "Platform Admin",
        email: "admin@learnpath.ai",
        role: "admin",
        hasCompletedSetup: true,
      });
      router.push("/admin");
    }
    setLoading(false);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface border border-border rounded-3xl p-8 shadow-xl text-center space-y-4">
          <Loader2 className="w-8 h-8 text-focus animate-spin mx-auto" />
          <p className="text-xs text-text-secondary">Loading LearnPath...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4 relative font-sans text-text-primary selection:bg-focus/30 selection:text-focus">
      <div className="max-w-md w-full bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xl space-y-5 relative z-10">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-11 h-11 rounded-xl bg-focus mx-auto flex items-center justify-center shadow-sm text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
            {isSignUp ? "Create your LearnPath Account" : "Welcome back to LearnPath AI"}
          </h1>
          <p className="text-xs text-text-secondary">
            AI-powered personalized career roadmaps and adaptive mastery.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-alert/10 border border-alert/30 text-alert text-xs font-medium">
            {error}
          </div>
        )}

        {/* 1-Click Instant Demo Accounts */}
        <div className="p-3.5 rounded-2xl border border-focus/30 bg-focus/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-focus uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              1-Click Demo Accounts (Instant Access)
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => handleQuickMockLogin("active-dashboard")}
              className="w-full p-2.5 rounded-xl bg-surface hover:bg-surface/80 border border-focus/40 text-left flex items-center justify-between group transition-all shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-focus/15 text-focus flex items-center justify-center font-bold text-xs">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-text-primary block group-hover:text-focus transition-colors">
                    Demo Learner (Active Roadmap)
                  </span>
                  <span className="text-[10px] text-text-secondary">Pre-populated DAG map, levels 1 & 2 done</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-focus opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickMockLogin("new-onboarding")}
              className="w-full p-2.5 rounded-xl bg-surface hover:bg-surface/80 border border-border text-left flex items-center justify-between group transition-all shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-signal/15 text-signal flex items-center justify-center font-bold text-xs">
                  <Rocket className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-text-primary block group-hover:text-signal transition-colors">
                    New Learner (Launch AI Wizard)
                  </span>
                  <span className="text-[10px] text-text-secondary">Directly runs 4-Step Onboarding Wizard</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-signal opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickMockLogin("admin")}
              className="w-full p-2.5 rounded-xl bg-surface hover:bg-surface/80 border border-border text-left flex items-center justify-between group transition-all shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-warning/15 text-warning flex items-center justify-center font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-text-primary block group-hover:text-warning transition-colors">
                    Platform Admin Dashboard
                  </span>
                  <span className="text-[10px] text-text-secondary">Learner progress directory & chat monitor</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-warning opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          disabled={googleLoading || loading}
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-paper hover:bg-surface border border-border rounded-2xl text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-sm text-text-primary"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-focus" />
          ) : (
            <>
              <FcGoogle className="w-4 h-4" />
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <div className="flex items-center my-2">
          <div className="flex-grow border-t border-border"></div>
          <span className="px-3 text-[10px] text-text-secondary font-medium uppercase tracking-wider">Or email login</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  required={isSignUp}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Dev"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-paper border border-border text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-focus/50 shadow-sm"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-text-secondary">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-text-secondary" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-paper border border-border text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-focus/50 shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-text-secondary">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-text-secondary" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-paper border border-border text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-focus/50 shadow-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3 rounded-xl bg-focus hover:bg-focus/90 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-focus/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? "Create Account & Start" : "Sign In with Credentials"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Switch */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="text-xs text-text-secondary hover:text-focus font-medium transition-colors cursor-pointer"
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
}
