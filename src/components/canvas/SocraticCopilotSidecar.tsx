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
  level: LevelNode;
  onSeekRequested?: (seconds: number) => void;
  onInsertToNotes?: (snippet: string) => void;
  groqApiKey?: string;
}

const QUICK_PROMPTS = [
  "Summarize the core takeaways of this lecture",
  "Explain the key architectural trade-offs",
  "Give me a 2-minute hands-on practice challenge",
];

export function SocraticCopilotSidecar({
  level,
  onSeekRequested,
  onInsertToNotes,
  groqApiKey,
}: SocraticCopilotSidecarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init-1",
      sender: "copilot",
      content: `Hello! I'm your 24/7 **AI Learning Copilot** for **${level.title}**.\n\nAsk me any question about this lecture, request code clarifications, or click the quick action chips below. I can also seek the video to relevant timestamps like [Jump to 02:30].`,
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Parse [Jump to MM:SS] timestamps in text and render clickable seek buttons
  const renderMessageContent = (text: string) => {
    // Extract code blocks if any
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
      <div className="flex flex-col gap-2.5">
        {parts.map((p, idx) => {
          if (p.type === "code" && p.code) {
            return (
              <div key={idx} className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-950/90 overflow-hidden my-1">
                <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[11px] text-zinc-400 font-mono">
                  <span>{p.lang}</span>
                  <button
                    type="button"
                    onClick={() => onInsertToNotes?.(`\`\`\`${p.lang}\n${p.code}\n\`\`\``)}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                  >
                    <ClipboardText className="w-3.5 h-3.5" />
                    <span>Insert to Notes</span>
                  </button>
                </div>
                <pre className="p-3 text-xs text-zinc-100 font-mono overflow-x-auto whitespace-pre-wrap">
                  {p.code}
                </pre>
              </div>
            );
          }

          const rawText = p.content || "";
          const timestampRegex = /\[(?:Jump to|Seek to|timestamp:?)\s*(\d{1,2}):(\d{2})\]/gi;
          const textParts = [];
          let tLastIndex = 0;
          let tMatch;

          while ((tMatch = timestampRegex.exec(rawText)) !== null) {
            if (tMatch.index > tLastIndex) {
              textParts.push(rawText.substring(tLastIndex, tMatch.index));
            }
            const mins = parseInt(tMatch[1], 10);
            const secs = parseInt(tMatch[2], 10);
            const totalSecs = mins * 60 + secs;

            textParts.push(
              <button
                key={`${tMatch.index}-${totalSecs}`}
                type="button"
                onClick={() => onSeekRequested?.(totalSecs)}
                className="inline-flex items-center gap-1 px-2 py-0.5 my-0.5 mx-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                <FastForward className="w-3 h-3" />
                <span>Jump to {tMatch[1]}:{tMatch[2]}</span>
              </button>
            );
            tLastIndex = tMatch.index + tMatch[0].length;
          }
          if (tLastIndex < rawText.length) {
            textParts.push(rawText.substring(tLastIndex));
          }

          return (
            <p key={idx} className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap">
              {textParts}
            </p>
          );
        })}
      </div>
    );
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
              content: `You are CogniPath Socratic AI Copilot for level "${level.title}" (${level.skillName}).
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
            id: level.levelNumber,
            topic: level.title,
            pattern: level.skillName,
          },
        }),
      });

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let aiContent = "";

        const botMsgId = `bot-${Date.now()}`;
        setMessages((prev) => [
          ...prev,
          { id: botMsgId, sender: "copilot", content: "", timestamp: "Just now" },
        ]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });

          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "").trim();
              if (dataStr === "[DONE]") break;
              try {
                const parsed = JSON.parse(dataStr);
                const delta = parsed.choices?.[0]?.delta?.content || "";
                aiContent += delta;
                setMessages((prev) =>
                  prev.map((m) => (m.id === botMsgId ? { ...m, content: aiContent } : m))
                );
              } catch {}
            } else if (line.trim() && !line.startsWith("event:")) {
              aiContent += line;
              setMessages((prev) =>
                prev.map((m) => (m.id === botMsgId ? { ...m, content: aiContent } : m))
              );
            }
          }
        }
      } else {
        setTimeout(() => {
          const mockAiResponse = `Here is the Socratic breakdown for **${level.title}**:\n\n1. **Core Concept**: Focus on understanding how this directly bridges your target skill gap.\n2. **Video Timestamp**: Review the core syntax around [Jump to 05:45] and the hands-on implementation at [Jump to 12:20].\n\n\`\`\`${level.skillName.toLowerCase().includes("sql") ? "sql" : "python"}\n-- Example implementation\nSELECT category, AVG(sales) AS avg_sales\nFROM transactions\nGROUP BY category\nHAVING AVG(sales) > 500;\n\`\`\`\n\nClick **"Insert to Notes"** to paste this directly into your study scratchpad!`;

          setMessages((prev) => [
            ...prev,
            {
              id: `bot-${Date.now()}`,
              sender: "copilot",
              content: mockAiResponse,
              timestamp: "Just now",
            },
          ]);
        }, 600);
      }
    } catch (e) {
      console.error("Copilot request error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Sparkle className="w-4 h-4" weight="fill" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
              24/7 Socratic AI Copilot
            </h4>
            <span className="text-[10px] text-zinc-400">Context: {level.skillName}</span>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 min-h-[300px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                msg.sender === "user"
                  ? "bg-zinc-700 text-zinc-200"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              {msg.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Robot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-emerald-500 text-zinc-950 font-medium rounded-tr-sm"
                  : "bg-zinc-950 border border-zinc-800/90 text-zinc-200 rounded-tl-sm shadow-md"
              }`}
            >
              {msg.sender === "user" ? msg.content : renderMessageContent(msg.content)}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-400 w-fit">
            <SpinnerGap className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Copilot is reasoning...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-t border-zinc-800/60 bg-zinc-950/40 overflow-x-auto">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            className="text-[10px] font-medium text-zinc-300 hover:text-emerald-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer flex-shrink-0"
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
        className="flex items-center gap-2 p-3 border-t border-zinc-800 bg-zinc-950/90"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Copilot (e.g. Explain DAX syntax at 10:20)..."
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 disabled:opacity-40 transition-colors cursor-pointer"
        >
          <PaperPlaneRight className="w-4 h-4" weight="fill" />
        </button>
      </form>
    </div>
  );
}
