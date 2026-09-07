import PlaygroundStudio from "./_components/PlaygroundStudio";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playground",
  description: "Canvas and interaction experiments collected in one visual playground.",
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
              빛과 움직임으로 만든 작은 실험들.
              장면을 골라 천천히 둘러보고, 마음에 드는 순간에 몰입해 보세요.
            </p>
          </div>
        </div>
      </header>

      <PlaygroundStudio />
    </div>
  );
}
