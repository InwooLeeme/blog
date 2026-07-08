"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { TimelineItem } from "./Timeline";

const ITEM_DELAY_MS = 160;

/**
 * 뷰포트에 들어오면 세로선이 위→아래로 그려지고
 * 점·항목이 순서대로 등장하는 타임라인 (수상·대회·출제·자격증 공용).
 * prefers-reduced-motion이면 애니메이션 없이 즉시 표시.
 */
export default function AnimatedTimeline({ items }: { items: TimelineItem[] }) {
  const ref = React.useRef<HTMLOListElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <ol ref={ref} className="relative ml-2">
      {/* 그려지는 세로선 */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 start-0 w-px origin-top bg-border",
          "transition-transform duration-1000 ease-out motion-reduce:transition-none",
          visible ? "scale-y-100" : "scale-y-0",
        )}
      />
      {items.map((it, i) => (
        <li key={i} className="relative ms-6 pb-6 last:pb-0">
          {/* 선 위의 점 — 톡 하고 커지며 등장 */}
          <span
            aria-hidden
            style={{ transitionDelay: visible ? `${i * ITEM_DELAY_MS}ms` : "0ms" }}
            className={cn(
              "absolute -start-[29px] mt-1.5 h-2.5 w-2.5 rounded-full bg-accent-brand ring-4 ring-background",
              "transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none",
              visible ? "scale-100" : "scale-0",
            )}
          />
          {/* 내용 — 살짝 밀려 들어오며 등장 */}
          <div
            style={{ transitionDelay: visible ? `${i * ITEM_DELAY_MS + 80}ms` : "0ms" }}
            className={cn(
              "transition-all duration-500 ease-out motion-reduce:transition-none",
              visible ? "translate-x-0 opacity-100" : "translate-x-3 opacity-0",
            )}
          >
            <p className="text-xs font-medium tabular-nums text-muted-foreground">{it.date}</p>
            <p className="mt-1 font-medium leading-snug">{it.title}</p>
            {it.detail ? (
              <p className="mt-0.5 text-sm text-muted-foreground">{it.detail}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
