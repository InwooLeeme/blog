import type { CSSProperties } from "react";
import type { SimpleIcon } from "simple-icons";
import {
  siCplusplus,
  siTypescript,
  siPython,
  siJavascript,
  siReact,
  siNextdotjs,
  siTailwindcss,
  siMdx,
  siNodedotjs,
  siGit,
  siVercel,
} from "simple-icons";

/**
 * 기술 메타데이터의 단일 출처. 새 기술은 TECH에 한 줄만 추가
 */
export type TechMeta = {
  /** 브랜드 로고 */
  icon?: SimpleIcon;
  /** 색 override. */
  color?: string;
};

/** 기술 → 메타 매핑 */
export const TECH: Record<string, TechMeta> = {
  "C++": { icon: siCplusplus, color: "#2563eb" },
  TypeScript: { icon: siTypescript }, 
  Python: { icon: siPython, color: "#2563eb" },
  JavaScript: { icon: siJavascript, color: "#ca8a04" }, 
  React: { icon: siReact, color: "#0ea5e9" },
  "Next.js": { icon: siNextdotjs, color: "var(--foreground)" },
  "Tailwind CSS": { icon: siTailwindcss, color: "#0d9488" },
  MDX: { icon: siMdx, color: "#d97706" },
  "Node.js": { icon: siNodedotjs, color: "#16a34a" },
  Git: { icon: siGit, color: "#f05032" },
  Vercel: { icon: siVercel, color: "var(--foreground)" },
};

/** 매핑에 없을 때 */
export const TECH_COLOR_FALLBACK = "var(--accent-brand)";

/** 칩 배경/테두리 틴트 비율 */
const CHIP_BG_TINT = 12;
const CHIP_BORDER_TINT = 28;

/** 기술의 표시 색 */
export function techColor(tech: string): string {
  const meta = TECH[tech];
  if (meta?.color) return meta.color;
  if (meta?.icon) return `#${meta.icon.hex}`;
  return TECH_COLOR_FALLBACK;
}

/** 기술의 브랜드 로고 */
export function techIcon(tech: string): SimpleIcon | undefined {
  return TECH[tech]?.icon;
}

/** 기술 뱃지용 인라인 스타일 — 배경 틴트 + 테두리 + 텍스트 */
export function techChipStyle(tech: string): CSSProperties {
  const color = techColor(tech);
  return {
    color,
    backgroundColor: `color-mix(in oklab, ${color} ${CHIP_BG_TINT}%, transparent)`,
    borderColor: `color-mix(in oklab, ${color} ${CHIP_BORDER_TINT}%, transparent)`,
  };
}
