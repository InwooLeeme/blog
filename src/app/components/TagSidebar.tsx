"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    <aside className="sticky top-24 hidden lg:block w-60 shrink-0">
      {/* 아바타 추가 */}
      <Card>
        <CardContent className="p-4">
           <div className="flex flex-col gap-3 mb-4">
            <Avatar className="h-40 w-40">
              <AvatarImage src={avatarSrc} alt={avatarAlt} />
              <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="font-bold leading-tight truncate">
                {profileName}
              </h3>
              <div className="text-xs text-muted-foreground truncate mt-5">
                {profileDescription}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold font-medium text-muted-foreground">
              Categories
            </div>
          </div>

          <ScrollArea className="max-h-[calc(100vh-8rem)] pr-3 font-semibold">
            <div className="flex flex-col gap-2">
              {/* All Posts */}
              <Link href={basePath} className="block">
                <Badge
                  variant="outline"
                  className={cn(
                    "w-full justify-between rounded-md py-2",
                    !activeTag && "border-accent-brand"
                  )}
                >
                  <span>All Posts</span>
                  <span className="opacity-70">({totalCount})</span>
                </Badge>
              </Link>

              {/* Tags */}
              {sorted.map(({ tag, count }) => {
                const selected = activeTag === tag;
                return (
                  <Link
                    key={tag}
                    href={`${tagBasePath}/${encodeURIComponent(tag)}`}
                    className="block"
                  >
                    <Badge
                      variant={selected ? "outline" : "secondary"}
                      className={cn(
                        "w-full justify-between rounded-md py-2",
                        selected && "border-accent-brand"
                      )}
                    >
                      <span className="truncate">{tag}</span>
                      <span>({count})</span>
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </aside>
    </>
  );
}
