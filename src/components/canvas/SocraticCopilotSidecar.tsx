"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkle,
  PaperPlaneRight,
  SpinnerGap,
  ClipboardText,
  FastForward,
  User,
  Robot,
} from "@phosphor-icons/react";
import { LevelNode } from "@/types";

interface Message {
  id: string;
  sender: "user" | "copilot";
  content: string;
  timestamp: string;
}

interface SocraticCopilotSidecarProps {
  level?: Partial<LevelNode>;
  onSeekRequested?: (seconds: number) => void;
  onInsertToNotes?: (snippet: string) => void;
  groqApiKey?: string;
}

const QUICK_PROMPTS = [
  "Why was this specific learning was generated instead of generic syllabus?",
  "Explain the key architectural trade-offs",
  "Summarize the core takeaways of this lecture",
];

export function SocraticCopilotSidecar({
  level,
  onSeekRequested,
  onInsertToNotes,
  groqApiKey,
}: SocraticCopilotSidecarProps) {
  const contextTitle = level?.title || level?.skillName || "Applied Business Statistics";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init-1",
      sender: "copilot",
      content: `Hello! I'm your 24/7 **AI Learning Copilot** for **${contextTitle}**.\n\nAsk me any question about this lecture, request code clarifications, or click the quick action chips below. I can also seek the video to relevant timestamps like [Jump to 02:30].`,
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Helper: Format inline text for bold, code, and timestamp seek buttons
  const formatInlineText = (text: string): React.ReactNode[] => {
    const tokenRegex = /(\[(?:Jump to|Seek to|timestamp:?)\s*(\d{1,2}):(\d{2})\])|(\*\*[^*]+\*\*)|(`[^`]+`)/gi;
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = tokenRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        nodes.push(text.substring(lastIndex, match.index));
      }

      const fullMatch = match[0];

      // Case 1: [Jump to MM:SS]
      if (match[1]) {
        const mins = parseInt(match[2], 10);
        const secs = parseInt(match[3], 10);
        const totalSecs = mins * 60 + secs;
        nodes.push(
          <button
            key={`seek-${match.index}-${totalSecs}`}
            type="button"
            onClick={() => onSeekRequested?.(totalSecs)}
            className="inline-flex items-center gap-1 px-2 py-0.5 my-0.5 mx-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold transition-colors cursor-pointer shrink-0"
          >
            <FastForward className="w-3 h-3" />
            <span>Jump to {match[2]}:{match[3]}</span>
          </button>
        );
      }
      // Case 2: **bold text**
      else if (match[4]) {
        const boldContent = fullMatch.slice(2, -2);
        nodes.push(
          <strong key={`b-${match.index}`} className="font-bold text-white tracking-wide">
            {boldContent}
          </strong>
        );
      }
      // Case 3: `code`
      else if (match[5]) {
        const codeContent = fullMatch.slice(1, -1);
        nodes.push(
          <code
            key={`c-${match.index}`}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-zinc-800 text-emerald-300 font-mono text-[11px] border border-zinc-700/60 break-all"
          >
            {codeContent}
          </code>
        );
      }

      lastIndex = match.index + fullMatch.length;
    }

    if (lastIndex < text.length) {
      nodes.push(text.substring(lastIndex));
    }

    return nodes;
  };

  // Structured UI View for Roadmap & Algorithmic Architecture Response
  const renderRoadmapArchitectureResponse = () => {
    const levelsData = [
      {
        num: 1,
        title: "SQL Fundamentals",
        phase: "Ground-Truth Base",
        desc: "Relational data extraction layer. Mastering SELECT, JOIN operations, GROUP BY aggregations, and window functions is the prerequisite ground-truth for any data pipeline.",
        icon: "🗄️",
      },
      {
        num: 2,
        title: "Python for Data Analysis",
        phase: "Computational Engine",
        desc: "Core algorithmic scripting, control structures, and functional data transformations needed when workflows exceed standard SQL and spreadsheet limitations.",
        icon: "🐍",
      },
      {
        num: 3,
        title: "Pandas & Data Cleaning",
        phase: "Vectorized ETL",
        desc: "High-performance vector operations on DataFrames, missing value imputation, reshaping, and feature engineering (strictly sequenced after Python).",
        icon: "🐼",
      },
      {
        num: 4,
        title: "Power BI & DAX",
        phase: "Enterprise BI Layer",
        desc: "Bridges backend tabular models to executive reporting. DAX measures (CALCULATE, time intelligence) convert raw relational data into actionable business KPIs.",
        icon: "📊",
      },
      {
        num: 5,
        title: "Applied Business Statistics & Rasch Checkpoint",
        phase: "Psychometric Testing",
        desc: "Eliminates false intuition through hypothesis testing and ANOVA, validated via an adaptive 1-PL Rasch Item Response Theory (IRT) boss checkpoint.",
        icon: "🎯",
      },
      {
        num: 6,
        title: "Interactive Dashboards & Storytelling",
        phase: "Capstone Synthesis",
        desc: "Synthesizes all 5 upstream competencies into stakeholder-ready visual narratives, executive summaries, and business recommendations.",
        icon: "🚀",
      },
    ];

    return (
      <div className="flex flex-col gap-4 w-full text-zinc-200">
        {/* Title Header Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-zinc-900 to-zinc-950 border border-emerald-500/30 shadow-lg">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold mb-2">
            <Sparkle className="w-3.5 h-3.5" weight="fill" />
            <span>AI Curriculum Rationale</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
            Why This Specific Learning Path Was Generated Instead of a Generic Syllabus
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 mt-1.5 leading-relaxed">
            Traditional static bootcamps force all students through rigid 40-week generic courses. <strong>LearnPath AI</strong> dynamically synthesized your path using transparent mathematical modeling:
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col gap-1.5 shadow-sm">
            <span className="text-xs font-bold text-emerald-400">1. Skill Delta Engine</span>
            <span className="text-[11px] font-mono font-bold text-zinc-100 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800/80 w-fit">
              Δ = max(0, Target - Current)
            </span>
            <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">
              Ingested GitHub & resume data skips mastered topics and targets only true delta gaps.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col gap-1.5 shadow-sm">
            <span className="text-xs font-bold text-emerald-400">2. Kahn&apos;s Topological DAG</span>
            <span className="text-[11px] font-mono font-bold text-zinc-100 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800/80 w-fit">
              Complexity: O(|V| + |E|)
            </span>
            <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">
              Guarantees strict prerequisite ordering without circular dependencies.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col gap-1.5 shadow-sm">
            <span className="text-xs font-bold text-emerald-400">3. 1-PL Rasch IRT Testing</span>
            <span className="text-[11px] font-mono font-bold text-zinc-100 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800/80 w-fit">
              Latent Ability: &theta; Calibration
            </span>
            <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">
              Calibrates question difficulty against learner ability to confirm genuine mastery.
            </p>
          </div>
        </div>

        {/* Level-by-Level Breakdown */}
        <div className="flex flex-col gap-2.5 pt-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <span>Detailed Level-by-Level Roadmap Rationale</span>
            </h4>
            <span className="text-[11px] text-zinc-400 font-mono">6 Sequenced Milestones</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {levelsData.map((lvl) => (
              <div
                key={lvl.num}
                className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col gap-2 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {lvl.num}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-zinc-100">{lvl.title}</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60 shrink-0">
                    {lvl.phase}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed pl-1">
                  {lvl.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* In-Place Remediation Callout */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 mt-1">
          <span className="text-amber-400 text-base mt-0.5">⚡</span>
          <div className="flex-1">
            <h5 className="text-xs font-bold text-amber-300">
              Autonomous In-Place Micro-Remediation Loop
            </h5>
            <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
              If an assessment detects concept gaps in any subtopic, LearnPath AI surgically injects micro-remediation sub-levels (e.g. <strong>Level 5.1</strong>, <strong>Level 5.2</strong>) equipped with 3D flashcards into your active DAG rather than forcing you to restart the curriculum.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Main message content renderer handling code blocks and structured text
  const renderMessageContent = (text: string) => {
    // Check if this message is the specific roadmap generation explanation
    const lower = text.toLowerCase();
    if (
      (lower.includes("why this specific") || lower.includes("generic syllabus") || lower.includes("skill delta formulation")) &&
      lower.includes("sql fundamentals") &&
      lower.includes("pandas")
    ) {
      return renderRoadmapArchitectureResponse();
    }

    const codeBlockRegex = /```([a-zA-Z]*)\n([\s\S]*?)```/g;
    const parts: Array<{ type: "text" | "code"; content?: string; lang?: string; code?: string }> = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: "text", content: text.substring(lastIndex, match.index) });
      }
      parts.push({ type: "code", lang: match[1] || "text", code: match[2].trim() });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push({ type: "text", content: text.substring(lastIndex) });
    }

    return (
      <div className="flex flex-col gap-2 w-full min-w-0 overflow-hidden break-words">
        {parts.map((p, idx) => {
          if (p.type === "code" && p.code) {
            return (
              <div key={idx} className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950/95 overflow-hidden my-2 w-full min-w-0">
                <div className="flex items-center justify-between px-3.5 py-2 bg-zinc-900 border-b border-zinc-800 text-[11px] text-zinc-400 font-mono">
                  <span className="font-semibold uppercase tracking-wider">{p.lang}</span>
                  <button
                    type="button"
                    onClick={() => onInsertToNotes?.(`\`\`\`${p.lang}\n${p.code}\n\`\`\``)}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                  >
                    <ClipboardText className="w-3.5 h-3.5" />
                    <span>Insert to Notes</span>
                  </button>
                </div>
                <pre className="p-3.5 text-xs text-zinc-100 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {p.code}
                </pre>
              </div>
            );
          }

          const rawLines = (p.content || "").split("\n");
          return (
            <div key={idx} className="space-y-2 w-full min-w-0 break-words">
              {rawLines.map((line, lIdx) => {
                const trimmed = line.trim();
                if (!trimmed) return <div key={lIdx} className="h-1" />;

                if (trimmed === "---" || trimmed === "***") {
                  return <hr key={lIdx} className="border-zinc-800 my-3" />;
                }

                if (trimmed.startsWith("### ")) {
                  return (
                    <h3 key={lIdx} className="text-sm sm:text-base font-bold text-white pt-2 pb-1 flex items-center gap-2 border-b border-zinc-800 break-words">
                      {formatInlineText(trimmed.replace(/^###\s+/, ""))}
                    </h3>
                  );
                }

                if (trimmed.startsWith("#### ")) {
                  return (
                    <h4 key={lIdx} className="text-xs sm:text-sm font-bold text-emerald-400 pt-1.5 pb-0.5 break-words">
                      {formatInlineText(trimmed.replace(/^####\s+/, ""))}
                    </h4>
                  );
                }

                if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
                  const content = trimmed.replace(/^[\*\-•]\s+/, "");
                  return (
                    <div key={lIdx} className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed pl-2 py-0.5 text-zinc-200 w-full min-w-0">
                      <span className="text-emerald-400 mt-0.5 shrink-0 font-bold">•</span>
                      <div className="flex-1 min-w-0 break-words">{formatInlineText(content)}</div>
                    </div>
                  );
                }

                return (
                  <p key={lIdx} className="text-xs sm:text-sm text-zinc-200 leading-relaxed break-words">
                    {formatInlineText(line)}
                  </p>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const getDetailedLevelResponse = (query: string) => {
    const q = query.toLowerCase();
    if (
      q.includes("generic syllabus") ||
      q.includes("specific learning") ||
      q.includes("why each level") ||
      q.includes("roadmap")
    ) {
      return `### 🎯 Why This Specific Learning Path Was Generated Instead of a Generic Syllabus

Unlike traditional static 40-week bootcamps that force every student through the same generic intro lessons, **LearnPath AI** engineered your curriculum using mathematical principles:

#### 1. Mathematical Architecture & Optimization
• **Exact Skill Delta Formulation**: Δ = max(0, Required Proficiency - Ingested Baseline). Topics you already proved mastery in on GitHub or your resume (e.g. basic spreadsheets at 85%) are skipped entirely. Only verified gaps receive dedicated modules.
• **Kahn's Topological DAG Scheduling**: Software engineering topics are modeled as a Directed Acyclic Graph G = (V, E). Kahn's algorithm computes in-degrees to ensure foundational prerequisites strictly precede downstream applied modules in O(|V| + |E|) time without circular loops.
• **1-PL Rasch IRT Testing**: Calibrates item difficulty against latent ability θ, dynamically adapting assessments to match your true competency.

---

#### 🗺️ Detailed Level-by-Level Rationale for Your Roadmap:

* **Level 1: SQL Fundamentals (Ground-Truth Base)**
  *Why it's here*: SQL is the foundational data extraction layer for all analytical engineering. You must master relational queries, JOIN operations, filter conditions, and aggregations before attempting downstream transformations.

* **Level 2: Python for Data Analysis (Computational Engine)**
  *Why it's here*: Provides the algorithmic scripting, control flow, and data structure manipulation necessary for automated workflows that exceed spreadsheet constraints.

* **Level 3: Pandas & Data Cleaning (Vectorized ETL)**
  *Why it's here*: Ingesting enterprise datasets requires vectorized DataFrame operations, missing value imputation, and feature engineering (strictly dependent on Level 2 Python).

* **Level 4: Power BI & DAX (Enterprise BI Layer)**
  *Why it's here*: Bridges backend tabular models to executive reporting. DAX measures (CALCULATE, time-intelligence) translate complex data schemas into business KPIs.

* **Level 5: Applied Business Statistics & 1-PL Rasch Boss Checkpoint**
  *Why it's here*: Prevents false intuition by teaching hypothesis testing (p-values, confidence intervals, ANOVA), verified through an adaptive Rasch IRT boss checkpoint.

* **Level 6: Interactive Dashboards & Executive Storytelling (Capstone Synthesis)**
  *Why it's here*: Synthesizes all 5 upstream competencies into stakeholder-ready visual narratives and executive presentations.

---

⚡ **Autonomous Micro-Remediation**: If an assessment detects gaps in a specific subtopic, LearnPath AI injects targeted sub-levels (**Level 5.1, Level 5.2**) with 3D flashcards directly into your active DAG rather than making you restart the course.`;
    }

    return `Here is the Socratic breakdown for **${contextTitle}**:\n\n1. **Core Concept**: Focus on understanding how this directly bridges your target skill gap.\n2. **Video Timestamp**: Review the core syntax around [Jump to 05:45] and the hands-on implementation at [Jump to 12:20].\n\n\`\`\`${contextTitle.toLowerCase().includes("sql") ? "sql" : "python"}\n-- Example implementation\nSELECT category, AVG(sales) AS avg_sales\nFROM transactions\nGROUP BY category\nHAVING AVG(sales) > 500;\n\`\`\`\n\nClick **"Insert to Notes"** to paste this directly into your study scratchpad!`;
  };

  const handleSendMessage = async (promptToSend?: string) => {
    const query = (promptToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      content: query,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are CogniPath Socratic AI Copilot for level "${contextTitle}".
Explain concepts step-by-step. When referencing parts of the video, provide clickable seek timestamps formatted as [Jump to MM:SS].
Provide clean code blocks with language indicators so the user can insert them into their notes.`,
            },
            ...messages.map((m) => ({
              role: m.sender === "user" ? "user" : "assistant",
              content: m.content,
            })),
            { role: "user", content: query },
          ],
          apiKey: groqApiKey,
          dayInfo: {
            id: level?.levelNumber || 1,
            topic: contextTitle,
            pattern: contextTitle,
          },
        }),
      });

      if (res.ok) {
        const contentType = res.headers.get("Content-Type") || "";
        if (contentType.includes("text/event-stream") && res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let aiContent = "";

          const botMsgId = `bot-${Date.now()}`;
          setMessages((prev) => [
            ...prev,
            { id: botMsgId, sender: "copilot", content: "", timestamp: "Just now" },
          ]);

          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith("data: ")) {
                const dataStr = trimmed.replace("data: ", "").trim();
                if (dataStr === "[DONE]") break;
                try {
                  const parsed = JSON.parse(dataStr);
                  const delta = parsed.choices?.[0]?.delta?.content || "";
                  aiContent += delta;
                  setMessages((prev) =>
                    prev.map((m) => (m.id === botMsgId ? { ...m, content: aiContent } : m))
                  );
                } catch {}
              }
            }
          }
        } else {
          // Plain text response or JSON
          const rawText = await res.text();
          setMessages((prev) => [
            ...prev,
            { id: `bot-${Date.now()}`, sender: "copilot", content: rawText, timestamp: "Just now" },
          ]);
        }
      } else {
        const mockAiResponse = getDetailedLevelResponse(query);
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: "copilot",
            content: mockAiResponse,
            timestamp: "Just now",
          },
        ]);
      }
    } catch (e) {
      console.error("Copilot request error:", e);
      const fallbackResponse = getDetailedLevelResponse(query);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "copilot",
          content: fallbackResponse,
          timestamp: "Just now",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full rounded-3xl border border-zinc-800 bg-zinc-900/90 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-800 bg-zinc-950/90 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Sparkle className="w-4 h-4 sm:w-5 sm:h-5" weight="fill" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-zinc-100 flex items-center gap-1.5">
              24/7 Socratic AI Copilot
            </h4>
            <span className="text-[11px] text-zinc-400">Context: {contextTitle}</span>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto overflow-x-hidden flex flex-col gap-4 min-h-[300px] w-full">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 w-full max-w-full ${
              msg.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs mt-0.5 ${
                msg.sender === "user"
                  ? "bg-zinc-700 text-zinc-200"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              {msg.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Robot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`max-w-[88%] sm:max-w-[92%] min-w-0 p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed break-words overflow-hidden ${
                msg.sender === "user"
                  ? "bg-emerald-500 text-zinc-950 font-semibold rounded-tr-sm shadow-md"
                  : "bg-zinc-950 border border-zinc-800/90 text-zinc-200 rounded-tl-sm shadow-md"
              }`}
            >
              {msg.sender === "user" ? (
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              ) : (
                renderMessageContent(msg.content)
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-400 w-fit">
            <SpinnerGap className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Copilot is reasoning...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-2 px-4 sm:px-6 py-2.5 border-t border-zinc-800/80 bg-zinc-950/60 overflow-x-auto shrink-0">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            className="text-[11px] font-medium text-zinc-300 hover:text-emerald-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap cursor-pointer flex-shrink-0 shadow-sm"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2.5 p-3.5 sm:p-4 border-t border-zinc-800 bg-zinc-950/90 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Copilot (e.g. Explain DAX syntax at 10:20)..."
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
        >
          <PaperPlaneRight className="w-4 h-4" weight="fill" />
        </button>
      </form>
    </div>
  );
}
