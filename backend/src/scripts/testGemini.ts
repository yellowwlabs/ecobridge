// Smoke-tests the Gemini client and its model fallback chain.
import { executeGeminiRequest } from '../services/gemini.js';

const result = await executeGeminiRequest({
  contents: [{ role: 'user', parts: [{ text: 'What is the current scrap copper rate in India?' }] }]
});

console.log(result.success ? `[${result.model}] ${result.text}` : `FAILED: ${result.error}`);
process.exitCode = result.success ? 0 : 1;
