"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_LOCALE, LOCALE_COOKIE, formatMessage, messages, type Locale, type MessageId } from "@/lib/i18n";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // SSG HTML은 기본 언어로 나가므로, 저장된 언어는 마운트 후 반영한다(하이드레이션 불일치 방지)
  useEffect(() => {
    const saved = document.cookie.match(/(?:^|;\s*)locale=(ko|en)/)?.[1] as Locale | undefined;
    if (saved && saved !== DEFAULT_LOCALE) setLocaleState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

/** 현재 언어의 메시지 조회 함수 — t("post.loadMore"), t("series.viewAll", { n: 5 }) */
export function useT() {
  const { locale } = useLocale();
  return useCallback(
    (id: MessageId, params?: Record<string, string | number>) => formatMessage(messages[locale][id], params),
    [locale],
  );
}
