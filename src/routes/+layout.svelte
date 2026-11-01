<script>
  import '../app.css';
  import Header from '#lib/components/Header.svelte';
  let { children } = $props();
</script>
<a class="skip-link" href="#main">Skip to content</a>
<Header />
{@render children()}
<footer class="site-footer"><a href="/" class="wordmark">janel<span>kit</span>.</a><p>A new window for Python.</p><span>Open source. MIT licensed.</span><a href="/docs/introduction/">Read the docs ↗</a></footer>
