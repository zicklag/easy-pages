import { Head } from "$fresh/runtime.ts";
import { PageProps } from "$fresh/server.ts";
import Header from "../../components/Header.tsx";
import BrandGithub from "https://deno.land/x/tabler_icons_tsx@0.0.1/tsx/brand-github.tsx";

export default function Start(props: PageProps) {
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
    </>
  );
}
