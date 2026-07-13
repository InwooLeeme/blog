"use client";

import { useEffect, useState } from "react";
import { EFFECTS } from "@/app/components/effects/registry";

export default function GateEffect() {
  const [Effect, setEffect] = useState<(typeof EFFECTS)[number] | null>(null);

  // 마운트 후에만 랜덤 선택 — 하이드레이션 불일치 방지 목적의 의도적 동기 setState
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEffect(EFFECTS[Math.floor(Math.random() * EFFECTS.length)]);
  }, []);

  if (!Effect) return null;
  return (
    <div className="absolute inset-0 animate-in fade-in duration-700">
      <Effect.Component />
    </div>
  );
}
