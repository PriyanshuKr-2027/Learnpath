/**
 * Gemini AI client helper
 * Provides generateContent and streamContent wrappers with automatic key rotation
 * and multi-model fallback (gemini-1.5-flash -> gemini-2.0-flash -> gemini-1.5-pro).
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getNextGeminiApiKey } from "@/lib/services/aiKeys";

const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-3.1-pro-preview",
];




export async function getGeminiModel(preferredModel?: string, customKey?: string) {
  const apiKey = await getNextGeminiApiKey(customKey);
  if (!apiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelToUse = preferredModel || "gemini-1.5-flash";
    return genAI.getGenerativeModel({ model: modelToUse });
  } catch {
    return null;
  }
}

/**
 * JSON extraction via Gemini with automatic model fallback
 */
export async function geminiExtractJSON<T>(
  systemInstruction: string,
  userPrompt: string,
  customKey?: string
): Promise<T | null> {
  const apiKey = await getNextGeminiApiKey(customKey);
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        systemInstruction,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
          maxOutputTokens: 2048,
        },
      });

      const text = result.response.text();
      return JSON.parse(text) as T;
    } catch (e: any) {
      console.warn(`[Gemini] model ${modelName} failed, trying next fallback:`, e?.message || e);
    }
  }

  return null;
}

/**
 * Chat completion via Gemini with automatic model fallback
 */
export async function geminiChat(
  systemInstruction: string,
  messages: Array<{ role: "user" | "model"; content: string }>,
  customKey?: string
): Promise<string | null> {
  const apiKey = await getNextGeminiApiKey(customKey);
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const chat = model.startChat({
        systemInstruction,
        history: messages.slice(0, -1).map((m) => ({
          role: m.role,
          parts: [{ text: m.content }],
        })),
      });

      const lastMsg = messages[messages.length - 1];
      const result = await chat.sendMessage(lastMsg.content);
      return result.response.text();
    } catch (e: any) {
      console.warn(`[Gemini Chat] model ${modelName} failed, trying next fallback:`, e?.message || e);
    }
  }

  return null;
}
