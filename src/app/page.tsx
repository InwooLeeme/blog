import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllPosts } from "@/lib/posts";
import LandingHero from "./components/LandingHero";
import PostCard from "./components/PostCard";
import JsonLd from "./components/JsonLd";
import { buildWebSiteJsonLd, buildPersonJsonLd } from "@/lib/jsonLd";
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

      <section className="mx-auto w-full max-w-6xl px-4 pb-20 md:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold">최근 글</h2>
          <Link
            href="/blog"
            className="group inline-flex items-center gap-1 text-sm font-medium text-accent-brand"
          >
            전체 보기
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((p) => (
            <PostCard key={p.slug} slug={p.slug} meta={p.meta} />
          ))}
        </div>
      </section>
    </>
  );
}
