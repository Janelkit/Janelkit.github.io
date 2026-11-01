import { error } from '@sveltejs/kit';
import { docs } from '#lib/docs.js';
export function entries() { return docs.map(doc => ({ slug: doc.slug })); }
export function load({ params }) {
  const doc = docs.find(doc => doc.slug === params.slug);
  if (!doc) error(404, 'Documentation page not found');
  return { doc };
}
