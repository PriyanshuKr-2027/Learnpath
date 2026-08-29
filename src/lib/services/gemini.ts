/**
 * Gemini AI client helper
 * Provides generateContent and streamContent wrappers with automatic key rotation.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getNextGeminiApiKey } from "@/lib/services/aiKeys";

export async function getGeminiModel(modelName = "gemini-1.5-flash", customKey?: string) {
  const apiKey = await getNextGeminiApiKey(customKey);
  if (!apiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: modelName });
  } catch {
    return null;
  }
}

/**
 * JSON extraction via Gemini — returns parsed object or null on failure.
 */
export async function geminiExtractJSON<T>(
  systemInstruction: string,
  userPrompt: string,
  customKey?: string
): Promise<T | null> {
  try {
    const model = await getGeminiModel("gemini-1.5-flash", customKey);
    if (!model) return null;

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
  } catch (e) {
    console.warn("[Gemini] JSON extraction failed:", e);
    return null;
  }
}

/**
 * Chat completion via Gemini — returns text response or null.
 */
export async function geminiChat(
  systemInstruction: string,
  messages: Array<{ role: "user" | "model"; content: string }>,
  customKey?: string
): Promise<string | null> {
  try {
    const model = await getGeminiModel("gemini-1.5-flash", customKey);
    if (!model) return null;

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
  } catch (e) {
    console.warn("[Gemini] Chat failed:", e);
    return null;
  }
}
