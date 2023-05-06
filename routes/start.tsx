import { Head } from "$fresh/runtime.ts";
import { PageProps } from "$fresh/server.ts";
import Header from "../components/Header.tsx";
import BrandGithub from "https://deno.land/x/tabler_icons_tsx@0.0.1/tsx/brand-github.tsx";

export default function Start(props: PageProps) {
  return (
    <>
      <Head>
        <title>Start | Easy Pages</title>
      </Head>
      <Header active={props.url.pathname} />
      <h1 class="text-4xl text-center font-medium my-8">Choose a Hosting Provider</h1>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-screen-md mx-auto my-10 px-4">
        <a href="/publish/github">
          <div class="p-4 text-center bg-slate-700 rounded-md text-white flex flex-col justify-center">
            <div class="mx-auto mb-2">
              <BrandGithub size={50} />
            </div>
            <div class="text-lg">GitHub</div>
          </div>
        </a>
      </div>
    </>
  );
}
