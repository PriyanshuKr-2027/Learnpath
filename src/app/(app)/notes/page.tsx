"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Note,
  MagnifyingGlass,
  CalendarBlank,
  GameController,
  Code,
  ArrowRight,
  PencilSimple,
  Sparkle,
} from "@phosphor-icons/react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { mockStore } from "@/lib/services/mockStore";
import { LearningPath, LevelNode, Day } from "@/types";
import { getPatternBadgeStyle } from "@/lib/badgeStyle";

export default function NotesPage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "levels" | "dsa">("all");
  const { days, dayNotes } = useSupabase();

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

  // 75-Day DSA Notes
  const daysWithNotes = (days || [])
    .map((d: Day) => {
      const userNote = dayNotes?.[d.id] || "";
      return {
        ...d,
        notes: userNote,
      };
    })
    .filter((d) => d.notes && d.notes.trim() !== "");

  // Filtered Level Notes
  const filteredLevelNotes = levelNotes.filter(
    (item) =>
      item.level.title.toLowerCase().includes(search.toLowerCase()) ||
      item.level.skillName.toLowerCase().includes(search.toLowerCase()) ||
      item.note.toLowerCase().includes(search.toLowerCase())
  );

  // Filtered DSA Notes
  const filteredDsaNotes = daysWithNotes.filter(
    (day) =>
      day.topic.toLowerCase().includes(search.toLowerCase()) ||
      day.pattern.toLowerCase().includes(search.toLowerCase()) ||
      day.notes.toLowerCase().includes(search.toLowerCase())
  );

  const totalNotesCount = filteredLevelNotes.length + filteredDsaNotes.length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Note className="w-6 h-6 text-emerald-400" />
            Study Notes & Architectural Insights
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Aggregated personal markdown notes from your CourseOs Learning Canvas and 75-Day DSA practice sessions.
          </p>
        </div>

        <Link
          href="/roadmap"
          className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <GameController className="w-4 h-4 text-emerald-400" />
          <span>Open Level Map</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Tab Filters */}
        <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === "all"
                ? "bg-emerald-500 text-zinc-950 shadow-md"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            All Notes ({totalNotesCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("levels")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === "levels"
                ? "bg-emerald-500 text-zinc-950 shadow-md"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Roadmap Levels ({filteredLevelNotes.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("dsa")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === "dsa"
                ? "bg-emerald-500 text-zinc-950 shadow-md"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            DSA Practice Days ({filteredDsaNotes.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="flex items-center relative max-w-sm w-full">
          <MagnifyingGlass className="absolute left-3.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search note keywords, syntax, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {/* Level Canvas Notes */}
        {(filterType === "all" || filterType === "levels") &&
          filteredLevelNotes.map(({ level, note }) => (
            <div
              key={level.id}
              className="p-5 rounded-3xl border border-zinc-800 bg-zinc-900/40 hover:border-emerald-500/30 transition-all flex flex-col gap-3 group shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    LEVEL {level.displayLevel}
                  </span>
                  <span className="text-xs font-bold text-zinc-200">{level.title}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">• {level.skillName}</span>
                </div>

                <Link
                  href={`/learn/${level.id}`}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span>Edit in Canvas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 font-mono text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                {note}
              </div>
            </div>
          ))}

        {/* 75-Day DSA Notes */}
        {(filterType === "all" || filterType === "dsa") &&
          filteredDsaNotes.map((day) => (
            <div
              key={day.id}
              className="p-5 rounded-3xl border border-zinc-800 bg-zinc-900/40 hover:border-cyan-500/30 transition-all flex flex-col gap-3 group shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    DAY #{day.id}
                  </span>
                  <span className="text-xs font-bold text-zinc-200">{day.topic}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${getPatternBadgeStyle(day.pattern)}`}>
                    {day.pattern}
                  </span>
                </div>

                <Link
                  href={`/day/${day.id}`}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span>Open Day Practice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 text-xs text-zinc-300 leading-relaxed italic max-h-48 overflow-y-auto">
                &ldquo;{day.notes}&rdquo;
              </div>
            </div>
          ))}

        {totalNotesCount === 0 && (
          <div className="p-12 rounded-3xl border border-zinc-800 bg-zinc-900/20 text-center space-y-3">
            <Note className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-base font-bold text-zinc-300">No Study Notes Found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              As you take notes in the CourseOs Split-Screen Canvas (`/learn/[stepId]`) or the 75-Day DSA Days, they will automatically be indexed here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
