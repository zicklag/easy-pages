import { Head } from "$fresh/runtime.ts";
import { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
import Header from "../../components/Header.tsx";
import BrandGithub from "https://deno.land/x/tabler_icons_tsx@0.0.1/tsx/brand-github.tsx";
import { GH_CLIENT_ID, GH_STATE_COOKIE_NAME } from "../../config.ts";

export const handler: Handlers = {
  async GET(req: Request, ctx: HandlerContext) {
    const state = crypto.randomUUID();
    ctx.state["authState"] = state;

    const resp = await ctx.render(state);
    resp.headers.set(
      "Set-Cookie",
      `${GH_STATE_COOKIE_NAME}=${state}; Secure; Max-Age=960; Domain=${
        new URL(req.url).hostname
      }`
    );

    return resp;
  },
};

export default function Start(props: PageProps<string>) {
  return (
    <>
      <Head>
        <title>Publish to GitHub | Easy Pages</title>
      </Head>
      <Header active={props.url.pathname} />
      <h1 class="text-4xl text-center font-medium my-8 flex justify-center gap-8 items-center">
        Publish to GitHub
        <BrandGithub size={50} />
      </h1>

      <div class="flex flex-col items-center">
        <a
          href={`https://github.com/login/oauth/authorize?client_id=${GH_CLIENT_ID}&state=${
            props.data
          }&scope=public_repo&redirect_uri=${encodeURIComponent(
            props.url.href
          )}/callback`}
        >
          <div class="px-3 py-2 mx-auto rounded border border(gray-500 2) hover:bg-gray-200 active:bg-gray-300">
            Login to GitHub
          </div>
        </a>
      </div>
    </>
  );
}
