"use client";

import { useEffect, useRef } from "react";
import { EFFECT_CATALOG } from "./effect-catalog";

export default function EffectRail({ activeId, onSelect }: { activeId: string | null; onSelect: (id: string) => void }) {
  const activeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeButton.current?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
  }, [activeId]);

  return (
    <nav aria-label="장면 목록" className="min-w-0 snap-x snap-mandatory overflow-x-auto overscroll-x-contain border-y border-white/10 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:max-h-[800px] lg:overflow-y-auto lg:border-y-0 lg:border-r">
      <ol className="flex w-max gap-1 p-3 lg:w-auto lg:flex-col lg:gap-1 lg:p-4">
        {EFFECT_CATALOG.map((effect, index) => (
          <li key={effect.id} className="snap-start">
            <button
              ref={activeId === effect.id ? activeButton : undefined}
              type="button"
              aria-current={activeId === effect.id ? "true" : undefined}
              aria-controls="playground-stage"
              title={effect.description}
              onClick={() => onSelect(effect.id)}
              className={`group flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm outline-none transition-opacity duration-200 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-300 motion-reduce:transition-none ${activeId === effect.id ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"}`}
            >
              <span aria-hidden="true" className={`font-mono text-[10px] tabular-nums ${activeId === effect.id ? "text-sky-300" : "text-zinc-500"}`}>{String(index + 1).padStart(2, "0")}</span>
              <span className="whitespace-nowrap">{effect.title}</span>
              <span aria-hidden="true" className={`ml-auto size-1 shrink-0 rounded-full bg-sky-300 transition-opacity duration-200 motion-reduce:transition-none ${activeId === effect.id ? "opacity-100" : "opacity-0"}`} />
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
