import { error, fail, redirect, type Cookies } from '@sveltejs/kit';
import { GH_ACCESS_TOKEN_COOKIE_NAME } from '$config';
import { Octokit } from '@octokit/rest';
import type { Actions } from './$types';
import { getOctokit } from '$utils';
import { fromByteArray as base64FromBytes } from 'base64-js';

import githubWorkflow from './github-workflow.yaml?raw';
import {
	EASY_PAGES_DEPLOYMENT_TARGET_CONTENTS,
	EASY_PAGES_DEPLOYMENT_TARGET_FILENAME as EASY_PAGES_DEPLOYMENT_TARGET_FILENAME
} from '../consts';

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
		const fileData = await file.arrayBuffer();

		const user = await getUser({ octokit, cookies, url });
		const owner = user.login;
		const repoExists = await checkRepoExists({ userLogin: user.login, octokit, repo });
		if (!repoExists) {
			await createRepo({ owner, repo, octokit });
		}

		// Get the repo data
		const repoData = await octokit.repos.get({ owner, repo });
		const defaultBranch = repoData.data.default_branch;

		// Verify this is a repo created by EasyPages
		try {
			await octokit.repos.getContent({ owner, repo, path: EASY_PAGES_DEPLOYMENT_TARGET_FILENAME });
		} catch {
			return fail(400, {
				errorMessage: 'Repo exists, but does not appear to have been created by Easy Pages.'
			});
		}

		// Update the GitHub pages configuration for the repo
		if (!repoData.data.has_pages) {
			await octokit.repos.createPagesSite({
				owner,
				repo,
				build_type: 'workflow',
				source: {
					branch: defaultBranch,
					path: '/'
				}
			});
		}
		await octokit.repos.updateInformationAboutPagesSite({
			owner,
			repo,
			cname: domain || null,
			build_type: 'workflow',
			source: {
				branch: defaultBranch,
				path: '/'
			}
		});
		const ref = `heads/${defaultBranch}`;

		// Create the github workflow YAML blob
		const websiteZipBlob = await octokit.git.createBlob({
			owner,
			repo,
			content: base64FromBytes(new Uint8Array(fileData)),
			encoding: 'base64'
		});
		const readme = await octokit.git.createBlob({
			owner,
			repo,
			content:
				'# EasyPages Website Deployment\n\nThis is a site that has been deployed with EasyPages.'
		});
		const workflowsDir = await octokit.git.createTree({
			owner,
			repo,
			tree: [
				{
					path: 'deploy.yaml',
					mode: '100644',
					content: githubWorkflow.replace('$default-branch', defaultBranch)
				}
			]
		});
		const githubDir = await octokit.git.createTree({
			owner,
			repo,
			tree: [
				{
					path: 'workflows',
					type: 'tree',
					mode: '040000',
					sha: workflowsDir.data.sha
				}
			]
		});
		const rootDir = await octokit.git.createTree({
			owner,
			repo,
			tree: [
				{
					path: '.github',
					type: 'tree',
					mode: '040000',
					sha: githubDir.data.sha
				},
				{
					path: 'website.zip',
					mode: '100644',
					type: 'blob',
					sha: websiteZipBlob.data.sha
				},
				{
					path: 'README.md',
					mode: '100644',
					type: 'blob',
					sha: readme.data.sha
				},
				{
					path: EASY_PAGES_DEPLOYMENT_TARGET_FILENAME,
					mode: '100644',
					content: EASY_PAGES_DEPLOYMENT_TARGET_CONTENTS
				}
			]
		});
		const commit = await octokit.git.createCommit({
			owner,
			repo,
			parents: [],
			message: 'Publish website through EasyPages',
			tree: rootDir.data.sha
		});
		await octokit.git.updateRef({
			owner,
			repo,
			ref,
			sha: commit.data.sha,
			force: true
		});
		await octokit.repos.createDispatchEvent({
			owner,
			repo,
			event_type: 'EasyPages'
		});

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
	owner,
	repo
}: {
	octokit: Octokit;
	owner: string;
	repo: string;
}) {
	await octokit.request('POST /user/repos', {
		name: repo,
		description: 'Website deployed with EasyPages',
		has_issues: false,
		has_projects: false,
		has_wiki: false,
		has_discussions: false,
		has_downloads: false
	});
	// Add the easy pages deployment file to mark the repo as being used for easy pages
	await octokit.repos.createOrUpdateFileContents({
		owner,
		repo,
		path: EASY_PAGES_DEPLOYMENT_TARGET_FILENAME,
		message: 'Initial Commit',
		content: btoa(EASY_PAGES_DEPLOYMENT_TARGET_CONTENTS)
	});
}
