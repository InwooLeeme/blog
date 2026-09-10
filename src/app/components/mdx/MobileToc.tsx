"use client";

import { useEffect, useState } from "react";
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

type Heading = { id: string; text: string; level: number };

/**
 * 모바일/태블릿용 목차
 */
export default function MobileToc() {
  const t = useT();
  const pathname = usePathname();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(
        "#post-article h2, #post-article h3, #post-article h4",
      ),
    ).filter((el) => el.id && !el.classList.contains("toc-ignore"));
    // 렌더된 MDX 본문의 실제 heading을 읽어야 해서 effect 안에서만 계산 가능
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
  }, [pathname]);

  if (headings.length === 0) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={t("toc.open")}
          className="fixed bottom-20 right-6 z-40 inline-flex h-11 items-center gap-2 rounded-full border bg-card/95 px-4 text-sm font-medium text-foreground shadow-sm backdrop-blur transition-colors hover:border-accent-brand/40 hover:text-accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 xl:hidden"
        >
          <List className="h-5 w-5" />
          {t("toc.title")}
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[70vh] gap-0 rounded-t-xl p-0">
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
