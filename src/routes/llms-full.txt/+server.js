import { docs } from '#lib/docs.js';
import { docToText } from '#lib/docs/text.js';
export const prerender = true;
export function GET() {
  const body = '# JanelKit — complete English learning guide and reference\n\nAlpha 0.1. Python desktop UI through Qt Quick. Not a web runtime or built-in LLM SDK.\n\n' + docs.map(docToText).join('\n\n---\n\n');
  return new Response(body, {headers:{'Content-Type':'text/plain; charset=utf-8'}});
}
