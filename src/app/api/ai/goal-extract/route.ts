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
    const { name = "Learner", goalPrompt = "", prompt = "", timeBudgetWeeks = 10, weeklyHours = 10, apiKey } = body;
    const finalPrompt = (goalPrompt || prompt || "").trim();

    if (!finalPrompt) {
      return NextResponse.json({ error: "Goal prompt is required" }, { status: 400 });
    }

    const systemPrompt = `You are CogniPath AI, an expert technical career architect.
Analyze the user's goal prompt and extract structured technical learning metadata.
You can match known engineering domains or synthesize any custom domain (e.g. Cybersecurity, DevOps, Blockchain, Mobile Development, Embedded Systems, Data Engineering, Game Development, Full-Stack, AI).

Respond with STRICT JSON format matching this schema:
{
  "targetRoleId": string (e.g. "cybersecurity-engineer", "data-analyst", "ai-engineer", "fullstack-ai-dev", "cloud-devops-architect", "system-design-backend", "mobile-app-dev", "blockchain-engineer"),
  "targetRoleTitle": string (e.g. "Cybersecurity Specialist & Penetration Tester", "Generative AI & RAG Engineer", "Full-Stack AI Application Developer"),
  "timeframeWeeks": number,
  "weeklyHoursBudget": number,
  "extractedSkills": string[] (5-7 core technical competencies required for this career path),
  "relevantTech": string[] (top 4 immediate foundational technologies to start with),
  "constraints": string,
  "reasoning": string
}`;

    const userPrompt = `Learner Name: ${name}\nGoal: ${finalPrompt}\nStated Timeframe: ${timeBudgetWeeks} weeks, ${weeklyHours} hrs/week`;

    //  -  -  1. Try Gemini (primary  -  JSON mode)  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 
    const geminiKey = await getNextGeminiApiKey(apiKey);
    if (geminiKey) {
      const result = await geminiExtractJSON<GoalExtractResult>(systemPrompt, userPrompt, geminiKey);
      if (result && result.targetRoleTitle && result.extractedSkills?.length) {
        return NextResponse.json(result);
      }
    }

    //  -  -  2. Try Groq (secondary  -  JSON mode)  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 
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
            model: "openai/gpt-oss-120b",
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
          const parsed = JSON.parse(data.choices[0].message.content) as GoalExtractResult;
          if (parsed?.targetRoleTitle && parsed.extractedSkills?.length) {
            return NextResponse.json(parsed);
          }
        }
      } catch (e) {
        console.warn("[goal-extract] Groq failed:", e);
      }
    }

    //  -  -  3. Comprehensive Domain Heuristic Analyzer  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  - 
    const promptLower = finalPrompt.toLowerCase();
    let targetRoleId = "data-analyst";
    let targetRoleTitle = "Data Analyst & Business Intelligence Specialist";
    let extractedSkills = [
      "SQL Fundamentals",
      "Python for Data Analysis",
      "Pandas & Vectorized ETL",
      "Power BI & DAX Modeling",
      "Applied Business Statistics",
      "Interactive Dashboards & Storytelling",
    ];

    if (
      promptLower.includes("cyber") ||
      promptLower.includes("security") ||
      promptLower.includes("hacking") ||
      promptLower.includes("pentest") ||
      promptLower.includes("soc") ||
      promptLower.includes("infosec")
    ) {
      targetRoleId = "cybersecurity-engineer";
      targetRoleTitle = "Cybersecurity Specialist & Penetration Tester";
      extractedSkills = [
        "Network Security & Protocols",
        "Linux CLI & System Hardening",
        "Web Application Penetration Testing",
        "Cryptography & Public Key Infrastructure",
        "Incident Response & SIEM Analysis",
        "Ethical Hacking & Vulnerability Assessment",
      ];
    } else if (
      promptLower.includes("ai") ||
      promptLower.includes("llm") ||
      promptLower.includes("machine learning") ||
      promptLower.includes("pytorch") ||
      promptLower.includes("rag") ||
      promptLower.includes("gpt")
    ) {
      targetRoleId = "ai-engineer";
      targetRoleTitle = "Generative AI & RAG Engineer";
      extractedSkills = [
        "Python & PyTorch Foundations",
        "Transformer Architectures & Attention",
        "Vector Databases & Semantic Embeddings",
        "LangChain & LangGraph Orchestration",
        "Fine-Tuning & Quantization",
        "Agentic RAG Workflows",
      ];
    } else if (
      promptLower.includes("fullstack") ||
      promptLower.includes("next.js") ||
      promptLower.includes("react") ||
      promptLower.includes("frontend") ||
      promptLower.includes("web")
    ) {
      targetRoleId = "fullstack-ai-dev";
      targetRoleTitle = "Full-Stack AI Application Developer";
      extractedSkills = [
        "TypeScript & Modern JavaScript",
        "Next.js App Router & Server Components",
        "PostgreSQL & Supabase Architecture",
        "Tailwind CSS & Component Architecture",
        "LLM Streaming & WebSockets",
        "Cloud Deployment & Serverless APIs",
      ];
    } else if (
      promptLower.includes("cloud") ||
      promptLower.includes("devops") ||
      promptLower.includes("docker") ||
      promptLower.includes("kubernetes") ||
      promptLower.includes("aws") ||
      promptLower.includes("ci/cd")
    ) {
      targetRoleId = "cloud-devops-architect";
      targetRoleTitle = "Cloud Solutions & DevOps Architect";
      extractedSkills = [
        "Linux Systems & Shell Scripting",
        "Docker & Containerization",
        "Kubernetes Cluster Orchestration",
        "Terraform & Infrastructure as Code",
        "CI/CD Pipelines & GitHub Actions",
        "AWS Cloud Architecture & Monitoring",
      ];
    } else if (
      promptLower.includes("backend") ||
      promptLower.includes("system design") ||
      promptLower.includes("distributed") ||
      promptLower.includes("kafka") ||
      promptLower.includes("microservices")
    ) {
      targetRoleId = "system-design-backend";
      targetRoleTitle = "FAANG Backend & System Design Specialist";
      extractedSkills = [
        "Golang / Java High-Concurrency Backend",
        "Relational & NoSQL Database Sharding",
        "Kafka & Event-Driven Architecture",
        "Caching & Redis Clustering",
        "Low-Latency API Gateways & Load Balancing",
        "Distributed Consensus & CAP Theorem",
      ];
    } else if (
      promptLower.includes("dsa") ||
      promptLower.includes("leetcode") ||
      promptLower.includes("algorithm") ||
      promptLower.includes("faang") ||
      promptLower.includes("interview")
    ) {
      targetRoleId = "dsa-faang";
      targetRoleTitle = "Data Structures & Competitive Algorithms";
      extractedSkills = [
        "Arrays, Strings & Two-Pointers",
        "Trees, Graphs & BFS/DFS",
        "Dynamic Programming & Memoization",
        "Heaps, Tries & Advanced Data Structures",
        "Backtracking & Greedy Algorithms",
        "Complexity Optimization & Space Invariants",
      ];
    }

    const weeksMatch = promptLower.match(/(\d+)\s*(?:weeks|week|wks)/);
    const hoursMatch = promptLower.match(/(\d+)\s*(?:hours|hour|hrs|hr)/);
    const calculatedWeeks = weeksMatch ? parseInt(weeksMatch[1], 10) : Number(timeBudgetWeeks) || 10;
    const calculatedHours = hoursMatch ? parseInt(hoursMatch[1], 10) : Number(weeklyHours) || 10;

    return NextResponse.json({
      targetRoleId,
      targetRoleTitle,
      timeframeWeeks: calculatedWeeks,
      weeklyHoursBudget: calculatedHours,
      extractedSkills,
      relevantTech: extractedSkills.slice(0, 4),
      constraints: `${calculatedHours} hours/week commitment across ${calculatedWeeks} weeks.`,
      reasoning: `Synthesized curriculum for ${targetRoleTitle} based on your objective: "${finalPrompt}".`,
    });
  } catch (error: any) {
    console.error("[goal-extract]", error);
    return NextResponse.json({ error: "Failed to extract goal parameters" }, { status: 500 });
  }
}

