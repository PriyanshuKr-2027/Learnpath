"use client";

import React from "react";

export default function RootGlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full p-8 rounded-3xl border border-red-500/30 bg-zinc-900/90 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto text-2xl font-bold font-mono">
            !
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-white">System Critical Recovery</h1>
            <p className="text-xs text-zinc-400">
              The root application layout encountered an unhandled exception.
            </p>
          </div>

          {error?.message && (
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-400 text-left overflow-x-auto max-h-32">
              {error.message}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="flex-1 py-3 rounded-xl bg-focus hover:bg-focus/90 text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
            >
              Recover Session
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") window.location.href = "/";
              }}
              className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Home Page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
