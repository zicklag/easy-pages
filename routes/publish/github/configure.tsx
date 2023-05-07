import { Head } from "$fresh/runtime.ts";
import { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
import { getCookies } from "std/http/cookie.ts";
import Header from "../../../components/Header.tsx";
import BrandGithub from "https://deno.land/x/tabler_icons_tsx@0.0.1/tsx/brand-github.tsx";
import { GH_ACCESS_TOKEN_COOKIE_NAME } from "../../../config.ts";
import { Octokit } from "https://esm.sh/octokit@2.0.14";

export const handler: Handlers = {
  async GET(req: Request, ctx: HandlerContext) {
    const cookies = getCookies(req.headers);
    const access_token = cookies[GH_ACCESS_TOKEN_COOKIE_NAME];

    if (!access_token) {
      return new Response(null, {
        status: 303,
        headers: new Headers({
          Location: "/",
        }),
      });
    }

    const octokit = new Octokit({
      auth: access_token,
    });

    let repos = octokit.paginate.iterator(octokit.rest)

    const resp = await ctx.render(repos);

    return resp;
  },
};

export default function Start(props: PageProps<string>) {
  const repos = props.data;

  return (
    <>
      <Head>
        <title>Configure GitHub | Easy Pages</title>
      </Head>
      <Header active={props.url.pathname} />
      <h1 class="text-4xl text-center font-medium my-8 flex justify-center gap-8 items-center">
        Configure GitHub
        <BrandGithub size={50} />
      </h1>
    </>
  );
}
