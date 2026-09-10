import type { Metadata } from "next";
import TilHub from "@/app/components/til/TilHub";
import Tr from "@/app/components/Tr";
import { buildTilOverview } from "@/lib/til";
import { getAllTilRecords } from "@/lib/til-files";

export const metadata: Metadata = {
  title: "SKALA TIL",
  description: "SKALA 부트캠프에서 매일 배운 내용과 과제, 팀 프로젝트 진행 기록",
  alternates: { canonical: "/til" },
};

export default function TilPage() {
  const overview = buildTilOverview(getAllTilRecords());

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="mb-10 max-w-3xl sm:mb-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-brand"><Tr id="til.eyebrow" /></p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-gradient-brand sm:text-5xl">
          <Tr id="til.titleLine1" /><br className="hidden sm:block" /> <Tr id="til.titleLine2" />
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          <Tr id="til.intro" />
        </p>
      </header>
      <TilHub overview={overview} />
    </div>
  );
}
