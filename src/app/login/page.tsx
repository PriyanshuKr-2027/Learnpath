"use client";

import { useState, useSyncExternalStore, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  ArrowRight,
  User,
  Sparkles,
  Loader2,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useSupabase } from "@/components/providers/SupabaseProvider";

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
  const { signIn, signUp, signInWithGoogle } = useSupabase();
  const mounted = useIsMounted();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlError = params.get("error");
      if (urlError) {
        if (urlError === "oauth_failed" || urlError === "no_auth_code") {
          setError("Google sign-in was canceled or could not be completed. Please try again.");
        } else {
          setError(decodeURIComponent(urlError));
        }
      }
    }
  }, []);


  const checkDestinationAndRedirect = async () => {
    try {
      const res = await fetch("/api/learner/path");
      if (res.ok) {
        const data = await res.json();
        if (data?.path) {
          router.push("/roadmap");
          return;
        }
      }
      router.push("/onboarding");
    } catch {
      router.push("/onboarding");
    }
  };

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
          await checkDestinationAndRedirect();
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
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google authentication failed.");
    } finally {
      setGoogleLoading(false);
    }
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
            {isSignUp ? "Create your LearnPath Account" : "Welcome to LearnPath AI"}
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
                  placeholder="Your Full Name"
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
                placeholder="name@example.com"
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
                placeholder="********"
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

