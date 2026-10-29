import type { Metadata } from "next";
import { buildGraphData } from "@/lib/graph";
import PostGraph from "./_components/PostGraph";

export const metadata: Metadata = {
  alternates: { canonical: "/graph" },
};

export default function GraphPage() {
  const data = buildGraphData();

  return (
    <div className="mx-auto mt-6 w-full max-w-[1600px] px-4 md:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
          지식 지도
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          글과 태그 사이의 연결을 따라 새로운 기록을 발견해 보세요.
        </p>
      </header>

      <PostGraph data={data} />
    </div>
  );
}
