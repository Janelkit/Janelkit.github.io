import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { sep } from 'node:path';
import { docs, zones, zoneDocs, legacyRedirects, legacySlugs } from '../src/lib/docs.js';
import { origins } from '../src/lib/origins.js';
import publicApi from './fixtures/public-api.json' with { type: 'json' };
import { highlightCode } from '../src/lib/highlighting/index.js';

test('Python reference documents every public top-level name from JanelKit 0.1.0',()=>{
  const reference=docs.find(d=>d.slug==='python-api');
  assert.ok(reference,'Python API reference is missing');
  const text=JSON.stringify(reference);
  for(const name of publicApi) assert.ok(text.includes(name),`Missing public API: ${name}`);
});

test('the learning path teaches from no framework experience to lifecycle and public APIs', () => {
  for (const slug of ['introduction','installation','first-app','anatomy','elements','state','expressions','events','forms','conditions-and-lists','computed','layout','styles','components','lifecycle','context-refs','navigation','async','persistence','accessibility','large-lists','reactivity-in-depth','how-it-works','python-api']) {
    assert.ok(docs.find(doc=>doc.slug===slug), `Missing guide: ${slug}`);
  }
});

test('lessons explain examples, results and common mistakes instead of just listing APIs', () => {
  for (const doc of zoneDocs('guide').filter(doc => !['testing', 'troubleshooting', 'cli'].includes(doc.slug))) {
    assert.ok(doc.sections.length>=4,`${doc.slug} needs at least four teaching sections`);
    assert.ok(doc.sections.some(s=>s.explanation?.length),`${doc.slug} needs an explained example`);
    assert.ok(doc.sections.some(s=>s.expected),`${doc.slug} needs an observable expected result`);
    assert.ok(doc.sections.some(s=>s.pitfalls?.length),`${doc.slug} needs common mistakes`);
  }
});

test('rewritten chapters open with goals and close with key points', () => {
  for (const doc of zoneDocs('guide').filter(doc => ['Start', 'Fundamentals', 'Advanced interface', 'Under the hood'].includes(doc.group))) {
    assert.ok(doc.learn?.length >= 2 && doc.learn.length <= 5, `${doc.slug} needs 2–5 learning goals`);
    assert.ok(doc.summary?.length >= 2 && doc.summary.length <= 4, `${doc.slug} needs 2–4 key points`);
  }
});

test('every cross-link and every written path points at an existing page', () => {
  const hrefs = new Set(docs.map(doc => doc.href.replace(/\/$/, '')));
  for (const doc of docs) {
    for (const section of doc.sections) for (const slug of section.see || []) assert.ok(docs.some(d => d.slug === slug), `${doc.slug}/${section.id} links to missing ${slug}`);
    for (const [path] of JSON.stringify(doc).matchAll(/\/(?:guide|reference|packages)\/[a-z0-9-]+/g)) assert.ok(hrefs.has(path), `${doc.slug} mentions missing ${path}`);
  }
});

test('every page and section has a unique identifier and valid teaching blocks',()=>{
  assert.equal(new Set(docs.map(d=>d.slug)).size,docs.length);
  for(const doc of docs){
    assert.ok(doc.description && doc.title && doc.group);
    assert.equal(new Set(doc.sections.map(s=>s.id)).size,doc.sections.length,doc.slug);
    for(const s of doc.sections){
      assert.ok(s.body && s.title && s.id,`${doc.slug}/${s.id}`);
      for(const key of ['explanation','steps','pitfalls']) if(s[key]) assert.ok(Array.isArray(s[key]) && s[key].every(v=>typeof v==='string'));
      if(s.table) assert.ok(s.table.headers.length && s.table.rows.every(row=>row.length===s.table.headers.length));
    }
  }
});

test('highlighting preserves every documented example verbatim', () => {
  for (const doc of docs) {
    for (const section of doc.sections.filter(section => section.code)) {
      const tokens = highlightCode(section.code, section.language);
      assert.equal(tokens.map(token => token.content).join(''), section.code, `${doc.slug}/${section.id}`);
      assert.ok(tokens.some(token => token.color), `No highlighting: ${doc.slug}/${section.id}`);
    }
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
<Button on:click={count += 1}>Hello</Button>
{#each [{"id": 1}] as item (item["id"])}
<Text>{item["id"]}</Text>
{/each}
<style>
.page { padding: 24px; }
</style>`;
  const tokens = highlightCode(source, 'janel');
  for (const [content, category] of [
    ['Button', 'tag'], ['on', 'keyword'], ['click', 'attribute'],
    ['from', 'keyword'], ['0', 'number'], ['#each', 'keyword'],
    ['as', 'keyword'], ['id', 'string'], ['padding', 'attribute'], ['24', 'number']
  ]) {
    assert.ok(tokens.some(token => token.content === content && token.color === `var(--syntax-${category})`), `${content}: ${category}`);
  }
});

test('documentation is split into guide, reference and packages areas', () => {
  assert.deepEqual(zones.map(zone => zone.id), ['guide', 'reference', 'packages']);
  for (const zone of zones) assert.ok(zoneDocs(zone.id).length > 0, `${zone.id} is empty`);
  for (const doc of docs) assert.equal(doc.href, `/${doc.zone}/${doc.slug}/`);
  // The guide teaches what you use before how the engine works, and never uses a concept before its chapter.
  const guide = zoneDocs('guide').map(doc => doc.slug);
  const before = (a, b, why) => assert.ok(guide.indexOf(a) < guide.indexOf(b), why);
  before('anatomy', 'elements', 'The file format comes before its contents');
  before('elements', 'expressions', 'Built-in elements come before template details');
  before('state', 'expressions', 'State comes before the expressions that unwrap it');
  before('events', 'forms', 'Events come before two-way binding');
  before('layout', 'styles', 'Layout comes before decoration');
  before('styles', 'components', 'Styling comes before building larger apps');
  before('lifecycle', 'reactivity-in-depth', 'Advanced reactivity comes after effects');
  assert.equal(guide.at(-1), 'how-it-works', 'Engine internals close the guide');
  for (const slug of ['python-api', 'glossary', 'ai-agents']) assert.equal(docs.find(d => d.slug === slug).zone, 'reference');
});

test('every guide page is marked as core and every package page names its package', () => {
  for (const doc of zoneDocs('guide')) assert.equal(doc.origin, 'core', doc.slug);
  for (const doc of zoneDocs('packages').filter(doc => doc.slug !== 'overview')) {
    assert.ok(doc.origin && doc.origin !== 'core', `${doc.slug} needs a package origin`);
    assert.ok(origins[doc.origin].install, `${doc.slug} needs install instructions`);
  }
  const overview = JSON.stringify(docs.find(doc => doc.slug === 'overview'));
  for (const control of ['Button', 'TextField', 'List']) assert.ok(overview.includes(control), `Overview must say ${control} is core`);
});

test('package pages cover every public name their package exports', () => {
  const root = new URL('../../Janelkit/packages/', import.meta.url);
  const packages = { 'janelkit-desktop': 'janelkit_desktop', 'janelkit-i18n': 'janelkit_i18n' };
  for (const [slug, module] of Object.entries(packages)) {
    let init;
    try { init = readFileSync(new URL(`${slug}/src/${module}/__init__.py`, root), 'utf8'); }
    catch { continue; } // The framework checkout is optional when building the site alone.
    const names = [...init.matchAll(/__all__\s*=\s*\[([^\]]*)\]/g)][0][1].match(/"([^"]+)"/g).map(n => n.slice(1, -1)).filter(n => !n.startsWith('_') && n !== 'I18n');
    const text = JSON.stringify(docs.find(doc => doc.slug === slug));
    for (const name of names) assert.ok(text.includes(name), `${slug} page is missing ${name}`);
  }
});

test('every published /docs/ address redirects to an existing page', () => {
  assert.equal(legacySlugs.length, 24);
  for (const slug of legacySlugs) assert.ok(docs.some(doc => doc.href === legacyRedirects[slug]), slug);
});

test('no page text points at the retired /docs/ addresses', () => {
  for (const doc of docs) assert.ok(!/\/docs\/[a-z]/.test(JSON.stringify(doc.sections)), `${doc.slug} links to /docs/`);
  for (const file of readdirSync(new URL('../src/routes/', import.meta.url), { recursive: true }).filter(f => /\.(svelte|js)$/.test(f) && !f.startsWith('docs'))) {
    const source = readFileSync(new URL(`../src/routes/${file.split(sep).join('/')}`, import.meta.url), 'utf8');
    assert.ok(!/href="\/docs\//.test(source), `${file} links to /docs/`);
  }
});
