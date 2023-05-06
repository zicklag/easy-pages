import { Head } from "$fresh/runtime.ts";
import { PageProps } from "$fresh/server.ts";
import Header from "../components/Header.tsx";

export default function AboutPage(props: PageProps) {
  return (
    <>
      <Head>
        <title>Easy Pages</title>
      </Head>
      <Header active={props.url.pathname} />
      <article class="mx-auto max-w-screen-md prose-lg mt-9">
        Easy Pages is a simple solution for deploying static websites to a variety of backends.
        The idea is that you come here with a zip of your website contents, and we make it as
        easy as possible to publish to a variety of different hosting providers such as GitHub
        Pages, Netlify, Cloudflare, etc.
      </article>
    </>
  );
}
