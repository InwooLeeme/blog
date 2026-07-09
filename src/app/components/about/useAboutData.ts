"use client";

import * as ko from "@/lib/about";
import * as en from "@/lib/about.en";
import { useLocale } from "../LocaleProvider";

/** 현재 언어의 About 데이터 번들(요약·이력·프로젝트 등)을 반환 */
export function useAboutData() {
  const { locale } = useLocale();
  return locale === "en" ? en : ko;
}
