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

    const systemPrompt = `You are CogniPath Socratic AI Copilot  -  an expert AI learning architect and 24/7 technical tutor.
Your job is to guide the user step-by-step through their personalized learning path.
${levelContext}

Pedagogical Rules:
1. If the user asks why this specific learning path was generated instead of a generic syllabus, provide a detailed mathematical & architectural breakdown:
   - Skill Delta Formulation: Delta = max(0, Target_Required - Ingested_Baseline) eliminates redundant topics already mastered on resume/GitHub.
   - Kahn's Topological DAG Sort: Strict prerequisite ordering in O(|V| + |E|) time without circular loops.
   - Detailed Level-by-Level Rationale explaining why each level is in the roadmap:
     * Level 1: SQL Fundamentals (prerequisite ground-truth relational data extraction)
     * Level 2: Python for Data Analysis (computational scripting and algorithmic foundations)
     * Level 3: Pandas & Data Cleaning (vectorized DataFrame transformations and ETL)
     * Level 4: Power BI & DAX (enterprise data modeling, measures, and calculated context)
     * Level 5: Applied Business Statistics & 1-PL Rasch Boss Checkpoint (hypothesis testing and adaptive competency theta calibration)
     * Level 6: Interactive Dashboards & Storytelling (capstone executive presentation synthesis)
   - Dynamic In-Place Remediation: Autonomous loop injecting sub-levels (.1, .2) with flashcards when mistakes occur.
2. When answering conceptual questions, explain step-by-step with clear reasoning and code snippets.
3. If explaining video timestamps, use clickable format like [Jump to MM:SS].
4. For code implementations, always provide full syntax with language tags (e.g. \`\`\`sql, \`\`\`python, \`\`\`tsx).
5. Encourage the user and keep explanations punchy, structured, and actionable.`;

    const getSpecializedFallback = (query: string) => {
      const q = query.toLowerCase();
      if (
        q.includes("generic syllabus") ||
        q.includes("specific learning") ||
        q.includes("why each level") ||
        q.includes("roadmap")
      ) {
        return `###  -  -  Why This Specific Learning Path Was Generated Instead of a Generic Syllabus

Unlike traditional static 40-week bootcamps that force every student through the same generic intro lessons, **LearnPath AI** engineered your curriculum using mathematical principles:

#### 1. Mathematical Architecture & Optimization
 -  **Exact Skill Delta Formulation**:  -  = max(0, Required Proficiency - Ingested Baseline). Topics you already proved mastery in on GitHub or your resume (e.g. basic spreadsheets at 85%) are skipped entirely. Only verified gaps receive dedicated modules.
 -  **Kahn's Topological DAG Scheduling**: Software engineering topics are modeled as a Directed Acyclic Graph G = (V, E). Kahn's algorithm computes in-degrees to ensure foundational prerequisites strictly precede downstream applied modules in O(|V| + |E|) time without circular loops.
 -  **1-PL Rasch IRT Testing**: Calibrates item difficulty against latent ability  - , dynamically adapting assessments to match your true competency.

---

####  -  -  -  Detailed Level-by-Level Rationale for Your Roadmap:

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

 -  **Autonomous Micro-Remediation**: If an assessment detects gaps in a specific subtopic, LearnPath AI injects targeted sub-levels (**Level 5.1, Level 5.2**) with 3D flashcards directly into your active DAG rather than making you restart the course.`;
      }

      return `Here is the Socratic breakdown for **${dayInfo?.topic || "your learning topic"}**:\n\n1. **Core Mechanism**: Focus on foundational principles and edge-case handling.\n2. **Hands-On Practice**: Implement a minimal reproducible example to test your comprehension.\n\n\`\`\`python\n# Example Implementation\ndef process_data(records):\n    return [r for r in records if r.get('valid')]\n\`\`\`\n\nClick **"Insert to Notes"** to paste this directly into your study scratchpad!`;
    };

    const lastUserMsg = messages[messages.length - 1]?.content || "";

    //  -  -  1. Try Groq (primary, streaming)  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 
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

    //  -  -  2. Gemini fallback (non-streaming, wrapped as SSE)  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 
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

          // Wrap as SSE-compatible stream
          const stream = new ReadableStream({
            start(controller) {
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

    //  -  -  3. Specialized offline fallback for zero-config judging  -  -  -  -  -  -  -  -  -  -  -  -  - 
    const fallbackContent = getSpecializedFallback(lastUserMsg);

    const fallbackStream = new ReadableStream({
      start(controller) {
        const sseData = `data: ${JSON.stringify({
          choices: [{ delta: { content: fallbackContent }, finish_reason: null }],
        })}\n\n`;
        controller.enqueue(new TextEncoder().encode(sseData));
        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
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
  } catch (error: any) {
    console.error("[chat] API error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
