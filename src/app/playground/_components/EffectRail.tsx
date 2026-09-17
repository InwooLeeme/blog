"use client";

import { EFFECT_CATALOG } from "./effect-catalog";

export default function EffectRail({ activeId, onSelect }: { activeId: string | null; onSelect: (id: string) => void }) {
  return (
    <nav aria-label="장면 목록" className="min-w-0">
      <ol className="flex flex-wrap gap-1">
        {EFFECT_CATALOG.map((effect) => (
          <li key={effect.id}>
            <button
              type="button"
              aria-current={activeId === effect.id ? "true" : undefined}
              aria-controls="playground-stage"
              title={effect.description}
              onClick={() => onSelect(effect.id)}
              className={`inline-flex min-h-11 items-center rounded-md px-4 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${activeId === effect.id ? "bg-muted font-semibold text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}
            >
              {effect.title}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
