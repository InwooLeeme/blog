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
  giscus: {
    repo: "InwooLeeme/blog_comment",
    repoId: "R_kgDOPvLsdQ",
    category: "General",
    categoryId: "DIC_kwDOPvLsdc4CvZeK",
  },
} as const;

import type { MessageId } from "@/lib/i18n";

export type NavLink = { href: string; label: string; messageId?: MessageId };

export function resolveNavLabel(
  link: NavLink,
  translate: (id: MessageId) => string,
): string {
  return link.messageId ? translate(link.messageId) : link.label;
}

/** 헤더 내비게이션 */
export const navLinks: NavLink[] = [
  { href: "/blog", label: "블로그", messageId: "footer.blog" },
  { href: "/about", label: "Profile", messageId: "nav.profile" },
  { href: "/notes", label: "Notes", messageId: "nav.notes" },
  { href: "/playground", label: "Playground", messageId: "nav.playground" },
  { href: "/graph", label: "Graph", messageId: "nav.graph" },
];

/** 푸터 */
export const footerLinks: NavLink[] = [
  { href: "/blog", label: "블로그", messageId: "footer.blog" },
  { href: "/notes", label: "Notes", messageId: "nav.notes" },
  { href: "/about", label: "Profile", messageId: "nav.profile" },
];


export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}
