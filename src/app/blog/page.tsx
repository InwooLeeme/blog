import Link from "next/link";
import { getAllPosts, getTagCounts } from "@/lib/posts"
import PostGridLoadMore from "../components/PostGridLoadMore";
import TagSidebar from "../components/TagSidebar";
import LatestHero from "../components/LatestHero";
import Tr from "../components/Tr";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const tagCounts = getTagCounts(posts);
  const seriesCount = new Set(posts.map((p) => p.meta.series).filter(Boolean)).size;

  return (
    <div className="w-full max-w-6xl mx-auto mt-6 px-4 md:px-6 lg:px-8">
      <header className="mb-8 md:mb-12">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent-brand">
          Blog
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl text-gradient-brand">
          All Posts
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          <Tr id="site.description" />
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          <Link href="/blog/series" className="group transition-colors hover:text-accent-brand">
            <strong className="font-display font-bold tabular-nums text-foreground group-hover:text-accent-brand">
              {seriesCount}
            </strong>
            <Tr id="blog.seriesSuffix" />
          </Link>
        </p>
      </header>

      <div className="lg:flex lg:gap-10">
        {/* sidebar */}
         <TagSidebar
          tagCounts={tagCounts}
          totalCount={posts.length}
          activeTag={null}
          basePath="/blog"
          tagBasePath="/blog/tags"
        />
        {/* main */}
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-6xl space-y-8">
            <LatestHero posts={posts} />

            <div className="space-y-8">
              <h2 className="text-2xl md:text-3xl font-bold mt-2 mb-2">
                <Tr id="blog.allPosts" params={{ n: posts.length }} />
              </h2>

              <PostGridLoadMore posts={posts} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}