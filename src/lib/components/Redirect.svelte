<!-- Static-host friendly redirect: client navigation keeps the #anchor; without
     JavaScript the meta refresh still reaches the new page. -->
<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  let { to, title = 'This page has moved' } = $props();
  onMount(() => { goto(to + location.hash, { replace: true }); });
</script>
<svelte:head>
  <title>{title} — JanelKit</title>
  <meta http-equiv="refresh" content={`1; url=${to}`}/>
  <meta name="robots" content="noindex"/>
  <link rel="canonical" href={to}/>
</svelte:head>
<main id="main" class="shell" style="padding-block:100px;min-height:65vh">
  <span class="eyebrow">THE DOCUMENTATION WAS REORGANIZED</span>
  <h1>{title}</h1>
  <p>This address now lives somewhere else.</p>
  <a class="button primary" href={to} style="margin-top:30px">Continue to the new page ↗</a>
</main>
