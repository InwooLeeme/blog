import { sectionHeadingClass } from "@/lib/ui-styles";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { PostItem } from "@/lib/posts";
import { formatPostDate, getCardCoverSrc, getFirstCardCoverIndex } from "@/lib/post-display";
import Tr from "./Tr";

export default function LatestHero({ posts }: { posts: PostItem[] }) {
  const latest = posts.slice(0, 4);
  if (latest.length === 0) return null;
  const priorityCoverIndex = getFirstCardCoverIndex(latest.map(({ meta }) => meta));

  return (
    <section className="mb-10" aria-labelledby="latest-posts-title">
      <h2 id="latest-posts-title" className={cn(sectionHeadingClass, "mb-4")}>
        <Tr id="blog.latest" />
      </h2>
      <ol className="divide-y border-y">
        {latest.map(({ slug, meta }, index) => {
          const coverSrc = getCardCoverSrc(meta);
          return (
            <li key={slug}>
              <Link
                href={`/blog/${slug}`}
                className="group flex items-start gap-4 py-6 transition-colors hover:text-accent-brand focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:gap-5"
              >
                <span aria-hidden className="hidden pt-1 font-mono text-xs text-muted-foreground sm:block">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  {meta.tags?.[0] ? (
                    <p className="mb-2 text-xs font-medium text-accent-brand">{meta.tags[0]}</p>
                  ) : null}
                  <h3 className="text-lg font-semibold leading-snug tracking-tight sm:text-xl">
                    {meta.title}
                  </h3>
                  {meta.summary ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {meta.summary}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs tabular-nums text-muted-foreground">
                    <time dateTime={meta.date}>{formatPostDate(meta.date)}</time>
                    {meta.readingTime ? (
                      <>
                        <span aria-hidden>·</span>
                        <span><Tr id="post.readingTime" params={{ n: meta.readingTime }} /></span>
                      </>
                    ) : null}
                  </div>
                </div>
                {coverSrc ? (
                  <div className="relative mt-1 h-14 w-20 shrink-0 overflow-hidden rounded-lg border bg-muted sm:h-20 sm:w-28">
                    <Image
                      src={coverSrc}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(min-width:640px) 112px, 80px"
                      priority={index === priorityCoverIndex}
                    />
                  </div>
                ) : (
                  <ArrowUpRight aria-hidden className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-accent-brand" />
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
