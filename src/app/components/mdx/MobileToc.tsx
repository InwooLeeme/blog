"use client";

import { useEffect, useState } from "react";
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

type Heading = { id: string; text: string; level: number };

/**
 * 모바일/태블릿용 목차
 */
export default function MobileToc() {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>(
      "#post-article h2, #post-article h3, #post-article h4",
    );
    // 렌더된 MDX 본문의 실제 heading을 읽어야 해서 effect 안에서만 계산 가능
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHeadings(
      Array.from(nodes)
        .filter((el) => el.id)
        .map((el) => ({
          id: el.id,
          text: el.textContent?.trim() ?? "",
          level: Number(el.tagName[1]),
        })),
    );
  }, []);

  if (headings.length === 0) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="목차 열기"
          className="fixed bottom-20 right-6 z-40 grid h-12 w-12 place-items-center rounded-full border bg-card/90 text-foreground shadow-lg backdrop-blur transition hover:border-accent-brand hover:text-accent-brand xl:hidden"
        >
          <List className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[70vh] gap-0 rounded-t-xl p-0">
        <SheetTitle className="border-b px-5 py-4 text-sm font-semibold">
          목차
        </SheetTitle>
        <SheetDescription className="sr-only">
          이 글의 목차입니다. 항목을 선택하면 해당 위치로 이동합니다.
        </SheetDescription>
        <nav className="overflow-y-auto px-3 py-3">
          <ul className="space-y-0.5">
            {headings.map((h) => (
              <li key={h.id}>
                <SheetClose asChild>
                  <a
                    href={`#${h.id}`}
                    className={cn(
                      "block rounded-md px-3 py-2 text-sm text-foreground/80 transition hover:bg-muted hover:text-accent-brand",
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
