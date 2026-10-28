import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { getRequest } from "@tanstack/react-start/server";

// Models tried in order. Override with GEMINI_MODELS="model-a,model-b".
const DEFAULT_MODELS = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.8-flash"];
const CALL_TIMEOUT_MS = 25_000;

// Per-visitor limit on AI calls. In-memory, so it is per server instance:
// it stops scripted abuse of one warm instance but is not a global quota —
// also set a budget alert / spending cap on the Google Cloud project.
const RATE_LIMIT = { max: 40, windowMs: 10 * 60_000 };
const hits = new Map<string, number[]>();

/** Error whose message is safe to show to the user. */
export class AiUserError extends Error {}

function clientKey(): string {
  try {
    const headers = getRequest()?.headers;
    const ip =
      headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headers?.get("x-real-ip") ||
      "unknown";
    return ip;
  } catch {
    return "unknown";
  }
}

function enforceRateLimit() {
  const key = clientKey();
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  if (recent.length >= RATE_LIMIT.max) {
    throw new AiUserError("You're making requests too quickly. Please wait a few minutes and try again.");
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear(); // bound memory on long-lived instances
}

function provider() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === "your_actual_key_here") {
    console.error("[gemini] GEMINI_API_KEY is not configured");
    throw new AiUserError("The AI service is not configured right now. Please try again later.");
  }
  return createGoogleGenerativeAI({ apiKey });
}

export function isGeminiConfigured() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  return Boolean(apiKey && apiKey !== "your_actual_key_here");
}

function candidateModels() {
  const fromEnv = process.env.GEMINI_MODELS?.split(",").map((m) => m.trim()).filter(Boolean);
  return fromEnv?.length ? fromEnv : DEFAULT_MODELS;
}

// Only overload / timeout / network problems are worth trying another model for.
function isRetryable(err: unknown): boolean {
  const e = err as { statusCode?: number; name?: string; message?: string };
  if (e?.name === "TimeoutError" || e?.name === "AbortError") return true;
  if (typeof e?.statusCode === "number") return e.statusCode === 429 || e.statusCode >= 500;
  return /fetch failed|network|ECONNRESET|overloaded|unavailable/i.test(e?.message ?? "");
}

/**
 * Runs a Gemini text generation with a per-visitor rate limit, a timeout,
 * and fallback to the next model only when a model is busy or unavailable.
 */
export async function generateWithGeminiFallback(options: { system?: string; prompt: string }) {
  enforceRateLimit();
  const google = provider();
  let lastError: unknown = null;

  for (const modelName of candidateModels()) {
    try {
      return await generateText({
        model: google(modelName),
        system: options.system,
        prompt: options.prompt,
        maxRetries: 1,
        abortSignal: AbortSignal.timeout(CALL_TIMEOUT_MS),
      });
    } catch (err) {
      lastError = err;
      console.warn(`[gemini] ${modelName} failed:`, (err as Error)?.message ?? err);
      if (!isRetryable(err)) break;
    }
  }

  console.error("[gemini] all models failed", lastError);
  const status = (lastError as { statusCode?: number })?.statusCode;
  if (status === 400 || status === 401 || status === 403) {
    // Invalid/disabled API key or bad request: retrying won't help.
    console.error("[gemini] check GEMINI_API_KEY — Google rejected the request with", status);
    throw new AiUserError("The AI service is unavailable right now. Please try again later.");
  }
  throw new AiUserError("The AI service is busy right now. Please try again in a moment.");
}

/** Message safe to return to the browser for any error from an AI call. */
export function userMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  return err instanceof AiUserError ? err.message : fallback;
}
