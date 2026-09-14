"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ModeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import { useT } from "./LocaleProvider";
import IconGithub from "./icon/IconGithub";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ArrowUpRight, Menu, Network } from "lucide-react";
import ReadingProgressBar from "./ReadingProgressBar";
import { SearchProvider, SearchTrigger } from "./SearchDialog";
import { cn } from "@/lib/utils";
import { navLinks, siteConfig, isActivePath, resolveNavLabel } from "@/lib/site";
import { subscribeToScroll } from "./scroll-subscriber";
import { nextHeaderScrolled } from "./scroll-visibility";

interface IHeader {
  title: string | undefined;
}

function useScrolled(onPx = 40, offPx = 16) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const read = () =>
      setScrolled((previous) =>
        nextHeaderScrolled(previous, window.scrollY, onPx, offPx),
      );
    read();
    return subscribeToScroll(read);
  }, [onPx, offPx]);
  return scrolled;
}

function Wordmark({ title }: { title: string | undefined }) {
  const hasDevSuffix = title?.endsWith(".dev");
  return (
    <Link
      href="/"
      title={title}
      className="inline-flex min-h-11 shrink-0 items-center rounded-md font-display font-bold tracking-tight text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background max-[360px]:text-sm"
    >
      <span>
        {hasDevSuffix ? title?.slice(0, -4) : title}
        {hasDevSuffix && <span className="text-accent-brand">.dev</span>}
      </span>
    </Link>
  );
}

// 데스크톱 헤더 컨트롤
function Controls() {
  return (
    <div className="hidden shrink-0 items-center gap-3 lg:flex">
      <SearchTrigger />
      <div className="flex items-center border-l border-border/70 pl-2">
        <LanguageToggle />
        <ModeToggle />
      </div>
    </div>
  );
}

function DesktopNav({ pathname }: { pathname: string }) {
  const t = useT();
  return (
    <nav
      aria-label={t("header.navigation")}
      className="hidden shrink-0 items-center gap-1 text-sm lg:flex"
    >
      {navLinks.map((link) => {
        const active = isActivePath(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative inline-flex min-h-11 items-center whitespace-nowrap rounded-lg px-2.5 font-medium transition-colors hover:bg-muted/70 outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
              active
                ? "text-accent-brand after:absolute after:inset-x-2.5 after:bottom-1 after:h-0.5 after:rounded-full after:bg-accent-brand"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {resolveNavLabel(link, t)}
          </Link>
        );
      })}
    </nav>
  );
}

function MobileNav({ pathname }: { pathname: string }) {
  const t = useT();
  return (
    <div className="flex shrink-0 items-center gap-1 lg:hidden">
      <SearchTrigger compact />
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("header.openMenu")}
            className="size-11 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-[min(22rem,100vw)] gap-0 overflow-y-auto p-5 [&>button]:top-3 [&>button]:right-3 [&>button]:flex [&>button]:size-11 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-lg"
          aria-describedby={undefined}
        >
          <SheetTitle className="flex min-h-11 items-center pr-10">
            {t("header.menu")}
          </SheetTitle>
          <nav
            aria-label={t("header.navigation")}
            className="mt-4 flex flex-col gap-1"
          >
            {navLinks.map((n) => {
              const active = isActivePath(pathname, n.href);
              return (
                <SheetClose asChild key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center rounded-lg px-3 py-2 text-base transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active
                        ? "bg-accent-brand/10 font-semibold text-accent-brand"
                        : "text-foreground hover:bg-muted/70",
                    )}
                  >
                    {resolveNavLabel(n, t)}
                  </Link>
                </SheetClose>
              );
            })}
          </nav>
          <div className="mt-5 border-t border-border/70 pt-5">
            <h3 className="px-3 text-xs font-medium text-muted-foreground">
              {t("header.explore")}
            </h3>
            <SheetClose asChild>
              <Link
                href="/graph"
                aria-current={
                  isActivePath(pathname, "/graph") ? "page" : undefined
                }
                className={cn(
                  "mt-2 flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm transition-colors hover:bg-muted/70 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActivePath(pathname, "/graph")
                    ? "bg-accent-brand/10 font-semibold text-accent-brand"
                    : "text-foreground",
                )}
              >
                <Network className="size-4" aria-hidden />
                {t("nav.graph")}
              </Link>
            </SheetClose>
            <a
              href={siteConfig.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <IconGithub width={17} height={17} />
              GitHub
              <ArrowUpRight className="ml-auto size-4" aria-hidden />
            </a>
          </div>
          <div className="mt-auto pt-6">
            <h3 className="border-t border-border/70 px-3 pt-5 text-xs font-medium text-muted-foreground">
              {t("header.preferences")}
            </h3>
            <div className="mt-2 space-y-1 px-3">
              <div className="flex min-h-11 items-center justify-between gap-4">
                <span className="text-sm">{t("header.language")}</span>
                <LanguageToggle />
              </div>
              <div className="flex min-h-11 items-center justify-between gap-4">
                <span className="text-sm">{t("header.theme")}</span>
                <ModeToggle />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function Header({ title }: IHeader) {
  const pathname = usePathname() ?? "";
  const scrolled = useScrolled();

  return (
    <SearchProvider>
      <header className="sticky top-0 z-50">
        <ReadingProgressBar />
        <div
          className={cn(
            "border-b backdrop-blur-md transition-[background-color,box-shadow,border-color] duration-200 motion-reduce:transition-none",
            scrolled
              ? "border-border bg-background/95 shadow-sm"
              : "border-border/50 bg-background/80",
          )}
        >
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6 lg:gap-5 lg:px-8">
            <div className="flex min-w-0 flex-1 items-center">
              <Wordmark title={title} />
            </div>
            <DesktopNav pathname={pathname} />
            <Controls />
            <MobileNav pathname={pathname} />
          </div>
        </div>
      </header>
    </SearchProvider>
  );
}
