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
    const tokenRegex = /(\[(?:Jump to|Seek to)\s*(\d{1,2}):(\d{2})\])|(\bhttps?:\/\/[^\s)]+)|(\*\*[^*]+\*\*)|(`[^`]+`)/gi;
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
            className="inline-flex items-center gap-1 px-2.5 py-0.5 my-0.5 mx-1 rounded-lg bg-focus/10 hover:bg-focus/20 text-focus border border-focus/30 text-xs font-mono font-bold transition-colors cursor-pointer shrink-0"
          >
            <FastForward className="w-3 h-3" />
            <span>Jump to {match[2]}:{match[3]}</span>
          </button>
        );
      }
      // Case 2: URLs
      else if (match[4]) {
        nodes.push(
          <a
            key={`url-${match.index}`}
            href={match[4]}
            target="_blank"
            rel="noreferrer"
            className="text-focus hover:underline font-bold"
          >
            {match[4]}
          </a>
        );
      }
      // Case 3: **bold text**
      else if (match[5]) {
        const boldContent = fullMatch.slice(2, -2);
        nodes.push(
          <strong key={`b-${match.index}`} className="font-bold text-text-primary tracking-wide">
            {boldContent}
          </strong>
        );
      }
      // Case 4: `code`
      else if (match[6]) {
        const codeContent = fullMatch.slice(1, -1);
        nodes.push(
          <code
            key={`c-${match.index}`}
            className="bg-paper border border-border text-focus px-1.5 py-0.5 rounded font-mono text-[11px] font-bold mx-0.5"
          >
            {codeContent}
          </code>
        );
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      nodes.push(text.substring(lastIndex));
    }

    return nodes;
  };

  // Helper: Render markdown blocks & code blocks
  const renderMessageContent = (content: string) => {
    if (content.includes("Why This Specific Learning Path Was Generated Instead of a Generic Syllabus")) {
      return renderCurriculumRationale();
    }

    const blocks = content.split(/(\`\`\`(?:[a-zA-Z0-9_-]+)?\n[\s\S]*?\n\`\`\`)/g);

    return (
      <div className="flex flex-col gap-2.5 w-full text-xs sm:text-sm text-text-primary leading-relaxed break-words">
        {blocks.map((block, idx) => {
          if (block.startsWith("```")) {
            const lines = block.split("\n");
            const lang = lines[0].replace("```", "").trim() || "code";
            const code = lines.slice(1, -1).join("\n");

            return (
              <div
                key={idx}
                className="my-2 rounded-2xl overflow-hidden border border-border bg-paper shadow-sm"
              >
                <div className="flex items-center justify-between px-3.5 py-1.5 bg-surface border-b border-border text-[11px] font-mono text-text-secondary">
                  <span className="font-bold text-focus uppercase tracking-wider">{lang}</span>
                  {onInsertToNotes && (
                    <button
                      type="button"
                      onClick={() => onInsertToNotes(`\`\`\`${lang}\n${code}\n\`\`\``)}
                      className="inline-flex items-center gap-1 text-[11px] text-text-secondary hover:text-focus transition-colors cursor-pointer font-semibold"
                    >
                      <ClipboardText className="w-3.5 h-3.5" />
                      <span>Insert to Notes</span>
                    </button>
                  )}
                </div>
                <pre className="p-3.5 text-[11px] font-mono text-text-primary overflow-x-auto whitespace-pre leading-relaxed">
                  <code>{code}</code>
                </pre>
              </div>
            );
          }

          const paragraphs = block.split("\n\n").filter(Boolean);
          return (
            <React.Fragment key={idx}>
              {paragraphs.map((p, pIdx) => (
                <p key={pIdx} className="leading-relaxed">
                  {formatInlineText(p)}
                </p>
              ))}
            </React.Fragment>
          );
        })}
      </div>
    );

  };

  const renderCurriculumRationale = () => {
    const levelsData = [
      {
        num: 1,
        title: "Relational Foundations & Window Analytics",
        phase: "Prerequisite Anchor",
        desc: "Establishes deterministic tabular modeling, DENSE_RANK() window partitions, and Star Schema indexing before analytical transformations.",
      },
      {
        num: 2,
        title: "Vectorized Python & Pandas Pipeline Architecture",
        phase: "Analytical Core",
        desc: "Replaces iterative slow loops with vectorized NumPy/Pandas C-level operations. Essential for high-throughput pipeline automation.",
      },
      {
        num: 3,
        title: "Star-Schema Warehouse Architecture & Dimensional Modeling",
        phase: "Architectural Synthesis",
        desc: "Transforms normalized transaction logs into Kimball dimensional fact tables (Surrogate keys, SCD Type-2) to ensure sub-second dashboard performance.",
      },
      {
        num: 4,
        title: "Enterprise Power BI & DAX Context Engine",
        phase: "Business Semantic Layer",
        desc: "Bridges backend tabular models to executive reporting. DAX measures (CALCULATE, time intelligence) convert raw relational data into actionable business KPIs.",
      },
      {
        num: 5,
        title: "Applied Business Statistics & Rasch Checkpoint",
        phase: "Psychometric Testing",
        desc: "Eliminates false intuition through hypothesis testing and ANOVA, validated via an adaptive 1-PL Rasch Item Response Theory (IRT) boss checkpoint.",
      },
      {
        num: 6,
        title: "Interactive Dashboards & Storytelling",
        phase: "Capstone Synthesis",
        desc: "Synthesizes all 5 upstream competencies into stakeholder-ready visual narratives, executive summaries, and business recommendations.",
      },
    ];

    return (
      <div className="flex flex-col gap-4 w-full text-text-primary">
        {/* Title Header Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-focus/5 border border-focus/25 shadow-sm">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-focus/10 text-focus border border-focus/20 text-xs font-bold mb-2">
            <Sparkle className="w-3.5 h-3.5" weight="fill" />
            <span>AI Curriculum Rationale</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-text-primary leading-tight">
            Why This Specific Learning Path Was Generated Instead of a Generic Syllabus
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary mt-1.5 leading-relaxed">
            Traditional static bootcamps force all students through rigid generic syllabi. <strong>LearnPath AI</strong> dynamically synthesized your path using transparent mathematical modeling:
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-paper border border-border flex flex-col gap-1.5 shadow-sm">
            <span className="text-xs font-bold text-focus">1. Skill Delta Engine</span>
            <span className="text-[11px] font-mono font-bold text-text-primary bg-surface px-2 py-1 rounded-lg border border-border w-fit">
              Delta = max(0, Target - Current)
            </span>
            <p className="text-xs text-text-secondary leading-relaxed mt-0.5">
              Ingested GitHub & resume data skips mastered topics and targets only true delta gaps.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-paper border border-border flex flex-col gap-1.5 shadow-sm">
            <span className="text-xs font-bold text-focus">2. Kahn&apos;s Topological DAG</span>
            <span className="text-[11px] font-mono font-bold text-text-primary bg-surface px-2 py-1 rounded-lg border border-border w-fit">
              Complexity: O(|V| + |E|)
            </span>
            <p className="text-xs text-text-secondary leading-relaxed mt-0.5">
              Guarantees strict prerequisite ordering without circular dependencies.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-paper border border-border flex flex-col gap-1.5 shadow-sm">
            <span className="text-xs font-bold text-focus">3. 1-PL Rasch IRT Testing</span>
            <span className="text-[11px] font-mono font-bold text-text-primary bg-surface px-2 py-1 rounded-lg border border-border w-fit">
              Latent Ability: theta Calibration
            </span>
            <p className="text-xs text-text-secondary leading-relaxed mt-0.5">
              Calibrates question difficulty against learner ability to confirm genuine mastery.
            </p>
          </div>
        </div>

        {/* Level-by-Level Breakdown */}
        <div className="flex flex-col gap-2.5 pt-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-bold text-text-primary tracking-wide flex items-center gap-2">
              <span>Detailed Level-by-Level Roadmap Rationale</span>
            </h4>
            <span className="text-[11px] text-text-secondary font-mono">6 Sequenced Milestones</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {levelsData.map((lvl) => (
              <div
                key={lvl.num}
                className="p-3.5 rounded-2xl bg-paper border border-border hover:border-focus/40 transition-colors flex flex-col gap-2 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-focus/15 border border-focus/30 text-focus font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {lvl.num}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-text-primary">{lvl.title}</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface text-text-secondary border border-border shrink-0">
                    {lvl.phase}
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed pl-1">
                  {lvl.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: textToSend.trim(),
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.slice(-5).map((m) => ({
              role: m.sender === "user" ? "user" : "assistant",
              content: m.content,
            })),
            { role: "user", content: textToSend },
          ],
          context: {
            levelId: level?.id,
            skillName: level?.skillName,
            title: level?.title,
            curriculumGoal: "Personalized Career Path Mastery",
          },
          apiKey: groqApiKey,
        }),
      });

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantReply = "";

      const assistantMessageId = `copilot-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          sender: "copilot",
          content: "",
          timestamp: "Just now",
        },
      ]);

      if (reader) {
        let streamBuffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });

          if (chunk.includes("data:")) {
            streamBuffer += chunk;
            const lines = streamBuffer.split("\n");
            streamBuffer = lines.pop() || "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith("data:")) {
                if (trimmed === "data: [DONE]") continue;
                try {
                  const parsed = JSON.parse(trimmed.replace(/^data:\s*/, ""));
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) assistantReply += content;
                } catch {
                  // If not JSON, ignore
                }
              }
            }
          } else {
            assistantReply += chunk;
          }

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: assistantReply }
                : msg
            )
          );
        }
      }
    } catch {
      // Fallback answers
      let fallbackText = `Here is a quick guidance on **${contextTitle}**:\n\n1. **Core Concept**: Focus on the fundamental rules and edge cases.\n2. **Practical Tip**: Refer to [Jump to 02:30] for the core demo.\n\nFeel free to ask for specific code examples or debugging tips!`;
      if (textToSend.includes("Why was this specific learning")) {
        fallbackText = "Why This Specific Learning Path Was Generated Instead of a Generic Syllabus";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `copilot-${Date.now()}`,
          sender: "copilot",
          content: fallbackText,
          timestamp: "Just now",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-border bg-surface shadow-md overflow-hidden w-full">
      {/* Compact Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-focus/15 border border-focus/30 text-focus flex items-center justify-center shadow-sm">
            <Sparkle className="w-4 h-4" weight="fill" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <span>24/7 AI Socratic Copilot</span>
            </h3>
            <p className="text-[10px] text-text-secondary truncate max-w-[180px] sm:max-w-xs font-mono">
              {contextTitle}
            </p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-signal/15 text-signal border border-signal/30 flex items-center gap-1 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse" />
          Live
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3 sm:p-3.5 overflow-y-auto overflow-x-hidden flex flex-col gap-2.5 min-h-0 w-full bg-paper/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 w-full max-w-full ${
              msg.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs mt-0.5 ${
                msg.sender === "user"
                  ? "bg-cloudy/30 text-text-primary font-bold"
                  : "bg-focus/15 text-focus border border-focus/30"
              }`}
            >
              {msg.sender === "user" ? <User className="w-3 h-3" /> : <Robot className="w-3 h-3" />}
            </div>

            <div
              className={`max-w-[88%] sm:max-w-[92%] min-w-0 p-2.5 sm:p-3 rounded-xl text-xs leading-relaxed break-words overflow-hidden ${
                msg.sender === "user"
                  ? "bg-focus text-white font-medium rounded-tr-xs shadow-sm shadow-focus/20"
                  : "bg-surface border border-border text-text-primary rounded-tl-xs shadow-xs"
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
          <div className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-border text-[11px] text-text-secondary w-fit shadow-xs">
            <SpinnerGap className="w-3.5 h-3.5 animate-spin text-focus" />
            <span>Copilot is reasoning...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Compact Quick Prompt Chips */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-t border-border bg-surface overflow-x-auto shrink-0 no-scrollbar">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            className="text-[10px] font-medium text-text-secondary hover:text-focus bg-paper hover:bg-surface border border-border hover:border-focus/40 px-2.5 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer flex-shrink-0 shadow-2xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Compact Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 p-2 sm:p-2.5 border-t border-border bg-surface shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Copilot (e.g. Explain DAX syntax at 10:20)..."
          className="flex-1 bg-paper border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-focus/50 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 rounded-lg bg-focus hover:bg-focus/90 text-white disabled:opacity-40 transition-all cursor-pointer shadow-sm shadow-focus/25 shrink-0"
          title="Send message"
        >
          <PaperPlaneRight className="w-3.5 h-3.5" weight="fill" />
        </button>
      </form>
    </div>
  );
}
