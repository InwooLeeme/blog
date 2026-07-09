"use client";

import { Trophy, Medal, PenTool, BadgeCheck } from "lucide-react";
import { siteConfig } from "@/lib/site";
import Reveal from "../Reveal";
import AboutSummary from "./AboutSummary";
import AboutHero from "./AboutHero";
import AnimatedTimeline from "./AnimatedTimeline";
import ProjectsSection from "./ProjectsSection";
import TechStackSection from "./TechStackSection";
import TocSpy from "./TocSpy";
import { SectionHeading } from "./Timeline";
import { ChatbotLauncher } from "../ChatbotLauncher";
import WorkingStyleSection from "./WorkingStyleSection";
import { useT } from "../LocaleProvider";
import { useAboutData } from "./useAboutData";

/** About 본문 — 언어 컨텍스트를 읽어 ko/en 데이터 번들과 섹션 라벨을 전환 */
export default function AboutPageContent() {
  const t = useT();
  const { awards, competitions, contestWorks, certifications } = useAboutData();

  const sections = [
    { id: "tech-stack", label: t("about.techStack") },
    { id: "awards", label: t("about.awards") },
    { id: "competitions", label: t("about.competitions") },
    { id: "contest-works", label: t("about.contestWorks") },
    { id: "projects", label: t("about.projects") },
    { id: "working-style", label: t("about.workingStyle") },
    { id: "certifications", label: t("about.certifications") },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <TocSpy sections={sections} />
      <AboutHero />
      <Reveal>
        <AboutSummary />
      </Reveal>

      {/* solved.ac 프로필 카드 — 클릭 시 프로필로 이동, 티어 변동 시 자동 갱신 */}
      <Reveal>
        <div className="mb-12 flex justify-center">
          <a
            href={siteConfig.solvedacUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={t("about.solvedacAria")}
            className="block w-full max-w-lg transition-transform duration-300 hover:scale-[1.015]"
          >
            <img
              src={siteConfig.solvedacCardUrl}
              alt={`${siteConfig.author} solved.ac profile card`}
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
          {t("about.toc")}
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
            <SectionHeading icon={<Trophy className="h-5 w-5" />}>{t("about.awards")}</SectionHeading>
            <AnimatedTimeline
              items={awards.map((a) => ({
                date: a.date,
                title: a.title,
                detail: a.detail,
                link: a.link,
              }))}
            />
          </section>
        </Reveal>

        {/* 3. 대회 참가 이력 */}
        <Reveal>
          <section id="competitions" className="scroll-mt-24">
            <SectionHeading icon={<Medal className="h-5 w-5" />}>{t("about.competitions")}</SectionHeading>
            <AnimatedTimeline
              items={competitions.map((c) => ({
                date: c.date,
                title: c.name,
                detail: c.result,
                link: c.link,
              }))}
            />
          </section>
        </Reveal>

        {/* 4. 알고리즘 대회 출제 및 운영 */}
        <Reveal>
          <section id="contest-works" className="scroll-mt-24">
            <SectionHeading icon={<PenTool className="h-5 w-5" />}>
              {t("about.contestWorks")}
            </SectionHeading>
            <AnimatedTimeline
              items={contestWorks.map((c) => ({
                date: c.date,
                title: c.title,
                detail: c.detail,
                link: c.link,
              }))}
            />
          </section>
        </Reveal>

        {/* 5. 프로젝트 */}
        <ProjectsSection />

        {/* 6. 작업 방식 */}
        <Reveal>
          <WorkingStyleSection />
        </Reveal>

        {/* 7. 자격증 */}
        <Reveal>
          <section id="certifications" className="scroll-mt-24">
            <SectionHeading icon={<BadgeCheck className="h-5 w-5" />}>{t("about.certifications")}</SectionHeading>
            <AnimatedTimeline
              items={certifications.map((c) => ({
                date: c.date,
                title: c.name,
                detail: [c.nameEn, c.issuer].filter(Boolean).join(" · "),
                link: c.link,
              }))}
            />
          </section>
        </Reveal>
      </div>

      <ChatbotLauncher host="https://portfolio-chatbot-six-theta.vercel.app" />
    </div>
  );
}
