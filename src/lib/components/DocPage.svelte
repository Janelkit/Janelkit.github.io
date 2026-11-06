<script>
  import { onMount } from 'svelte';
  import { docs, zones, zoneDocs, sequenceDocs, hrefFor, version } from '../docs.js';
  import { origins } from '../origins.js';
  import DocSection from './DocSection.svelte';

  let { doc } = $props();
  let ready = $state(false);
  onMount(() => { ready = true; });

  // Search covers every area; without a query the sidebar shows the current area only.
  let query = $state('');
  const searchable = new Map(docs.map(d => [d.slug, JSON.stringify(d).toLowerCase()]));
  let needle = $derived(query.trim().toLowerCase());
  let visible = $derived(needle ? docs.filter(d => searchable.get(d.slug).includes(needle)) : zoneDocs(doc.zone));
  let groups = $derived([...new Map(visible.map(d => {
    const label = needle ? `${zones.find(z => z.id === d.zone).title} · ${d.group}` : d.group;
    return [label, visible.filter(other => other.zone === d.zone && other.group === d.group)];
  }))]);

  let zone = $derived(zones.find(z => z.id === doc.zone));
  let sequence = $derived(doc.sequence ? sequenceDocs(doc.sequence) : []);
  let index = $derived(sequence.findIndex(d => d.slug === doc.slug));
  let previous = $derived(index > 0 ? sequence[index - 1] : null);
  let next = $derived(index >= 0 && index < sequence.length - 1 ? sequence[index + 1] : null);
  let origin = $derived(doc.origin ? origins[doc.origin] : null);
  let minutes = $derived(Math.max(1, Math.ceil(doc.sections.map(s => [s.body, ...(s.explanation || []), s.expected || '', ...(s.pitfalls || [])].join(' ')).join(' ').split(/\s+/).length / 200)));
  let sourceUrl = $derived(origin && origin.package !== 'janelkit'
    ? `https://github.com/janelkit/janelkit/tree/main/packages/${origin.package}#readme`
    : 'https://github.com/janelkit/janelkit/tree/main/docs');
  // The package sections of the ecosystem, for the cards on its overview page.
  const packages = zones.find(z => z.id === 'ecosystem').parts.filter(part => part.origin)
    .map(part => ({ title: part.title, href: part.base, ...origins[part.origin] }));
  const pad = n => String(n).padStart(2, '0');
</script>

<svelte:head><title>{doc.title} — JanelKit {zone.title}</title><meta name="description" content={doc.description}/></svelte:head>
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
        <div class="docs-links">{#each items as item}<a href={item.href} class:current={item.slug === doc.slug} aria-current={item.slug === doc.slug ? 'page' : undefined}>{item.title}</a>{/each}</div>
      {/each}
      {#if visible.length === 0}<p class="empty-search" role="status">No topics found. Try “state”, “task”, or “dialogs”.</p>{/if}
    </nav>
  </aside>

  <article class="doc-article">
    <div class="doc-kicker">{zone.title.toUpperCase()} / {doc.group.toUpperCase()}</div>
    <h1>{doc.title}</h1>
    <p class="doc-description">{doc.description}</p>
    {#if origin}
      <div class="doc-origin" data-origin={doc.origin}>
        <span class="origin-kind">{origin.kind}</span>
        <code>{origin.package}</code>
        <span class="origin-summary">{origin.summary}</span>
        {#if origin.install}<code class="origin-install">{origin.install}</code>{/if}
      </div>
    {/if}
    {#if zone.sequential}
      <div class="doc-reading-meta" aria-label="Learning path"><span>CHAPTER {pad(index + 1)} / {pad(sequence.length)}</span><span>~{minutes} min read · try examples at your own pace</span></div>
    {:else if sequence.length > 1}
      <div class="doc-reading-meta" aria-label="Package pages"><span>{doc.group.toUpperCase()} · PAGE {index + 1} / {sequence.length}</span><span>~{minutes} min read</span></div>
    {:else}
      <div class="doc-reading-meta"><span>{zone.title.toUpperCase()}</span><span>{zone.description}</span></div>
    {/if}

    {#if doc.slug === 'introduction'}
      <section class="learning-path"><h2>How to read this documentation</h2>
        <p>No experience with web frameworks, HTML, or CSS is required. We assume you can read basic Python: variables, functions, lists, and imports. The documentation has three areas. The <strong>Guide</strong> teaches in order; everything in it ships with janelkit. The <strong>Reference</strong> is for looking up exact details. The <strong>Ecosystem</strong> covers the packages you add when you need them: navigation, shared data, system dialogs, translations and editor support.</p>
        <ol>
          <li><a href={hrefFor('first-app')}>Build your first app</a><span>A complete example, explained step by step.</span></li>
          <li><a href={hrefFor('elements')}>Meet the built-in elements</a><span>Windows, layout and controls included with janelkit.</span></li>
          <li><a href={hrefFor('python-api')}>Look up a Python function</a><span>Signatures, behavior, and when to use each API.</span></li>
          <li><a href={hrefFor('overview')}>Explore the ecosystem</a><span>What the core includes, and what each package adds.</span></li>
        </ol>
      </section>
    {/if}
    {#if doc.slug === 'overview'}
      <section class="package-cards" aria-label="Packages">
        {#each packages as item}<a href={item.href}><span class="origin-kind">{item.kind}</span><strong>{item.package}</strong><span>{item.summary}</span><code>{item.install}</code></a>{/each}
      </section>
    {/if}
    <div class="doc-alpha"><strong>Alpha / {version}</strong> — These pages document JanelKit {version} and its packages. Each series (0.1, 0.2…) may change the public API, always with migration notes: see <a href={hrefFor('changes')}>Changes and migration</a>. The website uses Svelte; the desktop examples use Python and JanelKit, not JavaScript.</div>
    {#if doc.learn?.length}
      <section class="lesson-goals" aria-label="What you will learn"><h2>What you will learn</h2><ul>{#each doc.learn as goal}<li>{goal}</li>{/each}</ul></section>
    {/if}

    {#each doc.sections as section}<DocSection {section}/>{/each}

    {#if doc.summary?.length}
      <section class="lesson-summary" aria-label="Key points"><h2>Key points</h2><ul>{#each doc.summary as point}<li>{point}</li>{/each}</ul></section>
    {/if}

    {#if previous || next}
      <nav class="doc-pagination" aria-label="Chapter navigation">
        {#if previous}<a href={previous.href}><small>← PREVIOUS</small>{previous.title}</a>{/if}
        {#if next}<a href={next.href}><small>NEXT →</small>{next.title}</a>{/if}
      </nav>
    {/if}
    <p class="docs-source">English documentation based on the JanelKit source. For additional details, <a href={sourceUrl} target="_blank" rel="noreferrer">browse the source docs ↗</a>.</p>
  </article>

  <aside class="doc-toc" aria-label="On this page"><span>ON THIS PAGE</span>{#each doc.sections as section}<a href={`#${section.id}`}>{section.title}</a>{/each}<a href={hrefFor('ai-agents')}>For coding agents ↗</a></aside>
</main>
