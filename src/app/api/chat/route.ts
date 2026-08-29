import { NextRequest } from "next/server";
import { getNextGroqApiKey, getNextGeminiApiKey } from "@/lib/services/aiKeys";
import { getGeminiModel } from "@/lib/services/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, dayInfo, apiKey: clientApiKey } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build level-aware system prompt
    const levelContext = dayInfo
      ? `The user is studying Level ${dayInfo.id}: "${dayInfo.topic}" (Skill Focus: ${dayInfo.pattern}).`
      : "";

    const systemPrompt = `You are CogniPath Socratic AI Copilot — an expert AI learning architect and 24/7 technical tutor.
Your job is to guide the user step-by-step through their personalized learning path.
${levelContext}

Pedagogical Rules:
1. When answering conceptual questions, explain step-by-step with clear reasoning and code snippets.
2. If explaining video timestamps, use clickable format like [Jump to MM:SS].
3. For code implementations, always provide full syntax with language tags (e.g. \`\`\`sql, \`\`\`python, \`\`\`tsx).
4. Encourage the user and keep explanations punchy and actionable.`;

    // ── 1. Try Groq (primary, streaming) ────────────────────────────────────
    const groqKey = await getNextGroqApiKey(clientApiKey);

    if (groqKey) {
      const formattedMessages = [
        { role: "system", content: systemPrompt },
        ...messages.filter((m: any) => m.role !== "system"),
      ];

      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: formattedMessages,
          temperature: 0.5,
          max_tokens: 1024,
          stream: true,
        }),
      });

      if (groqResponse.ok) {
        return new Response(groqResponse.body, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      }

      console.warn("[chat] Groq failed, falling back to Gemini.");
    }

    // ── 2. Gemini fallback (non-streaming, wrapped as SSE) ──────────────────
    const geminiKey = await getNextGeminiApiKey(clientApiKey);
    if (geminiKey) {
      try {
        const model = await getGeminiModel("gemini-1.5-flash", geminiKey);
        if (model) {
          const userMessages = messages.filter((m: any) => m.role !== "system");
          const history = userMessages.slice(0, -1).map((m: any) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          }));
          const lastMsg = userMessages[userMessages.length - 1];

          const chat = model.startChat({ systemInstruction: systemPrompt, history });
          const result = await chat.sendMessage(lastMsg?.content || "Hello");
          const responseText = result.response.text();

          // Wrap as SSE-compatible stream
          const stream = new ReadableStream({
            start(controller) {
              // Emit as a single data chunk mimicking Groq SSE format
              const sseData = `data: ${JSON.stringify({
                choices: [{ delta: { content: responseText }, finish_reason: null }],
              })}\n\n`;
              controller.enqueue(new TextEncoder().encode(sseData));
              controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
              controller.close();
            },
          });

          return new Response(stream, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
            },
          });
        }
      } catch (geminiErr) {
        console.warn("[chat] Gemini fallback also failed:", geminiErr);
      }
    }

    // ── 3. Static offline fallback ──────────────────────────────────────────
    const fallbackText = `Here is the Socratic breakdown for **${dayInfo?.topic || "your learning topic"}**:\n\n1. **Core Mechanism**: Focus on foundational principles and edge-case handling.\n2. **Hands-On Practice**: Implement a minimal reproducible example to test your comprehension.\n\n\`\`\`python\n# Example Implementation\ndef process_data(records):\n    return [r for r in records if r.get('valid')]\n\`\`\`\n\nClick **"Insert to Notes"** to paste this directly into your study scratchpad!`;

    return new Response(fallbackText, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: any) {
    console.error("[chat] API error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
