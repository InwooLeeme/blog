import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Code2, Trophy, Medal, PenTool, FolderGit2, BadgeCheck, ExternalLink } from "lucide-react";
import { siteConfig } from "@/lib/site";
import Reveal from "../components/Reveal";
import IconGithub from "../components/icon/IconGithub";
import { techChipStyle } from "@/lib/tech-colors";
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
};

const sections = [
  { id: "tech-stack", label: "기술 스택" },
  { id: "awards", label: "수상 이력" },
  { id: "competitions", label: "대회 참가 이력" },
  { id: "contest-works", label: "알고리즘 대회 출제 및 운영" },
  { id: "projects", label: "프로젝트" },
  { id: "certifications", label: "자격증" },
];

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
      {/* 헤더 */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{siteConfig.author}</h1>
        <p className="mt-2 text-muted-foreground">{siteConfig.description}</p>
      </header>

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
                        className="rounded-md border bg-card px-2.5 py-1 text-sm transition hover:border-accent-brand"
                      >
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
        <Reveal>
          <section id="projects" className="scroll-mt-24">
            <SectionHeading icon={<FolderGit2 className="h-5 w-5" />}>프로젝트</SectionHeading>
            <div className="space-y-4">
              {projects.map((p) => (
                <div
                  key={p.name}
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
                </div>
              ))}
            </div>
          </section>
        </Reveal>

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
