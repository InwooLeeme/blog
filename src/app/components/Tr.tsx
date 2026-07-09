"use client";

import type { MessageId } from "@/lib/i18n";
import { useT } from "./LocaleProvider";

/** 서버 컴포넌트 안에서 번역 문자열을 렌더링하는 클라이언트 리프 */
export default function Tr({ id, params }: { id: MessageId; params?: Record<string, string | number> }) {
  const t = useT();
  return <>{t(id, params)}</>;
}
