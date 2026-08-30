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
    <div className="flex flex-col h-full rounded-3xl border border-border bg-surface overflow-hidden shadow-xl">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
        <div className="flex items-center gap-1">
          {/* Tab Switcher */}
          <div className="flex items-center p-0.5 rounded-xl bg-paper border border-border mr-2">
            <button
              type="button"
              onClick={() => setActiveTab("write")}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "write"
                  ? "bg-focus text-white shadow-sm shadow-focus/25"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <PencilSimple className="w-3.5 h-3.5" />
              <span>Write</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "preview"
                  ? "bg-focus text-white shadow-sm shadow-focus/25"
                  : "text-text-secondary hover:text-text-primary"
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
                className="p-1.5 rounded-lg hover:bg-paper text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                title="Bold"
              >
                <TextB className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("*", "*")}
                className="p-1.5 rounded-lg hover:bg-paper text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                title="Italic"
              >
                <TextItalic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("```\n", "\n```")}
                className="p-1.5 rounded-lg hover:bg-paper text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                title="Code Block"
              >
                <Code className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("- ")}
                className="p-1.5 rounded-lg hover:bg-paper text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                title="Bullet List"
              >
                <ListBullets className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("> ")}
                className="p-1.5 rounded-lg hover:bg-paper text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
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
            <span className="text-signal flex items-center gap-1 text-[11px] font-bold">
              <CheckCircle className="w-3.5 h-3.5" weight="fill" />
              Auto-saved
            </span>
          ) : (
            <span className="text-warning flex items-center gap-1 text-[11px] font-bold">
              <FloppyDisk className="w-3.5 h-3.5 animate-pulse" />
              Saving...
            </span>
          )}
        </div>
      </div>

      {/* Editor Content Body */}
      <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto min-h-0 bg-paper/30">
        {activeTab === "write" ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextChange}
            placeholder="Write your study notes, insights, and code snippets here (Markdown supported)..."
            className="w-full h-full min-h-[220px] bg-transparent border-0 text-xs sm:text-sm text-text-primary placeholder:text-text-secondary focus:outline-none resize-none font-mono leading-relaxed"
          />
        ) : (
          <div className="max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans text-text-primary">
            {content || <span className="text-text-secondary italic">No notes written yet.</span>}
          </div>
        )}
      </div>
    </div>
  );
}

