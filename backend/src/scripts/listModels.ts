// Prints the Gemini models this API key may call with generateContent.
import { env } from '../config/env.js';

interface ModelList {
  models?: Array<{ name: string; supportedGenerationMethods?: string[] }>;
}

const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${env.geminiApiKey}`);
const data = (await res.json()) as ModelList;

console.log('LIST MODELS STATUS:', res.status);
if (data.models) {
  for (const m of data.models) {
    if (m.supportedGenerationMethods?.includes('generateContent')) console.log(`- ${m.name}`);
  }
} else {
  console.log(JSON.stringify(data, null, 2));
}
