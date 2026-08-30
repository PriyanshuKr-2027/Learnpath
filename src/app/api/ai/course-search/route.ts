import { NextRequest, NextResponse } from "next/server";
import { getNextGeminiApiKey, getNextGroqApiKey } from "@/lib/services/aiKeys";
import { getGeminiModel } from "@/lib/services/gemini";

export interface LiveCourseSearchResult {
  title: string;
  url: string;
  platform: "GeeksforGeeks" | "NPTEL" | "Swayam" | "Udemy" | "Coursera" | "edX" | "YouTube" | "Official Docs" | "Web";
  description: string;
  rating?: number;
  duration?: string;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  isFree?: boolean;
}

async function handleCourseSearch(searchTerm: string, clientApiKey?: string): Promise<NextResponse> {
  const targetPlatforms = ["GeeksforGeeks", "NPTEL", "Swayam", "Udemy", "Coursera", "edX"];

  // Try Gemini first
  const geminiKey = await getNextGeminiApiKey(clientApiKey);
  if (geminiKey) {
    try {
      const model = await getGeminiModel("gemini-3.1-flash-lite", geminiKey);
      if (model) {
        const prompt = `You are a live educational web search crawler.
Find authentic, current courses on: "${searchTerm}" across: ${targetPlatforms.join(", ")}.
Return a JSON array of top 6-8 real courses. Each must have:
- "title": exact course title
- "url": direct link to course page (e.g. https://www.coursera.org/learn/..., https://nptel.ac.in/courses/..., https://www.udemy.com/course/...)
- "platform": one of "GeeksforGeeks","NPTEL","Swayam","Udemy","Coursera","edX","Official Docs","Web"
- "description": 1-2 sentence summary
- "rating": number 0-5
- "duration": e.g. "12 Weeks"
- "difficulty": "Beginner"|"Intermediate"|"Advanced"
- "isFree": boolean
Return ONLY the JSON array.`;

        const result = await model.generateContent(prompt);
        const rawText = result.response.text().trim();
        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed: LiveCourseSearchResult[] = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ query: searchTerm, source: "gemini-live-web-search", courses: parsed });
        }
      }
    } catch (err) {
      console.warn("[course-search] Gemini failed:", err);
    }
  }

  // Try Groq fallback
  const groqKey = await getNextGroqApiKey(clientApiKey);
  if (groqKey) {
    try {
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: 'Return pure JSON with a "courses" array of 5 real courses from GeeksforGeeks, NPTEL, Swayam, Coursera, edX. Each: title, platform, url (direct course link), rating(0-5), difficulty, duration, description, isFree.',
            },
            {
              role: "user",
              content: `Best courses for: "${searchTerm}"\nReturn: { "courses": [{...}] }`,
            },
          ],
          temperature: 0.2,
        }),
      });

      if (groqRes.ok) {
        const groqData = await groqRes.json();
        const responseContent = groqData.choices?.[0]?.message?.content || "";
        try {
          const parsed = JSON.parse(responseContent);
          if (Array.isArray(parsed?.courses)) {
            return NextResponse.json({ query: searchTerm, source: "groq-structured-search", courses: parsed.courses });
          }
        } catch {}
      }
    } catch (err) {
      console.warn("[course-search] Groq failed:", err);
    }
  }

  // Algorithmic deep-link fallback (pure standard ASCII)
  const encoded = encodeURIComponent(searchTerm);
  const fallback: LiveCourseSearchResult[] = [
    { title: `${searchTerm} - Tutorials and Articles`, url: `https://www.geeksforgeeks.org/search/?q=${encoded}`, platform: "GeeksforGeeks", description: `Comprehensive tutorials and practice problems covering ${searchTerm}.`, rating: 4.8, duration: "Self-Paced", difficulty: "Beginner", isFree: true },
    { title: `NPTEL / Swayam: ${searchTerm}`, url: `https://swayam.gov.in/explorer?searchText=${encoded}`, platform: "Swayam", description: `IIT and IISc certified academic courses on ${searchTerm} by Ministry of Education.`, rating: 4.7, duration: "8-12 Weeks", difficulty: "Intermediate", isFree: true },
    { title: `${searchTerm} Specialization`, url: `https://www.coursera.org/search?query=${encoded}`, platform: "Coursera", description: `University-accredited specialization with capstone projects for ${searchTerm}.`, rating: 4.8, duration: "4-8 Weeks", difficulty: "Intermediate", isFree: false },
    { title: `Complete ${searchTerm} Bootcamp`, url: `https://www.udemy.com/courses/search/?q=${encoded}`, platform: "Udemy", description: `Industry-led video bootcamp with practical exercises for ${searchTerm}.`, rating: 4.6, duration: "20-45 Hours", difficulty: "Beginner", isFree: false },
    { title: `NPTEL: ${searchTerm}`, url: `https://nptel.ac.in/courses?searchTerm=${encoded}`, platform: "NPTEL", description: `Academic lecture series by IIT professors for ${searchTerm}.`, rating: 4.9, duration: "12 Weeks", difficulty: "Advanced", isFree: true },
  ];

  return NextResponse.json({ query: searchTerm, source: "algorithmic-live-deep-links", courses: fallback });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const topic = searchParams.get("topic") || "Data Structures and Algorithms";
    return await handleCourseSearch(topic);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, skillName, apiKey: clientApiKey } = body;
    return await handleCourseSearch(query || skillName || "Data Structures and Algorithms", clientApiKey);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
