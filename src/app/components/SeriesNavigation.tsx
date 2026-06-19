"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SeriesNav } from "@/lib/posts";

/** 원형 화살표 네비 버튼 */
function CircleButton({
  href,
  label,
  children,
}: {
  href?: string;
  label: string;
  children: ReactNode;
}) {
  const base = "grid h-7 w-7 place-items-center rounded-full border transition";
  if (!href) {
    return (
      <span aria-hidden className={cn(base, "text-muted-foreground opacity-40")}>
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        base,
        "text-muted-foreground hover:border-accent-brand hover:text-accent-brand",
      )}
    >
      {children}
    </Link>
  );
}

/** 현재 글을 강조한 회차 목록 */
function EpisodeList({
  episodes,
  currentSlug,
}: {
  episodes: SeriesNav["episodes"];
  currentSlug: string;
}) {
  return (
    <ol className="mt-4 space-y-0.5 border-t pt-3">
      {episodes.map((ep, i) => {
        const isCurrent = ep.slug === currentSlug;
        return (
          <li key={ep.slug}>
            <Link
              href={`/blog/${ep.slug}`}
              aria-current={isCurrent ? "page" : undefined}
              className={cn(
                "flex gap-2.5 rounded-md px-3 py-1.5 text-sm transition",
                isCurrent
                  ? "bg-accent-brand/10 font-semibold text-accent-brand"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground",
              )}
            >
              <span className="tabular-nums opacity-60">{i + 1}.</span>
              <span className="line-clamp-1">{ep.title}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

/** 시리즈 카드 */
export default function SeriesNavigation({ nav }: { nav: SeriesNav }) {
  const { series, prev, next, position, total, currentSlug, episodes } = nav;
  const [open, setOpen] = useState(false);

  return (
    <section
      aria-label="시리즈"
      className="relative mt-12 overflow-hidden rounded-xl border bg-card p-5"
    >
      {/* 상단 브랜드 그라데이션 바 */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ background: "var(--accent-gradient)" }}
      />

      <h2 className="line-clamp-2 font-display text-xl font-bold tracking-tight">
        {series}
      </h2>

      {/* 토글 + 위치/이전·다음 */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 transition hover:text-foreground"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-300",
              open && "rotate-180",
            )}
          />
          {open ? "목록 닫기" : "목록 보기"}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs tabular-nums text-muted-foreground">
            {position}/{total}
          </span>
          <CircleButton
            href={prev ? `/blog/${prev.slug}` : undefined}
            label="이전 회차"
          >
            <ChevronLeft className="h-4 w-4" />
          </CircleButton>
          <CircleButton
            href={next ? `/blog/${next.slug}` : undefined}
            label="다음 회차"
          >
            <ChevronRight className="h-4 w-4" />
          </CircleButton>
        </div>
      </div>

      {/* grid-rows 0fr↔1fr로 부드럽게 펼침 */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <EpisodeList episodes={episodes} currentSlug={currentSlug} />
        </div>
      </div>
    </section>
  );
}
