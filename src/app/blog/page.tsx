import { sectionHeadingClass } from "@/lib/ui-styles";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, Network } from "lucide-react";
import { getAllPosts, getTagCounts, getPostItemsByKind, groupPostsBySeries, getAllSeries } from "@/lib/posts"
import TagSidebar from "../components/TagSidebar";
import LatestHero from "../components/LatestHero";
import PostGrid from "../components/PostGrid";
import SeriesLogList from "../components/SeriesLogList";
import Tr from "../components/Tr";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const tagCounts = getTagCounts(posts);
  const seriesCount = new Set(posts.map((p) => p.meta.series).filter(Boolean)).size;
  const rest = posts.slice(4);
  const articles = getPostItemsByKind(rest, "article");
  const solveLogs = getPostItemsByKind(rest, "solve-log");
  const logGroups = groupPostsBySeries(solveLogs.filter((p) => !!p.meta.series));
  const standaloneLogs = solveLogs.filter((p) => !p.meta.series);

  return (
    <div className="w-full max-w-6xl mx-auto mt-6 px-4 md:px-6 lg:px-8">
      <header className="mb-8 md:mb-12">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent-brand">
          <Tr id="blog.eyebrow" />
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl text-gradient-brand">
          <Tr id="blog.pageTitle" />
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          <Tr id="site.description" />
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 text-sm text-muted-foreground">
          <Link
            href="/blog/series"
            className="group inline-flex min-h-11 items-center rounded-md transition-colors hover:text-accent-brand outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span>
              <strong className="font-display font-bold tabular-nums text-foreground group-hover:text-accent-brand">
                {seriesCount}
              </strong>
              <Tr id="blog.seriesSuffix" />
            </span>
          </Link>
          <Link
            href="/graph"
            className="inline-flex min-h-11 items-center gap-2 rounded-md transition-colors hover:text-accent-brand outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Network className="size-4" aria-hidden />
            <Tr id="nav.graph" />
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </header>

      <div className="lg:flex lg:gap-10">
        {/* sidebar */}
         <TagSidebar
          tagCounts={tagCounts}
          totalCount={posts.length}
          activeTag={null}
          basePath="/blog"
          tagBasePath="/blog/tags"
          series={getAllSeries()}
        />
        {/* main */}
        <div className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-6xl space-y-8">
            <LatestHero posts={posts} />

            {articles.length > 0 ? (
              <section className="space-y-2">
                <h2 className={cn(sectionHeadingClass, "mt-2 mb-2")}>
                  <Tr id="blog.articles" />
                </h2>
                <PostGrid posts={articles} featureFirst={false} />
              </section>
            ) : null}

            {solveLogs.length > 0 ? (
              <section className="space-y-2">
                <h2 className={cn(sectionHeadingClass, "mt-2 mb-2")}>
                  <Tr id="blog.solveLogs" />
                </h2>
                <SeriesLogList groups={logGroups} />
                {standaloneLogs.length > 0 ? <PostGrid posts={standaloneLogs} featureFirst={false} /> : null}
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
