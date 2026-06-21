import Image from "next/image";
import { siteConfig } from "@/lib/site";
import IconGithub from "../icon/IconGithub";

export default function AboutHero() {
  return (
    <header className="mb-10 flex flex-col items-center text-center">
      <div className="relative">
        <div
          aria-hidden
          className="absolute -inset-1 rounded-full bg-gradient-to-br from-accent-brand/40 to-accent-brand/0 blur-md"
        />
        <Image
          src="/avatar.png"
          alt={`${siteConfig.author} 아바타`}
          width={112}
          height={112}
          className="relative h-28 w-28 rounded-full border ring-2 ring-accent-brand/30 ring-offset-2 ring-offset-background"
        />
      </div>
      <h1 className="mt-5 text-3xl font-bold tracking-tight">{siteConfig.author}</h1>
      <p className="mt-2 text-lg font-medium text-accent-brand">
        Problem Solving과 웹 개발 그리고 AI에 관심이 있는 뉴비입니다.
      </p>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Problem Solving을 즐기고, 웹과 AI를 배우고 있는 뉴비입니다.
        <br/>
        그날 풀었던 대회 문제나 새로 배운 것들을 기록합니다.
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
