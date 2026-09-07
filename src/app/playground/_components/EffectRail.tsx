"use client";

import { useEffect, useRef } from "react";
import { EFFECT_CATALOG } from "./effect-catalog";

export default function EffectRail({ activeId, onSelect }: { activeId: string | null; onSelect: (id: string) => void }) {
  const activeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeButton.current?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
  }, [activeId]);

  return (
    <nav aria-label="장면 목록" className="playground-rail min-w-0 snap-x snap-mandatory overflow-x-auto overscroll-x-contain border-y border-white/10 bg-[#0b0c10] lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:max-h-[800px] lg:overflow-y-auto lg:border-y-0 lg:border-r">
      <div className="sticky top-0 z-10 hidden items-center justify-between bg-[#0b0c10]/95 px-5 pb-4 pt-5 backdrop-blur-sm lg:flex">
        <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-zinc-500">Scenes</p>
        <span className="font-mono text-[10px] tabular-nums text-zinc-600">{String(EFFECT_CATALOG.length).padStart(2, "0")}</span>
      </div>
      <ol className="flex w-max gap-1.5 p-3 lg:w-auto lg:flex-col lg:gap-1 lg:px-3 lg:pb-4 lg:pt-0">
        {EFFECT_CATALOG.map((effect, index) => (
          <li key={effect.id} className="snap-start">
            <button
              ref={activeId === effect.id ? activeButton : undefined}
              type="button"
              aria-current={activeId === effect.id ? "true" : undefined}
              aria-controls="playground-stage"
              title={effect.description}
              onClick={() => onSelect(effect.id)}
              className={`group relative flex min-h-11 w-full items-center gap-3 overflow-hidden rounded-xl border px-3 py-3 text-left text-sm outline-none transition-[color,background-color,border-color] duration-200 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-300 motion-reduce:transition-none ${activeId === effect.id ? "border-white/10 bg-white/[0.07] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" : "border-transparent text-zinc-500 hover:bg-white/[0.035] hover:text-zinc-200"}`}
            >
              <span aria-hidden="true" className={`absolute inset-y-2 left-0 w-0.5 rounded-r-full bg-sky-300 transition-opacity duration-200 motion-reduce:transition-none ${activeId === effect.id ? "opacity-100" : "opacity-0"}`} />
              <span aria-hidden="true" className={`font-mono text-[10px] tabular-nums transition-colors duration-200 motion-reduce:transition-none ${activeId === effect.id ? "text-sky-300" : "text-zinc-600 group-hover:text-zinc-500"}`}>{String(index + 1).padStart(2, "0")}</span>
              <span className="whitespace-nowrap font-medium tracking-[-0.01em]">{effect.title}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
