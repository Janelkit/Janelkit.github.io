// Ordered English learning path. Framework source is consumed read-only.
import { learningDocs } from './docs/learning.js';
import { stateDocs } from './docs/state.js';
import { runtimeDocs } from './docs/runtime.js';
import { interfaceDocs } from './docs/interface.js';
import { practiceDocs } from './docs/practice.js';
import { retainedDocs } from './docs/retained.js';

const order = [
  'introduction', 'installation', 'how-it-works', 'first-app', 'glossary',
  'template-syntax', 'control-flow', 'events',
  'reactivity', 'computed-effects', 'persistence',
  'components', 'lifecycle', 'context-refs', 'navigation',
  'controls', 'styling', 'async',
  'testing', 'troubleshooting', 'python-api', 'cli', 'ecosystem', 'ai-agents'
];
const catalog = [...learningDocs, ...stateDocs, ...runtimeDocs, ...interfaceDocs, ...practiceDocs, ...retainedDocs];
if (new Set(catalog.map(doc => doc.slug)).size !== catalog.length) throw new Error('Duplicate documentation slug');
export const docs = order.map(slug => {
  const doc = catalog.find(doc => doc.slug === slug);
  if (!doc) throw new Error(`Missing documentation: ${slug}`);
  return doc;
});
if (docs.length !== catalog.length) throw new Error('A documentation page is missing from the learning path');

