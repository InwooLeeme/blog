import { siteConfig } from "@/lib/site";
import Tr from "./Tr";
import ShootingStars from "./ShootingStars";

/** 랜딩 히어로 — Profile·Graph와 같은 구상성단 밤하늘로 사이트 아이덴티티를 통일한다. */
export default function LandingHero() {
  return (
    <section className="relative isolate flex min-h-[46vh] items-center overflow-hidden sm:min-h-[52vh]">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <ShootingStars />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <h1 className="font-display text-[clamp(2rem,11vw,4.5rem)] font-bold tracking-tight">
          <span className="text-gradient-brand">{siteConfig.name}</span>
        </h1>

        <p className="mt-4 text-lg font-medium text-accent-brand">
          <Tr id="about.heroTitle" />
        </p>

        <p className="mt-5 inline-flex items-center rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          <Tr id="landing.tagline" />
        </p>
      </div>
    </section>
  );
}
