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

/** Model used for the AI Health Assistant chat (streaming). */
export const GROQ_CHAT_MODEL = 'llama-3.3-70b-versatile';

/** Model used for the AI Symptom Checker (JSON mode). */
export const GROQ_ANALYSIS_MODEL = 'llama-3.3-70b-versatile';

export default groq;

