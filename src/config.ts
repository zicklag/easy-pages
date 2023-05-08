import { env } from '$env/dynamic/private';

export const GH_STATE_COOKIE_NAME = 'gh_state';
export const GH_ACCESS_TOKEN_COOKIE_NAME = 'gh_token';
export const GH_CLIENT_ID = env['GH_CLIENT_ID'];
export const GH_CLIENT_SECRET = env['GH_CLIENT_SECRET'];
