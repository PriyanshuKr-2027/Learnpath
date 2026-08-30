"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Note,
  MagnifyingGlass,
  GameController,
  ArrowRight,
  Copy,
  Check,
  PencilSimple,
  Plus,
  Trash,
  DownloadSimple,
  Sparkle,
  FloppyDisk,
  X,
} from "@phosphor-icons/react";
import { mockStore } from "@/lib/services/mockStore";

interface StudyNoteItem {
  levelId: string;
  title: string;
  skillName: string;
  targetWeek: number;
  phase: string;
  displayLevel: string;
  content: string;
}

function getNotesItems(): StudyNoteItem[] {
  const activePath = mockStore.getLearningPath();
  const allNotesMap = mockStore.getAllNotes();
  const levels = activePath?.levels || [];

  const items: StudyNoteItem[] = [];

  // First map notes for known levels in the DAG
  levels.forEach((lvl) => {
    const noteContent = allNotesMap[lvl.id];
    if (noteContent && noteContent.trim() !== "") {
      items.push({
        levelId: lvl.id,
        title: lvl.title,
        skillName: lvl.skillName,
        targetWeek: lvl.targetWeek,
        phase: lvl.phase,
        displayLevel: String(lvl.displayLevel || lvl.levelNumber),
        content: noteContent,
      });
    }
  });

  // Also include any notes stored with custom IDs not in default levels
  Object.entries(allNotesMap).forEach(([id, content]) => {
    if (content && content.trim() !== "" && !levels.some((l) => l.id === id)) {
      items.push({
        levelId: id,
        title: id.replace("lvl-", "Level ").replace("-", " "),
        skillName: "Study Scratchpad",
        targetWeek: 1,
        phase: "Independent Study",
        displayLevel: id.replace("lvl-", "").toUpperCase(),
        content: content,
      });
    }
  });

  return items;
}

export default function NotesPage() {
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState<StudyNoteItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<StudyNoteItem | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [selectedLevelId, setSelectedLevelId] = useState("all");

  const loadNotes = useCallback(() => {
    setNotes(getNotesItems());
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadNotes();
    }, 0);

    const handleUpdate = () => {
      loadNotes();
    };

    window.addEventListener("learnpath_notes_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("learnpath_notes_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [loadNotes]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportAll = () => {
    const allContent = notes
      .map(
        (n) =>
          `# ${n.title} (Level ${n.displayLevel} * ${n.skillName})\n\n${n.content}\n\n---\n`
      )
      .join("\n");

    const blob = new Blob([allContent], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `LearnPath-Study-Notes-${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveEdit = () => {
    if (!editingNote) return;
    mockStore.saveNote(editingNote.levelId, editContent);
    loadNotes();
    setEditingNote(null);
  };

  const handleDelete = (levelId: string) => {
    mockStore.saveNote(levelId, "");
    loadNotes();
  };

  const handleCreateNew = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const customId = `custom-${Date.now()}`;
    const formattedContent = `# ${newTitle.trim()}\n\n${newContent.trim()}`;
    mockStore.saveNote(customId, formattedContent);
    setIsCreatingNew(false);
    setNewTitle("");
    setNewContent("");
    loadNotes();
  };

  // Filter notes
  const filteredNotes = notes.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.skillName.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase());

    const matchesLevel =
      selectedLevelId === "all" || item.levelId === selectedLevelId;

    return matchesSearch && matchesLevel;
  });

  // Markdown renderer for note content
  const renderMarkdown = (raw: string) => {
    const lines = raw.split("\n");
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLines: string[] = [];
    let codeLang = "";

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      if (trimmed.startsWith("```")) {
        if (inCodeBlock) {
          // Close block
          const codeString = codeLines.join("\n");
          elements.push(
            <div
              key={`code-${idx}`}
              className="my-3 rounded-xl border border-border bg-paper overflow-hidden font-mono text-xs shadow-inner"
            >
              <div className="flex items-center justify-between px-3 py-1.5 bg-surface border-b border-border text-[11px] text-text-secondary">
                <span className="font-semibold uppercase">{codeLang || "code"}</span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(codeString)}
                  className="hover:text-text-primary text-text-secondary flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
              <pre className="p-3.5 text-text-primary overflow-x-auto whitespace-pre leading-relaxed">
                {codeString}
              </pre>
            </div>
          );
          codeLines = [];
          inCodeBlock = false;
          codeLang = "";
        } else {
          inCodeBlock = true;
          codeLang = trimmed.replace("```", "").trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        return;
      }

      if (!trimmed) {
        elements.push(<div key={`sp-${idx}`} className="h-1.5" />);
        return;
      }

      if (trimmed.startsWith("# ")) {
        elements.push(
          <h1 key={`h1-${idx}`} className="text-base sm:text-lg font-bold text-text-primary mt-2 mb-1">
            {trimmed.replace("# ", "")}
          </h1>
        );
        return;
      }

      if (trimmed.startsWith("## ")) {
        elements.push(
          <h2 key={`h2-${idx}`} className="text-sm sm:text-base font-bold text-text-primary mt-2 mb-1">
            {trimmed.replace("## ", "")}
          </h2>
        );
        return;
      }

      if (trimmed.startsWith("### ")) {
        elements.push(
          <h3 key={`h3-${idx}`} className="text-xs sm:text-sm font-bold text-focus mt-2 mb-1">
            {trimmed.replace("### ", "")}
          </h3>
        );
        return;
      }

      if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("* ")) {
        const itemText = trimmed.replace(/^[-**]\s+/, "");
        elements.push(
          <div key={`li-${idx}`} className="flex items-start gap-2 text-xs text-text-primary pl-2 py-0.5 leading-relaxed">
            <span className="text-focus mt-0.5 shrink-0 font-bold">*</span>
            <div className="flex-1">{formatInline(itemText)}</div>
          </div>
        );
        return;
      }

      if (trimmed.startsWith("> ")) {
        elements.push(
          <blockquote
            key={`quote-${idx}`}
            className="pl-3 py-1 my-1 border-l-2 border-focus/50 text-xs text-text-secondary italic"
          >
            {trimmed.replace("> ", "")}
          </blockquote>
        );
        return;
      }

      elements.push(
        <p key={`p-${idx}`} className="text-xs text-text-primary leading-relaxed">
          {formatInline(line)}
        </p>
      );
    });

    return elements;
  };

  const formatInline = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-bold text-text-primary">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-surface border border-border text-focus font-mono text-[11px]">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-4 text-text-primary">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl border border-border bg-surface shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-focus/15 border border-focus/30 text-focus flex items-center justify-center shadow-lg shadow-focus/20 shrink-0">
            <Note className="w-6 h-6" weight="fill" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary flex items-center gap-2">
              Study Notes & Learning Scratchpad
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              All notes and code snippets saved from the <strong>Markdown Notes</strong> canvas sync here automatically.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCreatingNew(true)}
            className="px-3.5 py-2 rounded-xl bg-focus hover:bg-focus/90 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-focus/25 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" weight="bold" />
            <span>New Note</span>
          </button>

          <button
            type="button"
            onClick={handleExportAll}
            className="px-3.5 py-2 rounded-xl bg-paper hover:bg-border border border-border text-text-primary text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Export all notes to a markdown document"
          >
            <DownloadSimple className="w-3.5 h-3.5" />
            <span>Export (.md)</span>
          </button>

          <Link
            href="/roadmap"
            className="px-3.5 py-2 rounded-xl bg-paper hover:bg-border border border-border text-text-primary text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <GameController className="w-3.5 h-3.5" weight="fill" />
            <span>DAG Map</span>
          </Link>
        </div>
      </div>

      {/* Search & Level Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center relative w-full sm:max-w-md">
          <MagnifyingGlass className="absolute left-3.5 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search note contents, code snippets, topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-border text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-focus/50 transition-all shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 text-text-secondary hover:text-text-primary text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <select
            value={selectedLevelId}
            onChange={(e) => setSelectedLevelId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-focus/50 cursor-pointer shadow-sm font-medium"
          >
            <option value="all">All Learning Levels</option>
            {notes.map((n) => (
              <option key={n.levelId} value={n.levelId}>
                Level {n.displayLevel}: {n.title}
              </option>
            ))}
          </select>

          <span className="text-xs text-text-secondary font-mono bg-surface px-3 py-2 rounded-xl border border-border shadow-sm">
            {filteredNotes.length} {filteredNotes.length === 1 ? "Note" : "Notes"}
          </span>
        </div>
      </div>

      {/* Create New Note Modal/Card */}
      {isCreatingNew && (
        <div className="p-5 sm:p-6 rounded-3xl border border-focus/40 bg-surface shadow-2xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Sparkle className="w-4 h-4 text-focus" weight="fill" />
              <span>Create New Study Note</span>
            </h3>
            <button
              onClick={() => setIsCreatingNew(false)}
              className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-border transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            type="text"
            placeholder="Note Title (e.g., Advanced SQL Window Functions & CTEs)..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-paper border border-border text-xs sm:text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-focus/50"
          />

          <textarea
            rows={6}
            placeholder="Write markdown notes, code blocks (```python ... ```), insights..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full p-3.5 rounded-xl bg-paper border border-border text-xs sm:text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-focus/50 font-mono leading-relaxed resize-y"
          />

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-text-secondary hover:bg-border transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateNew}
              className="px-4 py-2 rounded-xl bg-focus hover:bg-focus/90 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-focus/25 cursor-pointer"
            >
              <FloppyDisk className="w-4 h-4" />
              <span>Save Note</span>
            </button>
          </div>
        </div>
      )}

      {/* Edit In-Place Modal */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl p-6 rounded-3xl bg-surface border border-border shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold text-focus">
                  Editing Level {editingNote.displayLevel} Note
                </span>
                <h3 className="text-base font-bold text-text-primary">{editingNote.title}</h3>
              </div>
              <button
                onClick={() => setEditingNote(null)}
                className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-border transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="flex-1 min-h-[300px] w-full p-4 rounded-2xl bg-paper border border-border text-xs sm:text-sm text-text-primary focus:outline-none focus:border-focus/50 font-mono leading-relaxed resize-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setEditingNote(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-border transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl bg-focus hover:bg-focus/90 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-focus/25 cursor-pointer"
              >
                <FloppyDisk className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Grid / List */}
      <div className="space-y-4">
        {filteredNotes.map((item) => (
          <div
            key={item.levelId}
            className="p-6 rounded-3xl border border-border bg-surface hover:border-focus/50 transition-all flex flex-col gap-3 group shadow-lg"
          >
            {/* Note Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/60">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-focus/10 text-focus border border-focus/20">
                  LEVEL {item.displayLevel}
                </span>
                <h2 className="text-sm sm:text-base font-bold text-text-primary">{item.title}</h2>
                <span className="text-[11px] text-text-secondary font-mono">
                  * {item.skillName} (Week {item.targetWeek})
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleCopy(item.levelId, item.content)}
                  className="p-2 rounded-xl hover:bg-paper text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 text-xs cursor-pointer"
                  title="Copy raw Markdown"
                >
                  {copiedId === item.levelId ? (
                    <Check className="w-4 h-4 text-signal" weight="bold" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">
                    {copiedId === item.levelId ? "Copied" : "Copy"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingNote(item);
                    setEditContent(item.content);
                  }}
                  className="p-2 rounded-xl hover:bg-paper text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 text-xs cursor-pointer"
                  title="Quick Edit Note"
                >
                  <PencilSimple className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit</span>
                </button>

                {item.levelId.startsWith("lvl-") && (
                  <Link
                    href={`/learn/${item.levelId}`}
                    className="p-2 rounded-xl bg-focus/10 hover:bg-focus/20 text-focus transition-colors flex items-center gap-1 text-xs font-bold"
                    title="Open in split-screen learning canvas"
                  >
                    <span>Canvas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => handleDelete(item.levelId)}
                  className="p-2 rounded-xl hover:bg-alert/10 text-text-secondary hover:text-alert transition-colors cursor-pointer"
                  title="Clear note"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Rendered Note Markdown Body */}
            <div className="p-4 sm:p-5 rounded-2xl bg-paper/80 border border-border text-xs sm:text-sm text-text-primary leading-relaxed space-y-1.5 max-h-96 overflow-y-auto">
              {renderMarkdown(item.content)}
            </div>
          </div>
        ))}

        {filteredNotes.length === 0 && (
          <div className="p-12 rounded-3xl border border-border bg-surface/50 text-center space-y-3 shadow-sm">
            <Note className="w-12 h-12 text-text-secondary mx-auto" />
            <h3 className="text-base font-bold text-text-primary">No Study Notes Found</h3>
            <p className="text-xs text-text-secondary max-w-md mx-auto">
              Write notes in the <strong>Markdown Notes</strong> editor while watching lectures in the Learning Canvas (<code className="px-1.5 py-0.5 bg-paper rounded border border-border">/learn/[stepId]</code>), or click <strong>&quot;New Note&quot;</strong> above to create one now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
