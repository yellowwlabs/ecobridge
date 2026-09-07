import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config/env.js';

const datasetDir = path.resolve(process.cwd(), 'backend/data');
const datasetFilePath = path.join(datasetDir, 'slm_dataset.jsonl');

export interface SlmRecord {
  input_prompt: string;
  output_response: string;
  context_category?: string;
  material_confidence?: number | null;
  language?: string;
  price_grounding_used?: boolean;
}

/** Strip obvious PII before anything is persisted for fine-tuning. */
export function sanitizePii(text: string): string {
  return text
    .replace(/(?:\+91[-\s]?)?[6-9]\d{9}/g, '[REDACTED_PHONE]')
    .replace(/(?:House|Plot|Flat|Door)\s*(?:No\.?|#)?\s*\w+/gi, '[REDACTED_ADDRESS]')
    .replace(/\b(Raju|Amit|Suresh|Ramesh|Priya|Sunita|Anil|Vikas|Rahul)\b/gi, '[USER]');
}

export function appendSlmDataset(record: SlmRecord): void {
  try {
    fs.mkdirSync(datasetDir, { recursive: true });
    const sanitized = {
      timestamp: new Date().toISOString(),
      model: env.geminiModel,
      input_prompt: sanitizePii(record.input_prompt),
      output_response: sanitizePii(record.output_response),
      context_category: record.context_category ?? 'general_scrap',
      material_confidence: record.material_confidence ?? null,
      language: record.language ?? 'hi',
      price_grounding_used: Boolean(record.price_grounding_used)
    };
    fs.appendFileSync(datasetFilePath, `${JSON.stringify(sanitized)}\n`, 'utf8');
  } catch (err) {
    console.warn('[SLM Dataset Logger Warning]:', err instanceof Error ? err.message : err);
  }
}
