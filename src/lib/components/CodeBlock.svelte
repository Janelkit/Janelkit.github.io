<script>
  import { onMount } from 'svelte';
  let ready = $state(false);
  onMount(() => { ready = true; });
  let { code, label = 'App.janel' } = $props();
  let status = $state('Copy');
  async function copy() {
    try { await navigator.clipboard.writeText(code); status = 'Copied!'; }
    catch { status = 'Select to copy'; }
  }
</script>
<div class="code-block"><div class="code-toolbar"><span>{label}</span><button disabled={!ready} onclick={copy} aria-label={`Copy ${label}`}>{status}</button></div><pre><code>{code}</code></pre><span class="sr-only" aria-live="polite">{status}</span></div>
