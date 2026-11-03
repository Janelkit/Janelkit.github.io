// Exports every documented code example so the Python validator can compile, mount
// and exercise them against a real JanelKit installation.
//   node scripts/export_doc_examples.mjs  →  artifacts/doc-validation/examples.json
import { mkdirSync, writeFileSync } from 'node:fs';
import { docs } from '../src/lib/docs.js';

const examples = docs.flatMap(doc => doc.sections.filter(section => section.code).map(section => ({
  slug: doc.slug,
  id: section.id,
  key: `${doc.slug}/${section.id}`,
  language: section.language || 'text',
  // A complete component is either marked standalone or labeled with its App.janel path.
  complete: Boolean(section.standalone || section.file === 'src/App.janel'),
  file: section.file || null,
  code: section.code
})));

const out = new URL('../artifacts/doc-validation/', import.meta.url);
mkdirSync(out, { recursive: true });
writeFileSync(new URL('examples.json', out), JSON.stringify(examples, null, 2));
const complete = examples.filter(e => e.language === 'janel' && e.complete).length;
const python = examples.filter(e => e.language === 'python').length;
console.log(`Exported ${examples.length} examples (${complete} complete components, ${python} Python snippets).`);
