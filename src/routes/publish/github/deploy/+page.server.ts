import { fail, redirect } from '@sveltejs/kit';
import { GH_ACCESS_TOKEN_COOKIE_NAME } from 'config';
import type { Actions } from './$types';

export const load = async ({ cookies, url }) => {
	const repo = url.searchParams.get('repo');
	const domain = url.searchParams.get('domain');
	const access_token = cookies.get(GH_ACCESS_TOKEN_COOKIE_NAME);

	// Make sure the repo is set
	if (!repo) {
		throw redirect(303, '/publish/github');
	}

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

	const user: { login: string; avatar_url: string; name: string } = await userResp.json();
	return { user, repo, domain };
};

export const actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const file = data.get('file') as File;

		if (file.size == 0) {
			return fail(400, { errorMessage: 'You must select a file to deploy.' });
		}

		return { success: true, errorMessage: null };
	}
} satisfies Actions;
