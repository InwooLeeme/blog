import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { contentCardClass, contentCardInteractionClass } from "@/lib/ui-styles";
import { cn } from "@/lib/utils";
import LegacyEffectRedirect from "./_components/LegacyEffectRedirect";

export const metadata: Metadata = {
  title: "Playground",
  description: "직접 만든 알고리즘 시각화와 그래픽 실험 모음.",
  alternates: { canonical: "/playground" },
};

const experimentClass = cn(
  contentCardClass,
  contentCardInteractionClass,
  "group grid min-w-0 grid-cols-[minmax(0,1fr)_6rem] items-center gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_13rem] sm:gap-8 sm:p-6",
);

export default function Playground() {
  return (
    <div className="mx-auto mt-6 w-full max-w-6xl px-4 pb-12 md:px-6 lg:px-8">
      <Suspense fallback={null}><LegacyEffectRedirect /></Suspense>
      <header className="mb-8 md:mb-10">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Playground</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">직접 만든 알고리즘 시각화와 그래픽 실험을 모았습니다.</p>
      </header>

      <nav aria-label="실험 선택" className="space-y-4">
        <Link href="/playground/pathfinding" className={experimentClass}>
          <div className="min-w-0">
            <h2 className="flex items-center gap-3 text-xl font-semibold tracking-tight group-hover:text-accent-brand">
              경로 탐색
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">벽을 그린 지도에서 알고리즘별 탐색 과정과 최단 경로를 비교합니다.</p>
            <p className="mt-4 font-mono text-xs text-muted-foreground">BFS · Dijkstra · A*</p>
          </div>
          <svg viewBox="0 0 208 144" fill="none" aria-hidden="true" className="w-full rounded-lg border border-border bg-muted/30">
            <defs>
              <pattern id="preview-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                <path d="M16 0H0V16" className="stroke-border" />
              </pattern>
            </defs>
            <path d="M0 0H208V144H0Z" fill="url(#preview-grid)" />
            <path d="M64 32V80M128 64V112" className="stroke-muted-foreground/30" strokeWidth="12" />
            <path d="M24 72H40V104H88V40H152V88H184" className="stroke-accent-brand" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="24" cy="72" r="4" className="fill-accent-brand" />
            <circle cx="184" cy="88" r="4" className="fill-background stroke-accent-brand" strokeWidth="2" />
          </svg>
        </Link>

        <Link href="/playground/effects" prefetch={false} className={experimentClass}>
          <div className="min-w-0">
            <h2 className="flex items-center gap-3 text-xl font-semibold tracking-tight group-hover:text-accent-brand">
              그래픽 실험
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">별의 분포와 움직임, 색이 겹치는 효과를 화면에 그립니다.</p>
            <p className="mt-4 text-xs text-muted-foreground">구상성단 · 색방울</p>
          </div>
          <svg viewBox="0 0 208 144" aria-hidden="true" className="w-full rounded-lg border border-border bg-muted/30">
            <g className="fill-muted-foreground/40">
              <circle cx="28" cy="36" r="1" /><circle cx="48" cy="112" r="1.5" />
              <circle cx="176" cy="32" r="1.5" /><circle cx="183" cy="100" r="1" />
              <circle cx="62" cy="54" r="1.5" /><circle cx="152" cy="117" r="1" />
              <circle cx="145" cy="46" r="1" /><circle cx="73" cy="93" r="1" />
            </g>
            <g className="fill-accent-brand">
              <circle cx="90" cy="63" r="1.5" /><circle cx="112" cy="51" r="1" />
              <circle cx="104" cy="72" r="2.5" /><circle cx="96" cy="83" r="1.5" />
              <circle cx="118" cy="78" r="1.5" /><circle cx="126" cy="64" r="1" />
              <circle cx="108" cy="94" r="1" /><circle cx="83" cy="73" r="1" />
            </g>
          </svg>
        </Link>
      </nav>
    </div>
  );
}
