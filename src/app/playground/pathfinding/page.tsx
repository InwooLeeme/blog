import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Route } from "lucide-react";
import PathfindingPlayground from "./_components/PathfindingPlayground";

export const metadata: Metadata = {
  title: "경로 탐색 놀이터",
  description: "벽을 그리고 시작점과 도착점을 배치하며 BFS, Dijkstra, A*의 최단 경로 탐색 과정을 비교해 보세요.",
  alternates: { canonical: "/playground/pathfinding" },
};

export default function PathfindingPage() {
  return (
    <div className="mx-auto w-full min-w-0 max-w-[1440px] px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
      <Link href="/playground" className="inline-flex min-h-11 items-center gap-2 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"><ArrowLeft size={14} aria-hidden="true" />Playground로 돌아가기</Link>
      <header className="mb-7 mt-5 sm:mb-9">
        <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-700 dark:text-sky-400"><Route size={14} aria-hidden="true" />Algorithms, made visible</p>
        <h1 className="text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">길을 찾는 서로 다른 방법.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">벽을 그리고, 출발과 도착을 정해 보세요.<br className="sm:hidden" /> 같은 지도 위에서 세 알고리즘이 길을 찾아가는 과정을 비교하는 경로 탐색 놀이터입니다.</p>
      </header>
      <PathfindingPlayground />
    </div>
  );
}
