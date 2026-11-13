import Groq from 'groq-sdk';

/**
 * Centralized Groq AI client and model configuration.
 * Uses globalThis caching to avoid re-instantiation during Next.js dev hot-reload.
 */

const globalForGroq = globalThis;

export const groq =
  globalForGroq.groq ??
  new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

if (process.env.NODE_ENV !== 'production') globalForGroq.groq = groq;

/**
 * Priority list of candidate models for chat and symptom analysis.
 * Prioritizes fast, instruction-tuned models available on Groq.
 */
export const GROQ_CANDIDATE_MODELS = [
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'llama-3.3-70b-versatile',
  'llama3-70b-8192',
  'llama3-8b-8192',
];

/** Model used for the AI Health Assistant chat (streaming). */
export const GROQ_CHAT_MODEL = process.env.GROQ_CHAT_MODEL || 'qwen/qwen3.8-27b';

/** Model used for the AI Symptom Checker (JSON mode). */
export const GROQ_ANALYSIS_MODEL = process.env.GROQ_ANALYSIS_MODEL || 'qwen/qwen3.8-27b';

/**
 * Executes a Groq chat completion with automatic fallback if the requested model is not found (404 / model_not_found).
 * Ensures high availability across varying Groq account model access tiers.
 */
export async function createChatCompletionWithFallback(options) {
  const primaryModel = options.model || GROQ_ANALYSIS_MODEL;
  const modelsToTry = [
    primaryModel,
    ...GROQ_CANDIDATE_MODELS.filter(m => m !== primaryModel),
  ];

  let lastError = null;
  for (const model of modelsToTry) {
    try {
      return await groq.chat.completions.create({
        ...options,
        model,
      });
    } catch (err) {
      lastError = err;
      // If error is 404 (model_not_found), seamlessly try the next candidate
      if (err?.status === 404 || err?.error?.code === 'model_not_found') {
        console.warn(`[Groq] Model '${model}' not available (404). Falling back to next available model...`);
        continue;
      }
      // For other errors (e.g. 401, 429), rethrow immediately
      throw err;
    }
  }

  throw lastError;
}

export default groq;
