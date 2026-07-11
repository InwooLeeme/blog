import Link from "next/link";
import type { SeriesGroup } from "@/lib/posts";
import { formatPostDate, getEpisodeLabel } from "@/lib/post-display";
import Tr from "./Tr";

/** `/blog` 회차성 글 컴팩트 리스트 — 시리즈별로 그룹핑해 밀도 높은 행으로 렌더 */
export default function SeriesLogList({ groups }: { groups: SeriesGroup[] }) {
  return (
    <div className="space-y-8">
      {groups.map((g) => (
        <div key={g.series}>
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-bold">
              {g.series}
              <span className="ml-2 text-sm font-medium text-muted-foreground">
                <Tr id="series.episodeCount" params={{ n: g.total }} />
              </span>
            </h3>
            <Link
              href={`/blog/series/${encodeURIComponent(g.series)}`}
              className="shrink-0 text-sm text-muted-foreground transition-colors hover:text-accent-brand"
            >
              <Tr id="seriesNav.viewAll" params={{ n: g.total }} />
            </Link>
          </div>

          <div className="mt-3 divide-y divide-border rounded-md border">
            {g.posts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                aria-label={p.meta.title}
                className="group flex items-center justify-between gap-4 px-4 py-2.5 transition-colors hover:bg-muted/60"
              >
                <span className="truncate text-sm font-medium group-hover:text-accent-brand">
                  {getEpisodeLabel(p.meta)}
                </span>
                <time
                  dateTime={p.meta.date}
                  className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground"
                >
                  {formatPostDate(p.meta.date)}
                </time>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
