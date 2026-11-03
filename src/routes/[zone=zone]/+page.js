import { zones, zoneDocs } from '#lib/docs.js';

// /guide/, /reference/ and /packages/ open the first page of their zone.
export function entries() {
  return zones.map(zone => ({ zone: zone.id }));
}

export function load({ params }) {
  return { to: zoneDocs(params.zone)[0].href };
}
