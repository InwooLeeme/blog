"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale, useT } from "./LocaleProvider";
import {
  getNextLocale,
  shouldAnimateLanguageTransition,
} from "./language-transition";

type LanguageViewTransition = {
  finished: Promise<void>;
};

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => LanguageViewTransition;
};

/** 한/영 전환 버튼 — 누르면 반대 언어로 전환 후 쿠키에 저장 */
export default function LanguageToggle() {
  const { locale, setLocale } = useLocale();
  const t = useT();
  const transitioningRef = React.useRef(false);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  const toggle = React.useCallback(() => {
    if (transitioningRef.current) return;

    const next = getNextLocale(locale);
    const doc = document as DocumentWithViewTransition;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (
      !shouldAnimateLanguageTransition({
        supportsViewTransition: Boolean(doc.startViewTransition),
        prefersReducedMotion,
      })
    ) {
      setLocale(next);
      return;
    }

    transitioningRef.current = true;
    setIsTransitioning(true);
    document.documentElement.classList.add("language-transitioning");

    const cleanup = () => {
      document.documentElement.classList.remove("language-transitioning");
      transitioningRef.current = false;
      setIsTransitioning(false);
    };

    try {
      const transition = doc.startViewTransition!(() =>
        flushSync(() => setLocale(next)),
      );
      void transition.finished.catch(() => undefined).finally(cleanup);
    } catch {
      setLocale(next);
      cleanup();
    }
  }, [locale, setLocale]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative disabled:opacity-100 before:absolute before:-inset-1 before:content-['']"
      aria-label={t("header.language")}
      disabled={isTransitioning}
      onClick={toggle}
    >
      <Languages className="language-toggle-icon h-[1.2rem] w-[1.2rem]" />
    </Button>
  );
}
