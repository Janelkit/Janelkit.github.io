<script>
  import { onMount } from 'svelte';
  import { highlightCode } from '../highlighting/index.js';
  let ready = $state(false);
  onMount(() => { ready = true; });
  let { code, label = 'App.janel', language = 'janel' } = $props();
  let tokens = $derived(highlightCode(code, language));
  let status = $state('Copy');
  async function copy() {
    try { await navigator.clipboard.writeText(code); status = 'Copied!'; }
    catch { status = 'Select to copy'; }
  }
</script>
<div class="code-block"><div class="code-toolbar"><span>{label}</span><button disabled={!ready} onclick={copy} aria-label={`Copy ${label}`}>{status}</button></div><pre><code data-language={language}>{#each tokens as token}<span style:color={token.color}>{token.content}</span>{/each}</code></pre><span class="sr-only" aria-live="polite">{status}</span></div>
