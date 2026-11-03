<script>
  import { onMount } from 'svelte';
  import { docs, zones, zoneDocs, hrefFor } from '#lib/docs.js';
  import { origins } from '#lib/origins.js';
  import DocSection from '#lib/components/DocSection.svelte';

  let { data } = $props();
  let ready = $state(false);
  onMount(() => { ready = true; });

  // Search covers every zone; without a query the sidebar shows the current zone only.
  let query = $state('');
  const searchable = new Map(docs.map(doc => [doc.slug, JSON.stringify(doc).toLowerCase()]));
  let needle = $derived(query.trim().toLowerCase());
  let visible = $derived(needle ? docs.filter(doc => searchable.get(doc.slug).includes(needle)) : zoneDocs(data.doc.zone));
  let groups = $derived([...new Map(visible.map(doc => {
    const label = needle ? `${zones.find(z => z.id === doc.zone).title} · ${doc.group}` : doc.group;
    return [label, visible.filter(d => d.zone === doc.zone && d.group === doc.group)];
  }))]);

  let zone = $derived(zones.find(z => z.id === data.doc.zone));
  let pages = $derived(zoneDocs(data.doc.zone));
  let index = $derived(pages.findIndex(doc => doc.slug === data.doc.slug));
  let previous = $derived(zone.sequential && index > 0 ? pages[index - 1] : null);
  let next = $derived(zone.sequential && index < pages.length - 1 ? pages[index + 1] : null);
  let origin = $derived(data.doc.origin ? origins[data.doc.origin] : null);
  let minutes = $derived(Math.max(1, Math.ceil(data.doc.sections.map(s => [s.body, ...(s.explanation || []), s.expected || '', ...(s.pitfalls || [])].join(' ')).join(' ').split(/\s+/).length / 200)));
  let sourceUrl = $derived(data.doc.zone === 'packages' && origin
    ? `https://github.com/janelkit/janelkit/tree/main/packages/${origin.package}#readme`
    : 'https://github.com/janelkit/janelkit/tree/main/docs');
</script>

<svelte:head><title>{data.doc.title} — JanelKit {zone.title}</title><meta name="description" content={data.doc.description}/></svelte:head>
<main id="main" class="docs-layout">
  <aside class="docs-sidebar" aria-label="Documentation navigation">
    <span class="mobile-doc-title">JANELKIT / {zone.title.toUpperCase()}</span>
    <nav class="docs-zones" aria-label="Documentation areas">
      {#each zones as item}<a href={zoneDocs(item.id)[0].href} class:current={item.id === zone.id} aria-current={item.id === zone.id ? 'true' : undefined}>{item.title}</a>{/each}
    </nav>
    <label class="docs-search">Search all documentation<input disabled={!ready} type="search" bind:value={query} placeholder="Find a concept or API…"/></label>
    <nav class="docs-navigation" aria-label="Documentation topics">
      {#each groups as [label, items]}
        <h2 class="docs-group-label">{label}</h2>
        <div class="docs-links">{#each items as doc}<a href={doc.href} class:current={doc.slug === data.doc.slug} aria-current={doc.slug === data.doc.slug ? 'page' : undefined}>{doc.title}</a>{/each}</div>
      {/each}
      {#if visible.length === 0}<p class="empty-search" role="status">No topics found. Try “state”, “task”, or “dialogs”.</p>{/if}
    </nav>
  </aside>

  <article class="doc-article">
    <div class="doc-kicker">{zone.title.toUpperCase()} / {data.doc.group.toUpperCase()}</div>
    <h1>{data.doc.title}</h1>
    <p class="doc-description">{data.doc.description}</p>
    {#if origin}
      <div class="doc-origin" data-origin={data.doc.origin}>
        <span class="origin-kind">{origin.kind}</span>
        <code>{origin.package}</code>
        <span class="origin-summary">{origin.summary}</span>
        {#if origin.install}<code class="origin-install">{origin.install}</code>{/if}
      </div>
    {/if}
    {#if zone.sequential}
      <div class="doc-reading-meta" aria-label="Learning path"><span>CHAPTER {String(index + 1).padStart(2, '0')} / {String(pages.length).padStart(2, '0')}</span><span>~{minutes} min read · try examples at your own pace</span></div>
    {:else}
      <div class="doc-reading-meta"><span>{zone.title.toUpperCase()}</span><span>{zone.description}</span></div>
    {/if}

    {#if data.doc.slug === 'introduction'}
      <section class="learning-path"><h2>How to read this documentation</h2>
        <p>No experience with web frameworks, HTML, or CSS is required. We assume you can read basic Python: variables, functions, lists, and imports. The documentation has three areas. The <strong>Guide</strong> teaches in order; everything in it ships with janelkit. The <strong>Reference</strong> is for looking up exact details. <strong>Packages</strong> covers optional add-ons.</p>
        <ol>
          <li><a href={hrefFor('first-app')}>Build your first app</a><span>A complete example, explained step by step.</span></li>
          <li><a href={hrefFor('elements')}>Meet the built-in elements</a><span>Windows, layout and controls included with janelkit.</span></li>
          <li><a href={hrefFor('python-api')}>Look up a Python function</a><span>Signatures, behavior, and when to use each API.</span></li>
          <li><a href={hrefFor('overview')}>Check what needs an install</a><span>The core versus the optional packages.</span></li>
        </ol>
      </section>
    {/if}
    <div class="doc-alpha"><strong>Alpha / 0.1</strong> — These pages follow the local JanelKit implementation. Public APIs can change in minor 0.x releases. The website uses Svelte; the desktop examples use Python and JanelKit, not JavaScript.</div>
    {#if data.doc.learn?.length}
      <section class="lesson-goals" aria-label="What you will learn"><h2>What you will learn</h2><ul>{#each data.doc.learn as goal}<li>{goal}</li>{/each}</ul></section>
    {/if}

    {#each data.doc.sections as section}<DocSection {section}/>{/each}

    {#if data.doc.summary?.length}
      <section class="lesson-summary" aria-label="Key points"><h2>Key points</h2><ul>{#each data.doc.summary as point}<li>{point}</li>{/each}</ul></section>
    {/if}

    {#if previous || next}
      <nav class="doc-pagination" aria-label="Chapter navigation">
        {#if previous}<a href={previous.href}><small>← PREVIOUS</small>{previous.title}</a>{/if}
        {#if next}<a href={next.href}><small>NEXT →</small>{next.title}</a>{/if}
      </nav>
    {/if}
    <p class="docs-source">English documentation based on the JanelKit source. For additional details, <a href={sourceUrl} target="_blank" rel="noreferrer">browse the source docs ↗</a>.</p>
  </article>

  <aside class="doc-toc" aria-label="On this page"><span>ON THIS PAGE</span>{#each data.doc.sections as section}<a href={`#${section.id}`}>{section.title}</a>{/each}<a href={hrefFor('ai-agents')}>For coding agents ↗</a></aside>
</main>
