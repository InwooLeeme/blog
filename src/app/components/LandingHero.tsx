import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site";
import HeroParallax from "./HeroParallax";

/** 랜딩 히어로 — 갤럭시 배경 위 미니멀 브랜드 첫인상. */
export default function LandingHero() {
  return (
    <section className="relative isolate flex min-h-[80vh] items-center overflow-hidden">
      {/* 배경 — 구상성단 별빛 필드, 스크롤 패럴랙스 */}
      <HeroParallax />

      <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:py-32">

        <h1 className="font-display text-[clamp(2rem,11vw,4.5rem)] font-bold tracking-tight">
          <span className="text-gradient-brand">{siteConfig.name}</span>
        </h1>

        <p className="mt-5 inline-flex items-center rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          알고리즘 · 개발 이야기
        </p>
        {/* <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-lg bg-accent-brand px-5 py-2.5 text-sm font-semibold text-accent-brand-fg shadow-sm transition hover:opacity-90"
          >
            블로그 보기
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center rounded-lg border px-5 py-2.5 text-sm font-medium transition hover:border-accent-brand hover:text-accent-brand"
          >
            소개
          </Link>
        </div> */}
      </div>
    </section>
  );
}
