import { env } from '../config/env.js';
import { dbAll } from '../db/pool.js';
import type { Lang, MaterialCategory } from '../types/index.js';

export interface GeminiSuccess {
  success: true;
  text: string;
  model: string;
  raw: unknown;
}
export interface GeminiFailure {
  success: false;
  error: string;
}
export type GeminiResult = GeminiSuccess | GeminiFailure;

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}

/** Call Gemini, falling back through known-good models if the primary errors. */
export async function executeGeminiRequest(
  payload: unknown,
  primaryModel: string = env.geminiModel
): Promise<GeminiResult> {
  if (!env.geminiApiKey) {
    return { success: false, error: 'GEMINI_API_KEY is not configured' };
  }

  const modelsToTry = [...new Set([primaryModel, 'gemini-3.6-flash', 'gemini-3.5-flash'])];

  for (const model of modelsToTry) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.geminiApiKey}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.warn(`[Gemini Proxy] Model ${model} returned HTTP ${response.status}: ${errText}`);
        continue;
      }

      const data = (await response.json()) as GeminiResponse;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return { success: true, text, model, raw: data };
    } catch (err) {
      console.error(`[Gemini Proxy] Model ${model} failed:`, err instanceof Error ? err.message : err);
    }
  }

  return { success: false, error: 'All Gemini model endpoint attempts failed' };
}

/**
 * System prompt grounded in the live price board, so the model quotes real
 * rates instead of inventing them.
 */
export async function buildPriceBoardSystemContext(lang: Lang = 'hi'): Promise<string> {
  const fallback = `You are EcoBridge AI assistant for scrap collectors in India. Always be helpful, friendly, and concise. Response language: ${lang}.`;

  try {
    const categories = await dbAll<Pick<MaterialCategory, 'id' | 'name_en' | 'name_hi' | 'name_mr' | 'rate_per_kg' | 'unit'>>(
      'SELECT id, name_en, name_hi, name_mr, rate_per_kg, unit FROM material_categories'
    );

    const rateLines = categories
      .map((c) => {
        const name = lang === 'mr' ? c.name_mr : lang === 'en' ? c.name_en : c.name_hi;
        return `- ${name} (${c.id}): ₹${c.rate_per_kg}/${c.unit}`;
      })
      .join('\n');

    return `You are EcoBridge AI, an expert assistant for scrap collectors and recyclers in India.
CRITICAL MANDATE FOR PRICING: You must ONLY use the following official live market rates from the EcoBridge Price Board. NEVER fabricate, hallucinate, or guess any scrap prices under any circumstances. If a user asks about price or rate, state the exact rate from this official list:
${rateLines}

Keep your responses helpful, concise, friendly, and tailored to scrap collectors. Response language: ${lang}.`;
  } catch {
    return fallback;
  }
}
