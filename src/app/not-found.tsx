"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [emoji, setEmoji] = useState(KAOMOJIS[0]);

  useEffect(() => {
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
        aria-label="다른 이모지 보기"
        className="font-mono text-5xl md:text-6xl select-none transition-transform duration-200 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand/50 rounded-md px-4 py-2"
      >
        {emoji}
      </button>

      <h1 className="mt-8 text-2xl md:text-3xl font-bold tracking-tight">
        페이지를 찾을 수 없어요
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        요청하신 주소가 존재하지 않거나 이동되었어요.
      </p>

      <Button asChild className="mt-8">
        <Link href="/">
          <Home className="h-4 w-4" />
          홈으로
        </Link>
      </Button>
    </div>
  );
}
