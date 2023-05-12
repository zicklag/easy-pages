<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	let repoName = '';
	let domain = '';

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

<div class="flex justify-center">
	<div class="flex items-center gap-4">
		<div class="avatar">
			<div class="w-12 rounded-full">
				<img alt="User Avatar" src={data.avatar_url} />
			</div>
		</div>
		<h2 class="text-xl">{data.name}</h2>
	</div>
</div>

<div class="flex flex-col items-center mt-8">
	<form method="post" class="flex flex-col max-w-full" use:enhance>
		<label class="label" for="repo">
			<span class="label-text">The repository to deploy to.</span>
		</label>
		<input
			id="repo"
			type="text"
			name="repo"
			placeholder="Repository Name"
			class="input input-bordered w-full"
			class:input-error={form?.repoErrorMessage}
			bind:value={repoName}
		/>
		{#if form?.repoErrorMessage}
			<label class="label" for="repo">
				<span class="label-text-alt text-error">{form.repoErrorMessage}</span>
			</label>
		{/if}

		<label class="label mt-2" for="domain">Domain</label>
		<input
			id="repo"
			type="text"
			name="domain"
			placeholder={`${data.login}.github.io/${repoName}`}
			class="input input-bordered w-full"
			bind:value={domain}
		/>

		<button type="submit" class="btn btn-active btn-primary ml-auto mt-6">Next</button>
	</form>
</div>
