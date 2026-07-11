import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PostItem } from "@/lib/posts";
import { formatPostDate, getCardCoverSrc } from "@/lib/post-display";
import Tr from "./Tr";
import CoverPlaceholder from "./CoverPlaceholder";

export default function LatestHero({ posts }: { posts: PostItem[] }) {
  const latest = posts.slice(0, 4);
  if (latest.length === 0) return null;

  const [first] = latest;
  const firstCoverSrc = getCardCoverSrc(first.meta);
  const firstPrimaryTag = first.meta.tags?.[0];

  return (
    <>
      {/* 모바일·태블릿: 최신글 1건을 큰 히어로 카드로 */}
      <section className="lg:hidden mb-8">
        <h2 className="text-xl font-bold mb-4"><Tr id="blog.latest" /></h2>

        <Link
          href={`/blog/${first.slug}`}
          aria-label={first.meta.title}
          className="group relative block h-64 overflow-hidden rounded-md border"
        >
          {firstCoverSrc ? (
            <Image
              src={firstCoverSrc}
              alt={first.meta.title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="100vw"
              priority
            />
          ) : (
            <CoverPlaceholder />
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            {firstPrimaryTag ? (
              <span className="inline-block rounded bg-accent-brand px-2 py-0.5 text-xs font-semibold text-accent-brand-fg">
                {firstPrimaryTag}
              </span>
            ) : null}
            <h3 className="mt-2 text-lg font-bold leading-snug line-clamp-2 drop-shadow">
              {first.meta.title}
            </h3>
            <div className="mt-2 flex items-center gap-3 text-xs text-white/85">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <time dateTime={first.meta.date}>
                  {formatPostDate(first.meta.date)}
                </time>
              </span>
              {first.meta.readingTime ? (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <Tr id="post.readingTime" params={{ n: first.meta.readingTime }} />
                </span>
              ) : null}
            </div>
          </div>
        </Link>

        {latest.length > 1 ? (
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-md border">
            {latest.slice(1).map(({ slug, meta }) => {
              const src = getCardCoverSrc(meta);
              return (
                <li key={slug}>
                  <Link
                    href={`/blog/${slug}`}
                    className="group flex items-center gap-3 p-3 transition-colors hover:bg-muted/60"
                  >
                    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded">
                      {src ? (
                        <Image
                          src={src}
                          alt={meta.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <CoverPlaceholder />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-accent-brand">
                        {meta.title}
                      </h4>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <time dateTime={meta.date}>{formatPostDate(meta.date)}</time>
                        {meta.readingTime ? (
                          <>
                            <span aria-hidden>·</span>
                            <Tr id="post.readingTime" params={{ n: meta.readingTime }} />
                          </>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      {/* 데스크톱: 가로 아코디언 */}
      <section className="hidden lg:block mb-10">
        <h2 className="text-xl font-bold mb-4"><Tr id="blog.latest" /></h2>

        <div className="group/row flex gap-1 h-[24rem]">
          {latest.map(({ slug, meta }, i) => {
            const coverSrc = getCardCoverSrc(meta);
            const primaryTag = meta.tags?.[0];
            return (
              <Link
                key={slug}
                href={`/blog/${slug}`}
                aria-label={meta.title}
                className={cn(
                  "group relative basis-0 overflow-hidden rounded-md border bg-card",
                  "transition-[flex-grow,border-color] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                  "outline-none focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  i === 0 ? "grow-[4] border-accent-brand" : "grow",
                  "group-hover/row:grow group-hover/row:border-border",
                  "group-focus-within/row:grow group-focus-within/row:border-border",
                  "hover:!grow-[4] hover:!border-accent-brand",
                  "focus-visible:!grow-[4] focus-visible:!border-accent-brand"
                )}
              >
                {coverSrc ? (
                  <Image
                    src={coverSrc}
                    alt={meta.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(min-width:1024px) 50vw, 25vw"
                    priority={i === 0}
                  />
                ) : (
                  <CoverPlaceholder />
                )}

                {/* dark gradient overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                {/* content overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  {primaryTag ? (
                    <span className="inline-block rounded bg-accent-brand px-2 py-0.5 text-xs font-semibold text-accent-brand-fg">
                      {primaryTag}
                    </span>
                  ) : null}
                  <h3
                    className={cn(
                      "mt-2 text-base font-bold leading-snug line-clamp-2 drop-shadow transition-opacity duration-300",
                      i === 0 ? "opacity-100" : "opacity-0",
                      "group-hover/row:opacity-0 hover:!opacity-100",
                      "group-focus-within/row:opacity-0 group-focus-visible:!opacity-100",
                    )}
                  >
                    {meta.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-3 text-xs text-white/85 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <time dateTime={meta.date}>
                        {formatPostDate(meta.date)}
                      </time>
                    </span>
                    {meta.readingTime ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <Tr id="post.readingTime" params={{ n: meta.readingTime }} />
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
