"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SeriesNav } from "@/lib/posts";

const WINDOW_SIZE = 5;
const WINDOW_THRESHOLD = 8;

type NodeState = "read" | "current" | "upcoming";

function getNodeState(i: number, currentIdx: number): NodeState {
  if (i === currentIdx) return "current";
  return i < currentIdx ? "read" : "upcoming";
}

/** 회차 하나(레일 노드 + 제목) */
function EpisodeRow({
  episode,
  index,
  currentIdx,
  isLast,
}: {
  episode: SeriesNav["episodes"][number];
  index: number;
  currentIdx: number;
  isLast: boolean;
}) {
  const state = getNodeState(index, currentIdx);
  const isCurrent = state === "current";

  return (
    <li className={cn("relative flex gap-3", !isLast && "pb-4")}>
      {/* 레일: 점 + 다음 노드로 이어지는 연결선 */}
      <div className="relative w-5 shrink-0">
        {!isLast && (
          <span
            aria-hidden
            className={cn(
              "absolute left-1/2 top-3 bottom-0 w-px -translate-x-1/2",
              state === "read" ? "bg-accent-brand" : "bg-border",
            )}
          />
        )}
        <span
          aria-hidden
          className={cn(
            "absolute left-1/2 top-1 -translate-x-1/2 rounded-full",
            isCurrent && "h-3 w-3 bg-accent-brand ring-4 ring-accent-brand/20",
            state === "read" && "h-2 w-2 bg-accent-brand",
            state === "upcoming" && "h-2 w-2 border-2 border-muted-foreground/30 bg-card",
          )}
        />
      </div>

      <Link
        href={`/blog/${episode.slug}`}
        aria-current={isCurrent ? "page" : undefined}
        className={cn(
          "flex min-w-0 flex-1 items-baseline gap-2 rounded-md px-2 py-0.5 text-sm transition",
          isCurrent
            ? "bg-accent-brand/10 font-semibold text-accent-brand"
            : state === "read"
              ? "text-foreground/80 hover:bg-muted hover:text-foreground"
              : "text-foreground/55 hover:bg-muted hover:text-foreground",
        )}
      >
        <span className="tabular-nums opacity-60">{index + 1}.</span>
        <span className="line-clamp-1">{episode.title}</span>
        {isCurrent && (
          <span className="ml-auto shrink-0 rounded-full bg-accent-brand/15 px-1.5 py-0.5 text-xs font-medium">
            지금 읽는 중
          </span>
        )}
      </Link>
    </li>
  );
}

/** 이전/다음 회차로 이동하는 카드형 링크 */
function AdjacentLink({
  post,
  direction,
}: {
  post: SeriesNav["prev"];
  direction: "prev" | "next";
}) {
  const isPrev = direction === "prev";

  if (!post) {
    return (
      <div
        className={cn(
          "flex-1 rounded-lg border border-dashed p-3 text-xs text-muted-foreground/50",
          !isPrev && "text-right",
        )}
      >
        {isPrev ? "첫 회차입니다" : "마지막 회차입니다"}
      </div>
    );
  }

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "flex-1 rounded-lg border p-3 text-sm transition hover:bg-muted",
        isPrev
          ? "hover:border-accent-brand/50"
          : "border-accent-brand/30 bg-accent-brand/5 text-right hover:border-accent-brand",
      )}
    >
      <span
        className={cn(
          "flex items-center gap-1 text-xs",
          isPrev ? "text-muted-foreground" : "justify-end text-accent-brand",
        )}
      >
        {isPrev && <ChevronLeft className="h-3.5 w-3.5" />}
        {isPrev ? "이전 회차" : "다음 회차"}
        {!isPrev && <ChevronRight className="h-3.5 w-3.5" />}
      </span>
      <span
        className={cn(
          "mt-1 line-clamp-1 font-medium",
          !isPrev && "text-accent-brand",
        )}
      >
        {post.meta.title}
      </span>
    </Link>
  );
}

/** 시리즈 진행 타임라인 카드 */
export default function SeriesNavigation({ nav }: { nav: SeriesNav }) {
  const { series, prev, next, position, total, episodes } = nav;
  const [expanded, setExpanded] = useState(false);

  const currentIdx = position - 1;
  const isLong = episodes.length > WINDOW_THRESHOLD;
  const windowStart = isLong
    ? Math.min(Math.max(currentIdx - 2, 0), episodes.length - WINDOW_SIZE)
    : 0;
  const visibleEpisodes =
    isLong && !expanded
      ? episodes.slice(windowStart, windowStart + WINDOW_SIZE)
      : episodes;

  return (
    <section
      aria-label="시리즈"
      className="relative mt-12 overflow-hidden rounded-xl border bg-card p-5"
    >
      {/* 좌측 브랜드 그라데이션 레일 */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ background: "var(--accent-gradient)" }}
      />

      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-semibold tracking-wider text-accent-brand">
          SERIES
        </span>
        <span className="text-xs tabular-nums text-muted-foreground">
          {position} / {total}회차
        </span>
      </div>
      <h2 className="mt-1 line-clamp-2 font-display text-xl font-bold tracking-tight">
        {series}
      </h2>

      <ol className="mt-4 border-t pt-4">
        {visibleEpisodes.map((ep, localI) => {
          const i = windowStart + localI;
          return (
            <EpisodeRow
              key={ep.slug}
              episode={ep}
              index={i}
              currentIdx={currentIdx}
              isLast={localI === visibleEpisodes.length - 1}
            />
          );
        })}
      </ol>

      {isLong && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-1 text-xs font-medium text-muted-foreground transition hover:text-accent-brand"
        >
          전체 {episodes.length}개 회차 보기
        </button>
      )}

      <div className="mt-5 flex items-stretch gap-3 border-t pt-4">
        <AdjacentLink post={prev} direction="prev" />
        <AdjacentLink post={next} direction="next" />
      </div>
    </section>
  );
}
