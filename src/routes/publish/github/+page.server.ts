import { fail, redirect } from '@sveltejs/kit';
import { GH_ACCESS_TOKEN_COOKIE_NAME } from '$config';
import type { Actions } from './$types';

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

	const user: { login: string; avatar_url: string; name: string } = await userResp.json();
	return user;
};

export const actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const repo = data.get('repo');
		let domain = data.get('domain');

		await new Promise((resolve) => {
			setTimeout(resolve, 2000);
		});

		if (!repo) {
			return fail(400, { repo, domain, repoErrorMessage: 'Repo must be set' });
		}

		throw redirect(303, `/publish/github/deploy?repo=${repo}&domain=${domain}`);
	}
} satisfies Actions;
