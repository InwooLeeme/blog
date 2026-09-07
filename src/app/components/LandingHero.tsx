import { siteConfig } from "@/lib/site";
import Link from "next/link";
import Tr from "./Tr";
import ShootingStars from "./ShootingStars";

/** 랜딩 히어로 — Profile·Graph와 같은 구상성단 밤하늘로 사이트 아이덴티티를 통일한다. */
export default function LandingHero() {
  return (
    <section className="relative isolate flex min-h-[38vh] items-center overflow-hidden sm:min-h-[44vh]">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <ShootingStars />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 sm:py-16 lg:px-8">
        <h1 className="font-display text-[clamp(2rem,10vw,4.5rem)] font-bold tracking-tight">
          <span className="text-gradient-brand">{siteConfig.name}</span>
        </h1>

        <p className="mt-4 text-lg font-medium text-accent-brand">
          <Tr id="about.heroTitle" />
        </p>

        <p className="mt-5 inline-flex items-center rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          <Tr id="landing.tagline" />
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/blog"
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-accent-brand px-5 py-2 text-sm font-semibold text-accent-brand-fg shadow-lg shadow-accent-brand/15 transition hover:-translate-y-0.5 hover:shadow-accent-brand/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Tr id="landing.blogCta" />
          </Link>
          <Link
            href="/notes"
            className="inline-flex min-h-10 items-center justify-center rounded-full border bg-background/50 px-5 py-2 text-sm font-semibold text-foreground backdrop-blur transition hover:-translate-y-0.5 hover:border-accent-brand hover:text-accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Tr id="landing.notesCta" />
          </Link>
        </div>
      </div>
    </section>
  );
}
