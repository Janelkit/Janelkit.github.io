import { zones, zoneDocs } from '#lib/docs.js';
import { docToText } from '#lib/docs/text.js';
export const prerender = true;
export function GET() {
  const head = '# JanelKit — complete English documentation\n\nAlpha 0.1. Python desktop UI through Qt Quick. Not a web runtime or built-in LLM SDK. Areas: Guide (in order), Reference (look up), Packages (optional add-ons).\n\n';
  const body = head + zones.map(zone => `# ${zone.title.toUpperCase()}\n\n${zone.description}\n\n` + zoneDocs(zone.id).map(docToText).join('\n\n---\n\n')).join('\n\n===\n\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
