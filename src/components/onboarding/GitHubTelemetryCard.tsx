"use client";

import React, { useState } from "react";
import { GitFork, CheckCircle2, Loader2, Sparkles, Code2 } from "lucide-react";
import { FiGithub } from "react-icons/fi";
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
    <div className="flex flex-col gap-4 p-5 rounded-2xl border border-border bg-paper min-h-[220px] justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-surface border border-border flex items-center justify-center text-text-primary shadow-sm">
            <FiGithub className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary">GitHub Profile Analysis</h4>
            <p className="text-xs text-text-secondary">Scans original non-forked code to verify authentic skills</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-signal/10 text-signal border border-signal/20">
          <GitFork className="w-3 h-3 rotate-180" />
          Forks Filtered
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary">
            github.com/
          </span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            onKeyDown={(e) => e.key === "Enter" && handleSync()}
            className="w-full bg-surface border border-border rounded-xl pl-24 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-focus/50 shadow-sm"
          />
        </div>
        <button
          type="button"
          disabled={isLoading || !username.trim()}
          onClick={() => handleSync()}
          className="px-4 py-2.5 rounded-xl bg-focus hover:bg-focus/90 text-white text-sm font-medium disabled:opacity-40 flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Analyzing...</span>
            </>
          ) : (
            <span>Sync Profile</span>
          )}
        </button>
      </div>

      {syncedTelemetry && (
        <div className="flex flex-col gap-3 pt-2 border-t border-border">
          <div className="flex items-center justify-between text-xs text-text-primary">
            <span className="flex items-center gap-1.5 font-medium text-signal">
              <CheckCircle2 className="w-4 h-4" />
              Synced @{syncedTelemetry.username} ({syncedTelemetry.publicReposCount} original repos)
            </span>
          </div>

          {/* Language Breakdown Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span className="flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5" />
                Codebase Language Distribution
              </span>
            </div>
            <div className="w-full h-2 bg-surface rounded-full overflow-hidden flex border border-border">
              {Object.entries(syncedTelemetry.topLanguages).map(([lang, pct], idx) => {
                const colors = ["bg-focus", "bg-signal", "bg-warning", "bg-alert"];
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
                const dotColors = ["bg-focus", "bg-signal", "bg-warning", "bg-alert"];
                return (
                  <span key={lang} className="text-[11px] text-text-secondary flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${dotColors[idx % dotColors.length]}`} />
                    {lang}: <strong className="text-text-primary">{pct}%</strong>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 1-Click Sample Button */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary">Want to test instantly?</span>
        <button
          type="button"
          onClick={handleSampleUser}
          className="text-xs font-medium text-focus hover:text-focus/80 flex items-center gap-1 py-1 px-2.5 rounded-lg bg-focus/10 hover:bg-focus/20 border border-focus/20 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Test with Sample GitHub
        </button>
      </div>
    </div>
  );
}
