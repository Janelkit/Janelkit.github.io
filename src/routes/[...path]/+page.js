import { error } from '@sveltejs/kit';
import { docs, redirects } from '#lib/docs.js';

// Every documentation address: the pages placed in src/lib/docs.js, and the older
// addresses that now redirect to them.
const strip = href => href.replace(/^\/|\/$/g, '');

export function entries() {
  return [...docs.map(doc => doc.href), ...Object.keys(redirects)].map(href => ({ path: strip(href) }));
}

export function load({ params }) {
  const href = `/${strip(params.path ?? "")}/`;
  const doc = docs.find(doc => doc.href === href);
  if (doc) return { doc };
  if (redirects[href]) return { to: redirects[href] };
  error(404, 'Documentation page not found');
}
