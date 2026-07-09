import { siteConfig } from "@/lib/site";
import Tr from "./Tr";

/** 랜딩 히어로 — 정적인 브랜드 배경으로 가볍게 유지한다. */
export default function LandingHero() {
  return (
    <section className="relative isolate flex min-h-[80vh] items-center overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute left-1/2 top-1/2 h-[34rem] w-[48rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--accent-brand),transparent_70%)] opacity-20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8">
        <h1 className="font-display text-[clamp(2rem,11vw,4.5rem)] font-bold tracking-tight">
          <span className="text-gradient-brand">{siteConfig.name}</span>
        </h1>

        <p className="mt-5 inline-flex items-center rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          <Tr id="landing.tagline" />
        </p>
      </div>
    </section>
  );
}
