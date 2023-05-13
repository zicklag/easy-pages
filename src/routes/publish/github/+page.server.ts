import { fail, redirect } from '@sveltejs/kit';
import { GH_ACCESS_TOKEN_COOKIE_NAME } from '$config';
import type { Actions } from './$types';
import { getOctokit } from '$utils';

export const load = async ({ cookies, url }) => {
	const octokit = getOctokit(cookies);

	// Get the authenticated user
	try {
		const userResp = await octokit.request('GET /user');

		return userResp.data;

	} catch {
		cookies.delete(GH_ACCESS_TOKEN_COOKIE_NAME, {
			domain: url.hostname,
			path: '/'
		});
		throw redirect(303, '/publish/github/login');
	}
};

export const actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const repo = data.get('repo');
		let domain = data.get('domain');

		if (!repo) {
			return fail(400, { repo, domain, repoErrorMessage: 'Repo must be set' });
		}

		throw redirect(303, `/publish/github/deploy?repo=${repo}&domain=${domain}`);
	}
} satisfies Actions;
