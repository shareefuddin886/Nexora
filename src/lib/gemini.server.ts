import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { getRequest } from "@tanstack/react-start/server";

// Models tried in order. Override with GEMINI_MODELS="model-a,model-b".
const DEFAULT_MODELS = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.8-flash"];
const CALL_TIMEOUT_MS = 25_000;

/**
 * Each AI feature can use its own key (ideally from its own Google Cloud
 * project, since Gemini quotas are per project). If a feature key is not
 * set — or runs out of quota — the shared GEMINI_API_KEY is used.
 */
export type AiFeature = "assessment" | "interview" | "resume" | "review";
const FEATURE_KEY_ENV: Record<AiFeature, string> = {
  assessment: "GEMINI_API_KEY_ASSESSMENT",
  interview: "GEMINI_API_KEY_INTERVIEW",
  resume: "GEMINI_API_KEY_RESUME",
  review: "GEMINI_API_KEY_REVIEW",
};

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
    return headers?.get("x-forwarded-for")?.split(",")[0]?.trim() || headers?.get("x-real-ip") || "unknown";
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

const validKey = (k: string | undefined) => {
  const v = k?.trim();
  return v && v !== "your_actual_key_here" ? v : undefined;
};

/** Keys to try for a feature: its own key first, then the shared key. */
function keysFor(feature?: AiFeature): string[] {
  const own = feature ? validKey(process.env[FEATURE_KEY_ENV[feature]]) : undefined;
  const shared = validKey(process.env.GEMINI_API_KEY);
  return [...new Set([own, shared].filter((k): k is string => !!k))];
}

export function isGeminiConfigured(feature?: AiFeature) {
  return keysFor(feature).length > 0;
}

function candidateModels() {
  const fromEnv = process.env.GEMINI_MODELS?.split(",").map((m) => m.trim()).filter(Boolean);
  return fromEnv?.length ? fromEnv : DEFAULT_MODELS;
}

const statusOf = (err: unknown) => (err as { statusCode?: number })?.statusCode;

// Only overload / timeout / network problems are worth trying another model for.
function isRetryable(err: unknown): boolean {
  const e = err as { name?: string; message?: string };
  if (e?.name === "TimeoutError" || e?.name === "AbortError") return true;
  const status = statusOf(err);
  if (typeof status === "number") return status === 429 || status >= 500;
  return /fetch failed|network|ECONNRESET|overloaded|unavailable/i.test(e?.message ?? "");
}

/**
 * Runs a Gemini text generation with a per-visitor rate limit, a timeout,
 * fallback to the next model when one is busy, and fallback to the shared
 * key when a feature's own key is out of quota or rejected.
 */
export async function generateWithGeminiFallback(options: {
  system?: string;
  prompt: string;
  feature?: AiFeature;
}) {
  enforceRateLimit();
  const keys = keysFor(options.feature);
  if (!keys.length) {
    console.error("[gemini] no API key configured", options.feature ?? "");
    throw new AiUserError("The AI service is not configured right now. Please try again later.");
  }

  let lastError: unknown = null;
  for (const [ki, apiKey] of keys.entries()) {
    const google = createGoogleGenerativeAI({ apiKey });
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
        const which = ki === 0 && keys.length > 1 ? "feature key" : "key";
        console.warn(`[gemini] ${options.feature ?? "shared"} ${which} / ${modelName} failed:`, (err as Error)?.message ?? err);
        if (!isRetryable(err)) break; // bad key or bad request: try the next key, not the next model
      }
    }
  }

  console.error("[gemini] all keys and models failed", lastError);
  const status = statusOf(lastError);
  if (status === 400 || status === 401 || status === 403) {
    console.error("[gemini] check the API key(s) — Google rejected the request with", status);
    throw new AiUserError("The AI service is unavailable right now. Please try again later.");
  }
  throw new AiUserError("The AI service is busy right now. Please try again in a moment.");
}

/** Message safe to return to the browser for any error from an AI call. */
export function userMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  return err instanceof AiUserError ? err.message : fallback;
}
