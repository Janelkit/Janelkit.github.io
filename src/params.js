// Route parameter matchers (SvelteKit 3 reads them all from this file).
import { defineParams } from '@sveltejs/kit/params';
import { zones } from '#lib/docs.js';

export const params = defineParams({
  /** Only documentation areas (guide, reference, packages) match /[zone=zone]/. */
  zone: param => (zones.some(zone => zone.id === param) ? param : undefined)
});
