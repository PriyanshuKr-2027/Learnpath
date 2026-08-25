// Centralized AI API Key Manager & Key Rotation Engine
// Handles multiple Groq and Gemini API keys transparently on the backend.
// Users / Judges never have to input keys in the UI.

const DEFAULT_FALLBACK_GROQ_KEYS = [
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
].filter(Boolean) as string[];

const DEFAULT_FALLBACK_GEMINI_KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
].filter(Boolean) as string[];

let currentGroqIndex = 0;
let currentGeminiIndex = 0;

/**
 * Returns an active Groq API Key with automatic round-robin rotation.
 */
export function getNextGroqApiKey(customKey?: string): string {
  if (customKey && customKey.trim().startsWith("gsk_")) {
    return customKey.trim();
  }

  // Parse comma-separated list if provided in env
  const envKeys = (process.env.GROQ_API_KEYS || "")
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.startsWith("gsk_"));

  const keyPool = envKeys.length > 0 ? envKeys : DEFAULT_FALLBACK_GROQ_KEYS;

  if (keyPool.length === 0) {
    return process.env.GROQ_API_KEY || "";
  }

  const selectedKey = keyPool[currentGroqIndex % keyPool.length];
  currentGroqIndex = (currentGroqIndex + 1) % keyPool.length;
  return selectedKey;
}

/**
 * Returns an active Gemini API Key with automatic round-robin rotation.
 */
export function getNextGeminiApiKey(customKey?: string): string {
  if (customKey && customKey.trim().length > 10) {
    return customKey.trim();
  }

  const envKeys = (process.env.GEMINI_API_KEYS || "")
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length > 10);

  const keyPool = envKeys.length > 0 ? envKeys : DEFAULT_FALLBACK_GEMINI_KEYS;

  if (keyPool.length === 0) {
    return process.env.GEMINI_API_KEY || "";
  }

  const selectedKey = keyPool[currentGeminiIndex % keyPool.length];
  currentGeminiIndex = (currentGeminiIndex + 1) % keyPool.length;
  return selectedKey;
}
