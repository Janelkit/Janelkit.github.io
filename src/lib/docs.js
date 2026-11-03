// Documentation structure. Framework source is consumed read-only.
//
// The site has separate zones, each answering one reader question:
//   guide      — "How do I learn to build with JanelKit?"  Read in order.
//   reference  — "What exactly does this do?"               Looked up, not read in order.
//   packages   — "What can I add, and what does it give me?"
//
// Pages are written in topic modules under ./docs/. This file only decides where
// each page lives and in which order. A page's URL is /<zone>/<slug>/.
import { startDocs } from './docs/start.js';
import { fundamentalsDocs } from './docs/fundamentals.js';
import { advancedDocs } from './docs/advanced.js';
import { internalsDocs } from './docs/internals.js';
import { stateDocs } from './docs/state.js';
import { buildingDocs } from './docs/building.js';
import { interfaceDocs } from './docs/interface.js';
import { practiceDocs } from './docs/practice.js';
import { retainedDocs } from './docs/retained.js';
import { packageDocs } from './docs/packages.js';
import { origins } from './origins.js';

export const zones = [
  {
    id: 'guide', title: 'Guide', sequential: true, origin: 'core',
    description: 'Learn to build JanelKit applications, from your first window to how the engine works.',
    parts: [
      { title: 'Start', slugs: ['introduction', 'installation', 'first-app', 'anatomy'] },
      { title: 'Fundamentals', slugs: ['elements', 'state', 'expressions', 'events', 'forms', 'conditions-and-lists', 'computed', 'layout', 'styles'] },
      { title: 'Building applications', slugs: ['components', 'lifecycle', 'sharing-data', 'refs', 'navigation', 'async', 'timers', 'persistence'] },
      { title: 'Advanced interface', slugs: ['accessibility', 'large-lists', 'reactivity-in-depth'] },
      { title: 'Quality and delivery', slugs: ['testing', 'troubleshooting', 'cli'] },
      { title: 'Under the hood', slugs: ['how-it-works'] }
    ]
  },
  {
    id: 'reference', title: 'Reference',
    description: 'Exact signatures, behavior and vocabulary. Look things up here; learn them in the Guide.',
    parts: [
      { title: 'Python API', origin: 'core', slugs: ['python-api'] },
      { title: 'Vocabulary', slugs: ['glossary'] },
      { title: 'Working with AI', slugs: ['ai-agents'] }
    ]
  },
  {
    id: 'packages', title: 'Packages',
    description: 'Optional packages and editor tools. Everything you need to build an app is already in the core.',
    parts: [
      { title: 'Start here', slugs: ['overview'] },
      { title: 'Optional packages', slugs: ['janelkit-desktop', 'janelkit-i18n'] },
      { title: 'Editor tooling', slugs: ['janelkit-vscode'] }
    ]
  }
];

const catalog = [...startDocs, ...fundamentalsDocs, ...advancedDocs, ...internalsDocs, ...stateDocs, ...buildingDocs, ...interfaceDocs, ...practiceDocs, ...retainedDocs, ...packageDocs];
if (new Set(catalog.map(doc => doc.slug)).size !== catalog.length) throw new Error('Duplicate documentation slug');

export const docs = zones.flatMap(zone => zone.parts.flatMap(part => part.slugs.map(slug => {
  const doc = catalog.find(doc => doc.slug === slug);
  if (!doc) throw new Error(`Missing documentation: ${slug}`);
  const origin = doc.origin ?? part.origin ?? zone.origin ?? null;
  if (origin && !origins[origin]) throw new Error(`Unknown origin "${origin}" in ${slug}`);
  return { ...doc, group: part.title, zone: zone.id, href: `/${zone.id}/${slug}/`, origin };
})));
if (docs.length !== catalog.length) throw new Error('A documentation page is not placed in any zone');

export const zoneDocs = id => docs.filter(doc => doc.zone === id);

export function hrefFor(slug) {
  const doc = docs.find(doc => doc.slug === slug);
  if (!doc) throw new Error(`No documentation page: ${slug}`);
  return doc.href;
}

// Every URL the site published under /docs/<slug>/ keeps working, including pages
// that were renamed when their content was reorganized.
const renamed = {
  ecosystem: 'overview', controls: 'elements', 'template-syntax': 'expressions', reactivity: 'state',
  'control-flow': 'conditions-and-lists', 'computed-effects': 'computed', styling: 'styles',
  'context-refs': 'sharing-data'
};
export const legacySlugs = [
  'introduction', 'installation', 'how-it-works', 'first-app', 'glossary',
  'template-syntax', 'control-flow', 'events',
  'reactivity', 'computed-effects', 'persistence',
  'components', 'lifecycle', 'context-refs', 'navigation',
  'controls', 'styling', 'async',
  'testing', 'troubleshooting', 'python-api', 'cli', 'ecosystem', 'ai-agents'
];
export const legacyRedirects = Object.fromEntries(legacySlugs.map(slug => [slug, hrefFor(renamed[slug] ?? slug)]));
