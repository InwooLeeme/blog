import EffectCarousel from "./_components/EffectCarousel";
import type { Metadata } from "next";
import { GalleryHorizontal, Grid3X3, Maximize2, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Playground",
  description: "Canvas and interaction experiments collected in one visual playground.",
  alternates: { canonical: "/playground" },
};

export default function Playground() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 border-b pb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
              <GalleryHorizontal className="h-3.5 w-3.5 text-accent-brand" />
              Visual Lab
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Playground
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              웹에서 직접 실험한 캔버스 이펙트와 인터랙션을 모아둔 공간입니다.
              가볍게 둘러보고 마음에 드는 장면은 화면 전체로 감상할 수 있습니다.
            </p>
          </div>
        </div>
      </header>

      <EffectCarousel />
    </main>
  );
}
