import test from 'node:test';
import assert from 'node:assert/strict';
import { docs } from '../src/lib/docs.js';
import publicApi from './fixtures/public-api.json' with { type: 'json' };
import { highlightCode } from '../src/lib/highlighting/index.js';

test('Python reference documents every public top-level name from JanelKit 0.1.0',()=>{
  const reference=docs.find(d=>d.slug==='python-api');
  assert.ok(reference,'Python API reference is missing');
  const text=JSON.stringify(reference);
  for(const name of publicApi) assert.ok(text.includes(name),`Missing public API: ${name}`);
});

test('the learning path teaches from no framework experience to lifecycle and public APIs', () => {
  for (const slug of ['introduction','how-it-works','first-app','template-syntax','control-flow','events','reactivity','computed-effects','persistence','python-api','components','lifecycle','context-refs','navigation','async']) {
    assert.ok(docs.find(doc=>doc.slug===slug), `Missing beginner guide: ${slug}`);
  }
});

test('new lessons explain examples, results and common mistakes instead of just listing APIs', () => {
  for (const slug of ['how-it-works','first-app','template-syntax','control-flow','events','reactivity','computed-effects','persistence','components','lifecycle','context-refs','navigation','async']) {
    const doc=docs.find(doc=>doc.slug===slug);
    assert.ok(doc,`Missing ${slug}`);
    assert.ok(doc.sections.length>=5,`${slug} needs at least five teaching sections`);
    assert.ok(doc.sections.some(s=>s.explanation?.length),`${slug} needs an explained example`);
    assert.ok(doc.sections.some(s=>s.expected),`${slug} needs an observable expected result`);
    assert.ok(doc.sections.some(s=>s.pitfalls?.length),`${slug} needs common mistakes`);
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
