"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import type Fuse from "fuse.js";
import type { IFuseOptions } from "fuse.js";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PostMeta } from "@/lib/posts";

type Item = { slug: string; meta: PostMeta };

const FUSE_OPTIONS: IFuseOptions<Item> = {
  threshold: 0.4,
  ignoreLocation: true,
  minMatchCharLength: 2,
  keys: [
    { name: "meta.title", weight: 0.6 },
    { name: "meta.tags", weight: 0.3 },
    { name: "meta.summary", weight: 0.1 },
  ],
};

export default function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[] | null>(null);
  const [fuse, setFuse] = useState<Fuse<Item> | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open || items) return;
    let cancelled = false;
    (async () => {
      try {
        const [data, fuseModule] = await Promise.all([
          fetch("/search-index.json").then((r) => r.json() as Promise<Item[]>),
          import("fuse.js"),
        ]);
        if (cancelled) return;
        setItems(data);
        setFuse(new fuseModule.default(data, FUSE_OPTIONS));
      } catch {
        if (!cancelled) setItems([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, items]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const results = useMemo<Item[]>(() => {
    if (!items) return [];
    const q = query.trim();
    if (!q) return items.slice(0, 10);
    if (!fuse) return [];
    return fuse.search(q, { limit: 20 }).map((r) => r.item);
  }, [items, fuse, query]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label="게시글 검색">
          <Search className="h-5 w-5" />
        </Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-[20%] z-50 w-[min(92vw,560px)] -translate-x-1/2 rounded-xl border bg-background p-4 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <DialogPrimitive.Title className="sr-only">
            게시글 검색
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            제목, 태그, 요약으로 게시글을 검색합니다.
          </DialogPrimitive.Description>

          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden
            />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="제목, 태그, 요약으로 검색..."
              aria-label="검색어 입력"
              className="w-full rounded-lg border bg-background pl-9 pr-10 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-brand"
            />
            <DialogPrimitive.Close
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition hover:text-foreground"
              aria-label="검색 닫기"
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>

          <div className="mt-3 max-h-[60vh] overflow-y-auto">
            {!items ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                불러오는 중...
              </p>
            ) : results.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {query.trim()
                  ? `“${query.trim()}”에 해당하는 게시글이 없습니다.`
                  : "게시글이 없습니다."}
              </p>
            ) : (
              <ul className="space-y-1">
                {results.map(({ slug, meta }) => (
                  <li key={slug}>
                    <Link
                      href={`/blog/${slug}`}
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-3 py-2 transition hover:bg-muted"
                    >
                      <div className="font-medium line-clamp-1">
                        {meta.title}
                      </div>
                      {meta.summary ? (
                        <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {meta.summary}
                        </div>
                      ) : null}
                      {meta.tags && meta.tags.length > 0 ? (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {meta.tags.slice(0, 3).map((t) => (
                            <Badge
                              key={t}
                              variant="secondary"
                              className="rounded-full text-xs"
                            >
                              {t}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
