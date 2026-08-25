"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Note,
  MagnifyingGlass,
  GameController,
  ArrowRight,
  Sparkle,
} from "@phosphor-icons/react";
import { mockStore } from "@/lib/services/mockStore";
import { LearningPath, LevelNode } from "@/types";

export default function NotesPage() {
  const [search, setSearch] = useState("");
  const [path, setPath] = useState<LearningPath | null>(null);
  const [levelNotes, setLevelNotes] = useState<Array<{ level: LevelNode; note: string }>>([]);

  useEffect(() => {
    const activePath = mockStore.getLearningPath();
    setPath(activePath);

    if (activePath && activePath.levels) {
      const populated = activePath.levels
        .map((lvl) => ({
          level: lvl,
          note: mockStore.getNote(lvl.id),
        }))
        .filter((item) => item.note && item.note.trim() !== "");

      setLevelNotes(populated);
    }
  }, []);

  const filteredNotes = levelNotes.filter(
    (item) =>
      item.level.title.toLowerCase().includes(search.toLowerCase()) ||
      item.level.skillName.toLowerCase().includes(search.toLowerCase()) ||
      item.note.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 text-text-primary">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl border border-border bg-surface shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Note className="w-6 h-6 text-focus" />
            Study Notes & Learning Scratchpad
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            All your personal markdown notes and code snippets captured in the CourseOs Split-Screen Canvas.
          </p>
        </div>

        <Link
          href="/roadmap"
          className="px-4 py-2 rounded-xl bg-focus hover:bg-focus/90 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-focus/25"
        >
          <GameController className="w-4 h-4" weight="fill" />
          <span>Open Candy Crush DAG Map</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center relative max-w-md w-full">
          <MagnifyingGlass className="absolute left-3.5 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search note contents, algorithms, syntax..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-border text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-focus/50"
          />
        </div>

        <span className="text-xs text-text-secondary font-mono">
          {filteredNotes.length} Note{filteredNotes.length === 1 ? "" : "s"} Found
        </span>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.map(({ level, note }) => (
          <div
            key={level.id}
            className="p-6 rounded-3xl border border-border bg-surface hover:border-focus/50 transition-all flex flex-col gap-3 group shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-focus/10 text-focus border border-focus/20">
                  LEVEL {level.displayLevel}
                </span>
                <h2 className="text-sm font-bold text-text-primary">{level.title}</h2>
                <span className="text-[10px] text-text-secondary font-mono">• {level.skillName} (Week {level.targetWeek})</span>
              </div>

              <Link
                href={`/learn/${level.id}`}
                className="text-xs font-bold text-focus hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span>Edit in Canvas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-paper border border-border font-mono text-xs text-text-primary leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
              {note}
            </div>
          </div>
        ))}

        {filteredNotes.length === 0 && (
          <div className="p-12 rounded-3xl border border-border bg-surface/50 text-center space-y-3">
            <Note className="w-10 h-10 text-text-secondary mx-auto" />
            <h3 className="text-base font-bold text-text-primary">No Study Notes Yet</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              As you take notes in the CourseOs Split-Screen Canvas (`/learn/[stepId]`), they will automatically sync and index here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
