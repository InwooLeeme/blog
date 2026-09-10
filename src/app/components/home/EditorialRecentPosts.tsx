import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { formatPostDate } from "@/lib/post-display";
import type { PostItem } from "@/lib/posts";
import Tr from "../Tr";
import { getEditorialPosts } from "./editorial-posts";
import { sectionHeadingClass } from "@/lib/ui-styles";
import { cn } from "@/lib/utils";

export default function EditorialRecentPosts({ posts }: { posts: PostItem[] }) {
  const recent = getEditorialPosts(posts);

  if (recent.length === 0) return null;

  return (
    <section
      id="recent-posts"
      aria-labelledby="recent-posts-title"
      className="scroll-mt-20 bg-background"
    >
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <header className="grid gap-3 border-b pb-6 md:grid-cols-[1fr_1.35fr] md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-accent-brand">
              01 / <Tr id="landing.recentEyebrow" />
            </p>
            <h2
              id="recent-posts-title"
              className={cn(sectionHeadingClass, "mt-3")}
            >
              <Tr id="landing.recent" />
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted-foreground md:justify-self-end md:text-base">
            <Tr id="landing.recentIntro" />
          </p>
        </header>

        <ol>
          {recent.map(({ slug, meta }, index) => {
            const tag = meta.tags?.[0];

            return (
              <li
                key={slug}
                className="border-b"
              >
                <Link
                  href={`/blog/${slug}`}
                  aria-label={meta.title}
                  className="group grid gap-x-6 gap-y-4 py-6 transition-colors focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:grid-cols-[3rem_minmax(0,1fr)] sm:py-8 lg:grid-cols-[3rem_minmax(0,1fr)_11rem]"
                >
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0">
                    {tag ? (
                      <p className="mb-3 font-mono text-xs tracking-[0.04em] text-accent-brand">
                        {tag}
                      </p>
                    ) : null}
                    <h3
                      className="flex max-w-3xl items-start gap-2 text-xl font-semibold leading-snug tracking-[-0.025em] transition-colors group-hover:text-accent-brand group-focus-visible:text-accent-brand sm:text-2xl"
                    >
                      <span>{meta.title}</span>
                      <ArrowUpRight
                        className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-brand motion-reduce:transform-none motion-reduce:transition-none"
                        aria-hidden
                      />
                    </h3>
                    {meta.summary ? (
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                        {meta.summary}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-end gap-2 text-xs tabular-nums text-muted-foreground sm:col-start-2 lg:col-start-3 lg:row-start-1 lg:flex-col lg:items-end lg:justify-between lg:text-right">
                    <time dateTime={meta.date}>{formatPostDate(meta.date)}</time>
                    {meta.readingTime ? (
                      <>
                        <span aria-hidden className="lg:hidden">·</span>
                        <span><Tr id="post.readingTime" params={{ n: meta.readingTime }} /></span>
                      </>
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>

        <div className="mt-10 flex justify-end">
          <Link
            href="/blog"
            className="group/more inline-flex min-h-10 items-center gap-3 border-b border-foreground/30 text-sm font-semibold transition-colors hover:border-accent-brand hover:text-accent-brand focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          >
            <Tr id="landing.morePosts" />
            <ArrowRight className="h-4 w-4 transition-transform group-hover/more:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
