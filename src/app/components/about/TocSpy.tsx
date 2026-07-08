"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TocSection = { id: string; label: string };

/**
 * 읽기 진행률 바 + 스크롤스파이 미니 목차.
 * - 진행률 바: 화면 최상단 고정, 스크롤 비율만큼 채워짐
 * - 미니 목차: xl 이상에서 상단 정적 목차가 화면을 벗어나면 우측에 등장,
 *   IntersectionObserver로 현재 섹션 하이라이트
 * - prefers-reduced-motion이면 진행률 바만 표시(트랜지션 없음)
 */
export default function TocSpy({ sections }: { sections: TocSection[] }) {
  const [progress, setProgress] = React.useState(0);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [showToc, setShowToc] = React.useState(false);

  // 읽기 진행률 — rAF로 스크롤 이벤트 스로틀
  React.useEffect(() => {
    let raf = 0;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0);
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // 미니 목차 표시 여부 — 정적 목차(#about-toc)가 뷰포트를 벗어나면 표시
  React.useEffect(() => {
    const staticToc = document.getElementById("about-toc");
    if (!staticToc) {
      setShowToc(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setShowToc(!entry.isIntersecting && entry.boundingClientRect.top < 0),
    );
    observer.observe(staticToc);
    return () => observer.disconnect();
  }, []);

  // 현재 섹션 하이라이트
  React.useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 화면에 보이는 섹션 중 가장 위에 있는 것을 활성화
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -60% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <>
      {/* 읽기 진행률 바 */}
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent"
      >
        <div
          className="h-full origin-left bg-accent-brand transition-transform duration-150 ease-out motion-reduce:transition-none"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      {/* 미니 목차 — xl 이상에서만 */}
      <nav
        aria-label="현재 위치 목차"
        className={cn(
          "fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 xl:block",
          "transition-all duration-300 motion-reduce:transition-none",
          showToc ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-3 opacity-0",
        )}
      >
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          On this page
        </p>
        <ul className="space-y-0.5">
          {sections.map((s) => {
            const active = s.id === activeId;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={cn(
                    "block border-s-2 px-3 py-1 text-xs transition-colors duration-200",
                    active
                      ? "border-accent-brand font-semibold text-accent-brand"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
