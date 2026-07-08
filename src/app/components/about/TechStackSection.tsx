"use client";

import * as React from "react";
import { Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { techChipStyle } from "@/lib/tech";
import { techLevelLabels, techStack, type TechLevel } from "@/lib/about";
import BrandIcon from "../icon/BrandIcon";
import { SectionHeading } from "./Timeline";

const CHIP_DELAY_MS = 60;
const levelTone: Record<TechLevel, string> = {
  main: "border-accent-brand/40 bg-accent-brand/10 text-accent-brand",
  used: "border-border bg-muted/60 text-muted-foreground",
  learning: "border-dashed border-border bg-background text-muted-foreground",
};

/**
 * 기술 스택 섹션 — 칩이 물결처럼 순서대로 등장하고, 호버 시 튀어오름.
 * 등장(바깥 래퍼)과 호버(안쪽 칩)의 transform을 분리해 지연이 호버에 안 걸리게 함.
 * prefers-reduced-motion이면 즉시 표시.
 */
export default function TechStackSection() {
  const ref = React.useRef<HTMLElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  let chipIndex = 0;

  return (
    <section ref={ref} id="tech-stack" className="scroll-mt-24">
      <SectionHeading icon={<Code2 className="h-5 w-5" />}>기술 스택</SectionHeading>
      <div className="mb-4 flex flex-wrap gap-1.5 text-xs">
        {Object.entries(techLevelLabels).map(([level, label]) => (
          <span
            key={level}
            className={cn(
              "rounded-md border px-2 py-0.5 font-medium",
              levelTone[level as TechLevel],
            )}
          >
            {label}
          </span>
        ))}
      </div>
      <div className="space-y-4">
        {techStack.map((group) => (
          <div key={group.category}>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
              {group.category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => {
                const delay = chipIndex++ * CHIP_DELAY_MS;
                return (
                  <span
                    key={item.name}
                    style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
                    className={cn(
                      "inline-block transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none",
                      visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-90 opacity-0",
                    )}
                  >
                    <span
                      style={techChipStyle(item.name)}
                      className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm font-medium shadow-sm transition duration-200 hover:-translate-y-1 hover:-rotate-2 hover:shadow-md"
                    >
                      <BrandIcon tech={item.name} className="shrink-0 text-[1.05em]" />
                      {item.name}
                      <span
                        className={cn(
                          "ml-1 rounded border px-1.5 py-0.5 text-[10px] leading-none",
                          levelTone[item.level],
                        )}
                      >
                        {techLevelLabels[item.level]}
                      </span>
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
