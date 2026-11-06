// Documentation structure. Framework source is consumed read-only.
//
// The site has separate areas, each answering one reader question:
//   guide      — "How do I learn to build with JanelKit?"  Read in order. Core only.
//   reference  — "What exactly does this do?"               Looked up, not read in order.
//   ecosystem  — "What can I add, and how do I use it?"     One section per package.
//
// Pages are written in topic modules under ./docs/. This file only decides where each
// page lives, in which order, and its URL: /<area>/<slug>/ in the guide and the reference,
// and <section base><path>/ in the ecosystem (/ecosystem/router/sections/).
import { startDocs } from './docs/start.js';
import { fundamentalsDocs } from './docs/fundamentals.js';
import { advancedDocs } from './docs/advanced.js';
import { internalsDocs } from './docs/internals.js';
import { stateDocs } from './docs/state.js';
import { buildingDocs } from './docs/building.js';
import { realtimeDocs } from './docs/realtime.js';
import { interfaceDocs } from './docs/interface.js';
import { practiceDocs } from './docs/practice.js';
import { retainedDocs } from './docs/retained.js';
import { styleReferenceDocs } from './docs/style-reference.js';
import { changesDocs } from './docs/changes.js';
import { ecosystemDocs } from './docs/ecosystem.js';
import { routerDocs } from './docs/router.js';
import { storeDocs } from './docs/store.js';
import { desktopDocs } from './docs/desktop.js';
import { i18nDocs } from './docs/i18n.js';
import { vscodeDocs } from './docs/vscode.js';
import { origins } from './origins.js';

export const version = '0.2';

export const zones = [
  {
    id: 'guide', title: 'Guide', sequential: true, origin: 'core',
    description: 'Learn to build JanelKit applications, from your first window to how the engine works. Everything here ships with janelkit.',
    parts: [
      { title: 'Start', slugs: ['introduction', 'installation', 'first-app', 'anatomy'] },
      { title: 'Fundamentals', slugs: ['elements', 'state', 'expressions', 'events', 'forms', 'conditions-and-lists', 'computed', 'layout', 'styles'] },
      { title: 'Building applications', slugs: ['components', 'lifecycle', 'sharing-data', 'refs', 'windows', 'async', 'timers'] },
      { title: 'Real time', slugs: ['video', 'real-time'] },
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
      { title: 'Styles', origin: 'core', slugs: ['style-reference'] },
      { title: 'Versions', slugs: ['changes'] },
      { title: 'Vocabulary', slugs: ['glossary'] },
      { title: 'Working with AI', slugs: ['ai-agents'] }
    ]
  },
  {
    id: 'ecosystem', title: 'Ecosystem',
    description: 'Packages that add navigation, shared data, system services, translations and editor support. Each one is installed on its own and uses only the public API of the core.',
    parts: [
      { title: 'Start here', base: '/ecosystem/', pages: { overview: '', 'build-your-own': 'build-your-own' } },
      { title: 'Router', base: '/ecosystem/router/', origin: 'router', sequential: true, pages: {
        router: '', 'router-stacks': 'stacks', 'router-sections': 'sections', 'router-leaving': 'leaving',
        'router-testing': 'testing', 'router-reference': 'reference'
      } },
      { title: 'Store', base: '/ecosystem/store/', origin: 'store', sequential: true, pages: {
        store: '', 'store-fields': 'fields', 'store-strict': 'strict', 'store-use': 'use',
        'store-tracking': 'tracking', 'store-persistence': 'persistence', 'store-testing': 'testing',
        'store-reference': 'reference'
      } },
      { title: 'Desktop', base: '/ecosystem/desktop/', origin: 'desktop', sequential: true, pages: {
        desktop: '', 'desktop-dialogs': 'dialogs', 'desktop-clipboard': 'clipboard', 'desktop-testing': 'testing'
      } },
      { title: 'i18n', base: '/ecosystem/i18n/', origin: 'i18n', sequential: true, pages: {
        i18n: '', 'i18n-catalogs': 'catalogs', 'i18n-formats': 'formats', 'i18n-reference': 'reference'
      } },
      { title: 'VS Code', base: '/ecosystem/vscode/', origin: 'vscode', pages: { vscode: '' } }
    ]
  }
];

const catalog = [
  ...startDocs, ...fundamentalsDocs, ...advancedDocs, ...internalsDocs, ...stateDocs, ...buildingDocs,
  ...realtimeDocs, ...interfaceDocs, ...practiceDocs, ...retainedDocs, ...styleReferenceDocs, ...changesDocs,
  ...ecosystemDocs, ...routerDocs, ...storeDocs, ...desktopDocs, ...i18nDocs, ...vscodeDocs
];
if (new Set(catalog.map(doc => doc.slug)).size !== catalog.length) throw new Error('Duplicate documentation slug');

const placed = (zone, part) => part.pages
  ? Object.entries(part.pages).map(([slug, path]) => [slug, part.base + (path ? `${path}/` : '')])
  : part.slugs.map(slug => [slug, `/${zone.id}/${slug}/`]);

export const docs = zones.flatMap(zone => zone.parts.flatMap(part => placed(zone, part).map(([slug, href]) => {
  const doc = catalog.find(doc => doc.slug === slug);
  if (!doc) throw new Error(`Missing documentation: ${slug}`);
  const origin = doc.origin ?? part.origin ?? zone.origin ?? null;
  if (origin && !origins[origin]) throw new Error(`Unknown origin "${origin}" in ${slug}`);
  // Previous and next follow the whole area in the guide, and one package in the ecosystem.
  const sequence = zone.sequential ? zone.id : part.sequential ? `${zone.id}/${part.title}` : null;
  return { ...doc, group: part.title, zone: zone.id, href, origin, sequence };
})));
if (docs.length !== catalog.length) throw new Error('A documentation page is not placed in any area');
if (new Set(docs.map(doc => doc.href)).size !== docs.length) throw new Error('Two pages share a URL');

export const zoneDocs = id => docs.filter(doc => doc.zone === id);
export const sequenceDocs = key => docs.filter(doc => doc.sequence === key);

export function hrefFor(slug) {
  const doc = docs.find(doc => doc.slug === slug);
  if (!doc) throw new Error(`No documentation page: ${slug}`);
  return doc.href;
}

// Every address the site has published keeps working, including pages that moved when
// the documentation was reorganized: the /docs/<slug>/ pages of the first site, the
// /packages/ area of 0.1, and the guide chapters that became packages in 0.2.
const legacyDocs = {
  introduction: 'introduction', installation: 'installation', 'how-it-works': 'how-it-works',
  'first-app': 'first-app', glossary: 'glossary', 'template-syntax': 'expressions',
  'control-flow': 'conditions-and-lists', events: 'events', reactivity: 'state',
  'computed-effects': 'computed', persistence: 'store-persistence', components: 'components',
  lifecycle: 'lifecycle', 'context-refs': 'sharing-data', navigation: 'router', controls: 'elements',
  styling: 'styles', async: 'async', testing: 'testing', troubleshooting: 'troubleshooting',
  'python-api': 'python-api', cli: 'cli', ecosystem: 'overview', 'ai-agents': 'ai-agents'
};
export const redirects = {
  '/docs/': hrefFor('introduction'),
  ...Object.fromEntries(Object.entries(legacyDocs).map(([old, slug]) => [`/docs/${old}/`, hrefFor(slug)])),
  '/guide/': hrefFor('introduction'),
  '/reference/': hrefFor('python-api'),
  '/guide/navigation/': hrefFor('router'),
  '/guide/persistence/': hrefFor('store-persistence'),
  '/packages/': hrefFor('overview'),
  '/packages/overview/': hrefFor('overview'),
  '/packages/janelkit-desktop/': hrefFor('desktop'),
  '/packages/janelkit-i18n/': hrefFor('i18n'),
  '/packages/janelkit-vscode/': hrefFor('vscode')
};
for (const from of Object.keys(redirects)) if (docs.some(doc => doc.href === from)) throw new Error(`A redirect hides a page: ${from}`);
