"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Note,
  MagnifyingGlass,
  GameController,
  ArrowRight,
  PencilSimple,
  Sparkle,
  BookOpen,
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
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Note className="w-6 h-6 text-emerald-400" />
            Study Notes & Learning Scratchpad
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            All your personal markdown notes and code snippets captured in the CourseOs Split-Screen Canvas.
          </p>
        </div>

        <Link
          href="/roadmap"
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
        >
          <GameController className="w-4 h-4" weight="fill" />
          <span>Open Candy Crush DAG Map</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center relative max-w-md w-full">
          <MagnifyingGlass className="absolute left-3.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search note contents, algorithms, syntax..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <span className="text-xs text-zinc-400 font-mono">
          {filteredNotes.length} Note{filteredNotes.length === 1 ? "" : "s"} Found
        </span>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.map(({ level, note }) => (
          <div
            key={level.id}
            className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 hover:border-emerald-500/30 transition-all flex flex-col gap-3 group shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  LEVEL {level.displayLevel}
                </span>
                <h2 className="text-sm font-bold text-zinc-100">{level.title}</h2>
                <span className="text-[10px] text-zinc-500 font-mono">• {level.skillName} (Week {level.targetWeek})</span>
              </div>

              <Link
                href={`/learn/${level.id}`}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span>Edit in Canvas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 font-mono text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
              {note}
            </div>
          </div>
        ))}

        {filteredNotes.length === 0 && (
          <div className="p-12 rounded-3xl border border-zinc-800 bg-zinc-900/20 text-center space-y-3">
            <Note className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-base font-bold text-zinc-300">No Study Notes Yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              As you take notes in the CourseOs Split-Screen Canvas (`/learn/[stepId]`), they will automatically sync and index here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
