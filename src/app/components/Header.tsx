"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ModeToggle from "./ThemeToggle";
import IconGithub from "./icon/IconGithub";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import ReadingProgressBar from "./ReadingProgressBar";
import SearchDialog from "./SearchDialog";
import { cn } from "@/lib/utils";
import { navLinks, siteConfig, isActivePath } from "@/lib/site";

interface IHeader {
  title: string | undefined;
}

function GithubButton() {
  return (
    <Button asChild variant="ghost" size="icon" aria-label="GitHub">
      <Link href={siteConfig.githubUrl} target="_blank" rel="noreferrer">
        <IconGithub width={20} height={20} />
      </Link>
    </Button>
  );
}

export default function Header({ title }: IHeader) {
  const pathname = usePathname() ?? "";

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <ReadingProgressBar />
      <div className="w-full mx-auto flex items-center justify-between h-14 px-4 sm:px-6 lg:px-20">
        <div className="flex flex-1 items-center gap-4">
          <Link
            href="/blog"
            className="font-display font-bold tracking-tight text-gradient-brand max-[360px]:text-sm"
            title={title}
          >
            {title}
          </Link>
        </div>

        {/* 우측: 데스크톱 내비 */}
        <nav className="hidden md:flex gap-5 text-sm items-center">
          {navLinks.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative font-medium transition-colors hover:text-accent-brand",
                  active ? "text-accent-brand" : "text-foreground",
                )}
              >
                {link.label}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 h-0.5 w-full origin-left bg-accent-brand transition-transform duration-300",
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                  )}
                />
              </Link>
            );
          })}
          <SearchDialog />
          <GithubButton />
          <ModeToggle />
        </nav>

        {/* 모바일: 검색 + 깃허브 + 다크모드 + 햄버거 */}
        <div className="md:hidden flex items-center gap-2">
          <SearchDialog />
          <GithubButton />
          <ModeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="메뉴 열기">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="mt-4 flex flex-col gap-1">
                {navLinks.map((n) => {
                  const active = isActivePath(pathname, n.href);
                  return (
                    <SheetClose asChild key={n.href}>
                      <Link
                        href={n.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "rounded-md px-3 py-2 text-base transition-colors",
                          active
                            ? "bg-accent-brand/10 font-semibold text-accent-brand"
                            : "text-foreground hover:bg-muted/70",
                        )}
                      >
                        {n.label}
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
