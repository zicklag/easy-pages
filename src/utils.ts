import { GH_ACCESS_TOKEN_COOKIE_NAME } from '$config';
import { Octokit } from '@octokit/core';
import { redirect, type Cookies } from '@sveltejs/kit';
import { version } from '$app/environment';

export function getOctokit(cookies: Cookies): Octokit {
	const accessToken = cookies.get(GH_ACCESS_TOKEN_COOKIE_NAME);

	// Make sure we have a GitHub access token
	if (!accessToken) {
		throw redirect(303, '/publish/github/login');
	}

	const octokit = new Octokit({ auth: accessToken, userAgent: `Easy Pages ${version}` });
	octokit.hook.wrap('request', async (request, options) => {
		// Set the GitHub API version.
		options.headers['X-GitHub-Api-Version'] = '2022-11-28';
		return request(options);
	});

	return octokit;
}
