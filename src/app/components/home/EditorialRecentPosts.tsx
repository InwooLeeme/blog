import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { formatPostDate } from "@/lib/post-display";
import type { PostItem } from "@/lib/posts";
import Tr from "../Tr";
import { getEditorialPosts } from "./editorial-posts";

export default function EditorialRecentPosts({ posts }: { posts: PostItem[] }) {
  const recent = getEditorialPosts(posts);

  if (recent.length === 0) return null;

  return (
    <section
      id="recent-posts"
      aria-labelledby="recent-posts-title"
      className="scroll-mt-20 border-t bg-background"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <header className="grid gap-4 border-b pb-9 md:grid-cols-[1fr_1.35fr] md:items-end md:pb-12">
          <div>
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-accent-brand">
              01 / <Tr id="landing.recentEyebrow" />
            </p>
            <h2
              id="recent-posts-title"
              className="mt-3 text-[clamp(2rem,5vw,4.5rem)] font-semibold leading-none tracking-[-0.045em]"
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
            const featured = index === 0;
            const tag = meta.tags?.[0];

            return (
              <li
                key={slug}
                className={`group border-b ${featured ? "py-10 sm:py-14" : "py-7 sm:py-9"}`}
              >
                <article className="grid gap-x-6 gap-y-4 sm:grid-cols-[3rem_minmax(0,1fr)] lg:grid-cols-[3rem_minmax(0,1fr)_11rem]">
                  <span className="font-mono text-xs text-muted-foreground/70">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0">
                    {tag ? (
                      <p className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent-brand">
                        {tag}
                      </p>
                    ) : null}
                    <h3
                      className={
                        featured
                          ? "max-w-4xl text-[clamp(1.75rem,4.2vw,3.75rem)] font-semibold leading-[1.06] tracking-[-0.04em]"
                          : "max-w-3xl text-xl font-semibold leading-snug tracking-[-0.025em] sm:text-2xl"
                      }
                    >
                      <Link
                        href={`/blog/${slug}`}
                        className="inline-flex items-start gap-2 transition-colors hover:text-accent-brand focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                      >
                        <span>{meta.title}</span>
                        <ArrowUpRight
                          className={`${featured ? "mt-1.5 h-5 w-5" : "mt-1 h-4 w-4"} shrink-0 opacity-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transform-none motion-reduce:transition-none`}
                          aria-hidden
                        />
                      </Link>
                    </h3>
                    {meta.summary ? (
                      <p className={`${featured ? "mt-5 max-w-2xl text-base" : "mt-3 max-w-xl text-sm"} leading-7 text-muted-foreground`}>
                        {meta.summary}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-end gap-2 font-mono text-[0.67rem] text-muted-foreground sm:col-start-2 lg:col-start-3 lg:row-start-1 lg:flex-col lg:items-end lg:justify-between lg:text-right">
                    <time dateTime={meta.date}>{formatPostDate(meta.date)}</time>
                    {meta.readingTime ? (
                      <>
                        <span aria-hidden className="lg:hidden">·</span>
                        <span><Tr id="post.readingTime" params={{ n: meta.readingTime }} /></span>
                      </>
                    ) : null}
                  </div>
                </article>
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
