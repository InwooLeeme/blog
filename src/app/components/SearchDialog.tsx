"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import type Fuse from "fuse.js";
import type { IFuseOptions } from "fuse.js";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useT } from "./LocaleProvider";

type Item = {
  type: "post" | "note";
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  body: string;
};

const FUSE_OPTIONS: IFuseOptions<Item> = {
  threshold: 0.4,
  ignoreLocation: true,
  minMatchCharLength: 2,
  keys: [
    { name: "title", weight: 0.5 },
    { name: "tags", weight: 0.25 },
    { name: "summary", weight: 0.15 },
    { name: "body", weight: 0.1 },
  ],
};

function itemHref(item: Item) {
  return item.type === "note" ? `/notes/${item.slug}` : `/blog/${item.slug}`;
}

type SearchContextValue = { open: boolean; setOpen: (open: boolean) => void };
const SearchContext = createContext<SearchContextValue | null>(null);

function useSearchDialog() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearchDialog must be used within SearchProvider");
  return ctx;
}

// 검색 다이얼로그는 헤더 안에서 데스크톱/모바일 두 곳에 트리거 버튼이 필요하지만
// 실제 다이얼로그(Root/Portal)는 한 번만 마운트해야 Ctrl/Cmd+K로 두 개가 동시에 열리지 않는다.
// 그래서 Provider가 다이얼로그 콘텐츠를 직접 렌더링해 단일 마운트를 구조적으로 보장한다.
export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const value = useMemo(() => ({ open, setOpen }), [open]);

  return (
    <SearchContext.Provider value={value}>
      {children}
      <SearchDialogContent />
    </SearchContext.Provider>
  );
}

export function SearchTrigger() {
  const t = useT();
  const { setOpen } = useSearchDialog();

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="ghost"
        size="icon"
        aria-label={t("search.open")}
        onClick={() => setOpen(true)}
        className="relative before:absolute before:-inset-1 before:content-['']"
      >
        <Search className="h-5 w-5" />
      </Button>
      <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground md:inline-block">
        ⌘K
      </kbd>
    </div>
  );
}

function SearchDialogContent() {
  const t = useT();
  const { open, setOpen } = useSearchDialog();
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

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery("");
  };

  const results = useMemo<Item[]>(() => {
    if (!items) return [];
    const q = query.trim();
    if (!q) return items.slice(0, 10);
    if (!fuse) return [];
    return fuse.search(q, { limit: 20 }).map((r) => r.item);
  }, [items, fuse, query]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-[20%] z-50 w-[min(92vw,560px)] -translate-x-1/2 rounded-xl border bg-background p-4 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <DialogPrimitive.Title className="sr-only">
            {t("search.title")}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {t("search.desc")}
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
              placeholder={t("search.placeholder")}
              aria-label={t("search.inputAria")}
              className="w-full rounded-lg border bg-background pl-9 pr-10 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-brand"
            />
            <DialogPrimitive.Close
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition hover:text-foreground"
              aria-label={t("search.close")}
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>

          <div className="mt-3 max-h-[60vh] overflow-y-auto">
            {!items ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t("search.loading")}
              </p>
            ) : results.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {query.trim()
                  ? t("search.noResultsFor", { q: query.trim() })
                  : t("search.empty")}
              </p>
            ) : (
              <ul className="space-y-1">
                {results.map((item) => (
                  <li key={`${item.type}-${item.slug}`}>
                    <Link
                      href={itemHref(item)}
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-3 py-2 transition hover:bg-muted"
                    >
                      <div className="font-medium line-clamp-1">
                        {item.title}
                      </div>
                      {item.summary ? (
                        <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {item.summary}
                        </div>
                      ) : null}
                      {item.tags.length > 0 ? (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="rounded-full text-xs"
                            >
                              {tag}
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
