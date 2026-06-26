"use client";

import * as React from "react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Hash, LayoutGrid } from "lucide-react";

export type TagCount = { tag: string; count: number };

export default function TagSidebar({
  tagCounts,
  totalCount,
  activeTag,
  basePath = "/blog",
  tagBasePath = "/blog/tags",
  avatarSrc = "/avatar.png",
  avatarAlt = "Blog Avatar",
  profileName = "InwooLeeme",
  profileDescription = "Learner"
}: {
  tagCounts: TagCount[];
  totalCount: number;
  activeTag?: string | null;
  /** 전체 글 목록 경로 */
  basePath?: string; // 기본: /blog
  /** 태그 페이지 베이스 경로: /blog/tags/[tag] */
  tagBasePath?: string; // 기본: /blog/tags
  avatarSrc?: string;       // public에 넣은 이미지 경로
  avatarAlt?: string;
  profileName?: string;
  profileDescription? : string
}) {
  const sorted = React.useMemo(() => {
    return [...tagCounts].sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }, [tagCounts]);
  const fallback = React.useMemo(() => {
    const t = (profileName ?? "").trim();
    if (!t) return "B";
    return t.slice(0, 2).toUpperCase();
  }, [profileName]);

  return (
    <>
      {/* 모바일: 수평 스크롤 태그 스트립 */}
      <div className="lg:hidden mb-4 overflow-x-auto pb-2 -mx-1 px-1">
        <div className="flex gap-2 min-w-max">
          <Link href={basePath}>
            <Badge
              variant="outline"
              className={cn("rounded-full py-1", !activeTag && "border-accent-brand")}
            >
              All ({totalCount})
            </Badge>
          </Link>
          {sorted.map(({ tag, count }) => (
            <Link
              key={tag}
              href={`${tagBasePath}/${encodeURIComponent(tag)}`}
            >
              <Badge
                variant={activeTag === tag ? "outline" : "secondary"}
                className={cn(
                  "rounded-full py-1",
                  activeTag === tag && "border-accent-brand"
                )}
              >
                {tag} ({count})
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {/* 데스크톱: 사이드바 */}
      <aside className="sticky top-24 hidden lg:block w-60 shrink-0 self-start">
        {/* 프로필 */}
        <div className="flex flex-col items-center text-center pb-6">
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-1 rounded-full bg-gradient-to-br from-accent-brand/40 to-accent-brand/0 blur-md"
            />
            <Avatar className="relative h-32 w-32 ring-2 ring-accent-brand/30 ring-offset-2 ring-offset-background">
              <AvatarImage src={avatarSrc} alt={avatarAlt} />
              <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
          </div>
          <h3 className="mt-4 text-base font-bold tracking-tight">
            {profileName}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {profileDescription}
          </p>
        </div>

        {/* 구분선 */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* 카테고리 헤더 */}
        <div className="mt-5 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Categories
            </span>
          </div>
          <span className="rounded-full bg-accent-brand/10 px-2 py-0.5 text-xs font-medium text-accent-brand tabular-nums">
            {sorted.length}
          </span>
        </div>

        <ScrollArea className="max-h-[calc(100vh-22rem)] pr-2">
          <ul className="flex flex-col gap-0.5">
            {/* All Posts */}
            <li>
              <Link
                href={basePath}
                className={cn(
                  "group relative flex items-center gap-2 rounded-md py-1.5 pl-3 pr-2 text-sm transition",
                  !activeTag
                    ? "bg-accent-brand/10 text-accent-brand font-medium"
                    : "text-foreground/80 hover:bg-muted/70 hover:text-foreground"
                )}
              >
                {!activeTag && (
                  <span
                    aria-hidden
                    className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-accent-brand"
                  />
                )}
                <LayoutGrid
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    !activeTag ? "text-accent-brand" : "text-muted-foreground"
                  )}
                />
                <span className="truncate">All Posts</span>
                <span
                  className={cn(
                    "ml-auto rounded px-1.5 py-0.5 text-xs tabular-nums",
                    !activeTag
                      ? "bg-accent-brand/15 text-accent-brand"
                      : "bg-muted text-muted-foreground group-hover:bg-background"
                  )}
                >
                  {totalCount}
                </span>
              </Link>
            </li>

            {/* Tags */}
            {sorted.map(({ tag, count }) => {
              const selected = activeTag === tag;
              return (
                <li key={tag}>
                  <Link
                    href={`${tagBasePath}/${encodeURIComponent(tag)}`}
                    className={cn(
                      "group relative flex items-center gap-2 rounded-md py-1.5 pl-3 pr-2 text-sm transition",
                      selected
                        ? "bg-accent-brand/10 text-accent-brand font-medium"
                        : "text-foreground/80 hover:bg-muted/70 hover:text-foreground"
                    )}
                  >
                    {selected && (
                      <span
                        aria-hidden
                        className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-accent-brand"
                      />
                    )}
                    <Hash
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        selected ? "text-accent-brand" : "text-muted-foreground"
                      )}
                    />
                    <span className="truncate">{tag}</span>
                    <span
                      className={cn(
                        "ml-auto rounded px-1.5 py-0.5 text-xs tabular-nums",
                        selected
                          ? "bg-accent-brand/15 text-accent-brand"
                          : "bg-muted text-muted-foreground group-hover:bg-background"
                      )}
                    >
                      {count}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </aside>
    </>
  );
}
