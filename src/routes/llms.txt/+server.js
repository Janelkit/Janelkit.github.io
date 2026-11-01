import { docs } from '#lib/docs.js';
export const prerender = true;
export function GET() {
  const body = '# JanelKit\n\nA Python desktop UI framework with declarative .janel components and Qt Quick rendering. Alpha 0.1: APIs may change. Python 3.10+.\n\nNo web-framework experience is needed for the learning path. Read guides in order. The website is Svelte; the examples run in Python desktop apps.\n\nFull documentation text: /llms-full.txt\n\n## Learning path and reference\n' + docs.map(doc => `- /docs/${doc.slug}/ — ${doc.title}: ${doc.description}`).join('\n') + '\n\nUse only documented public APIs. Script code uses .value; direct state names in templates are unwrapped. Scripts are trusted Python, not sandboxed markup. Async handlers run on the UI loop; background workers must not touch state or the UI. janel build emits QML, not an executable. Read the lifecycle, template, and public Python API guides before generating code.\n';
  return new Response(body, {headers:{'Content-Type':'text/plain; charset=utf-8'}});
}
