import { error } from '@sveltejs/kit';
import { legacyRedirects, legacySlugs } from '#lib/docs.js';

// Old /docs/<slug>/ URLs, published before the documentation was split into zones.
export function entries() {
  return legacySlugs.map(slug => ({ slug }));
}

export function load({ params }) {
  const to = legacyRedirects[params.slug];
  if (!to) error(404, 'Documentation page not found');
  return { to };
}
