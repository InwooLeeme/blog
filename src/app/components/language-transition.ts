import type { Locale } from "@/lib/i18n";

export type LanguageTransitionCapabilities = {
  supportsViewTransition: boolean;
  prefersReducedMotion: boolean;
};

export function getNextLocale(locale: Locale): Locale {
  return locale === "ko" ? "en" : "ko";
}

export function shouldAnimateLanguageTransition({
  supportsViewTransition,
  prefersReducedMotion,
}: LanguageTransitionCapabilities) {
  return supportsViewTransition && !prefersReducedMotion;
}
