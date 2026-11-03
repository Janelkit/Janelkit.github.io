<script>
  import { onMount } from 'svelte';
  import ThemeToggle from './ThemeToggle.svelte';
  let ready = $state(false);
  onMount(() => { ready = true; });
  import { page } from '$app/state';
  import { zones, zoneDocs } from '#lib/docs.js';
  let open = $state(false);
</script>
<header class="site-header"><div class="header-inner">
  <a class="wordmark" href="/" aria-label="JanelKit home">janel<span>kit</span><span class="wordmark-dot">.</span></a>
  <span class="version">0.1 / ALPHA</span>
  <nav class:open aria-label="Main navigation">
    {#each zones as zone}<a class:active={page.url.pathname.startsWith(`/${zone.id}/`)} href={zoneDocs(zone.id)[0].href} onclick={() => open = false}>{zone.title}</a>{/each}
    <a href="/#playground" onclick={() => open = false}>Examples</a>
    <a class="github-link" href="https://github.com/janelkit/janelkit" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
  </nav>
  <ThemeToggle />
  <button class="menu-toggle" disabled={!ready} aria-label="Toggle navigation" aria-expanded={open} onclick={() => open = !open}>{open ? 'Close −' : 'Menu +'}</button>
</div></header>
<style>
  @media(max-width:760px){.header-inner .menu-toggle{margin-left:0}}
  @media(max-width:480px){.version{display:none}}
</style>
