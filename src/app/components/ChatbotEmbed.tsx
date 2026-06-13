"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface ChatbotEmbedProps {
  /** 임베드할 챗봇 페이지 URL */
  src: string;
  /** iframe title (접근성) */
  title?: string;
  /** iframe 고정 높이(px) */
  height?: number;
  className?: string;
}

/**
 * 챗봇을 임베드하는 고정 높이 iframe 래퍼.
 * - 테마 동기화: 초기 ?theme= 쿼리 + 토글 시 'theme-change' postMessage
 *   → 챗봇 앱이 'theme-change' 메시지를 listen하면 새로고침 없이 실시간 반영
 * - 마운트 후에만 src를 계산해 hydration 불일치 방지
 */
export default function ChatbotEmbed({
  src,
  title = "AI 챗봇",
  height = 600,
  className,
}: ChatbotEmbedProps) {
  const { resolvedTheme } = useTheme();
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  // 초기 로드 시 테마를 쿼리로 주입 (마운트 후 1회 결정)
  const initialSrc = React.useMemo(() => {
    if (!mounted) return undefined;
    try {
      const url = new URL(src);
      url.searchParams.set("theme", resolvedTheme === "dark" ? "dark" : "light");
      return url.toString();
    } catch {
      return src;
    }
    // resolvedTheme는 의도적으로 deps에서 제외 — 토글 시 reload 막고 postMessage로 처리
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, src]);

  // 테마 토글 시 새로고침 없이 iframe에 알림 (챗봇이 listen하면 실시간 반영)
  React.useEffect(() => {
    if (!mounted || !resolvedTheme) return;
    iframeRef.current?.contentWindow?.postMessage(
      { type: "theme-change", theme: resolvedTheme },
      "*",
    );
  }, [resolvedTheme, mounted]);

  if (!mounted || !initialSrc) return null;

  return (
    <iframe
      ref={iframeRef}
      src={initialSrc}
      title={title}
      loading="lazy"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      style={{ height }}
      className={cn("block w-full", className)}
    />
  );
}
