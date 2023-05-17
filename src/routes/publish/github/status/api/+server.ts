import { getOctokit } from '$utils';
import type { RequestHandler } from './$types';

export type GhDeployStatus = {
	cache: {
		workflowId: number;
		jobsEtag?: string;
		workflowEtag?: string;
	};
	workflow: {
		status: string | null;
		steps: { name: string; status: 'queued' | 'in_progress' | 'completed' }[];
	};
};

export const GET = (async ({ cookies, url }) => {
	const octokit = getOctokit(cookies);
	const user = (await octokit.users.getAuthenticated()).data;
	const owner = user.login;
	const repo = url.searchParams.get('repo');
	const cacheWorkflowId = url.searchParams.get('workflowId');
	const cacheJobsEtag = url.searchParams.get('jobsEtag');
	const cacheWorkflowStatus = url.searchParams.get('workflowStatus');
	let cacheWorkflowEtag = url.searchParams.get('workflowEtag') || undefined;

	const after = url.searchParams.get('after');
	const afterDate = after && new Date(parseInt(after)).toISOString();

	if (!repo) {
		throw 'Missing `repo` query parameter';
	}

	let workflow: { id: number; status: string | null } | null = null;
	if (cacheWorkflowId && cacheWorkflowEtag && cacheWorkflowStatus) {
		try {
			const workflowRuns = await octokit.actions.listWorkflowRuns({
				owner,
				repo,
				workflow_id: 'deploy.yaml',
				created: afterDate ? `>${afterDate}` : undefined,
				exclude_pull_requests: true,
				per_page: 1,
				headers: {
					'If-None-Match': cacheWorkflowEtag
				}
			});
			const workflowRun = workflowRuns.data.workflow_runs.at(0);
			if (workflowRun) {
				workflow = {
					id: workflowRun.id,
					status: workflowRun.status
				};
			}
			cacheWorkflowEtag = workflowRuns.headers.etag;
		} catch (e: any) {
			if (e.status && e.status == 304) {
				return new Response(JSON.stringify({ unchanged: true }));
			} else {
				throw 'Unexpected Error';
			}
		}
	} else {
		const workflowRuns = await octokit.actions.listWorkflowRuns({
			owner,
			repo,
			workflow_id: 'deploy.yaml',
			created: afterDate ? `>${afterDate}` : undefined,
			exclude_pull_requests: true,
			per_page: 1
		});

		const workflowRun = workflowRuns.data.workflow_runs.at(0);
		if (workflowRun) {
			workflow = {
				id: workflowRun.id,
				status: workflowRun.status
			};
		}
	}

	// The workflow isn't ready yet
	if (!workflow) {
		return new Response(JSON.stringify({ unchanged: true }));
	}
	const workflowId = workflow.id;

	let jobsList;
	if (cacheJobsEtag) {
		try {
			jobsList = await octokit.actions.listJobsForWorkflowRun({
				owner,
				repo,
				run_id: workflowId,
				headers: {
					'If-None-Match': cacheJobsEtag
				}
			});
		} catch (e: any) {
			if (e.status && e.status == 304) {
				return new Response(JSON.stringify({ unchanged: true }));
			} else {
				throw 'Unexpected Error';
			}
		}
	} else {
		jobsList = await octokit.actions.listJobsForWorkflowRun({
			owner,
			repo,
			run_id: workflowId
		});
	}

	const steps = [];
	for (const job of jobsList.data.jobs) {
		for (const step of job.steps || []) {
			steps.push({
				name: step.name,
				status: step.status
			});
		}
	}

	const status: GhDeployStatus = {
		cache: {
			workflowId: workflowId,
			jobsEtag: jobsList.headers.etag,
			workflowEtag: cacheWorkflowEtag
		},
		workflow: {
			status: workflow.status,
			steps
		}
	};

	return new Response(JSON.stringify(status));
}) satisfies RequestHandler;
