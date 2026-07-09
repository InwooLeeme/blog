import type { Metadata } from "next";
import { buildGraphData } from "@/lib/graph";
import PostGraph from "./_components/PostGraph";
import Tr from "@/app/components/Tr";

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
          <Tr id="graph.title" />
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          <Tr id="graph.desc" />
        </p>
      </header>

      <PostGraph data={data} />
    </div>
  );
}
