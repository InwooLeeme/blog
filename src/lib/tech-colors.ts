import type { CSSProperties } from "react";

/**
 * 기술 → 브랜드 색 매핑.
 */
export const TECH_COLORS: Record<string, string> = {
  "Next.js": "var(--foreground)",
  React: "#0ea5e9",
  TypeScript: "#3178c6",
  JavaScript: "#ca8a04",
  "Tailwind CSS": "#0d9488",
  MDX: "#d97706",
  "C++": "#2563eb",
  Python: "#2563eb",
  "Node.js": "#16a34a",
};

/** 매핑에 없을 때 */
export const TECH_COLOR_FALLBACK = "var(--accent-brand)";

/** 칩 배경/테두리 틴트 비율(%) — 톤 조정 */
const CHIP_BG_TINT = 12;
const CHIP_BORDER_TINT = 28;

/** 기술의 표시 색을 반환 */
export function techColor(tech: string): string {
  return TECH_COLORS[tech] ?? TECH_COLOR_FALLBACK;
}

/** 기술 칩(뱃지)용 인라인 스타일 — 배경 틴트 + 테두리 + 텍스트 */
export function techChipStyle(tech: string): CSSProperties {
  const color = techColor(tech);
  return {
    color,
    backgroundColor: `color-mix(in oklab, ${color} ${CHIP_BG_TINT}%, transparent)`,
    borderColor: `color-mix(in oklab, ${color} ${CHIP_BORDER_TINT}%, transparent)`,
  };
}
