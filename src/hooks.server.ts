import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { setGlobalDispatcher, ProxyAgent } from 'undici';

if (dev && env.http_proxy) {
	const proxyUrl = new URL(env.http_proxy);
	const token = `Basic ${btoa(`${proxyUrl.username}:${proxyUrl.password}`)}`;

	const proxyAgent = new ProxyAgent({
		uri: proxyUrl.protocol + proxyUrl.host,
		token
	});

	setGlobalDispatcher(proxyAgent);
}

export const handle = (async ({ event, resolve }) => {
	return resolve(event);
}) satisfies Handle;
