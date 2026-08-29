import { NextRequest, NextResponse } from "next/server";
import { SkillEntry, ProjectEntry } from "@/types";
import { getNextGeminiApiKey, getNextGroqApiKey } from "@/lib/services/aiKeys";
import { geminiExtractJSON } from "@/lib/services/gemini";

interface ResumeParseResult {
  skills: Array<{ name: string; proficiency: number; evidence: string }>;
  certifications: string[];
  projects: Array<{ title: string; techStack: string[]; description: string }>;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeText = "", fileName = "resume.pdf", apiKey } = body;

    if (!resumeText.trim()) {
      return NextResponse.json({ error: "Resume text content is required" }, { status: 400 });
    }

    const truncatedText = resumeText.slice(0, 6000); // Gemini handles more tokens than Groq

    const systemPrompt = `You are a technical resume parser.
Extract technical skills, certifications, and projects from the provided resume text.
For each skill, estimate an initial baseline proficiency (0-100%) based on years of experience, depth of projects, and stated familiarity.

Return STRICT JSON matching:
{
  "skills": Array<{ "name": string, "proficiency": number, "evidence": string }>,
  "certifications": string[],
  "projects": Array<{ "title": string, "techStack": string[], "description": string }>
}`;

    const userPrompt = `Resume text (${fileName}):\n${truncatedText}`;

    // ── 1. Try Gemini (primary — supports 6k token resume, JSON mode) ────────
    const geminiKey = await getNextGeminiApiKey(apiKey);
    if (geminiKey) {
      const result = await geminiExtractJSON<ResumeParseResult>(systemPrompt, userPrompt, geminiKey);
      if (result?.skills?.length) {
        const formattedSkills: SkillEntry[] = result.skills.map((s) => ({
          name: s.name,
          source: "resume" as const,
          currentProficiency: Math.min(100, Math.max(10, Number(s.proficiency) || 50)),
          evidence: s.evidence || `Extracted from ${fileName}`,
        }));
        return NextResponse.json({
          skills: formattedSkills,
          certifications: result.certifications || [],
          projects: result.projects || [],
          provider: "gemini",
        });
      }
    }

    // ── 2. Try Groq (secondary — 4k token cap) ───────────────────────────────
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
              { role: "user", content: `Resume text (${fileName}):\n${resumeText.slice(0, 4000)}` },
            ],
            temperature: 0.1,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const parsed = JSON.parse(data.choices[0].message.content) as ResumeParseResult;

          const formattedSkills: SkillEntry[] = (parsed.skills || []).map((s) => ({
            name: s.name,
            source: "resume" as const,
            currentProficiency: Math.min(100, Math.max(10, Number(s.proficiency) || 50)),
            evidence: s.evidence || `Extracted from ${fileName}`,
          }));

          return NextResponse.json({
            skills: formattedSkills,
            certifications: parsed.certifications || [],
            projects: parsed.projects || [],
            provider: "groq",
          });
        }
      } catch (e) {
        console.warn("[parse-resume] Groq failed:", e);
      }
    }

    // ── 3. Heuristic keyword scanner fallback ────────────────────────────────
    const textLower = resumeText.toLowerCase();
    const detectedSkills: SkillEntry[] = [];
    const knownSkillsList = [
      { name: "SQL", keywords: ["sql", "postgres", "mysql", "queries"], prof: 50 },
      { name: "Python", keywords: ["python", "pandas", "numpy", "django", "flask"], prof: 65 },
      { name: "Excel", keywords: ["excel", "vlookup", "pivot", "spreadsheet"], prof: 75 },
      { name: "JavaScript", keywords: ["javascript", "js", "es6", "node"], prof: 60 },
      { name: "TypeScript", keywords: ["typescript", "ts"], prof: 55 },
      { name: "React", keywords: ["react", "next.js", "frontend", "redux"], prof: 65 },
      { name: "Power BI", keywords: ["power bi", "dax", "powerquery", "tableau"], prof: 30 },
      { name: "PyTorch", keywords: ["pytorch", "deep learning", "neural network"], prof: 45 },
      { name: "Docker", keywords: ["docker", "container", "k8s", "kubernetes"], prof: 40 },
      { name: "Git", keywords: ["git", "github", "version control"], prof: 70 },
      { name: "Statistics", keywords: ["statistics", "probability", "hypothesis testing"], prof: 40 },
      { name: "AWS", keywords: ["aws", "amazon web services", "s3", "ec2", "lambda"], prof: 45 },
      { name: "LangChain", keywords: ["langchain", "langgraph", "rag", "vector"], prof: 40 },
    ];

    for (const item of knownSkillsList) {
      if (item.keywords.some((kw) => textLower.includes(kw))) {
        detectedSkills.push({
          name: item.name,
          source: "resume",
          currentProficiency: item.prof,
          evidence: `Keywords identified in ${fileName}`,
        });
      }
    }

    const detectedCerts: string[] = [];
    if (textLower.includes("google") && textLower.includes("analytics")) detectedCerts.push("Google Data Analytics Certificate");
    if (textLower.includes("aws") && textLower.includes("certified")) detectedCerts.push("AWS Certified");
    if (textLower.includes("azure") && textLower.includes("certified")) detectedCerts.push("Azure Certified");

    const fallbackProjects: ProjectEntry[] = [{
      title: "Analytical Data Pipeline",
      techStack: ["Python", "SQL", "Pandas"],
      description: "Automated aggregation and cleaning of performance metrics.",
    }];

    return NextResponse.json({
      skills: detectedSkills.length > 0 ? detectedSkills : [
        { name: "SQL", source: "resume", currentProficiency: 45, evidence: "Identified in resume" },
        { name: "Python", source: "resume", currentProficiency: 55, evidence: "Identified in resume" },
      ],
      certifications: detectedCerts,
      projects: fallbackProjects,
      provider: "heuristic",
    });
  } catch (error: any) {
    console.error("[parse-resume]", error);
    return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 });
  }
}
