// Centralized AI API Key Manager & Key Rotation Engine
// Handles multiple Groq and Gemini API keys transparently on the backend.
// Uses Upstash Redis for atomic round-robin rotation across server restarts.

import { getNextIndexAtomic } from "@/lib/redis";

const GROQ_ROTATION_KEY = "learnpath:groq_key_idx";
const GEMINI_ROTATION_KEY = "learnpath:gemini_key_idx";

function buildGroqPool(customKey?: string): string[] {
  if (customKey?.trim().startsWith("gsk_")) return [customKey.trim()];

  // Comma-separated env pool takes priority
  const envKeys = (process.env.GROQ_API_KEYS || "")
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.startsWith("gsk_"));

  if (envKeys.length > 0) return envKeys;

  return [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
  ].filter(Boolean) as string[];
}

function buildGeminiPool(customKey?: string): string[] {
  if (customKey?.trim() && customKey.trim().length > 10) return [customKey.trim()];

  const envKeys = (process.env.GEMINI_API_KEYS || "")
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length > 10);

  if (envKeys.length > 0) return envKeys;

  return [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
  ].filter(Boolean) as string[];
}

// Module-level fallback index (used when Redis is unavailable)
let _groqFallbackIdx = 0;
let _geminiFallbackIdx = 0;

/**
 * Returns an active Groq API Key using Redis atomic round-robin rotation.
 * Falls back to module-level counter if Redis is unavailable.
 */
export async function getNextGroqApiKey(customKey?: string): Promise<string> {
  const pool = buildGroqPool(customKey);
  if (pool.length === 0) return process.env.GROQ_API_KEY || "";
  if (pool.length === 1) return pool[0];

  try {
    const idx = await getNextIndexAtomic(GROQ_ROTATION_KEY, pool.length);
    return pool[idx];
  } catch {
    const idx = _groqFallbackIdx % pool.length;
    _groqFallbackIdx++;
    return pool[idx];
  }
}

/**
 * Returns an active Gemini API Key using Redis atomic round-robin rotation.
 */
export async function getNextGeminiApiKey(customKey?: string): Promise<string> {
  const pool = buildGeminiPool(customKey);
  if (pool.length === 0) return process.env.GEMINI_API_KEY || "";
  if (pool.length === 1) return pool[0];

  try {
    const idx = await getNextIndexAtomic(GEMINI_ROTATION_KEY, pool.length);
    return pool[idx];
  } catch {
    const idx = _geminiFallbackIdx % pool.length;
    _geminiFallbackIdx++;
    return pool[idx];
  }
}

// Synchronous variants for backward-compatibility in non-async contexts
let _syncGroqIdx = 0;
let _syncGeminiIdx = 0;

export function getNextGroqApiKeySync(customKey?: string): string {
  const pool = buildGroqPool(customKey);
  if (pool.length === 0) return process.env.GROQ_API_KEY || "";
  const key = pool[_syncGroqIdx % pool.length];
  _syncGroqIdx++;
  return key;
}

export function getNextGeminiApiKeySync(customKey?: string): string {
  const pool = buildGeminiPool(customKey);
  if (pool.length === 0) return process.env.GEMINI_API_KEY || "";
  const key = pool[_syncGeminiIdx % pool.length];
  _syncGeminiIdx++;
  return key;
}
