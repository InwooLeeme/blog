/**
 * 사이트 전역 설정 — Header·Footer·메타데이터 등에서 공유.
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

/** 헤더 내비게이션 */
export const navLinks: NavLink[] = [
  { href: "/about", label: "Profile" },
  { href: "/notes", label: "Notes" },
  { href: "/playground", label: "Playground" },
];

/** 푸터 */
export const footerLinks: NavLink[] = [
  { href: "/blog", label: "블로그" },
  { href: "/notes", label: "Notes" },
  { href: "/about", label: "Profile" },
];


export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}
