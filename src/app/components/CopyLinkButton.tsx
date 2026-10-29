"use client";

import { useState } from "react";
import { useT } from "./LocaleProvider";

/** 현재 글 URL을 클립보드에 복사 */
export default function CopyLinkButton() {
  const t = useT();
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    setFailed(false);
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setFailed(true);
    }
  };

  return (
    <div>
    <button
      type="button"
      onClick={copy}
      aria-label={t("post.copyAria")}
      className="inline-flex min-h-11 items-center px-2 text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
    >

      {copied ? t("post.copied") : t("post.copyLink")}
    </button>
    <span role="status" className={failed ? "block text-sm" : "sr-only"}>{failed ? t("detail.linkFailed") : copied ? t("post.copied") : ""}</span>
    </div>
  );
}
