<script lang="ts">
	import type { PageData } from './$types';
	import { browser } from '$app/environment';
	import type { GhDeployStatus } from './api/+server';
	import Spinner from '$components/Spinner.svelte';
	export let data: PageData;

	let deployStatus: GhDeployStatus | null = null;

	if (browser) {
		new Promise(async () => {
			// Start polling the workflow status
			while (true) {
				const cacheArgs = deployStatus
					? `&workflowId=${deployStatus.cache.workflowId}&jobsEtag=${deployStatus.cache.jobsEtag}&workflowEtag=${deployStatus.cache.workflowEtag}&workflowStatus=${deployStatus.workflow.status}`
					: '';
				const afterArg = data.after ? `&after=${data.after}` : '';
				try {
					let statusResp = await fetch(
						`/publish/github/status/api?repo=${data.repo}` + afterArg + cacheArgs
					);
					const statusData = await statusResp.json();

					if (!statusData.unchanged) {
						deployStatus = statusData;
					}

					if (deployStatus?.workflow.status == 'completed') {
						break;
					}
				} catch {}

				await new Promise((resolve) => setTimeout(resolve, 5000));
			}
		});
	}

	const fadeDur = 250;
</script>

<h1 class="text-4xl text-center font-medium my-8 flex justify-center gap-6 items-center">
	Deployment Status

	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="40"
		height="40"
		fill="currentColor"
		class="bi bi-github"
		viewBox="0 0 16 16"
	>
		<path
			d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
		/>
	</svg>
</h1>

<div class="flex flex-col items-center gap-8">
	<div class="flex items-center gap-4">
		<div class="avatar">
			<div class="w-12 rounded-full">
				<img alt="User Avatar" src={data.user.avatar_url} />
			</div>
		</div>
		<h2 class="text-xl">{data.user.name} / {data.repo}</h2>
	</div>
</div>

<h2
	class="text-xl text-center mt-4"
	class:text-success={deployStatus?.workflow.status == 'completed'}
	class:text-warning={deployStatus?.workflow.status != 'completed'}
>
	{deployStatus?.workflow.status || ''}
</h2>
<div class="mt-8 flex justify-center">
	{#if deployStatus && deployStatus.workflow.steps.length > 0}
		<ul class="steps steps-vertical lg:steps-horizontal">
			{#each deployStatus.workflow.steps as step}
				<li
					class="step"
					class:step-primary={step.status == 'completed'}
					class:step-warning={step.status == 'in_progress'}
				>
					{step.name}
				</li>
			{/each}
		</ul>
	{:else}
		<div class="mx-auto">
			<Spinner size={50} />
		</div>
	{/if}
</div>

{#if deployStatus?.workflow.status == 'completed'}
	<div class="flex flex-col items-center prose text-center mx-auto">
		<div class="mt-12 mb-4 text-2xl font-bold">Deployment completed!</div>
		{#if data.domain}
			<p>
				Your site has been deployed to GitHub Pages. If you have not done so already, you must make
				sure that your domain <code>{data.domain}</code> is configured with a <code>CNAME</code>
				record, pointing at <code>{data.user.login}.github.io/{data.repo}</code>.
			</p>
			<p>
				Once that's done, you can access your new site at:
				<a href={`https://${data.domain}`}>https://${data.domain}</a>!
			</p>
		{:else}
			<p>
				Your site has been deployed to GitHub pages. You can view it at <a
					href={`https://${data.user.login}.github.io/${data.repo}`}
					>https://{data.user.login}.github.io/{data.repo}</a
				>
			</p>
		{/if}
	</div>
{/if}
