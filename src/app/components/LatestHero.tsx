import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock } from "lucide-react";
import type { PostItem } from "@/lib/posts";
import { formatPostDate, getCardCoverSrc, getCoverLabel } from "@/lib/post-display";
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
          className="group relative block h-64 overflow-hidden rounded-xl border"
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
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border">
            {latest.slice(1).map(({ slug, meta }, i) => {
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
                          priority={!firstCoverSrc && i === 0}
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

      {/* 데스크톱: 대표 글과 보조 글을 한눈에 비교하는 편집형 레이아웃 */}
      <section className="hidden lg:block mb-10">
        <h2 className="text-xl font-bold mb-4"><Tr id="blog.latest" /></h2>

        <div className="grid grid-cols-[minmax(0,3fr)_minmax(20rem,2fr)] gap-4">
          <Link
            href={`/blog/${first.slug}`}
            aria-label={first.meta.title}
            className="group relative min-h-96 overflow-hidden rounded-2xl border border-accent-brand/60 bg-card shadow-lg shadow-accent-brand/5 outline-none transition hover:-translate-y-0.5 hover:border-accent-brand hover:shadow-xl hover:shadow-accent-brand/15 focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {firstCoverSrc ? (
              <Image
                src={firstCoverSrc}
                alt={first.meta.title}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(min-width:1024px) 48vw, 100vw"
                priority
              />
            ) : (
              <CoverPlaceholder label={getCoverLabel(first.meta)} seed={0} />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/5" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              {firstPrimaryTag ? (
                <span className="inline-flex rounded-full bg-accent-brand px-2.5 py-1 text-xs font-semibold text-accent-brand-fg shadow-sm">
                  {firstPrimaryTag}
                </span>
              ) : null}
              <h3 className="mt-3 text-2xl font-bold leading-tight drop-shadow-sm">
                {first.meta.title}
              </h3>
              {first.meta.summary ? (
                <p className="mt-2 line-clamp-2 max-w-xl text-sm leading-relaxed text-white/75">
                  {first.meta.summary}
                </p>
              ) : null}
              <div className="mt-4 flex items-center gap-3 text-xs text-white/80">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" aria-hidden />
                  <time dateTime={first.meta.date}>{formatPostDate(first.meta.date)}</time>
                </span>
                {first.meta.readingTime ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    <Tr id="post.readingTime" params={{ n: first.meta.readingTime }} />
                  </span>
                ) : null}
              </div>
            </div>
          </Link>

          {latest.length > 1 ? (
            <div className="divide-y divide-border overflow-hidden rounded-2xl border bg-card">
              {latest.slice(1).map(({ slug, meta }, i) => {
                const src = getCardCoverSrc(meta);
                const primaryTag = meta.tags?.[0];
                return (
                  <Link
                    key={slug}
                    href={`/blog/${slug}`}
                    className="group grid min-h-32 grid-cols-[7rem_minmax(0,1fr)] items-center gap-4 p-3 outline-none transition hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-brand"
                  >
                    <div className="relative aspect-[14/10] overflow-hidden rounded-lg bg-muted">
                      {src ? (
                        <Image
                          src={src}
                          alt={meta.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="112px"
                          priority={!firstCoverSrc && i === 0}
                        />
                      ) : (
                        <CoverPlaceholder label={getCoverLabel(meta)} seed={i + 1} />
                      )}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    <div className="min-w-0">
                      {primaryTag ? (
                        <span className="text-[11px] font-semibold text-accent-brand">
                          {primaryTag}
                        </span>
                      ) : null}
                      <h3 className="mt-1 line-clamp-2 text-base font-bold leading-snug transition-colors group-hover:text-accent-brand">
                        {meta.title}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
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
                );
              })}
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
