import { Head } from "$fresh/runtime.ts";
import { PageProps } from "$fresh/server.ts";
import Header from "../components/Header.tsx";
import Hero from "../components/Hero.tsx";

export default function Home(props: PageProps) {
  return (
    <>
      <Head>
        <title>Easy Pages</title>
      </Head>
      <Header active={props.url.pathname} />
      <div class="m-8">
        <Hero />
      </div>
    </>
  );
}
