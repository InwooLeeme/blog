import { ArrowDown, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import Tr from "../Tr";
import ParticleVortex from "./ParticleVortex";

const textLinkClass =
  "group/link inline-flex min-h-11 items-center gap-2 border-b border-white/35 text-sm font-medium text-white transition-colors hover:border-cyan-300 hover:text-cyan-200 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-4 focus-visible:ring-offset-[#08090b]";

export default function ParticleEditorialHero() {
  return (
    <div className="bg-background px-4 pt-4 sm:px-6 lg:px-8">
      <section className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-xl border border-white/10 bg-[#08090b] text-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-x-0 top-0 h-[65%] md:h-full">
            <ParticleVortex />
          </div>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(8,9,11,.94)_0%,rgba(8,9,11,.65)_30%,rgba(8,9,11,.08)_58%,transparent_78%)] max-md:bg-[linear-gradient(to_bottom,transparent_25%,rgba(8,9,11,.3)_44%,#08090b_70%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-t from-[#08090b] to-transparent"
        />

        <div className="pointer-events-none relative z-10 mx-auto flex min-h-[clamp(32rem,74svh,48rem)] max-w-6xl flex-col px-5 py-6 max-md:min-h-[clamp(32rem,78svh,40rem)] sm:px-8 md:py-8 lg:px-10">
          <div className="flex items-center justify-between font-mono text-xs tracking-[0.08em] text-white/70">
            <span>~/inwooleeme/home</span>
            <span className="hidden sm:inline">Canvas study · 2026</span>
          </div>

          <div className="pointer-events-auto mt-auto max-w-3xl pb-12 pt-24 md:max-w-[60%] md:pb-14">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.12em] text-cyan-200/85">
              Personal developer log
            </p>
            <h1 className="font-display text-[clamp(2rem,6vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.05em] [overflow-wrap:anywhere] text-white">
              {siteConfig.name}
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
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
            className="pointer-events-auto absolute bottom-5 right-4 inline-flex min-h-11 items-center gap-2 font-mono text-xs tracking-[0.08em] text-white/75 transition hover:text-cyan-200 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:right-6 lg:right-8"
          >
            <Tr id="landing.scrollCue" />
            <ArrowDown className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      </section>
    </div>
  );
}
