"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import type Fuse from "fuse.js";
import type { IFuseOptions } from "fuse.js";
import { Search, X } from "lucide-react";
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

type SearchDialogContentProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function SearchDialogContent({
  open,
  setOpen,
}: SearchDialogContentProps) {
  const t = useT();
  const router = useRouter();
  const [items, setItems] = useState<Item[] | null>(null);
  const [fuse, setFuse] = useState<Fuse<Item> | null>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

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
    setActiveIndex(0);
  };

  const results = useMemo<Item[]>(() => {
    if (!items) return [];
    const q = query.trim();
    if (!q) return items.slice(0, 10);
    if (!fuse) return [];
    return fuse.search(q, { limit: 20 }).map((r) => r.item);
  }, [items, fuse, query]);

  useEffect(() => {
    itemRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const item = results[activeIndex];
      if (!item) return;
      e.preventDefault();
      setOpen(false);
      router.push(itemHref(item));
    }
  };

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
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleInputKeyDown}
              placeholder={t("search.placeholder")}
              aria-label={t("search.inputAria")}
              role="combobox"
              aria-expanded={results.length > 0}
              aria-controls="search-results-listbox"
              aria-activedescendant={
                results[activeIndex]
                  ? `search-result-${results[activeIndex].type}-${results[activeIndex].slug}`
                  : undefined
              }
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
              <ul className="space-y-1" role="listbox" id="search-results-listbox">
                {results.map((item, index) => (
                  <li key={`${item.type}-${item.slug}`} role="presentation">
                    <Link
                      id={`search-result-${item.type}-${item.slug}`}
                      ref={(el) => {
                        itemRefs.current[index] = el;
                      }}
                      href={itemHref(item)}
                      role="option"
                      aria-selected={index === activeIndex}
                      onClick={() => setOpen(false)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`block rounded-md px-3 py-2 transition hover:bg-muted ${
                        index === activeIndex ? "bg-muted" : ""
                      }`}
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
