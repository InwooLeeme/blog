import PlaygroundStudio from "./_components/PlaygroundStudio";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Route } from "lucide-react";

export const metadata: Metadata = {
  title: "Playground",
  description: "빛과 움직임을 감상하고, 알고리즘을 직접 조작하며 탐험하는 작은 실험실.",
  alternates: { canonical: "/playground" },
};

export default function Playground() {
  return (
    <div className="mx-auto w-full min-w-0 max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <header className="mb-7 sm:mb-9">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Experiments in motion</p>
            <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
              Playground
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              빛과 움직임을 감상하고, 알고리즘을 직접 만져보는 작은 실험실.
              마음에 드는 실험을 골라 나만의 방식으로 탐험해 보세요.
            </p>
          </div>
        </div>
      </header>

      <Link href="/playground/pathfinding" className="group mb-8 flex flex-col justify-between gap-5 rounded-2xl border border-sky-500/20 bg-sky-500/5 p-6 transition-colors hover:border-sky-500/50 hover:bg-sky-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 sm:flex-row sm:items-center sm:p-7">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-sky-500/20 bg-background text-sky-700 dark:text-sky-300"><Route size={21} aria-hidden="true" /></span>
          <div><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-400">Interactive lab · 01</p><h2 className="text-xl font-medium tracking-tight">경로 탐색 놀이터</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">벽을 그리고, BFS · Dijkstra · A*가 길을 찾는 방법을 비교해 보세요.</p></div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 text-sm font-medium">실험 시작하기<ArrowUpRight size={17} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none" /></span>
      </Link>
      <h2 className="mb-4 text-sm font-medium text-muted-foreground">빛과 움직임의 실험</h2>
      <PlaygroundStudio />
    </div>
  );
}
