"use client";

import React, { useState } from "react";
import { GithubLogo, SpinnerGap, GitFork, Sparkle, CheckCircle } from "@phosphor-icons/react";
import { GitHubTelemetry, SkillEntry } from "@/types";

interface GitHubTelemetryCardProps {
  onSynced: (data: { telemetry: GitHubTelemetry; skills: SkillEntry[] }) => void;
  githubToken?: string;
}

export function GitHubTelemetryCard({ onSynced, githubToken }: GitHubTelemetryCardProps) {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [syncedTelemetry, setSyncedTelemetry] = useState<GitHubTelemetry | null>(null);

  const handleSync = async (targetUsername?: string) => {
    const userToQuery = (targetUsername || username).trim();
    if (!userToQuery) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/github-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userToQuery, githubToken }),
      });

      if (res.ok) {
        const data = await res.json();
        setSyncedTelemetry(data.telemetry);
        onSynced(data);
      }
    } catch (e) {
      console.error("GitHub sync error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleUser = () => {
    setUsername("alex-analyst");
    handleSync("alex-analyst");
  };

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-200">
            <GithubLogo className="w-5 h-5" weight="fill" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-100">GitHub Profile Analysis</h4>
            <p className="text-xs text-zinc-400">Scans original non-forked code to verify authentic skills</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <GitFork className="w-3 h-3 rotate-180" />
          Forks Filtered
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
            github.com/
          </span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            onKeyDown={(e) => e.key === "Enter" && handleSync()}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-24 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <button
          type="button"
          disabled={isLoading || !username.trim()}
          onClick={() => handleSync()}
          className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm font-medium disabled:opacity-40 flex items-center gap-2 transition-colors cursor-pointer"
        >
          {isLoading ? (
            <>
              <SpinnerGap className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Analyzing...</span>
            </>
          ) : (
            <span>Sync Profile</span>
          )}
        </button>
      </div>

      {syncedTelemetry && (
        <div className="flex flex-col gap-3 pt-2 border-t border-zinc-800/60">
          <div className="flex items-center justify-between text-xs text-zinc-300">
            <span className="flex items-center gap-1.5 font-medium text-emerald-400">
              <CheckCircle className="w-4 h-4" weight="fill" />
              Synced @{syncedTelemetry.username} ({syncedTelemetry.publicReposCount} original repos)
            </span>
          </div>

          {/* Language Breakdown Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Codebase Language Distribution</span>
            </div>
            <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden flex">
              {Object.entries(syncedTelemetry.topLanguages).map(([lang, pct], idx) => {
                const colors = ["bg-emerald-500", "bg-cyan-500", "bg-amber-500", "bg-purple-500"];
                return (
                  <div
                    key={lang}
                    style={{ width: `${pct}%` }}
                    className={`${colors[idx % colors.length]} transition-all`}
                    title={`${lang}: ${pct}%`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {Object.entries(syncedTelemetry.topLanguages).map(([lang, pct], idx) => {
                const dotColors = ["bg-emerald-400", "bg-cyan-400", "bg-amber-400", "bg-purple-400"];
                return (
                  <span key={lang} className="text-[11px] text-zinc-300 flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${dotColors[idx % dotColors.length]}`} />
                    {lang}: <strong className="text-zinc-100">{pct}%</strong>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 1-Click Sample for Judges */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">Want to test instantly?</span>
        <button
          type="button"
          onClick={handleSampleUser}
          className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 py-1 px-2.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors"
        >
          <Sparkle className="w-3.5 h-3.5" />
          Test with Sample GitHub
        </button>
      </div>
    </div>
  );
}
