<script>
  import CodeBlock from './CodeBlock.svelte';
  import { docs } from '../docs.js';
  let { section } = $props();
  // "see" lists slugs of related pages; titles and URLs always come from the catalog.
  let related = $derived((section.see || []).map(slug => docs.find(doc => doc.slug === slug)).filter(Boolean));
</script>
<section class="doc-section" id={section.id}>
  <h2><a class="section-title-link" href={`#${section.id}`}>{section.title}<span aria-hidden="true"> #</span></a></h2>
  {#each section.body.split('\n\n').filter(Boolean) as paragraph}<p>{paragraph}</p>{/each}
  {#if section.steps?.length}<ol class="lesson-steps">{#each section.steps as step}<li>{step}</li>{/each}</ol>{/if}
  {#if section.table}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (Scrollable reference tables need keyboard focus.) -->
  <div class="doc-table-wrapper" role="region" aria-label={`${section.title} reference table`} tabindex="0"><table class="doc-table"><thead><tr>{#each section.table.headers as header}<th scope="col">{header}</th>{/each}</tr></thead><tbody>{#each section.table.rows as row}<tr>{#each row as cell}<td>{cell}</td>{/each}</tr>{/each}</tbody></table></div>{/if}
  {#if section.code}<CodeBlock code={section.code} language={section.language || 'text'} label={section.file || section.filename || section.language || 'Example'}/>{#if section.standalone}<p class="example-scope">Complete component · Save as src/App.janel in a scaffolded project.</p>{:else if section.file}<p class="example-scope">Complete file · Save as {section.file}.</p>{:else if section.language === 'janel'}<p class="example-scope">Fragment · Add it to an existing component; it is not a complete file.</p>{/if}{/if}
  {#if section.explanation?.length}<div class="lesson-explanation"><h3>How it works</h3><ol>{#each section.explanation as line}<li>{line}</li>{/each}</ol></div>{/if}
  {#if section.expected}<div class="lesson-expected"><h3>What you should see</h3><p>{section.expected}</p></div>{/if}
  {#if section.pitfalls?.length}<div class="lesson-pitfalls"><h3>Common mistakes</h3><ul>{#each section.pitfalls as mistake}<li>{mistake}</li>{/each}</ul></div>{/if}
  {#if related.length}<p class="lesson-see"><span>Learn more</span>{#each related as doc}<a href={doc.href}>{doc.title} ↗</a>{/each}</p>{/if}
</section>
