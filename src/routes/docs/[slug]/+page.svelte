<script>
  import { onMount } from 'svelte';
  let ready = $state(false);
  onMount(() => { ready = true; });
  import { docs } from '#lib/docs.js';
  import DocSection from '#lib/components/DocSection.svelte';
  let { data } = $props();
  let query = $state('');
  const groups = [...new Set(docs.map(doc => doc.group))];
  const searchable = new Map(docs.map(doc => [doc.slug, JSON.stringify(doc).toLowerCase()]));
  let filtered = $derived(docs.filter(doc => searchable.get(doc.slug).includes(query.trim().toLowerCase())));
  let currentIndex = $derived(docs.findIndex(doc => doc.slug === data.doc.slug));
  let minutes = $derived(Math.max(1, Math.ceil(data.doc.sections.map(s => [s.body, ...(s.explanation || []), s.expected || '', ...(s.pitfalls || [])].join(' ')).join(' ').split(/\s+/).length / 200)));
</script>
<svelte:head><title>{data.doc.title} — JanelKit Docs</title><meta name="description" content={data.doc.description}/></svelte:head>
<main id="main" class="docs-layout">
  <aside class="docs-sidebar" aria-label="Documentation navigation"><span class="mobile-doc-title">JANELKIT / DOCUMENTATION</span><label class="docs-search">Search documentation<input disabled={!ready} type="search" bind:value={query} placeholder="Find a concept or API…"/></label><nav class="docs-navigation" aria-label="Documentation topics">
  {#each groups as group}
    {#if filtered.some(doc => doc.group === group)}<h2 class="docs-group-label">{group}</h2><div class="docs-links">{#each filtered.filter(doc => doc.group === group) as doc}<a href={`/docs/${doc.slug}/`} class:current={doc.slug === data.doc.slug} aria-current={doc.slug === data.doc.slug ? 'page' : undefined}>{doc.title}</a>{/each}</div>{/if}
  {/each}
  {#if filtered.length === 0}<p class="empty-search" role="status">No topics found. Try “state”, “task”, or “Python”.</p>{/if}
  </nav></aside>
  <article class="doc-article"><div class="doc-kicker">DOCUMENTATION / {data.doc.group.toUpperCase()}</div><h1>{data.doc.title}</h1><p class="doc-description">{data.doc.description}</p>
  <div class="doc-reading-meta" aria-label="Learning path"><span>CHAPTER {String(currentIndex + 1).padStart(2, '0')} / {String(docs.length).padStart(2, '0')}</span><span>~{minutes} min read · try examples at your own pace</span></div>
  {#if data.doc.slug === 'introduction'}<section class="learning-path"><h2>How to read this documentation</h2><p>No experience with web frameworks, HTML, or CSS is required. We assume you can read basic Python: variables, functions, lists, and imports. Learn in order, or use the reference when you already know the concept.</p><ol><li><a href="/docs/how-it-works/">Understand how JanelKit works</a><span>The journey from a file to a desktop window.</span></li><li><a href="/docs/first-app/">Build your first app</a><span>A complete example, explained step by step.</span></li><li><a href="/docs/template-syntax/">Learn the template language</a><span>Describe what appears in your window.</span></li><li><a href="/docs/python-api/">Look up a Python function</a><span>Signatures, behavior, and when to use each API.</span></li></ol></section>{/if}<div class="doc-alpha"><strong>Alpha / 0.1</strong> — These guides follow the local JanelKit implementation. Public APIs can change in minor 0.x releases. The website uses Svelte; the desktop examples use Python and JanelKit, not JavaScript.</div>
  {#each data.doc.sections as section}<DocSection {section}/>{/each}
  <nav class="doc-pagination" aria-label="Chapter navigation">{#if currentIndex > 0}<a href={`/docs/${docs[currentIndex - 1].slug}/`}><small>← PREVIOUS</small>{docs[currentIndex - 1].title}</a>{/if}{#if currentIndex < docs.length - 1}<a href={`/docs/${docs[currentIndex + 1].slug}/`}><small>NEXT →</small>{docs[currentIndex + 1].title}</a>{/if}</nav>
  <p class="docs-source">English lessons and reference based on the JanelKit source. For additional platform details, <a href="https://github.com/janelkit/janelkit/tree/main/docs" target="_blank" rel="noreferrer">browse the source docs ↗</a>.</p>
  </article>
  <aside class="doc-toc" aria-label="On this page"><span>ON THIS PAGE</span>{#each data.doc.sections as section}<a href={`#${section.id}`}>{section.title}</a>{/each}<a href="/docs/ai-agents/">For coding agents ↗</a></aside>
</main>
