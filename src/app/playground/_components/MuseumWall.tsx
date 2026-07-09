"use client";

import { useEffect, useRef, useState } from "react";
import { EFFECTS, type Effect } from "@/app/components/effects/registry";
import { updateMountedEffects } from "./performance-policy";

const ROT_CENTER = 12; // 뷰포트 중앙에 왔을 때 액자 각도(deg)
const ROT_EDGE = 26; // 화면 가장자리에 있을 때 액자 각도(deg)
const LIFT_Z = 40; // 중앙 접근 시 복도 쪽으로 나오는 깊이(px)

/** 세로 스크롤을 전시 복도 삼아 좌우 벽에 액자를 교대로 거는 2.5D 미술관 뷰 */
export default function MuseumWall({ onSelect }: { onSelect: (effect: Effect) => void }) {
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [mounted, setMounted] = useState<boolean[]>(() => EFFECTS.map(() => false));

  // 뷰포트 근처 액자만 캔버스를 마운트해 화면 밖 리소스를 즉시 해제한다
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = frameRefs.current.indexOf(entry.target as HTMLDivElement);
          if (idx < 0) return;
          setMounted((prev) =>
            updateMountedEffects(prev, idx, entry.isIntersecting),
          );
        });
      },
      { rootMargin: "30% 0px" },
    );
    frameRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  // 스크롤 위치에 따라 액자를 복도 안쪽으로 기울여 "지나쳐 걷는" 원근감을 만든다
  useEffect(() => {
    const side = (i: number) => (i % 2 === 0 ? 1 : -1);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frameRefs.current.forEach((el, i) => {
        if (el) el.style.transform = `rotateY(${side(i) * ROT_CENTER}deg)`;
      });
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      frameRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) return;
        const t = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh / 2)));
        const ax = Math.abs(t);
        el.style.transform =
          `rotateY(${side(i) * (ROT_CENTER + ax * (ROT_EDGE - ROT_CENTER))}deg) ` +
          `translateZ(${(1 - ax) * LIFT_Z}px)`;
        el.style.opacity = String(0.55 + (1 - ax) * 0.45);
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      aria-label="이펙트 상설 전시"
      className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-gradient-to-b from-stone-100 via-[#faf8f4] to-stone-200 px-4 py-14 sm:px-8 lg:px-14 dark:border-zinc-800/60 dark:from-zinc-950 dark:via-[#0a0a10] dark:to-black"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,transparent_55%,rgba(120,113,108,0.18)_100%)] dark:bg-[radial-gradient(120%_90%_at_50%_0%,transparent_55%,rgba(0,0,0,0.55)_100%)]" />

      <header className="relative mb-16 text-center lg:mb-24">
        <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-zinc-500">Permanent Exhibition</p>
        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">캔버스 상설전 · {EFFECTS.length}점 — 스크롤로 복도를 걸어보세요</p>
      </header>

      <ul className="relative space-y-16 lg:space-y-24">
        {EFFECTS.map((eff, i) => {
          const left = i % 2 === 0;
          return (
            <li
              key={eff.id}
              className={`flex ${left ? "justify-start" : "justify-end"}`}
              style={{ perspective: "900px", perspectiveOrigin: left ? "80% 50%" : "20% 50%" }}
            >
              <div className={`flex flex-col gap-4 lg:items-center lg:gap-8 ${left ? "lg:flex-row" : "lg:flex-row-reverse"}`}>
                <div
                  ref={(el) => {
                    frameRefs.current[i] = el;
                  }}
                  className="relative will-change-transform"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* 조명 레일 + 액자 위로 떨어지는 빛 */}
                  <div aria-hidden className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2">
                    <div className="mx-auto h-1.5 w-12 rounded-full bg-zinc-400 shadow-[0_0_14px_4px_rgba(245,158,11,0.45)] dark:bg-zinc-700 dark:shadow-[0_0_18px_5px_rgba(255,238,190,0.6)]" />
                    <div className="h-16 w-64 bg-[conic-gradient(from_180deg_at_50%_0%,transparent_130deg,rgba(245,158,11,0.18)_180deg,transparent_230deg)] dark:bg-[conic-gradient(from_180deg_at_50%_0%,transparent_130deg,rgba(255,238,190,0.35)_180deg,transparent_230deg)]" />
                  </div>
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -inset-x-12 -top-16 bottom-1/4 bg-[radial-gradient(65%_75%_at_50%_0%,rgba(245,158,11,0.16),transparent_75%)] dark:bg-[radial-gradient(65%_75%_at_50%_0%,rgba(255,238,190,0.26),transparent_75%)]"
                  />

                  <button
                    type="button"
                    aria-label={`${eff.title} 전체 화면으로 보기`}
                    onClick={() => onSelect(eff)}
                    className="group relative block focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  >
                    <div className="rounded-[6px] border border-zinc-300 bg-gradient-to-b from-zinc-100 via-zinc-200 to-zinc-300 p-2 shadow-[0_25px_50px_-15px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-[1.02] sm:p-2.5 dark:border-zinc-700/60 dark:from-zinc-700/80 dark:via-zinc-800 dark:to-zinc-900 dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)]">
                      <div className="relative aspect-[4/3] w-[min(70vw,360px)] overflow-hidden border border-black/20 bg-zinc-950 dark:border-black/80">
                        {mounted[i] ? (
                          <eff.Component />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-950" />
                        )}
                      </div>
                    </div>
                  </button>
                </div>

                <aside className={`max-w-[240px] ${left ? "" : "lg:text-right"}`}>
                  <div className="inline-block rounded-sm border border-zinc-200 bg-white/80 px-4 py-3 text-left shadow-lg backdrop-blur-sm dark:border-zinc-700/50 dark:bg-zinc-900/80">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{eff.title}</div>
                    <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{eff.description}</p>
                  </div>
                </aside>
              </div>
            </li>
          );
        })}
      </ul>

      <footer className="relative mt-20 text-center text-[10px] font-medium uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600">
        Fin · Exit
      </footer>
    </section>
  );
}
