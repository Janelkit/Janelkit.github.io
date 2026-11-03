import { zones, zoneDocs } from '#lib/docs.js';
import { origins } from '#lib/origins.js';
export const prerender = true;

const intro = `# JanelKit

A Python desktop UI framework with declarative .janel components and Qt Quick rendering. Alpha 0.1: APIs may change. Python 3.10+.

The documentation has three areas: the Guide (read in order), the Reference (look up), and Packages (optional add-ons). Everything taught in the Guide ships with the core janelkit package, including every built-in element and control. Optional packages add services, not controls.

Full documentation text: /llms-full.txt
`;

const packages = Object.values(origins).filter(o => o.install).map(o => `- ${o.package} (${o.install}): ${o.summary}`).join('\n');

const rules = `Use only documented public APIs. Script code uses .value; direct state names in templates are unwrapped. Scripts are trusted Python, not sandboxed markup. Async handlers run on the UI loop; background workers must not touch state or the UI. janel build emits QML, not an executable. Import dialogs, clipboard and notify from janelkit_desktop, and t and i18n from janelkit_i18n, never from janelkit. Read the lifecycle, template, and public Python API pages before generating code.`;

export function GET() {
  const sections = zones.map(zone => {
    const pages = zoneDocs(zone.id).map(doc => `- ${doc.href} — ${doc.title} [${doc.group}]: ${doc.description}`).join('\n');
    return `## ${zone.title}\n${zone.description}\n\n${pages}`;
  }).join('\n\n');
  const body = `${intro}\n${sections}\n\n## Optional packages\n${packages}\n\n${rules}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
