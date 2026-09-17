import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PathfindingPlayground from "./_components/PathfindingPlayground";

export const metadata: Metadata = {
  title: "경로 탐색",
  description: "같은 지도에서 BFS, Dijkstra, A*의 탐색 과정과 최단 경로를 비교합니다.",
  alternates: { canonical: "/playground/pathfinding" },
};

export default function PathfindingPage() {
  return (
    <div className="mx-auto mt-6 w-full min-w-0 max-w-6xl px-4 pb-12 md:px-6 lg:px-8">
      <Link href="/playground" className="inline-flex min-h-11 items-center gap-2 rounded-md text-sm text-muted-foreground hover:text-accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowLeft size={16} aria-hidden="true" />Playground</Link>
      <header className="mt-4 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">경로 탐색</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">같은 지도에서 BFS, Dijkstra, A*의 탐색 과정과 최단 경로를 비교합니다.</p>
      </header>
      <PathfindingPlayground />
    </div>
  );
}
