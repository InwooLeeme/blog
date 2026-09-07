"use client";

import { useCallback, useEffect, useState } from "react";
import { EFFECT_CATALOG } from "./effect-catalog";
import { getEffectIdFromSearch, resolveEffectId, resolveEffectSelection, stepEffectId, subscribeEffectHistory, withEffectId } from "./effect-selection";

const effectIds = EFFECT_CATALOG.map((effect) => effect.id);

export function usePlaygroundSelection() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { selected, index } = resolveEffectSelection(activeId, EFFECT_CATALOG);

  useEffect(() => {
    const studioPathname = window.location.pathname;
    const syncFromLocation = () => {
      const candidate = getEffectIdFromSearch(window.location.search);
      const resolved = resolveEffectId(candidate, effectIds);
      setActiveId(resolved);
      if (resolved && candidate !== resolved) {
        window.history.replaceState(window.history.state, "", withEffectId(window.location.href, resolved));
      }
    };

    syncFromLocation();
    return subscribeEffectHistory(window, () => {
      if (window.location.pathname === studioPathname) syncFromLocation();
    });
  }, []);

  const selectEffect = useCallback((candidate: string) => {
    const id = resolveEffectId(candidate, effectIds);
    if (!id || id === activeId) return;
    window.history.pushState(window.history.state, "", withEffectId(window.location.href, id));
    setActiveId(id);
  }, [activeId]);

  const step = useCallback((delta: -1 | 1) => {
    const id = stepEffectId(activeId, delta, effectIds);
    if (id) selectEffect(id);
  }, [activeId, selectEffect]);

  return { activeId, selected: selected ?? EFFECT_CATALOG[0], index, total: effectIds.length, selectEffect, step };
}
