import { ArrowDown, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import Tr from "../Tr";
import ParticleVortex from "./ParticleVortex";

const textLinkClass =
  "group/link inline-flex min-h-10 items-center gap-2 border-b border-white/35 text-sm font-medium text-white transition-colors hover:border-cyan-300 hover:text-cyan-200 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-4 focus-visible:ring-offset-[#08090b]";

export default function ParticleEditorialHero() {
  return (
    <section className="relative isolate min-h-[clamp(34rem,calc(100svh-3.5rem),56rem)] overflow-hidden bg-[#08090b] text-white max-md:min-h-[min(42rem,calc(100svh-3.5rem))]">
      <div className="absolute inset-0 z-0">
        <div className="absolute left-1/2 top-[2%] h-[66%] w-[min(94vw,54rem)] -translate-x-1/2 md:left-auto md:right-[-2vw] md:top-0 md:h-full md:w-[min(72vw,68rem)] md:translate-x-0">
          <ParticleVortex />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_68%_44%,transparent_0%,transparent_25%,rgba(8,9,11,.28)_58%,rgba(8,9,11,.92)_100%)] max-md:bg-[linear-gradient(to_bottom,transparent_30%,rgba(8,9,11,.42)_54%,#08090b_82%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-t from-[#08090b] to-transparent"
      />

      <div className="pointer-events-none relative z-10 mx-auto flex min-h-[clamp(34rem,calc(100svh-3.5rem),56rem)] max-w-6xl flex-col px-4 py-8 max-md:min-h-[min(42rem,calc(100svh-3.5rem))] sm:px-6 md:py-10 lg:px-8">
        <div className="flex items-center justify-between font-mono text-[0.65rem] uppercase tracking-[0.24em] text-white/55">
          <span>~/inwooleeme/home</span>
          <span className="hidden sm:inline">Canvas study · 2026</span>
        </div>

        <div className="mt-auto max-w-2xl pb-14 md:pb-16">
          <p className="mb-4 font-mono text-[0.68rem] uppercase tracking-[0.26em] text-cyan-200/70">
            Personal developer log
          </p>
          <h1 className="font-display text-[clamp(2.7rem,8vw,6.8rem)] font-semibold leading-[0.88] tracking-[-0.065em] text-white">
            {siteConfig.name}
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/72 sm:text-lg">
            <Tr id="about.heroTitle" />
          </p>

          <div className="pointer-events-auto mt-7 flex flex-wrap gap-x-7 gap-y-2">
            <Link href="/blog" className={textLinkClass}>
              <Tr id="landing.blogCta" />
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none" aria-hidden />
            </Link>
            <Link href="/notes" className={textLinkClass}>
              <Tr id="landing.notesCta" />
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none" aria-hidden />
            </Link>
          </div>
        </div>

        <a
          href="#recent-posts"
          className="pointer-events-auto absolute bottom-5 right-4 inline-flex min-h-10 items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/55 transition hover:text-cyan-200 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:right-6 lg:right-8"
        >
          <Tr id="landing.scrollCue" />
          <ArrowDown className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
    </section>
  );
}
