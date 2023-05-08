export const GH_STATE_COOKIE_NAME = 'gh_state';
export const GH_ACCESS_TOKEN_COOKIE_NAME = 'gh_token';

let GH_CLIENT_ID_;
let GH_CLIENT_SECRET_;
if (process.env) {
	GH_CLIENT_ID_ = process.env['GH_CLIENT_ID'];
	GH_CLIENT_SECRET_ = process.env['GH_CLIENT_SECRET'];
} else {
	GH_CLIENT_ID_ = (Deno as any).env.get('GH_CLIENT_ID');
	GH_CLIENT_SECRET_ = (Deno as any).env.get('GH_CLIENT_SECRET');
}

export const GH_CLIENT_ID = GH_CLIENT_ID_;
export const GH_CLIENT_SECRET = GH_CLIENT_SECRET_;
