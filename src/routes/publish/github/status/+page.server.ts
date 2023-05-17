import { redirect } from '@sveltejs/kit';
import { GH_ACCESS_TOKEN_COOKIE_NAME } from '$config';
import { getOctokit } from '$utils';

export const load = async ({ cookies, url }) => {
	const octokit = getOctokit(cookies);
	const repo = url.searchParams.get('repo');
	const after = url.searchParams.get('after');
	if (!repo) {
		throw redirect(303, '/publish/github');
	}

	// Get the authenticated user
	let user;
	try {
		const userResp = await octokit.request('GET /user');
		user = userResp.data;
	} catch {
		cookies.delete(GH_ACCESS_TOKEN_COOKIE_NAME, {
			domain: url.hostname,
			path: '/'
		});
		throw redirect(303, '/publish/github/login');
	}
	const repoData = await octokit.repos.getPages({
		owner: user.login,
		repo
	});

	return { user, repo, after, domain: repoData.data.cname };
};
