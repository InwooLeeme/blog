import type { Metadata } from "next";
import { Trophy, Medal, PenTool, BadgeCheck } from "lucide-react";
import { siteConfig } from "@/lib/site";
import Reveal from "../components/Reveal";
import { awards, competitions, contestWorks, certifications } from "@/lib/about";
import AboutHero from "../components/about/AboutHero";
import AnimatedTimeline from "../components/about/AnimatedTimeline";
import ProjectsSection from "../components/about/ProjectsSection";
import TechStackSection from "../components/about/TechStackSection";
import TocSpy from "../components/about/TocSpy";
import { SectionHeading } from "../components/about/Timeline";
import { ChatbotLauncher } from "../components/ChatbotLauncher";

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

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <TocSpy sections={sections} />
      <AboutHero />

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

      {/* 목차 */}
      <nav id="about-toc" className="mb-12 rounded-lg border bg-muted/30 p-4">
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
          <TechStackSection />
        </Reveal>

        {/* 2. 수상 이력 */}
        <Reveal>
          <section id="awards" className="scroll-mt-24">
            <SectionHeading icon={<Trophy className="h-5 w-5" />}>수상 이력</SectionHeading>
            <AnimatedTimeline
              items={awards.map((a) => ({ date: a.date, title: a.title, detail: a.detail }))}
            />
          </section>
        </Reveal>

        {/* 3. 대회 참가 이력 */}
        <Reveal>
          <section id="competitions" className="scroll-mt-24">
            <SectionHeading icon={<Medal className="h-5 w-5" />}>대회 참가 이력</SectionHeading>
            <AnimatedTimeline
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
            <AnimatedTimeline
              items={contestWorks.map((c) => ({ date: c.date, title: c.title, detail: c.detail }))}
            />
          </section>
        </Reveal>

        {/* 5. 프로젝트 */}
        <ProjectsSection />

        {/* 6. 자격증 */}
        <Reveal>
          <section id="certifications" className="scroll-mt-24">
            <SectionHeading icon={<BadgeCheck className="h-5 w-5" />}>자격증</SectionHeading>
            <AnimatedTimeline
              items={certifications.map((c) => ({
                date: c.date,
                title: c.name,
                detail: [c.nameEn, c.issuer].filter(Boolean).join(" · "),
              }))}
            />
          </section>
        </Reveal>
      </div>

      <ChatbotLauncher host="https://portfolio-chatbot-six-theta.vercel.app" />
    </div>
  );
}
