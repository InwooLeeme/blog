import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PlaygroundStudio from "../_components/PlaygroundStudio";

export const metadata: Metadata = {
  title: "빛과 움직임",
  description: "구상성단과 색방울, 두 가지 빛의 움직임을 감상하는 비주얼 실험실.",
  alternates: { canonical: "/playground/effects" },
};

export default function EffectsPage() {
  return (
    <div className="mx-auto w-full min-w-0 max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <Link href="/playground" className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand"><ArrowLeft size={16} aria-hidden="true" />모든 실험</Link>
      <header className="mt-3 mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">빛과 움직임</h1>
        <p className="text-sm leading-6 text-muted-foreground">장면을 골라 감상하거나 전체 화면으로 펼쳐 보세요.</p>
      </header>
      <PlaygroundStudio />
    </div>
  );
}
