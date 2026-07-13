"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "./components/LocaleProvider";

const KAOMOJIS = [
  "(^-^*)",
  "\\(o_o)/",
  "(;-;)",
  "\\(^Д^)/",
  "(≥o≤)",
  "(o^^)o",
  "(>_<)",
  "(˚Δ˚)b",
  "｡°(°.◜ᯅ◝°)°｡",
];

function pickRandom(exclude?: string): string {
  if (KAOMOJIS.length === 1) return KAOMOJIS[0];
  let next = KAOMOJIS[Math.floor(Math.random() * KAOMOJIS.length)];
  while (next === exclude) {
    next = KAOMOJIS[Math.floor(Math.random() * KAOMOJIS.length)];
  }
  return next;
}

export default function NotFound() {
  const t = useT();
  const [emoji, setEmoji] = useState(KAOMOJIS[0]);

  // 마운트 후에만 랜덤 선택 — 하이드레이션 불일치 방지 목적의 의도적 동기 setState
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEmoji(pickRandom());
  }, []);

  const reroll = useCallback(() => {
    setEmoji((prev) => pickRandom(prev));
  }, []);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <button
        type="button"
        onClick={reroll}
        aria-label={t("notFound.emojiAria")}
        className="font-mono text-5xl md:text-6xl select-none transition-transform duration-200 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand/50 rounded-md px-4 py-2"
      >
        {emoji}
      </button>

      <h1 className="mt-8 text-2xl md:text-3xl font-bold tracking-tight">
        {t("notFound.title")}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {t("notFound.desc")}
      </p>

      <Button asChild className="mt-8">
        <Link href="/">
          <Home className="h-4 w-4" />
          {t("notFound.home")}
        </Link>
      </Button>
    </div>
  );
}
