"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "./LocaleProvider";

/** 스크롤이 일정 이상 내려가면 나타나는 "맨 위로" 버튼 */
export default function ScrollToTop({ threshold = 400 }: { threshold?: number }) {
  const t = useT();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const scrollToTop = React.useCallback(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={t("scrollTop.aria")}
      tabIndex={visible ? 0 : -1}
      className={cn(
        "fixed bottom-6 right-6 z-50 grid h-11 w-11 place-items-center rounded-full",
        "border bg-background/80 text-foreground shadow-lg backdrop-blur",
        "transition-all duration-300 ease-out",
        "hover:border-accent-brand hover:bg-accent-brand hover:text-accent-brand-fg",
        visible
          ? "opacity-100 translate-y-0"
          : "pointer-events-none opacity-0 translate-y-4",
      )}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
