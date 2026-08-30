"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  TextB,
  TextItalic,
  Code,
  ListBullets,
  Quotes,
  Eye,
  PencilSimple,
  FloppyDisk,
  CheckCircle,
} from "@phosphor-icons/react";
import { mockStore } from "@/lib/services/mockStore";

interface MarkdownNotesEditorProps {
  levelId: string;
  onContentChange?: (content: string) => void;
  injectedSnippet?: string | null;
}

export function MarkdownNotesEditor({
  levelId,
  onContentChange,
  injectedSnippet,
}: MarkdownNotesEditorProps) {
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isSaved, setIsSaved] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing note on mount
  useEffect(() => {
    const saved = mockStore.getNote(levelId);
    if (saved && saved.trim() !== "") {
      setContent(saved);
    } else {
      const initialTemplate = `# Study Notes  -  Level ${levelId}\n\n- Key concepts learned:\n- Practical code patterns:\n`;
      setContent(initialTemplate);
      mockStore.saveNote(levelId, initialTemplate);
    }
  }, [levelId]);

  // Handle injected code snippets from AI Copilot
  useEffect(() => {
    if (injectedSnippet) {
      setContent((prev) => {
        const updated = `${prev.trim()}\n\n${injectedSnippet}\n`;
        mockStore.saveNote(levelId, updated);
        onContentChange?.(updated);
        return updated;
      });
      setIsSaved(true);
      setActiveTab("write");
    }
  }, [injectedSnippet, levelId, onContentChange]);

  // Debounced auto-save
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setIsSaved(false);
    onContentChange?.(newContent);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      mockStore.saveNote(levelId, newContent);
      setIsSaved(true);
    }, 800);
  };

  // Formatting helpers
  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${prefix}${selected || "text"}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    mockStore.saveNote(levelId, newContent);
    onContentChange?.(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
    }, 50);
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-xl">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-950/80">
        <div className="flex items-center gap-1">
          {/* Tab Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-zinc-900 border border-zinc-800 mr-2">
            <button
              type="button"
              onClick={() => setActiveTab("write")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "write"
                  ? "bg-focus text-zinc-950 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <PencilSimple className="w-3.5 h-3.5" />
              <span>Write</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "preview"
                  ? "bg-focus text-zinc-950 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          {/* Quick Format Tools */}
          {activeTab === "write" && (
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => insertFormatting("**", "**")}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Bold"
              >
                <TextB className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("*", "*")}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Italic"
              >
                <TextItalic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("```\n", "\n```")}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Code Block"
              >
                <Code className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("- ")}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Bullet List"
              >
                <ListBullets className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("> ")}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Quote"
              >
                <Quotes className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Save Status Indicator */}
        <div className="flex items-center gap-1.5 text-xs">
          {isSaved ? (
            <span className="text-focus flex items-center gap-1 text-[11px] font-medium">
              <CheckCircle className="w-3.5 h-3.5" weight="fill" />
              Auto-saved
            </span>
          ) : (
            <span className="text-amber-400 flex items-center gap-1 text-[11px] font-medium">
              <FloppyDisk className="w-3.5 h-3.5 animate-pulse" />
              Saving...
            </span>
          )}
        </div>
      </div>

      {/* Editor Content Body */}
      <div className="flex-1 p-4 overflow-y-auto min-h-[360px]">
        {activeTab === "write" ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextChange}
            placeholder="Write your study notes, insights, and code snippets here (Markdown supported)..."
            className="w-full h-full min-h-[340px] bg-transparent border-0 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none resize-none font-mono leading-relaxed"
          />
        ) : (
          <div className="prose prose-invert prose-emerald max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans text-zinc-200">
            {content || <span className="text-zinc-500 italic">No notes written yet.</span>}
          </div>
        )}
      </div>
    </div>
  );
}
