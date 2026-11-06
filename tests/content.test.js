import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { sep } from 'node:path';
import { docs, zones, zoneDocs, sequenceDocs, redirects, version } from '../src/lib/docs.js';
import { origins } from '../src/lib/origins.js';
import publicApi from './fixtures/public-api.json' with { type: 'json' };
import { highlightCode } from '../src/lib/highlighting/index.js';

// The framework checkout next to the website is optional: tests that read it skip
// their checks when it is missing, so the site can be built on its own.
const framework = new URL('../../Janelkit/packages/', import.meta.url);
const read = path => { try { return readFileSync(new URL(path, framework), 'utf8'); } catch { return null; } };
const exportsOf = (folder, module) => {
  const init = read(`${folder}/src/${module}/__init__.py`);
  if (!init) return null;
  return [...init.match(/__all__\s*=\s*\[([^\]]*)\]/)[1].matchAll(/"([^"]+)"/g)].map(m => m[1]);
};
const packages = {
  router: ['janelkit-router', 'janelkit_router'],
  store: ['janelkit-store', 'janelkit_store'],
  desktop: ['janelkit-desktop', 'janelkit_desktop'],
  i18n: ['janelkit-i18n', 'janelkit_i18n']
};
const codeBlocks = doc => doc.sections.flatMap(section => [
  ...(section.code ? [{ code: section.code, language: section.language, where: section.id }] : []),
  ...(section.files || []).map(file => ({ code: file.code, language: file.language || 'janel', where: `${section.id}:${file.path}` }))
]);

test(`the site documents JanelKit ${version}, the version of the framework checkout`, () => {
  const init = read('janelkit/src/janelkit/__init__.py');
  if (!init) return;
  const installed = init.match(/__version__ = "([^"]+)"/)[1];
  assert.ok(installed.startsWith(`${version}.`), `The site says ${version}; the framework is ${installed}`);
});

test('the Python reference documents every public top-level name of janelkit', () => {
  const live = exportsOf('janelkit', 'janelkit');
  if (live) assert.deepEqual([...live].sort(), [...publicApi].sort(), 'tests/fixtures/public-api.json is out of date');
  const reference = JSON.stringify(docs.find(d => d.slug === 'python-api'));
  for (const name of publicApi) assert.ok(reference.includes(name), `Missing public API: ${name}`);
});

test('every package section names every public name of its package', () => {
  for (const [origin, [folder, module]] of Object.entries(packages)) {
    const names = exportsOf(folder, module);
    if (!names) continue;
    const text = JSON.stringify(docs.filter(doc => doc.origin === origin));
    for (const name of names.filter(n => !n.startsWith('_'))) assert.ok(text.includes(name), `${folder} pages are missing ${name}`);
  }
});

test('examples write built-in elements in lowercase, as JanelKit 0.2 does', () => {
  const legacy = read('janelkit/src/janelkit/compiler/legacy.py');
  const names = legacy
    ? [...legacy.match(/for name in \(([\s\S]*?)\)\s*\n\s*\)/)[1].matchAll(/"([A-Za-z]+)"/g)].map(m => m[1])
    : ['Window', 'Column', 'Row', 'Scroll', 'List', 'Text', 'Button', 'TextField', 'TextArea', 'Checkbox', 'Switch', 'Slider', 'Select', 'RadioGroup', 'Tabs', 'Image', 'Video', 'ProgressBar', 'Shortcut', 'Spacer', 'Slot'];
  assert.ok(names.length >= 20, 'Could not read LEGACY_TAGS');
  const tag = new RegExp(`</?(${names.join('|')})(?=[\\s/>])`);
  for (const doc of docs) {
    for (const block of codeBlocks(doc)) assert.ok(!tag.test(block.code), `${doc.slug}/${block.where} uses a 0.1 tag: ${block.code.match(tag)?.[0]}`);
    // The migration page names the 0.1 tags on purpose.
    if (doc.slug !== 'changes') for (const section of doc.sections) assert.ok(!tag.test(section.body), `${doc.slug}/${section.id} mentions a 0.1 tag`);
  }
});

test('examples import package names from their packages, and nothing removed in 0.2', () => {
  const moved = new Set(['History', 'notify', 'Pages', 'Sections', 'PageStack', 'SectionSet', 'pages', 'sections', 'navigation',
    'persisted', 'Persisted', 'store', 'use', 'dialogs', 'clipboard', 't', 'i18n']);
  for (const doc of docs) for (const block of codeBlocks(doc)) {
    for (const [, names] of block.code.matchAll(/from janelkit import ([^\n]+)/g)) {
      for (const name of names.split(',').map(n => n.trim().split(' ')[0])) assert.ok(!moved.has(name), `${doc.slug}/${block.where} imports ${name} from janelkit`);
    }
    assert.ok(!/\bnotify\(|History\(/.test(block.code), `${doc.slug}/${block.where} uses notify() or History`);
  }
});

test('the learning path teaches from no framework experience to lifecycle and public APIs', () => {
  for (const slug of ['introduction', 'installation', 'first-app', 'anatomy', 'elements', 'state', 'expressions', 'events', 'forms', 'conditions-and-lists', 'computed', 'layout', 'styles', 'components', 'lifecycle', 'sharing-data', 'refs', 'windows', 'async', 'timers', 'video', 'real-time', 'accessibility', 'large-lists', 'reactivity-in-depth', 'testing', 'troubleshooting', 'cli', 'how-it-works']) {
    assert.equal(docs.find(doc => doc.slug === slug)?.zone, 'guide', `Missing guide chapter: ${slug}`);
  }
});

test('lessons explain examples, results and common mistakes instead of just listing APIs', () => {
  for (const doc of zoneDocs('guide')) {
    assert.ok(doc.sections.length >= 4, `${doc.slug} needs at least four teaching sections`);
    assert.ok(doc.sections.some(s => s.explanation?.length), `${doc.slug} needs an explained example`);
    assert.ok(doc.sections.some(s => s.expected), `${doc.slug} needs an observable expected result`);
    assert.ok(doc.sections.some(s => s.pitfalls?.length), `${doc.slug} needs common mistakes`);
    assert.ok(doc.learn?.length >= 2 && doc.learn.length <= 5, `${doc.slug} needs 2–5 learning goals`);
    assert.ok(doc.summary?.length >= 2 && doc.summary.length <= 4, `${doc.slug} needs 2–4 key points`);
  }
});

test('every cross-link and every written path points at an existing page', () => {
  const hrefs = new Set(docs.map(doc => doc.href.replace(/\/$/, '')));
  for (const doc of docs) {
    for (const section of doc.sections) for (const slug of section.see || []) assert.ok(docs.some(d => d.slug === slug), `${doc.slug}/${section.id} links to missing ${slug}`);
    for (const [path] of JSON.stringify(doc).matchAll(/\/(?:guide|reference|ecosystem)(?:\/[a-z0-9-]+)+/g)) assert.ok(hrefs.has(path), `${doc.slug} mentions missing ${path}`);
    assert.ok(!/\/packages\/[a-z]/.test(JSON.stringify(doc.sections)), `${doc.slug} mentions a /packages/ address of 0.1`);
  }
});

test('every page and section has a unique identifier and valid teaching blocks', () => {
  assert.equal(new Set(docs.map(d => d.slug)).size, docs.length);
  for (const doc of docs) {
    assert.ok(doc.description && doc.title && doc.group);
    assert.equal(new Set(doc.sections.map(s => s.id)).size, doc.sections.length, doc.slug);
    for (const s of doc.sections) {
      assert.ok(s.body && s.title && s.id, `${doc.slug}/${s.id}`);
      for (const key of ['explanation', 'steps', 'pitfalls']) if (s[key]) assert.ok(Array.isArray(s[key]) && s[key].every(v => typeof v === 'string'));
      if (s.table) assert.ok(s.table.headers.length && s.table.rows.every(row => row.length === s.table.headers.length), `${doc.slug}/${s.id}: table rows`);
      if (s.files) {
        assert.ok(!s.code, `${doc.slug}/${s.id}: use either code or files`);
        assert.ok(s.files.every(f => f.path && f.code), `${doc.slug}/${s.id}: every file needs a path and code`);
        assert.equal(new Set(s.files.map(f => f.path)).size, s.files.length, `${doc.slug}/${s.id}: duplicate file path`);
      }
    }
  }
});

test('highlighting preserves every documented example verbatim', () => {
  for (const doc of docs) for (const block of codeBlocks(doc)) {
    const tokens = highlightCode(block.code, block.language);
    assert.equal(tokens.map(token => token.content).join(''), block.code, `${doc.slug}/${block.where}`);
    assert.ok(tokens.some(token => token.color), `No highlighting: ${doc.slug}/${block.where}`);
  }
  for (const source of ['', '\n', 'a\r\nb\r\n', 'á\t<&>\n', '<script>alert("not HTML")</script>']) {
    assert.equal(highlightCode(source, 'janel').map(token => token.content).join(''), source);
    assert.deepEqual(highlightCode(source, 'unknown'), [{ content: source }]);
  }
});

test('the VS Code grammar highlights Janel directives and embedded Python and CSS', () => {
  const source = `<script lang="python">
from janelkit import state
count = state(0)
</script>
<button on:click={count += 1}>Hello</button>
{#each [{"id": 1}] as item (item["id"])}
<text>{item["id"]}</text>
{/each}
<style>
.page { padding: 24px; }
</style>`;
  const tokens = highlightCode(source, 'janel');
  for (const [content, category] of [
    ['button', 'tag'], ['on', 'keyword'], ['click', 'attribute'],
    ['from', 'keyword'], ['0', 'number'], ['#each', 'keyword'],
    ['as', 'keyword'], ['id', 'string'], ['padding', 'attribute'], ['24', 'number']
  ]) {
    assert.ok(tokens.some(token => token.content === content && token.color === `var(--syntax-${category})`), `${content}: ${category}`);
  }
});

test('documentation is split into guide, reference and ecosystem areas', () => {
  assert.deepEqual(zones.map(zone => zone.id), ['guide', 'reference', 'ecosystem']);
  for (const zone of zones) assert.ok(zoneDocs(zone.id).length > 0, `${zone.id} is empty`);
  for (const doc of docs.filter(doc => doc.zone !== 'ecosystem')) assert.equal(doc.href, `/${doc.zone}/${doc.slug}/`);
  for (const doc of zoneDocs('ecosystem')) assert.match(doc.href, /^\/ecosystem\/([a-z0-9-]+\/)*$/);
  // The guide teaches what you use before how the engine works, and never uses a concept before its chapter.
  const guide = zoneDocs('guide').map(doc => doc.slug);
  const before = (a, b, why) => assert.ok(guide.indexOf(a) < guide.indexOf(b), why);
  before('anatomy', 'elements', 'The file format comes before its contents');
  before('elements', 'expressions', 'Built-in elements come before template details');
  before('state', 'expressions', 'State comes before the expressions that unwrap it');
  before('events', 'forms', 'Events come before two-way binding');
  before('layout', 'styles', 'Layout comes before decoration');
  before('styles', 'components', 'Styling comes before building larger apps');
  before('async', 'video', 'Background work comes before feeding a model with frames');
  before('timers', 'real-time', 'when= is taught before the real-time patterns that use it');
  before('lifecycle', 'reactivity-in-depth', 'Advanced reactivity comes after effects');
  assert.equal(guide.at(-1), 'how-it-works', 'Engine internals close the guide');
  for (const slug of ['python-api', 'changes', 'glossary', 'ai-agents']) assert.equal(docs.find(d => d.slug === slug).zone, 'reference');
});

test('the guide is all core, and every package has its own section in the ecosystem', () => {
  for (const doc of zoneDocs('guide')) assert.equal(doc.origin, 'core', doc.slug);
  for (const [origin, info] of Object.entries(origins).filter(([key]) => key !== 'core')) {
    const pages = zoneDocs('ecosystem').filter(doc => doc.origin === origin);
    assert.ok(pages.length, `${info.package} has no section`);
    assert.ok(info.install, `${info.package} needs install instructions`);
    assert.ok(pages.every(doc => doc.group === pages[0].group), `${info.package} pages are split across sections`);
  }
  const overview = JSON.stringify(docs.find(doc => doc.slug === 'overview'));
  for (const control of ['<button>', '<textfield>', '<list>']) assert.ok(overview.includes(control), `The overview must say ${control} is core`);
  for (const { package: name } of Object.values(origins)) assert.ok(overview.includes(name), `The overview must name ${name}`);
});

test('previous and next stay inside the guide or inside one package', () => {
  assert.equal(sequenceDocs('guide').length, zoneDocs('guide').length);
  for (const doc of zoneDocs('ecosystem').filter(doc => doc.sequence)) {
    assert.ok(sequenceDocs(doc.sequence).every(other => other.origin === doc.origin), doc.slug);
  }
});

test('the style reference lists every property, pseudo-class and inline property the framework accepts', () => {
  const compiler = read('janelkit/src/janelkit/styling/compiler.py');
  const parser = read('janelkit/src/janelkit/styling/parser.py');
  const lowering = read('janelkit/src/janelkit/compiler/lowering.py');
  if (!compiler || !parser || !lowering) return;
  const sides = ['top', 'right', 'bottom', 'left'];
  const block = (text, start) => text.slice(text.indexOf(start), text.indexOf('\n}', text.indexOf(start)));
  const supported = block(compiler, 'SUPPORTED: dict');
  const properties = [
    ...[...supported.matchAll(/^\s+"([a-z-]+)":/gm)].map(m => m[1]),
    ...[...supported.matchAll(/f"([a-z-]*)\{side\}([a-z-]*)"/g)].flatMap(m => sides.map(side => m[1] + side + m[2]))
  ];
  const pseudos = parser.match(/PSEUDO_CLASSES = \(([^)]*)\)/)[1].match(/"([^"]+)"/g).map(p => p.slice(1, -1));
  const inline = [...block(lowering, '_INLINE = {').matchAll(/^\s+"([a-z-]+)":/gm)].map(m => m[1]);
  assert.ok(properties.length >= 80 && pseudos.length >= 13 && inline.length >= 17, 'Could not read the framework tables');
  const page = docs.find(doc => doc.slug === 'style-reference');
  const sectionText = id => JSON.stringify(page.sections.find(s => s.id === id));
  const all = JSON.stringify(page);
  const word = name => new RegExp(`(^|[^a-z-])${name.replace(/[-]/g, '\\-')}([^a-z-]|$)`);
  for (const property of properties) assert.ok(word(property).test(all), `Style reference is missing the property ${property}`);
  for (const pseudo of pseudos) assert.ok(sectionText('pseudo-classes').includes(`:${pseudo}`), `Style reference is missing :${pseudo}`);
  for (const name of inline) assert.ok(word(name).test(sectionText('inline-style')), `Inline style section is missing ${name}`);
});

test('every address the site published redirects to an existing page', () => {
  const hrefs = new Set(docs.map(doc => doc.href));
  assert.equal(Object.keys(redirects).filter(from => /^\/docs\/[a-z]/.test(from)).length, 24, 'The 24 pages of the first site');
  for (const from of ['/packages/', '/packages/overview/', '/packages/janelkit-desktop/', '/packages/janelkit-i18n/', '/packages/janelkit-vscode/', '/guide/navigation/', '/guide/persistence/', '/guide/', '/reference/']) {
    assert.ok(redirects[from], `${from} must keep working`);
  }
  for (const [from, to] of Object.entries(redirects)) {
    assert.ok(hrefs.has(to), `${from} redirects to missing ${to}`);
    assert.ok(!hrefs.has(from), `${from} is both a page and a redirect`);
  }
});

test('no page text points at the retired /docs/ addresses', () => {
  for (const doc of docs) assert.ok(!/\/docs\/[a-z]/.test(JSON.stringify(doc.sections)), `${doc.slug} links to /docs/`);
  for (const file of readdirSync(new URL('../src/routes/', import.meta.url), { recursive: true }).filter(f => /\.(svelte|js)$/.test(f))) {
    const source = readFileSync(new URL(`../src/routes/${file.split(sep).join('/')}`, import.meta.url), 'utf8');
    assert.ok(!/href="\/(docs|packages)\//.test(source), `${file} links to a retired address`);
  }
});
