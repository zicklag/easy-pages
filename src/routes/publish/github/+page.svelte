<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import Spinner from '$components/Spinner.svelte';
	import { enhance } from '$app/forms';

	let repoName = '';
	let domain = '';
	let loading = false;

	export let data: PageData;
	export let form: ActionData;
</script>

<h1 class="text-4xl text-center font-medium my-8 flex justify-center gap-6 items-center">
	Publish to GitHub

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

<form class="flex justify-center" method="post" action="?/logout">
	<div class="flex items-center gap-4">
		<div class="avatar">
			<div class="w-12 rounded-full">
				<img alt="User Avatar" src={data.avatar_url} />
			</div>
		</div>
		<h2 class="text-xl">{data.name}</h2>
		<div class="tooltip tooltip-right" data-tip="Log Out">
			<button class="btn btn-ghost" type="submit">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					fill="currentColor"
					class="bi bi-box-arrow-right"
					viewBox="0 0 16 16"
				>
					<path
						fill-rule="evenodd"
						d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"
					/>
					<path
						fill-rule="evenodd"
						d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"
					/>
				</svg>
			</button>
		</div>
	</div>
</form>

<div class="flex flex-col items-center mt-8">
	<form
		method="post"
    action="?/deploy"
		class="flex flex-col max-w-full"
		use:enhance={() => {
			loading = true;
			return async ({ result, update }) => {
				await update();
				if (result.type == 'error' || result.type == 'failure') {
					loading = false;
				}
			};
		}}
	>
		<label class="label" for="repo">
			<span class="label-text">The repository to deploy to.</span>
		</label>
		<input
			id="repo"
			type="text"
			name="repo"
			placeholder="Repository Name"
			class="input input-bordered w-full"
			class:input-error={form?.errorMessage}
			disabled={loading}
			bind:value={repoName}
		/>
		<label class="label" for="repo">
			<span class="label-text-alt text-error">{form?.errorMessage || ''}&nbsp;</span>
		</label>

		<label class="label" for="domain">Domain</label>
		<input
			id="repo"
			type="text"
			name="domain"
			placeholder={`${data.login}.github.io/${repoName}`}
			class="input input-bordered w-full"
			disabled={loading}
			bind:value={domain}
		/>

		<div class="flex items-center mt-6">
			<a href="/publish" class="btn">Back</a>
			<div class="flex-grow" />
			{#if loading}
				<Spinner />
			{/if}
			<button type="submit" class="btn btn-active btn-primary ml" disabled={loading}> Next </button>
		</div>
	</form>
</div>
