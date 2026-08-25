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
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative font-sans text-zinc-100 selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-zinc-900/60 border border-zinc-800 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 text-zinc-950">
            <Sparkle className="w-6 h-6" weight="fill" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            {isSignUp ? "Create your LearnPath Account" : "Welcome back to LearnPath AI"}
          </h1>
          <p className="text-xs text-zinc-400">
            AI-powered personalized career roadmaps & adaptive mastery.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          disabled={googleLoading || loading}
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 rounded-2xl text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-md"
        >
          {googleLoading ? (
            <SpinnerGap className="w-5 h-5 animate-spin text-emerald-400" />
          ) : (
            <>
              <GoogleLogo className="w-5 h-5 text-emerald-400" weight="bold" />
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-zinc-800"></div>
          <span className="px-3 text-[11px] text-zinc-500 font-medium uppercase tracking-wider">Or continue with email</span>
          <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required={isSignUp}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Dev"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Email Address</label>
            <div className="relative">
              <Envelope className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
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
            className="text-xs text-zinc-400 hover:text-emerald-400 font-medium transition-colors cursor-pointer"
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Create one"}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <Sparkle className="w-6 h-6" weight="fill" />
            </div>
            <h3 className="text-base font-bold text-zinc-100">Check Your Email</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We have sent a verification link to <strong className="text-zinc-200">{email}</strong>. Please confirm your email to activate your account.
            </p>
            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                setIsSignUp(false);
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
