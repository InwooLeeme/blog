import Link from "next/link";
import type { Metadata } from "next";
import { getAllSeries } from "@/lib/posts";
import { formatPostDate } from "@/lib/post-display";
import Tr from "@/app/components/Tr";

export const metadata: Metadata = {
  title: "시리즈",
  alternates: { canonical: "/blog/series" },
};

export default function SeriesIndexPage() {
  const series = getAllSeries();

  return (
    <div className="w-full max-w-6xl mx-auto mt-6 px-4 md:px-6 lg:px-8">
      <header className="mb-8 md:mb-12">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent-brand">
          Series
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
          <Tr id="series.title" />
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          <Tr id="series.organized" params={{ n: series.length }} />
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {series.map(({ series: name, count, latestDate }) => (
          <li key={name}>
            <Link
              href={`/blog/series/${encodeURIComponent(name)}`}
              className="group flex h-full flex-col gap-2 rounded-md border bg-card p-5 transition hover:-translate-y-0.5 hover:border-accent-brand hover:shadow-md"
            >
              <h2 className="font-display text-lg font-bold tracking-tight leading-snug group-hover:text-accent-brand">
                {name}
              </h2>
              <div className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                <span><Tr id="series.episodeCount" params={{ n: count }} /></span>
                <span aria-hidden>·</span>
                <span><Tr id="series.updated" params={{ date: formatPostDate(latestDate) }} /></span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
