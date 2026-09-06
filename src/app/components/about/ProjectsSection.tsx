"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import * as m from "framer-motion/m";
import { FolderGit2, ExternalLink, BookOpen } from "lucide-react";
import { techChipStyle, TECH_COLOR_FALLBACK } from "@/lib/tech";
import BrandIcon from "../icon/BrandIcon";
import IconGithub from "../icon/IconGithub";
import SpotlightCard, { CARD_ENTER_TRANSITION } from "./SpotlightCard";
import { SectionHeading } from "./SectionHeading";
import { useT } from "../LocaleProvider";
import { useAboutData } from "./useAboutData";

export default function ProjectsSection() {
  const t = useT();
  const { projects } = useAboutData();
  const reducedMotion = useReducedMotion();
  return (
    <section id="projects" className="scroll-mt-24">
      <SectionHeading icon={<FolderGit2 className="h-5 w-5" />}>{t("about.projects")}</SectionHeading>
      <div className="space-y-4">
        {projects.map((p) => {
          const accent = p.accent ?? TECH_COLOR_FALLBACK;
          return (
            <SpotlightCard
              key={p.name}
              className="overflow-hidden rounded-lg border bg-card shadow-sm hover:shadow-md hover:[border-color:var(--proj-accent)]"
              style={{ "--proj-accent": accent } as CSSProperties}
            >
              {p.image ? (
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Image
                    src={p.image}
                    alt={t("about.projectPreviewAlt", { name: p.name })}
                    fill
                    // About 본문 컨테이너 폭(AboutPageContent.tsx의 max-w-5xl)에 맞춘 값 — TocSpy.tsx의 2xl 브레이크포인트와 함께 조정 필요
                    sizes="(max-width: 768px) 100vw, 992px"
                    className="object-cover"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-10"
                    style={{ background: "linear-gradient(to top, var(--card), transparent)" }}
                  />
                </div>
              ) : null}

              <div className="p-5">
                <h3 className="text-lg font-bold tracking-tight">{p.name}</h3>
                <m.span
                  aria-hidden
                  className="mb-2.5 mt-1.5 block h-0.5 w-11 origin-left rounded-full"
                  style={{ backgroundColor: accent }}
                  initial={reducedMotion ? false : { scaleX: 0 }}
                  whileInView={reducedMotion ? undefined : { scaleX: 1 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{
                    duration: 0.4,
                    delay: CARD_ENTER_TRANSITION.duration * 0.3,
                    ease: "easeOut",
                  }}
                />
                {p.meta ? (
                  <p className="text-xs font-medium tabular-nums text-muted-foreground">
                    {p.meta}
                  </p>
                ) : null}

                {p.highlights.length > 0 ? (
                  <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                    {p.highlights.map((h, j) => (
                      <li key={j} className="flex gap-2">
                        <span
                          aria-hidden
                          className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full"
                          style={{ backgroundColor: accent }}
                        />
                        <span className={j === 0 ? "font-medium text-foreground" : undefined}>
                          {h}
                        </span>
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
                        className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium"
                      >
                        <BrandIcon tech={t} className="shrink-0" />
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}

                {p.links && p.links.length > 0 ? (
                  <div className="mt-4 flex flex-wrap items-center gap-4 border-t pt-3 text-sm">
                    {p.links.map((l) => {
                      const external = /^https?:\/\//.test(l.href);
                      return (
                        <a
                          key={l.href}
                          href={l.href}
                          target={external ? "_blank" : undefined}
                          rel={external ? "noreferrer" : undefined}
                          className="inline-flex items-center gap-1.5 text-muted-foreground transition hover:[color:var(--proj-accent)]"
                        >
                          {l.type === "github" ? (
                            <IconGithub width={16} height={16} />
                          ) : l.type === "post" ? (
                            <BookOpen className="h-4 w-4" />
                          ) : (
                            <ExternalLink className="h-4 w-4" />
                          )}
                          {l.label}
                        </a>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </section>
  );
}
