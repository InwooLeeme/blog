import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Calendar } from "lucide-react";
import { getAllSeries, getPostsBySeries } from "@/lib/posts";
import { formatPostDate } from "@/lib/post-display";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return getAllSeries().map(({ series }) => ({ name: series }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name: rawName } = await params;
  const name = decodeURIComponent(rawName);
  return {
    title: `${name} 시리즈`,
    description: `"${name}" 시리즈의 전체 글 목록입니다.`,
    alternates: { canonical: `/blog/series/${rawName}` },
  };
}

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name: rawName } = await params;
  const name = decodeURIComponent(rawName);
  const posts = getPostsBySeries(name);
  if (posts.length === 0) return notFound();

  return (
    <div className="w-full max-w-3xl mx-auto mt-6 px-4 md:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent-brand">
          Series
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
          {name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          전체 {posts.length}개 회차
        </p>
      </header>

      <ol className="mt-4">
        {posts.map((p, i) => {
          const isLast = i === posts.length - 1;
          return (
            <li key={p.slug} className={cn("relative flex gap-4", !isLast && "pb-5")}>
              <div className="relative w-5 shrink-0">
                {!isLast && (
                  <span
                    aria-hidden
                    className="absolute left-1/2 top-3 bottom-0 w-px -translate-x-1/2 bg-accent-brand/40"
                  />
                )}
                <span
                  aria-hidden
                  className="absolute left-1/2 top-5 -translate-x-1/2 h-2 w-2 rounded-full bg-accent-brand"
                />
              </div>

              <Link
                href={`/blog/${p.slug}`}
                className="group min-w-0 flex-1 rounded-md border bg-card p-4 transition hover:-translate-y-0.5 hover:border-accent-brand hover:shadow-md"
              >
                <div className="flex items-baseline gap-2">
                  <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                    {i + 1}.
                  </span>
                  <h2 className="font-bold leading-snug line-clamp-2 group-hover:text-accent-brand">
                    {p.meta.title}
                  </h2>
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" aria-hidden />
                  <time dateTime={p.meta.date}>{formatPostDate(p.meta.date)}</time>
                  {p.meta.readingTime ? (
                    <>
                      <span aria-hidden>·</span>
                      <span>{p.meta.readingTime} min read</span>
                    </>
                  ) : null}
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
