import Link from "next/link";
import { ArrowRight } from "lucide-react";
import IconGithub from "./icon/IconGithub";
import { siteConfig } from "@/lib/site";

/**
 * 랜딩 히어로 — 브랜드 첫인상.
 * 배경의 'galaxy slot' div는 Phase 3에서 3D 갤럭시로 교체될 자리다.
 */
export default function LandingHero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* 배경 슬롯 — Phase 3에서 갤럭시 시뮬레이터로 교체 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute left-1/2 top-1/2 h-[34rem] w-[48rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-[100px]"
          style={{ background: "var(--accent-gradient)" }}
        />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:py-32">
        <p className="mb-5 inline-flex items-center rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          알고리즘 · 개발 이야기
        </p>

        <h1 className="font-display text-5xl font-bold tracking-tight sm:text-7xl">
          <span className="text-gradient-brand">{siteConfig.name}</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          {siteConfig.author}의 개발 블로그입니다. 알고리즘 풀이와 문제 해결 과정,
          그리고 그 사이에서 배운 것들을 기록합니다.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
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
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          <a
            href={siteConfig.githubUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="grid h-9 w-9 place-items-center rounded-md border text-muted-foreground transition hover:border-accent-brand hover:text-accent-brand"
          >
            <IconGithub width={18} height={18} />
          </a>
          <a
            href={siteConfig.solvedacUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center rounded-md border px-3 text-sm text-muted-foreground transition hover:border-accent-brand hover:text-accent-brand"
          >
            solved.ac
          </a>
        </div>
      </div>
    </section>
  );
}
