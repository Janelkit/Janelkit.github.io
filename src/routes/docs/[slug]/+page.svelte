<script>
  import Redirect from '#lib/components/Redirect.svelte';
  let { data } = $props();
</script>
<Redirect to={data.to}/>
