import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PathfindingPlayground from "./_components/PathfindingPlayground";

export const metadata: Metadata = {
  title: "경로 탐색 놀이터",
  description: "벽을 그리고 시작점과 도착점을 배치하며 BFS, Dijkstra, A*의 최단 경로 탐색 과정을 비교해 보세요.",
  alternates: { canonical: "/playground/pathfinding" },
};

export default function PathfindingPage() {
  return (
    <div className="mx-auto w-full min-w-0 max-w-[1280px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <Link href="/playground" className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand"><ArrowLeft size={16} aria-hidden="true" />모든 실험</Link>
      <header className="mt-3 mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">경로 탐색</h1>
        <p className="text-sm leading-6 text-muted-foreground">벽을 그리고, 알고리즘마다 다른 탐색 과정을 비교해 보세요.</p>
      </header>
      <PathfindingPlayground />
    </div>
  );
}
