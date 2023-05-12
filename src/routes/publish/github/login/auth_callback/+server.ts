import { error } from '@sveltejs/kit';
import {
	GH_ACCESS_TOKEN_COOKIE_NAME,
	GH_CLIENT_ID,
	GH_CLIENT_SECRET,
	GH_STATE_COOKIE_NAME
} from '$config';

export const GET = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const stateFromUrl = url.searchParams.get('state');
	const stateFromCookie = cookies.get(GH_STATE_COOKIE_NAME);
	const isValid = stateFromCookie == stateFromUrl;

	if (!isValid) {
		throw error(400, 'Invalid OAuth state');
	}

	const access_resp = await fetch('https://github.com/login/oauth/access_token', {
		method: 'POST',
		headers: new Headers({
			Accept: 'application/json'
		}),
		body: (() => {
			const data = new FormData();
			data.set('code', code || '');
			data.set('client_id', GH_CLIENT_ID || '');
			data.set('client_secret', GH_CLIENT_SECRET || '');
			return data;
		})()
	});
	if (!access_resp.ok) {
		console.error(
			'Error requesting access token: ' + access_resp.status + ' ' + access_resp.statusText
		);
	}

	const access_token = (await access_resp.json()).access_token;
	if (!access_token) {
		throw error(400, 'Access token not set');
	}

	const resp = new Response(null, {
		status: 303,
		headers: new Headers({
			'Set-Cookie': `${GH_ACCESS_TOKEN_COOKIE_NAME}=${access_token}; Secure; Domain=${
				new URL(url).hostname
			}; Path=/`,
			Location: '/publish/github'
		})
	});

	return resp;
};
