// Hits the running backend's AI proxy to confirm it answers end to end.
import { env } from '../config/env.js';

const res = await fetch(`http://localhost:${env.port}/api/v1/ai/query`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: 'How should I safely handle battery scrap?', lang: 'en' })
});

console.log('STATUS:', res.status);
console.log(JSON.stringify(await res.json(), null, 2));
