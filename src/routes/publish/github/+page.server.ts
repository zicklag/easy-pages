export const csr = false;

import { redirect } from '@sveltejs/kit';
import { GH_ACCESS_TOKEN_COOKIE_NAME, GH_CLIENT_ID } from 'config';

export const load = async ({ cookies, url }) => {
	const access_token = cookies.get(GH_ACCESS_TOKEN_COOKIE_NAME);

	// Make sure we have a GitHub access token
	if (!access_token) {
		throw redirect(303, '/publish/github/login');
	}

	// Get the authenticated user
	const userResp = await fetch(`https://api.github.com/user`, {
		method: 'GET',
		headers: new Headers({
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${access_token}`,
			'X-GitHub-Api-Version': '2022-11-28'
		})
	});

	if (!userResp.ok) {
		cookies.delete(GH_ACCESS_TOKEN_COOKIE_NAME, {
			domain: url.hostname,
			path: '/'
		});
		throw redirect(303, '/publish/github/login');
	}

	const user: { login: string; avatar_url: string } = await userResp.json();
	return user;
};
