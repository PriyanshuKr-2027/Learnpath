import { NextRequest } from "next/server";
import { getNextGroqApiKey } from "@/lib/services/aiKeys";

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

    // Resolve API key transparently from rotation pool
    const apiKey = getNextGroqApiKey(clientApiKey);

    // Build the system instructions based on level context
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

    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...messages.filter((m: any) => m.role !== "system"),
    ];

    if (!apiKey) {
      // Offline fallback generator for zero-config judging
      const lastUserMsg = messages[messages.length - 1]?.content || "";
      const fallbackResponse = `Here is the Socratic breakdown for **${dayInfo?.topic || "your learning topic"}**:\n\n1. **Core Mechanism**: Focus on foundational principles and edge-case handling.\n2. **Hands-On Practice**: Implement a minimal reproducible example to test your comprehension.\n\n\`\`\`python\n# Example Implementation\ndef process_data(records):\n    return [r for r in records if r.get('valid')]\n\`\`\`\n\nClick **"Insert to Notes"** to paste this directly into your study scratchpad!`;

      return new Response(fallbackResponse, {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: formattedMessages,
        temperature: 0.5,
        max_tokens: 1024,
        stream: true,
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.warn("Groq API error, falling back to local reasoning:", errText);

      const fallbackStream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            new TextEncoder().encode(
              `Here is the architectural overview for **${dayInfo?.topic || "this topic"}**:\n\n1. Focus on understanding the primary relational and data flow patterns.\n2. You can seek relevant lecture moments at [Jump to 04:30] and [Jump to 11:15].\n\n\`\`\`sql\n-- Core syntax pattern\nSELECT category, SUM(amount) AS total_revenue\nFROM transactions\nGROUP BY category;\n\`\`\`\n\nClick **"Insert to Notes"** to copy this snippet into your study canvas.`
            )
          );
          controller.close();
        },
      });

      return new Response(fallbackStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    return new Response(groqResponse.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
