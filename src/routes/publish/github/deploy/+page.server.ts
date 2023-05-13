import { error, fail, redirect, type Cookies } from '@sveltejs/kit';
import { GH_ACCESS_TOKEN_COOKIE_NAME } from '$config';
import { Octokit } from '@octokit/core';
import type { Actions } from './$types';
import { getOctokit } from '$utils';

export const load = async ({ cookies, url }) => {
	const repo = url.searchParams.get('repo');
	const domain = url.searchParams.get('domain');
	const accessToken = cookies.get(GH_ACCESS_TOKEN_COOKIE_NAME);

	// Make sure we have a GitHub access token
	if (!accessToken) {
		throw redirect(303, '/publish/github/login');
	}

	const octokit = new Octokit({ auth: accessToken });

	// Make sure the repo is set
	if (!repo) {
		throw redirect(303, '/publish/github');
	}

	// Get the authenticated user
	const user = await getUser({ octokit, cookies, url });

	// Check whether the repo exists
	const repoExists = await checkRepoExists({ userLogin: user.login, octokit, repo });

	return { user, repo, domain, repoExists };
};

export const actions = {
	default: async ({ request, cookies, url }) => {
		const data = await request.formData();
		const file = data.get('file') as File | undefined;
		const repo = data.get('repo') as string | undefined;
		let domain = data.get('domain') as string | undefined;
		const octokit = getOctokit(cookies);

		if (!repo) {
			throw error(400, 'Repo not set');
		}

		if (!file || file.size == 0) {
			return fail(400, { errorMessage: 'You must select a file to deploy.' });
		}

		const user = await getUser({ octokit, cookies, url });
		domain = domain || `${user.login}.github.io/${repo}`;
		const repoExists = await checkRepoExists({ userLogin: user.login, octokit, repo });

		if (!repoExists) {
			await createRepo({ repo, octokit, domain });
		}

		return { success: true, errorMessage: null };
	}
} satisfies Actions;

/** Check if the github repo already exists. */
async function checkRepoExists({
	userLogin,
	repo,
	octokit
}: {
	userLogin: string;
	repo: string;
	octokit: Octokit;
}): Promise<boolean> {
	let repoExists: boolean;
	try {
		await octokit.request('GET /repos/{owner}/{repo}', {
			owner: userLogin,
			repo
		});
		repoExists = true;
	} catch (e) {
		repoExists = false;
	}
	return repoExists;
}

async function getUser({
	octokit,
	cookies,
	url
}: {
	octokit: Octokit;
	cookies: Cookies;
	url: URL;
}) {
	const userResp = await octokit.request('GET /user');

	if (userResp.status != 200) {
		cookies.delete(GH_ACCESS_TOKEN_COOKIE_NAME, {
			domain: url.hostname,
			path: '/'
		});
		throw redirect(303, '/publish/github/login');
	}
	return userResp.data;
}

async function createRepo({
	octokit,
	repo,
	domain
}: {
	octokit: Octokit;
	domain: string;
	repo: string;
}) {
	return await octokit.request('POST /user/repos', {
		name: repo,
		description: 'Website deployed with EasyPages',
		homepage: domain,
		has_issues: false,
		has_projects: false,
		has_wiki: false,
		has_discussions: false,
		has_downloads: false
	});
}
