"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogo, Envelope, Lock, ArrowRight, User, Sparkle, SpinnerGap } from "@phosphor-icons/react";
import { useSupabase } from "@/components/providers/SupabaseProvider";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle } = useSupabase();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
          if (signUpResult.data?.session) {
            router.push("/dashboard");
          } else {
            setShowSuccessModal(true);
          }
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
    } catch (err: any) {
      setError(err?.message || "Google authentication failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4 relative font-sans text-text-primary selection:bg-focus/30 selection:text-focus">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-focus/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-surface border border-border backdrop-blur-2xl rounded-3xl p-8 shadow-2xl space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-focus mx-auto flex items-center justify-center shadow-lg shadow-focus/25 text-white">
            <Sparkle className="w-6 h-6" weight="fill" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            {isSignUp ? "Create your LearnPath Account" : "Welcome back to LearnPath AI"}
          </h1>
          <p className="text-xs text-text-secondary">
            AI-powered personalized career roadmaps & adaptive mastery.
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
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-paper hover:bg-sidebar border border-border rounded-2xl text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-sm text-text-primary"
        >
          {googleLoading ? (
            <SpinnerGap className="w-5 h-5 animate-spin text-focus" />
          ) : (
            <>
              <GoogleLogo className="w-5 h-5 text-focus" weight="bold" />
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-border"></div>
          <span className="px-3 text-[11px] text-text-secondary font-medium uppercase tracking-wider">Or continue with email</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  required={isSignUp}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Dev"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-paper border border-border text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-focus/50"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Email Address</label>
            <div className="relative">
              <Envelope className="absolute left-3.5 top-3.5 w-4 h-4 text-text-secondary" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-paper border border-border text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-focus/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-text-secondary" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-paper border border-border text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-focus/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3.5 rounded-2xl bg-focus hover:bg-focus/90 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-focus/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <SpinnerGap className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? "Create Free Account" : "Sign In to LearnPath"}</span>
                <ArrowRight className="w-4 h-4" weight="bold" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Switch */}
        <div className="text-center pt-2">
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

      {/* Confirmation Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-surface border border-border rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-focus/15 border border-focus/30 text-focus flex items-center justify-center mx-auto">
              <Sparkle className="w-6 h-6" weight="fill" />
            </div>
            <h3 className="text-base font-bold text-text-primary">Check Your Email</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              We have sent a verification link to <strong className="text-text-primary">{email}</strong>. Please confirm your email to activate your account.
            </p>
            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                setIsSignUp(false);
              }}
              className="w-full py-2.5 rounded-xl bg-focus text-white font-bold text-xs shadow-md shadow-focus/25"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
