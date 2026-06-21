import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { Code2, Trophy, Medal, PenTool, FolderGit2, BadgeCheck, ExternalLink, Bot } from "lucide-react";
import { siteConfig } from "@/lib/site";
import Reveal from "../components/Reveal";
import ChatbotEmbed from "../components/ChatbotEmbed";
import IconGithub from "../components/icon/IconGithub";
import BrandIcon from "../components/icon/BrandIcon";
import { StaggerItem } from "../components/Stagger";
import { techChipStyle } from "@/lib/tech";
import {
  techStack,
  awards,
  competitions,
  contestWorks,
  projects,
  certifications,
} from "@/lib/about";

export const metadata: Metadata = {
  title: "About",
  description: `${siteConfig.author} 소개 — 기술 스택, 수상 이력, 대회 참가, 프로젝트, 자격증`,
  alternates: { canonical: "/about" },
};

const sections = [
  { id: "tech-stack", label: "기술 스택" },
  { id: "awards", label: "수상 이력" },
  { id: "competitions", label: "대회 참가 이력" },
  { id: "contest-works", label: "알고리즘 대회 출제 및 운영" },
  { id: "projects", label: "프로젝트" },
  { id: "certifications", label: "자격증" },
];

// TODO: 실제 챗봇 배포 URL로 교체
const CHATBOT_URL = "https://portfolio-chatbot-six-theta.vercel.app";

function SectionHeading({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <h2 className="mb-5 flex items-center gap-2 text-xl font-bold tracking-tight">
      <span className="text-accent-brand">{icon}</span>
      {children}
    </h2>
  );
}

type TimelineItem = { date: string; title: string; detail?: string };

/** 세로 연결선 + 점이 있는 타임라인 (수상·대회·출제·자격증 공용) */
function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="relative ml-2 border-s border-border">
      {items.map((it, i) => (
        <li key={i} className="ms-6 pb-6 last:pb-0">
          {/* 선 위의 점 */}
          <span
            aria-hidden
            className="absolute -start-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-accent-brand ring-4 ring-background"
          />
          <p className="text-xs font-medium tabular-nums text-muted-foreground">
            {it.date}
          </p>
          <p className="mt-1 font-medium leading-snug">{it.title}</p>
          {it.detail ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{it.detail}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* 히어로 */}
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
          ICPC 예선과 교내 알고리즘 대회에서 입상했고, 알고리즘 경진대회 출제·운영에도 참여했습니다.
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

      {/* solved.ac 프로필 카드 — 클릭 시 프로필로 이동, 티어 변동 시 자동 갱신 */}
      <Reveal>
        <div className="mb-12 flex justify-center">
          <a
            href={siteConfig.solvedacUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="solved.ac 프로필 보기"
            className="block w-full max-w-lg transition-transform duration-300 hover:scale-[1.015]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={siteConfig.solvedacCardUrl}
              alt={`${siteConfig.author}의 solved.ac 프로필 카드`}
              width={626}
              height={422}
              className="h-auto w-full"
            />
          </a>
        </div>
      </Reveal>

      {/* AI 챗봇 */}
      <ChatbotEmbed src={CHATBOT_URL} />

      {/* 목차 */}
      <nav className="mb-12 rounded-lg border bg-muted/30 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          목차
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="text-foreground/80 transition hover:text-accent-brand"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-14">
        {/* 1. 기술 스택 */}
        <Reveal>
          <section id="tech-stack" className="scroll-mt-24">
            <SectionHeading icon={<Code2 className="h-5 w-5" />}>기술 스택</SectionHeading>
            <div className="space-y-4">
              {techStack.map((group) => (
                <div key={group.category}>
                  <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                    {group.category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        style={techChipStyle(item)}
                        className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:shadow"
                      >
                        <BrandIcon tech={item} className="shrink-0 text-[1.05em]" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* 2. 수상 이력 */}
        <Reveal>
          <section id="awards" className="scroll-mt-24">
            <SectionHeading icon={<Trophy className="h-5 w-5" />}>수상 이력</SectionHeading>
            <Timeline
              items={awards.map((a) => ({ date: a.date, title: a.title, detail: a.detail }))}
            />
          </section>
        </Reveal>

        {/* 3. 대회 참가 이력 */}
        <Reveal>
          <section id="competitions" className="scroll-mt-24">
            <SectionHeading icon={<Medal className="h-5 w-5" />}>대회 참가 이력</SectionHeading>
            <Timeline
              items={competitions.map((c) => ({ date: c.date, title: c.name, detail: c.result }))}
            />
          </section>
        </Reveal>

        {/* 4. 알고리즘 대회 출제 및 운영 */}
        <Reveal>
          <section id="contest-works" className="scroll-mt-24">
            <SectionHeading icon={<PenTool className="h-5 w-5" />}>
              알고리즘 대회 출제 및 운영
            </SectionHeading>
            <Timeline
              items={contestWorks.map((c) => ({ date: c.date, title: c.title, detail: c.detail }))}
            />
          </section>
        </Reveal>

        {/* 5. 프로젝트 */}
        <section id="projects" className="scroll-mt-24">
          <SectionHeading icon={<FolderGit2 className="h-5 w-5" />}>프로젝트</SectionHeading>
          <div className="space-y-4">
            {projects.map((p, i) => (
              <StaggerItem
                key={p.name}
                index={i}
                className="rounded-lg border bg-card p-5 transition hover:border-accent-brand"
              >
                  <h3 className="text-lg font-bold tracking-tight">{p.name}</h3>
                  {p.subtitle ? (
                    <p className="mt-0.5 text-sm font-medium text-accent-brand">
                      {p.subtitle}
                    </p>
                  ) : null}

                  {p.highlights.length > 0 ? (
                    <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                      {p.highlights.map((h, i) => (
                        <li key={i} className="flex gap-2">
                          <span
                            aria-hidden
                            className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-accent-brand"
                          />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {p.tech && p.tech.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.tech.map((t) => (
                        <span
                          key={t}
                          style={techChipStyle(t)}
                          className="rounded-full border px-2.5 py-0.5 text-xs font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {p.links && p.links.length > 0 ? (
                    <div className="mt-4 flex flex-wrap items-center gap-4 border-t pt-3 text-sm">
                      {p.links.map((l) => (
                        <a
                          key={l.href}
                          href={l.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-muted-foreground transition hover:text-accent-brand"
                        >
                          {l.type === "github" ? (
                            <IconGithub width={16} height={16} />
                          ) : (
                            <ExternalLink className="h-4 w-4" />
                          )}
                          {l.label}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </StaggerItem>
              ))}
            </div>
          </section>

        {/* 6. 자격증 */}
        <Reveal>
          <section id="certifications" className="scroll-mt-24">
            <SectionHeading icon={<BadgeCheck className="h-5 w-5" />}>자격증</SectionHeading>
            <Timeline
              items={certifications.map((c) => ({
                date: c.date,
                title: c.name,
                detail: [c.nameEn, c.issuer].filter(Boolean).join(" · "),
              }))}
            />
          </section>
        </Reveal>
      </div>
    </div>
  );
}
