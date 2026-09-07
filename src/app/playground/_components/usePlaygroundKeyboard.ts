"use client";

import { useCallback, type KeyboardEvent } from "react";

type KeyboardOptions = {
  activeId: string | null;
  fullscreen: boolean;
  onOpenFullscreen: () => void;
  onStep: (delta: -1 | 1) => void;
};

export function usePlaygroundKeyboard({ activeId, fullscreen, onOpenFullscreen, onStep }: KeyboardOptions) {
  return useCallback((event: KeyboardEvent<HTMLElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || target.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])") || event.altKey || event.ctrlKey || event.metaKey) return;

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      onStep(event.key === "ArrowLeft" ? -1 : 1);
    } else if (event.key === "Enter" && !target.closest("button, a") && activeId && !fullscreen) {
      event.preventDefault();
      onOpenFullscreen();
    }
  }, [activeId, fullscreen, onOpenFullscreen, onStep]);
}
