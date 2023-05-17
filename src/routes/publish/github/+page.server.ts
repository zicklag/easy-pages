import { fail, redirect } from '@sveltejs/kit';
import { GH_ACCESS_TOKEN_COOKIE_NAME } from '$config';
import type { Actions } from './$types';
import { getOctokit } from '$utils';
import { EASY_PAGES_DEPLOYMENT_TARGET_FILENAME } from './consts';

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
	deploy: async ({ request, cookies }) => {
		const data = await request.formData();
		const repo = data.get('repo');
		let domain = data.get('domain');

		const octokit = getOctokit(cookies);

		if (!repo) {
			return fail(400, { repo, domain, errorMessage: 'Repo must be set' });
		}

		// Verify this is a repo created by EasyPages, if it exists already
		const user = await octokit.users.getAuthenticated();
		const error = await octokit.repos
			.get({ owner: user.data.login, repo: repo.toString() })
			.then(async (repoData) => {
				try {
					await octokit.repos.getContent({
						owner: user.data.login,
						repo: repo.toString(),
						path: EASY_PAGES_DEPLOYMENT_TARGET_FILENAME
					});
				} catch (e) {
					return fail(400, {
						errorMessage: 'Repository exists, but does not appear to have been created by Easy Pages.'
					});
				}
			})
			.catch(() => undefined);

		if (error) {
			return error;
		}

		throw redirect(303, `/publish/github/deploy?repo=${repo}&domain=${domain}`);
	},
	logout: async ({ cookies, url }) => {
		cookies.delete(GH_ACCESS_TOKEN_COOKIE_NAME, { domain: url.hostname, secure: true, path: '/' });
	}
} satisfies Actions;
