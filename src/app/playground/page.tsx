import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight } from "lucide-react";
import LegacyEffectRedirect from "./_components/LegacyEffectRedirect";

export const metadata: Metadata = {
  title: "Playground",
  description: "경로를 찾고 빛의 움직임을 감상하는 작은 실험실. 경로 탐색과 비주얼 이펙트를 만나보세요.",
  alternates: { canonical: "/playground" },
};

const cardClass = "group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-accent-brand/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand";

export default function Playground() {
  return (
    <div className="mx-auto w-full min-w-0 max-w-[1280px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <Suspense fallback={null}><LegacyEffectRedirect /></Suspense>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-7 sm:mb-10">
        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-accent-brand">Interactive experiments</p>
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">Playground</h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">직접 길을 찾거나, 잠시 빛의 움직임을 따라가 보세요.</p>
        </div>
        <p className="font-mono text-xs text-muted-foreground">02 experiments</p>
      </header>
      <nav aria-label="실험 선택" className="grid gap-5 md:grid-cols-2 lg:gap-7">
        <Link href="/playground/pathfinding" className={cardClass}>
          <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden border-b border-border bg-[#0b1520] p-6 sm:p-9" aria-hidden="true">
            <svg viewBox="0 0 420 210" className="h-full w-full" fill="none">
              <defs><pattern id="preview-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" stroke="#263744" strokeWidth="1" /></pattern></defs>
              <rect width="420" height="210" fill="url(#preview-grid)" />
              <path d="M120 30V120M240 90V180M300 0V90" stroke="#435364" strokeWidth="24" />
              <path d="M45 105H75V165H195V45H255V135H375" stroke="#31ced2" strokeWidth="4" strokeLinejoin="round" />
              <circle cx="45" cy="105" r="9" fill="#6ee7b7" /><circle cx="375" cy="135" r="9" fill="#fbbf24" />
            </svg>
          </div>
          <div className="flex flex-1 flex-col p-5 sm:p-7">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-accent-brand">01 / Algorithm</p>
            <h2 className="mt-3 text-2xl font-medium tracking-tight">경로 탐색</h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">벽을 그리고, 같은 지도에서 알고리즘이 길을 찾는 방법을 비교해 보세요.</p>
            <div className="mt-7 flex items-center justify-between gap-3 border-t border-border pt-5">
              <span className="text-xs text-muted-foreground">BFS · Dijkstra · A*</span>
              <span className="inline-flex items-center gap-2 text-sm font-medium">지도 열기<ArrowUpRight size={17} aria-hidden="true" /></span>
            </div>
          </div>
        </Link>
        <Link href="/playground/effects" prefetch={false} className={cardClass}>
          <div aria-hidden="true" className="relative aspect-[16/9] overflow-hidden border-b border-border bg-[#090b13]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_50%,#22d3ee88_0%,transparent_35%),radial-gradient(circle_at_65%_45%,#6366f1aa_0%,transparent_38%),radial-gradient(circle_at_53%_75%,#e879f966_0%,transparent_32%)]" />
            <div className="absolute inset-x-6 bottom-5 flex justify-between font-mono text-xs text-white/60"><span>LIGHT</span><span>COLOR</span></div>
          </div>
          <div className="flex flex-1 flex-col p-5 sm:p-7">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-accent-brand">02 / Visual</p>
            <h2 className="mt-3 text-2xl font-medium tracking-tight">빛과 움직임</h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">은은하게 반짝이는 별 무리와 겹칠수록 밝아지는 색방울을 감상하세요.</p>
            <div className="mt-7 flex items-center justify-between gap-3 border-t border-border pt-5">
              <span className="text-xs text-muted-foreground">구상성단 · 색방울</span>
              <span className="inline-flex items-center gap-2 text-sm font-medium">장면 열기<ArrowUpRight size={17} aria-hidden="true" /></span>
            </div>
          </div>
        </Link>
      </nav>
    </div>
  );
}
