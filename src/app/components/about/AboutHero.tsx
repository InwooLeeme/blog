import Image from "next/image";
import { siteConfig } from "@/lib/site";
import IconGithub from "../icon/IconGithub";
import ShootingStars from "../ShootingStars";

export default function AboutHero() {
  return (
    <header className="relative isolate mb-10 flex flex-col items-center overflow-hidden py-12 text-center">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <ShootingStars />
      </div>
      <div className="relative">
        <div
          aria-hidden
          className="absolute -inset-4 rounded-full opacity-70 blur-2xl bg-[radial-gradient(circle,var(--accent-brand),transparent_70%)]"
        />
        <Image
          src="/avatar.png"
          alt={`${siteConfig.author} 아바타`}
          width={112}
          height={112}
          className="relative h-28 w-28 rounded-full ring-1 ring-accent-brand/70 shadow-lg shadow-accent-brand/20"
        />
      </div>
      <h1 className="mt-5 text-3xl font-bold tracking-tight">{siteConfig.author}</h1>
      <p className="mt-2 text-lg font-medium text-accent-brand">
        문제를 풀고, 만들고, 기록합니다.
      </p>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        C++로 알고리즘 문제를 풀고, Next.js와 AI로 무언가를 만듭니다.
        <br/>
        여기엔 그 과정에서 푼 문제와 새로 배운 것들을 남깁니다.
      </p>
      <div className="mt-5 flex items-center gap-2">
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
    </header>
  );
}
