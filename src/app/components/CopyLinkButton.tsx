"use client";

import { useState } from "react";
import { Check, Link as LinkIcon } from "lucide-react";
import { useT } from "./LocaleProvider";

/** 현재 글 URL을 클립보드에 복사 */
export default function CopyLinkButton() {
  const t = useT();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 접근 불가 — 무시
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={t("post.copyAria")}
      className="inline-flex items-center gap-2 rounded-full border bg-card/80 px-4 py-2 text-sm font-medium text-foreground/80 shadow-sm backdrop-blur transition hover:border-accent-brand hover:text-accent-brand"
    >
      {copied ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
      {copied ? t("post.copied") : t("post.copyLink")}
    </button>
  );
}
