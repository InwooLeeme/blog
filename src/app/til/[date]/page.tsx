import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import TilRecordView, { TilDate } from "@/app/components/til/TilRecordView";
import Tr from "@/app/components/Tr";
import { getAllTilRecords, getTilRecord } from "@/lib/til-files";

interface PageProps {
  params: Promise<{ date: string }>;
}

export function generateStaticParams() {
  return getAllTilRecords().map(({ date }) => ({ date }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { date } = await params;
  const record = getTilRecord(date);
  if (!record) return {};
  return {
    title: `${date} TIL`,
    description: record.summary,
    alternates: { canonical: `/til/${date}` },
  };
}

export default async function TilDetailPage({ params }: PageProps) {
  const { date } = await params;
  const record = getTilRecord(date);
  if (!record) return notFound();

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Link
        href="/til"
        className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-accent-brand"
      >
        <ArrowLeft className="size-4" /> <Tr id="til.back" />
      </Link>
      <header className="mb-10 mt-6 border-b pb-8 sm:mb-14 sm:pb-10">
        <time className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-brand" dateTime={record.date}>
          <TilDate date={record.date} />
        </time>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
          {record.summary}
        </h1>
        <div className="mt-5 flex flex-wrap gap-2">
          {record.lessons.map((lesson) => (
            <span key={lesson.id} className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
              {lesson.course}
            </span>
          ))}
        </div>
      </header>
      <TilRecordView record={record} />
    </article>
  );
}
