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

    const systemPrompt = `You are LearnPath Socratic AI Copilot - an expert pedagogical AI learning architect and technical tutor.
Context: The learner is currently studying "${levelTitle}" (Skill Focus: ${skillFocus}).

Pedagogical Directives:
1. If the user asks why this specific learning path was generated instead of a generic syllabus:
   - Explain Skill Delta Engine: Delta = max(0, Target - Baseline) skips topics already mastered on GitHub/resume.
   - Explain Kahn's Topological DAG Sort: Strict prerequisite ordering in O(|V| + |E|) time without cyclic dependencies.
   - Walk through the sequenced milestones from ground-truth base to capstone synthesis.
2. For conceptual queries, provide step-by-step reasoning with practical code blocks (e.g. \`\`\`python, \`\`\`sql).
3. If recommending timestamps in the video lecture, format as [Jump to MM:SS].
4. Keep answers structured, encouraging, and actionable.`;

    const lastUserMsg = messages[messages.length - 1]?.content || "";

    const getSpecializedFallback = (query: string) => {
      const q = query.toLowerCase();
      if (
        q.includes("generic syllabus") ||
        q.includes("specific learning") ||
        q.includes("why each level") ||
        q.includes("roadmap")
      ) {
        return `### Why This Specific Learning Path Was Generated Instead of a Generic Syllabus\n\nUnlike traditional static bootcamps that force every learner through rigid generic syllabi, **LearnPath AI** engineered your curriculum using mathematical modeling:\n\n#### 1. Mathematical Architecture & Optimization\n* **Exact Skill Delta Formulation**: Delta = max(0, Target - Baseline). Skills verified on your GitHub or resume are skipped, so you only spend time closing genuine competency gaps.\n* **Kahn's Topological DAG Scheduling**: Concepts are organized into a Directed Acyclic Graph G = (V, E). Kahn's algorithm computes in-degrees to ensure prerequisites strictly precede downstream modules in O(|V| + |E|) time.\n* **1-PL Rasch IRT Testing**: Calibrates question difficulty against learner ability theta to confirm genuine mastery before unlocking subsequent tiers.\n\n---\n\n#### 2. Adaptive Milestones\nEach milestone is sequenced so that relational extraction (SQL) precedes computational transformations (Python/Pandas), enterprise semantic modeling (Power BI/DAX), and statistical verification (Hypothesis Testing & IRT Checkpoints).\n\nIf mistakes occur during checkpoints, targeted micro-remediation levels (.1, .2) are injected dynamically into your DAG.`;
      }

      return `Here is the Socratic breakdown for **${levelTitle}**:\n\n1. **Core Mechanism**: Focus on foundational principles and edge-case handling.\n2. **Practical Tip**: Check [Jump to 02:30] for the core demo in the lecture.\n\n\`\`\`python\n# Example Practice\ndef process_data(records):\n    return [r for r in records if r.get('valid')]\n\`\`\`\n\nFeel free to ask for debugging assistance or click **"Insert to Notes"** to save this snippet!`;
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
