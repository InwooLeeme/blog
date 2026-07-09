import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import LandingHero from "./components/LandingHero";
import PostCard from "./components/PostCard";
import JsonLd from "./components/JsonLd";
import { buildWebSiteJsonLd, buildPersonJsonLd } from "@/lib/jsonLd";
import Tr from "./components/Tr";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  const latest = getAllPosts().slice(0, 3);

  return (
    <>
      <JsonLd data={[buildWebSiteJsonLd(), buildPersonJsonLd()]} />
      <LandingHero />

      <section className="mx-auto w-full mt-10 max-w-6xl px-4 pb-20 md:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold"><Tr id="landing.recent" /></h2>

        <div className="grid gap-5 lg:grid-cols-3">
          {latest.map((p) => (
            <PostCard key={p.slug} slug={p.slug} meta={p.meta} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full bg-accent-brand px-6 py-2.5 text-sm font-semibold text-accent-brand-fg shadow-sm transition hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md"
          >
            <Tr id="landing.morePosts" />
          </Link>
        </div>
      </section>
    </>
  );
}
