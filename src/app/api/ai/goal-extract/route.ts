import { NextRequest, NextResponse } from "next/server";
import { PRESEEDED_CAREER_ROLES } from "@/lib/data/roleTaxonomy";
import { getNextGeminiApiKey, getNextGroqApiKey } from "@/lib/services/aiKeys";
import { geminiExtractJSON } from "@/lib/services/gemini";

interface GoalExtractResult {
  targetRoleId: string;
  targetRoleTitle: string;
  timeframeWeeks: number;
  weeklyHoursBudget: number;
  extractedSkills: string[];
  relevantTech: string[];
  constraints: string;
  reasoning: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name = "Learner", goalPrompt = "", timeBudgetWeeks = 10, weeklyHours = 10, apiKey } = body;

    if (!goalPrompt.trim()) {
      return NextResponse.json({ error: "Goal prompt is required" }, { status: 400 });
    }

    const roleListText = PRESEEDED_CAREER_ROLES.map((r) => `${r.id} (${r.title})`).join(", ");

    const systemPrompt = `You are CogniPath AI, an expert technical career architect.
Analyze the user's goal prompt and extract structured technical learning metadata.
Available Roles: ${roleListText}

Respond with STRICT JSON format matching this schema:
{
  "targetRoleId": "data-analyst" | "ai-engineer" | "fullstack-ai-dev" | "cloud-devops-architect" | "system-design-backend" | "dsa-faang",
  "targetRoleTitle": string,
  "timeframeWeeks": number,
  "weeklyHoursBudget": number,
  "extractedSkills": string[],
  "relevantTech": string[],
  "constraints": string,
  "reasoning": string
}`;

    const userPrompt = `Learner Name: ${name}\nGoal: ${goalPrompt}\nStated Timeframe: ${timeBudgetWeeks} weeks, ${weeklyHours} hrs/week`;

    // ── 1. Try Gemini (primary — JSON mode) ─────────────────────────────────
    const geminiKey = await getNextGeminiApiKey(apiKey);
    if (geminiKey) {
      const result = await geminiExtractJSON<GoalExtractResult>(systemPrompt, userPrompt, geminiKey);
      if (result && result.targetRoleId) {
        return NextResponse.json(result);
      }
    }

    // ── 2. Try Groq (secondary — JSON mode) ─────────────────────────────────
    const groqKey = await getNextGroqApiKey(apiKey);
    if (groqKey) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${groqKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.2,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const parsed = JSON.parse(data.choices[0].message.content);
          if (parsed?.targetRoleId) return NextResponse.json(parsed);
        }
      } catch (e) {
        console.warn("[goal-extract] Groq failed:", e);
      }
    }

    // ── 3. Deterministic Heuristic Fallback ──────────────────────────────────
    const promptLower = goalPrompt.toLowerCase();
    let targetRoleId = "data-analyst";

    if (promptLower.includes("ai") || promptLower.includes("llm") || promptLower.includes("machine learning") || promptLower.includes("pytorch") || promptLower.includes("rag") || promptLower.includes("gpt")) {
      targetRoleId = "ai-engineer";
    } else if (promptLower.includes("fullstack") || promptLower.includes("next.js") || promptLower.includes("react") || promptLower.includes("frontend") || promptLower.includes("web")) {
      targetRoleId = "fullstack-ai-dev";
    } else if (promptLower.includes("cloud") || promptLower.includes("devops") || promptLower.includes("docker") || promptLower.includes("kubernetes") || promptLower.includes("aws")) {
      targetRoleId = "cloud-devops-architect";
    } else if (promptLower.includes("backend") || promptLower.includes("system design") || promptLower.includes("distributed") || promptLower.includes("kafka") || promptLower.includes("microservices")) {
      targetRoleId = "system-design-backend";
    } else if (promptLower.includes("dsa") || promptLower.includes("leetcode") || promptLower.includes("algorithm") || promptLower.includes("faang") || promptLower.includes("interview")) {
      targetRoleId = "dsa-faang";
    }

    const matchedRole = PRESEEDED_CAREER_ROLES.find((r) => r.id === targetRoleId) || PRESEEDED_CAREER_ROLES[0];
    const weeksMatch = promptLower.match(/(\d+)\s*(?:weeks|week|wks)/);
    const hoursMatch = promptLower.match(/(\d+)\s*(?:hours|hour|hrs|hr)/);
    const calculatedWeeks = weeksMatch ? parseInt(weeksMatch[1], 10) : Number(timeBudgetWeeks) || 10;
    const calculatedHours = hoursMatch ? parseInt(hoursMatch[1], 10) : Number(weeklyHours) || 10;

    return NextResponse.json({
      targetRoleId: matchedRole.id,
      targetRoleTitle: matchedRole.title,
      timeframeWeeks: calculatedWeeks,
      weeklyHoursBudget: calculatedHours,
      extractedSkills: matchedRole.skills.map((s) => s.skillName),
      relevantTech: matchedRole.skills.slice(0, 4).map((s) => s.skillName),
      constraints: `${calculatedHours} hours/week commitment across ${calculatedWeeks} weeks.`,
      reasoning: `Matched your goal to the ${matchedRole.title} taxonomy based on keyword analysis of your learning objectives.`,
    });
  } catch (error: any) {
    console.error("[goal-extract]", error);
    return NextResponse.json({ error: "Failed to extract goal parameters" }, { status: 500 });
  }
}
