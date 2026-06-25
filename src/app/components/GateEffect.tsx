"use client";

import { useEffect, useState } from "react";
import { EFFECTS } from "@/app/components/effects/registry";

export default function GateEffect() {
  const [Effect, setEffect] = useState<(typeof EFFECTS)[number] | null>(null);

  useEffect(() => {
    setEffect(EFFECTS[Math.floor(Math.random() * EFFECTS.length)]);
  }, []);

  if (!Effect) return null;
  return (
    <div className="absolute inset-0 animate-in fade-in duration-700">
      <Effect.Component />
    </div>
  );
}
