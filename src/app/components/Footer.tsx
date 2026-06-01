import Link from "next/link";
import type { ReactNode } from "react";
import { Rss } from "lucide-react";
import IconGithub from "./icon/IconGithub";
import { siteConfig, footerLinks } from "@/lib/site";

/** 소셜 링크 — 새 항목은 여기에 한 줄 추가 (아이콘 JSX 포함) */
type Social = { label: string; href: string; external?: boolean; icon: ReactNode };

const socials: Social[] = [
  {
    label: "GitHub",
    href: siteConfig.githubUrl,
    external: true,
    icon: <IconGithub width={18} height={18} />,
  },
  {
    label: "RSS",
    href: "/feed.xml",
    icon: <Rss className="h-[18px] w-[18px]" />,
  },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t mt-16">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* 브랜드 */}
          <div className="space-y-3">
            <Link
              href="/blog"
              className="font-semibold tracking-tight"
            >
              {siteConfig.name}
            </Link>
            <p className="text-sm text-muted-foreground">
              {siteConfig.description}
            </p>
            <div className="flex items-center gap-2 pt-1">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  {...(s.external
                    ? { target: "_blank", rel: "noreferrer" }
                    : {})}
                  className="grid h-9 w-9 place-items-center rounded-md border text-muted-foreground transition hover:border-accent-brand hover:text-accent-brand"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* 빠른 링크 */}
          <nav className="flex flex-col gap-2.5 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              둘러보기
            </span>
            {footerLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-foreground/80 transition hover:text-accent-brand"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground md:text-left">
          © {year} {siteConfig.author} · Built with Next.js
        </div>
      </div>
    </footer>
  );
}
