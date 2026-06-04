/**
 * 사이트 전역 설정 — Header·Footer·메타데이터 등에서 공유.
 * 브랜드 정보나 링크를 바꿀 때 이 파일만 수정하면 된다.
 */
export const siteConfig = {
  name: "InwooLeeme.dev",
  author: "InwooLeeme",
  description: "알고리즘과 개발 이야기",
  url: process.env.SITE_URL ?? "https://inwooleeme.vercel.app",
  githubUrl: "https://github.com/InwooLeeme",
  solvedacUrl: "https://solved.ac/profile/inwooleeme",
  solvedacCardUrl:
    "https://raw.githubusercontent.com/InwooLeeme/InwooLeeme/main/solvedac-inwooleeme-v1.svg",
} as const;

export type NavLink = { href: string; label: string };

/** 헤더 내비게이션 — 메뉴 추가 시 여기에만 추가 */
export const navLinks: NavLink[] = [
  { href: "/about", label: "소개" },
  { href: "/notes", label: "Notes" },
  { href: "/playground", label: "플레이그라운드" },
];

/** 푸터 빠른 링크 */
export const footerLinks: NavLink[] = [
  { href: "/blog", label: "블로그" },
  { href: "/notes", label: "Notes" },
  { href: "/about", label: "소개" },
];

/**
 * 현재 경로가 해당 링크에 속하는지 판단 (active 표시용).
 * 정확히 일치하거나 하위 경로(/notes/foo)면 active.
 */
export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}
