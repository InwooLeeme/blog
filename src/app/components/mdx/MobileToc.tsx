"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { List } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useT } from "../LocaleProvider";
import { subscribeToScroll } from "../scroll-subscriber";
import { DESKTOP_TOC_QUERY, subscribeTocViewport } from "./toc-viewport";

type Heading = { id: string; text: string; level: number };

/**
 * 모바일/태블릿용 목차
 */
export default function MobileToc() {
  const t = useT();
  const selectedHeading = useRef<string | null>(null);
  const pathname = usePathname();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    return subscribeTocViewport(window.matchMedia(DESKTOP_TOC_QUERY), false, () => {
      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>(
          "#post-body h2, #post-body h3, #post-body h4",
        ),
      ).filter((el) => el.id && !el.classList.contains("toc-ignore"));
      // 렌더된 MDX 본문의 실제 heading을 읽어야 해서 effect 안에서만 계산 가능
      setHeadings(
        nodes.map((el) => ({
          id: el.id,
          text: el.textContent?.trim() ?? "",
          level: Number(el.tagName[1]),
        })),
      );
      // 제목 사이의 긴 본문에서도 직전에 지나온 절을 유지한다.
      const updateActive = () => {
        let current = nodes[0]?.id ?? null;
        for (const node of nodes) {
          if (node.getBoundingClientRect().top > 112) break;
          current = node.id;
        }
        setActiveId(current);
      };
      const frame = requestAnimationFrame(updateActive);
      const unsubscribe = subscribeToScroll(updateActive);
      window.addEventListener("resize", updateActive);
      const observer = new ResizeObserver(updateActive);
      const article = document.getElementById("post-article");
      if (article) observer.observe(article);
      return () => {
        cancelAnimationFrame(frame);
        unsubscribe();
        window.removeEventListener("resize", updateActive);
        observer.disconnect();
      };
    });
  }, [pathname]);

  if (headings.length === 0) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={t("toc.open")}
          className="fixed bottom-20 right-6 z-40 inline-flex h-11 items-center gap-2 rounded-sm border bg-card/95 px-4 text-sm font-medium text-foreground shadow-sm backdrop-blur transition-colors hover:border-accent-brand/40 hover:text-accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 xl:hidden"
        >
          <List className="h-5 w-5" />
          {t("toc.title")}
        </button>
      </SheetTrigger>
      <SheetContent closeLabel={t("detail.closeToc")} side="bottom" className="max-h-[70dvh] gap-0 p-0 pb-[env(safe-area-inset-bottom)] [&>button]:h-11 [&>button]:w-11 [&>button]:top-1"
        onOpenAutoFocus={(event) => {
          const current = document.querySelector<HTMLAnchorElement>('[role="dialog"] a[aria-current="location"]');
          if (current) { event.preventDefault(); current.focus(); current.scrollIntoView({ block: 'nearest', behavior: 'instant' }); }
        }}
        onCloseAutoFocus={(event) => {
          if (!selectedHeading.current) return;
          event.preventDefault();
          const heading = document.getElementById(selectedHeading.current);
          heading?.setAttribute('tabindex', '-1');
          heading?.focus({ preventScroll: true });
          heading?.scrollIntoView({ block: 'start' });
          selectedHeading.current = null;
        }}>
        <SheetTitle className="border-b px-5 py-4 text-sm font-semibold">
          {t("toc.title")}
        </SheetTitle>
        <SheetDescription className="sr-only">
          {t("toc.description")}
        </SheetDescription>
        <nav aria-label={t("toc.title")} className="overflow-y-auto px-3 py-3">
          <ul className="space-y-0.5">
            {headings.map((h) => (
              <li key={h.id}>
                <SheetClose asChild>
                  <a
                    href={`#${h.id}`}
                    onClick={() => { selectedHeading.current = h.id; }}
                    aria-current={activeId === h.id ? "location" : undefined}
                    className={cn(
                      "flex min-h-11 items-center rounded-md border-l-2 px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                      activeId === h.id
                        ? "border-accent-brand bg-accent-brand/10 font-semibold text-accent-brand"
                        : "border-transparent text-foreground/80 hover:bg-muted hover:text-accent-brand",
                      h.level === 3 && "pl-6",
                      h.level === 4 && "pl-9",
                    )}
                  >
                    {h.text}
                  </a>
                </SheetClose>
              </li>
            ))}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
