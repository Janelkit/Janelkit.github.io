<script>
  import { onMount } from 'svelte';
  let theme = $state('dark');
  let ready = $state(false);
  function apply(next) {
    theme = next;
    document.documentElement.dataset.theme = next;
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--bg').trim());
  }
  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem('janelkit-theme', next); } catch { /* Theme still works without storage. */ }
  }
  onMount(() => {
    apply(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
    ready = true;
    const sync = (event) => {
      if (event.key === 'janelkit-theme' || event.key === null) apply(event.newValue === 'light' ? 'light' : 'dark');
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  });
</script>
<button class="theme-toggle" disabled={!ready} onclick={toggle} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} aria-pressed={theme === 'light'} title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
  {#if theme === 'dark'}<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>{:else}<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20.5 13a8.5 8.5 0 0 1-9.5-9.5A8.5 8.5 0 1 0 20.5 13Z"/></svg>{/if}
  <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
</button>
<style>
  .theme-toggle{display:inline-flex;flex-shrink:0;align-items:center;justify-content:center;gap:9px;min-height:44px;min-width:44px;padding:0 12px;background:var(--surface);color:var(--text);border:1px solid var(--line-strong);border-radius:3px;font-size:11px}
  .theme-toggle:hover{border-color:var(--pink);color:var(--pink)}
  .theme-toggle:disabled{opacity:.55}
  @media(max-width:760px){.theme-toggle{margin-left:auto;padding:0;width:44px}.theme-toggle span{display:none}}
</style>
