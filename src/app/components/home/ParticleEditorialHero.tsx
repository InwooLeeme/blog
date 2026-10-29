import Link from "next/link";
import Tr from "../Tr";
import ParticleVortex from "./ParticleVortex";

const textLinkClass =
  "group/link inline-flex min-h-11 items-center gap-2 border-b border-white/35 text-sm font-medium text-white transition-colors hover:border-cyan-300 hover:text-cyan-200 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-4 focus-visible:ring-offset-[#08090b]";

export default function ParticleEditorialHero() {
  return (
    <div className="bg-background px-4 pt-4 sm:px-6 lg:px-8">
      <section className="relative isolate mx-auto max-w-6xl overflow-hidden border-b border-white/10 bg-[#08090b] text-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0">
            <ParticleVortex />
          </div>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(8,9,11,.94)_0%,rgba(8,9,11,.65)_30%,rgba(8,9,11,.08)_58%,transparent_78%)] max-md:bg-[linear-gradient(90deg,rgba(8,9,11,.9)_0%,rgba(8,9,11,.75)_40%,rgba(8,9,11,.5)_72%,rgba(8,9,11,.18)_100%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-t from-[#08090b] to-transparent"
        />

        <div className="pointer-events-none relative z-10 mx-auto flex min-h-[clamp(20rem,46svh,25rem)] max-w-6xl flex-col px-5 py-5 sm:px-8 md:min-h-[clamp(23rem,48svh,32rem)] md:py-6 lg:px-10">
          <div className="pointer-events-auto my-auto max-w-xl py-10 md:max-w-[62%] md:py-12">
            <h1 className="font-display text-[clamp(2rem,4.6vw,3.75rem)] font-semibold leading-[1.22] tracking-[-0.045em] text-white [word-break:keep-all]">
              <Tr id="landing.heroLead" />
              <br />
              <Tr id="landing.heroEnd" />
            </h1>
            <p className="mt-6 max-w-sm text-sm leading-7 text-white/80 sm:text-base">
              <Tr id="landing.heroDescription" />
            </p>

            <div className="pointer-events-auto mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/blog" className="group/link inline-flex min-h-11 items-center gap-2 rounded-sm bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-4 focus-visible:ring-offset-[#08090b]">
                <Tr id="landing.blogCta" />
              </Link>
              <Link href="/notes" className={textLinkClass}>
                <Tr id="landing.notesCta" />
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
