import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PostItem } from "@/lib/posts";

const DATE_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export default function LatestHero({ posts }: { posts: PostItem[] }) {
  const latest = posts.slice(0, 4);
  if (latest.length === 0) return null;

  return (
    <section className="hidden lg:block mb-10">
      <h2 className="text-xl font-bold mb-4">Latest</h2>

      <div className="group/row flex gap-1 h-[24rem]">
        {latest.map(({ slug, meta }, i) => {
          const coverSrc = meta.cover || `/blog/${slug}/opengraph-image`;
          const primaryTag = meta.tags?.[0];
          return (
            <Link
              key={slug}
              href={`/blog/${slug}`}
              aria-label={meta.title}
              className={cn(
                "group relative basis-0 overflow-hidden rounded-xl border bg-card",
                "transition-[flex-grow,border-color] duration-300 ease-out",
                i === 0 ? "grow-[4] border-accent-brand" : "grow",
                "group-hover/row:grow group-hover/row:border-border",
                "hover:!grow-[4] hover:!border-accent-brand"
              )}
            >
              <Image
                src={coverSrc}
                alt={meta.title}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(min-width:1024px) 50vw, 25vw"
                priority={i === 0}
              />

              {/* dark gradient overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              {/* content overlay */}
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                {primaryTag ? (
                  <span className="inline-block rounded bg-accent-brand px-2 py-0.5 text-[0.7rem] font-semibold text-accent-brand-fg">
                    {primaryTag}
                  </span>
                ) : null}
                <h3 className="mt-2 text-base font-bold leading-snug line-clamp-2 drop-shadow">
                  {meta.title}
                </h3>
                <div className="mt-2 flex items-center gap-3 text-xs text-white/85 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <time dateTime={meta.date}>
                      {DATE_FORMATTER.format(new Date(meta.date))}
                    </time>
                  </span>
                  {meta.readingTime ? (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {meta.readingTime}분
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
