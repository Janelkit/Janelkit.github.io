import { zones, zoneDocs, version } from '#lib/docs.js';
import { origins } from '#lib/origins.js';
export const prerender = true;

const intro = `# JanelKit

Desktop applications written entirely in Python, one .janel file per component, rendered with Qt Quick. Alpha ${version}: each series may change the public API, with migration notes and janel migrate. Python 3.10+.

The documentation has three areas: the Guide (read in order), the Reference (look up), and the Ecosystem (one section per package). Everything taught in the Guide ships with the core janelkit package, including every built-in element and control. Packages add navigation, shared data, system services, translations and editor support.

Full documentation text: /llms-full.txt
`;

const packages = Object.values(origins).filter(o => o.install).map(o => `- ${o.package} (${o.install}): ${o.summary}`).join('\n');

const rules = `Use only documented public APIs. Built-in elements are lowercase (<text>, <button>, <column>); a tag with a capital letter is an imported component. Script code uses .value; direct state names in templates are unwrapped. Scripts are trusted Python, not sandboxed markup. Async handlers run on the UI loop; background workers must not touch state or the UI. janel build emits QML, not an executable. Import pages, sections, navigation, Pages and Sections from janelkit_router; store, use and persisted from janelkit_store; dialogs and clipboard from janelkit_desktop; t and i18n from janelkit_i18n; never from janelkit. History and notify no longer exist. Read the lifecycle, template, and public Python API pages before generating code.`;

export function GET() {
  const sections = zones.map(zone => {
    const pages = zoneDocs(zone.id).map(doc => `- ${doc.href} — ${doc.title} [${doc.group}]: ${doc.description}`).join('\n');
    return `## ${zone.title}\n${zone.description}\n\n${pages}`;
  }).join('\n\n');
  const body = `${intro}\n${sections}\n\n## Packages\n${packages}\n\n${rules}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
