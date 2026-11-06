<script>
  import Redirect from '#lib/components/Redirect.svelte';
  import DocPage from '#lib/components/DocPage.svelte';
  let { data } = $props();
</script>
{#if data.to}<Redirect to={data.to}/>{:else}<DocPage doc={data.doc}/>{/if}
