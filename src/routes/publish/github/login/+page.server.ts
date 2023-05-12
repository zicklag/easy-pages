export const csr = false;

import { redirect } from '@sveltejs/kit';
import { GH_ACCESS_TOKEN_COOKIE_NAME, GH_CLIENT_ID, GH_STATE_COOKIE_NAME } from '$config';

export const load = ({ cookies, url }) => {
  if (cookies.get(GH_ACCESS_TOKEN_COOKIE_NAME)) {
    throw redirect(303, '/publish/github');
  }

	const state = crypto.randomUUID();
	cookies.set(GH_STATE_COOKIE_NAME, state, {
		domain: url.hostname,
		secure: true,
		maxAge: 960,
		path: '/'
	});
	return { GH_CLIENT_ID, state, href: url.href };
};
