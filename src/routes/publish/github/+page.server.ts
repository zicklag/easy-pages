export const csr = false;

import { GH_CLIENT_ID } from '../../../config';
import type { PageLoad } from './$types';

export const load = (({ params, url }) => {
	return { GH_CLIENT_ID, state: crypto.randomUUID(), href: url.href };
}) satisfies PageLoad;
