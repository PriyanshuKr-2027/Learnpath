import { NextRequest } from "next/server";
import { getNextGroqApiKey, getNextGeminiApiKey } from "@/lib/services/aiKeys";
import { getGeminiModel } from "@/lib/services/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, dayInfo, context, apiKey: clientApiKey } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const levelTitle = context?.title || dayInfo?.topic || "Applied Business Statistics";
    const skillFocus = context?.skillName || dayInfo?.pattern || "Data Analysis";

    const systemPrompt = `You are LearnPath Socratic AI Copilot — a warm, clear, and practical technical tutor.
Context: The learner is currently studying "${levelTitle}" (Skill Focus: ${skillFocus}).

Pedagogical Principles:
1. Provide direct, intuitive explanations using clear real-world analogies and concise code snippets (e.g. \`\`\`python, \`\`\`sql).
2. If asked why this specific roadmap was generated instead of a generic syllabus:
   - Explain that their GitHub/resume was analyzed to skip skills they already know (Skill Delta Optimization).
   - Explain that prerequisite topics are mapped in a dependency graph to ensure foundational topics come before advanced ones.
3. Keep video timestamp recommendations clean and relevant: format as [Jump to MM:SS].
4. Be supportive, concise, and avoid academic jargon unless the user specifically asks for mathematical formulations.`;

    const lastUserMsg = messages[messages.length - 1]?.content || "";

    const getSpecializedFallback = (query: string) => {
      const q = query.toLowerCase();
      if (
        q.includes("generic syllabus") ||
        q.includes("specific learning") ||
        q.includes("why each level") ||
        q.includes("roadmap")
      ) {
        return `### Why Your Learning Path is Personalized\n\nTraditional courses force everyone through the same rigid syllabus. **LearnPath AI** built your path specifically for you:\n\n1. **Skill Gap Targeting**: Topics you've already demonstrated on GitHub or your resume are bypassed so you don't waste time relearning what you know.\n2. **Prerequisite Sequencing**: Every concept is ordered so foundational skills (like SQL and Data Wrangling) directly prepare you for complex analytics and machine learning.\n3. **Adaptive Remediation**: If you encounter difficulty in a checkpoint, focused micro-lessons are automatically added to strengthen that specific concept.\n\nAsk me about any specific milestone to see how it connects to your goal!`;
      }

      return `Here is a focused breakdown for **${levelTitle}**:\n\n1. **Core Concept**: Focus on foundational logic and clean syntax.\n2. **Video Tip**: Check [Jump to 02:30] for the live walkthrough.\n\n\`\`\`python\n# Practice Pattern\ndef process_records(items):\n    return [x for x in items if x.get('status') == 'active']\n\`\`\`\n\nClick **"Insert to Notes"** below to save this snippet into your markdown notebook!`;
    };

    // 1. Try Groq (streaming with SSE delta extraction)
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
          model: "openai/gpt-oss-120b",
          messages: formattedMessages,
          temperature: 0.5,
          max_tokens: 1024,
          stream: true,
        }),
      });

      if (groqResponse.ok && groqResponse.body) {
        const reader = groqResponse.body.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";

        const textStream = new ReadableStream({
          async start(controller) {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                  const trimmed = line.trim();
                  if (!trimmed || !trimmed.startsWith("data:")) continue;
                  if (trimmed === "data: [DONE]") continue;

                  const jsonStr = trimmed.replace(/^data:\s*/, "");
                  try {
                    const parsed = JSON.parse(jsonStr);
                    const deltaContent = parsed.choices?.[0]?.delta?.content;
                    if (deltaContent) {
                      controller.enqueue(encoder.encode(deltaContent));
                    }
                  } catch {
                    // ignore malformed lines
                  }
                }
              }
              controller.close();
            } catch (err) {
              controller.error(err);
            }
          },
        });

        return new Response(textStream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      }

      console.warn("[chat] Groq failed, falling back to Gemini.");
    }

    // 2. Gemini fallback
    const geminiKey = await getNextGeminiApiKey(clientApiKey);
    if (geminiKey) {
      try {
        const model = await getGeminiModel("gemini-3.1-flash-lite", geminiKey);
        if (model) {
          const userMessages = messages.filter((m: any) => m.role !== "system");

          const history = userMessages.slice(0, -1).map((m: any) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          }));

          const chat = model.startChat({ systemInstruction: systemPrompt, history });
          const result = await chat.sendMessage(lastUserMsg || "Hello");
          const responseText = result.response.text();

          return new Response(responseText, {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "no-cache",
            },
          });
        }
      } catch (geminiErr) {
        console.warn("[chat] Gemini fallback also failed:", geminiErr);
      }
    }

    // 3. Specialized Fallback
    const fallbackContent = getSpecializedFallback(lastUserMsg);
    return new Response(fallbackContent, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("[chat] API error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
