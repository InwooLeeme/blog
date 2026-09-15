import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PlaygroundStudio from "../_components/PlaygroundStudio";

export const metadata: Metadata = {
  title: "그래픽 실험",
  description: "구상성단과 색방울로 살펴보는 별의 분포, 움직임과 색의 혼합.",
  alternates: { canonical: "/playground/effects" },
};

export default function EffectsPage() {
  return (
    <div className="mx-auto mt-6 w-full min-w-0 max-w-6xl px-4 pb-12 md:px-6 lg:px-8">
      <Link href="/playground" className="inline-flex min-h-11 items-center gap-2 rounded-md text-sm text-muted-foreground hover:text-accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowLeft size={16} aria-hidden="true" />Playground</Link>
      <header className="mt-4 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">그래픽 실험</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">별의 분포와 색이 겹치는 효과. 장면을 선택하면 바로 실행됩니다.</p>
      </header>
      <PlaygroundStudio />
    </div>
  );
}
