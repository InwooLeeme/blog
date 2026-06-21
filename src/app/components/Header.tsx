"use client";

import * as React from "react";
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

function useScrolled(onPx = 40, offPx = 16) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const read = () =>
      setScrolled((prev) => {
        const y = window.scrollY;
        if (!prev && y > onPx) return true;
        if (prev && y < offPx) return false;
        return prev;
      });
    window.addEventListener("scroll", read, { passive: true });
    read();
    return () => window.removeEventListener("scroll", read);
  }, [onPx, offPx]);
  return scrolled;
}

function Wordmark({ title }: { title: string | undefined }) {
  return (
    <Link
      href="/blog"
      title={title}
      className="font-display font-bold tracking-tight text-gradient-brand max-[360px]:text-sm"
    >
      {title}
    </Link>
  );
}

// 데스크톱/모바일 공용 컨트롤
function Controls() {
  return (
    <>
      <SearchDialog />
      <Button asChild variant="ghost" size="icon" aria-label="GitHub">
        <Link href={siteConfig.githubUrl} target="_blank" rel="noreferrer">
          <IconGithub width={20} height={20} />
        </Link>
      </Button>
      <ModeToggle />
    </>
  );
}

function DesktopNav({ pathname }: { pathname: string }) {
  const activeIndex = navLinks.findIndex((l) => isActivePath(pathname, l.href));
  const [hovered, setHovered] = React.useState<number | null>(null);
  const navRef = React.useRef<HTMLElement>(null);
  const itemsRef = React.useRef<(HTMLAnchorElement | null)[]>([]);
  const [pill, setPill] = React.useState({ left: 0, width: 0, opacity: 0 });

  // 강조 대상: 호버 항목, 없으면 현재 경로의 active 항목
  const target = hovered ?? (activeIndex >= 0 ? activeIndex : null);

  // 레이아웃 변동 시 ResizeObserver가 pill 위치 재측정
  React.useEffect(() => {
    const measure = () => {
      if (target === null) {
        setPill((p) => ({ ...p, opacity: 0 }));
        return;
      }
      const el = itemsRef.current[target];
      if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth, opacity: 1 });
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (navRef.current) observer.observe(navRef.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <nav
      ref={navRef}
      className="relative hidden items-center gap-1 text-sm md:flex"
      onMouseLeave={() => setHovered(null)}
    >
      <span
        aria-hidden
        className="absolute left-0 top-1/2 h-8 rounded-full bg-accent-brand/10 transition-all duration-300 ease-out"
        style={{
          width: pill.width,
          opacity: pill.opacity,
          transform: `translateX(${pill.left}px) translateY(-50%)`,
        }}
      />
      {navLinks.map((link, i) => (
        <Link
          key={link.href}
          href={link.href}
          ref={(el) => {
            itemsRef.current[i] = el;
          }}
          onMouseEnter={() => setHovered(i)}
          aria-current={i === activeIndex ? "page" : undefined}
          className={cn(
            "relative rounded-full px-3 py-1.5 font-medium transition-colors",
            i === target
              ? "text-accent-brand"
              : "text-foreground/80 hover:text-foreground",
          )}
        >
          {link.href === "/about" ? (
            <span className="animate-diagonal-shake">{link.label}</span>
          ) : (
            link.label
          )}
        </Link>
      ))}
      <div className="flex items-center gap-1 pl-2">
        <Controls />
      </div>
    </nav>
  );
}

function MobileNav({ pathname }: { pathname: string }) {
  return (
    <div className="flex items-center gap-2 md:hidden">
      <Controls />
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
  );
}

export default function Header({ title }: IHeader) {
  const pathname = usePathname() ?? "";
  const scrolled = useScrolled();

  return (
    <div className="sticky top-0 z-50">
      <ReadingProgressBar />
      <div
        className={cn(
          "mx-auto flex h-14 max-w-[120rem] items-center px-4 backdrop-blur transition-[transform,border-radius,background-color,box-shadow,border-color] duration-300 ease-out [will-change:transform] sm:px-6 lg:px-20",
          scrolled
            ? "rounded-full border bg-background/85 shadow-lg"
            : "rounded-none border-b bg-background/70",
        )}
        style={{
          transform: scrolled ? "translateY(6px) scale(0.97)" : "translateY(0) scale(1)",
        }}
      >
        <div className="flex flex-1 items-center gap-4">
          <Wordmark title={title} />
        </div>
        <DesktopNav pathname={pathname} />
        <MobileNav pathname={pathname} />
      </div>
    </div>
  );
}
