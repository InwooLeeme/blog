import type { Metadata } from "next";
import { buildGraphData } from "@/lib/graph";
import PostGraph from "./_components/PostGraph";

export const metadata: Metadata = {
  alternates: { canonical: "/graph" },
};

export default function GraphPage() {
  const data = buildGraphData();

  return (
    <div className="mx-auto mt-6 w-full max-w-6xl px-4 md:px-6 lg:px-8">
      <header className="mb-8 md:mb-12">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent-brand">
          Graph
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl text-gradient-brand">
          글 그래프
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          시리즈와 태그로 이어진 글들을 한눈에 살펴보세요
        </p>
      </header>

      <PostGraph data={data} />
    </div>
  );
}
