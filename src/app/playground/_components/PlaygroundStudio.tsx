"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, Maximize2, X } from "lucide-react";
import { EFFECT_CATALOG } from "./effect-catalog";
import { getEffectIdFromSearch, resolveEffectId, stepEffectId, withEffectId } from "./effect-selection";
import EffectRail from "./EffectRail";
import EffectStage, { StageLoading } from "./EffectStage";

const ids = EFFECT_CATALOG.map((effect) => effect.id);
const controlClass = "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-white/15 px-4 text-sm text-zinc-200 outline-none transition-opacity duration-200 hover:opacity-70 focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transition-none";

export default function PlaygroundStudio() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = EFFECT_CATALOG.find((effect) => effect.id === activeId) ?? EFFECT_CATALOG[0];
  const index = EFFECT_CATALOG.findIndex((effect) => effect.id === selected.id);

  useEffect(() => {
    const syncFromLocation = () => {
      const candidate = getEffectIdFromSearch(window.location.search);
      const resolved = resolveEffectId(candidate, ids);
      setActiveId(resolved);
      if (resolved && candidate !== resolved) {
        window.history.replaceState(window.history.state, "", withEffectId(window.location.href, resolved));
      }
    };
    syncFromLocation();
    window.addEventListener("popstate", syncFromLocation);
    return () => window.removeEventListener("popstate", syncFromLocation);
  }, []);

  const selectEffect = (candidate: string) => {
    const id = resolveEffectId(candidate, ids);
    if (!id || id === activeId) return;
    window.history.pushState(window.history.state, "", withEffectId(window.location.href, id));
    setActiveId(id);
  };

  const step = (delta: -1 | 1) => {
    const id = stepEffectId(activeId, delta, ids);
    if (id) selectEffect(id);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || target.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])") || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      step(event.key === "ArrowLeft" ? -1 : 1);
    } else if (event.key === "Enter" && !target.closest("button, a") && activeId && !fullscreen) {
      event.preventDefault();
      setFullscreen(true);
    }
  };

  return (
    <Dialog.Root open={fullscreen} onOpenChange={setFullscreen}>
      <section aria-label="인터랙티브 스튜디오" aria-describedby="studio-keyboard-help" tabIndex={0} onKeyDown={onKeyDown} className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#101115] text-zinc-100 shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-sky-300 sm:rounded-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-sky-300" />
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-zinc-400">Immersive Studio <span className="ml-2 text-zinc-500">/ {String(EFFECT_CATALOG.length).padStart(2, "0")} scenes</span></p>
          </div>
          <Dialog.Trigger asChild>
            <button ref={triggerRef} type="button" disabled={!activeId} className={controlClass}>
              <Maximize2 aria-hidden="true" className="size-4" /> 전체 화면
            </button>
          </Dialog.Trigger>
        </div>

        <div className="grid min-w-0 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div id="playground-stage" role="region" aria-label={`${selected.title} 감상 화면`} tabIndex={0} className="relative min-w-0 overflow-hidden bg-[#05060a] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-300 lg:col-start-2 lg:row-start-1">
            {!fullscreen && (activeId ? <EffectStage effectId={activeId} /> : <div className="relative aspect-[16/10]"><StageLoading /></div>)}
            {fullscreen && <div className="grid aspect-[16/10] place-items-center text-sm text-zinc-500">전체 화면에서 감상 중</div>}
          </div>

          <EffectRail activeId={activeId} onSelect={selectEffect} />

          <div className="flex min-w-0 flex-col gap-6 px-5 py-6 sm:px-7 sm:py-7 lg:col-start-2 lg:row-start-2">
            <div aria-live="polite" aria-atomic="true" className="min-w-0">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-sky-300">Scene {String(index + 1).padStart(2, "0")}</p>
              <h2 className="text-xl font-medium tracking-tight sm:text-2xl">{selected.title}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">{selected.description}</p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
              <p id="studio-keyboard-help" className="text-xs leading-5 text-zinc-500">← → 장면 이동 <span aria-hidden="true" className="mx-2">·</span> Enter 전체 화면</p>
              <div className="flex items-center gap-2">
                <span className="mr-2 font-mono text-xs tabular-nums text-zinc-500">{String(index + 1).padStart(2, "0")} / {ids.length}</span>
                <button type="button" aria-label="이전 장면" disabled={!activeId || index === 0} onClick={() => step(-1)} className={controlClass}><ArrowLeft aria-hidden="true" className="size-4" /></button>
                <button type="button" aria-label="다음 장면" disabled={!activeId || index === ids.length - 1} onClick={() => step(1)} className={controlClass}><ArrowRight aria-hidden="true" className="size-4" /></button>
              </div>
            </div>
          </div>
        </div>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black" />
          <Dialog.Content onCloseAutoFocus={(event) => { event.preventDefault(); triggerRef.current?.focus(); }} className="fixed inset-x-0 top-0 z-50 h-svh overflow-hidden bg-[#05060a] text-zinc-100 outline-none">
            <Dialog.Title className="sr-only">{selected.title} 전체 화면</Dialog.Title>
            <Dialog.Description className="sr-only">{selected.description} 좌우 방향키로 장면을 이동하고 Escape로 닫습니다.</Dialog.Description>
            {fullscreen && activeId && <EffectStage effectId={activeId} fullscreen />}
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 bg-gradient-to-b from-black/70 to-transparent pb-12 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(1rem,env(safe-area-inset-top))]">
              <p className="pt-3 text-sm text-zinc-200">{selected.title}</p>
              <Dialog.Close aria-label="전체 화면 닫기" className={`${controlClass} pointer-events-auto bg-black/40`}><X aria-hidden="true" className="size-5" /></Dialog.Close>
            </div>
            <div className="absolute inset-x-0 bottom-0 flex justify-center gap-3 bg-gradient-to-t from-black/70 to-transparent pt-12 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button type="button" aria-label="이전 장면" disabled={index === 0} onClick={() => step(-1)} className={`${controlClass} bg-black/40`}><ArrowLeft aria-hidden="true" className="size-4" /></button>
              <button type="button" aria-label="다음 장면" disabled={index === ids.length - 1} onClick={() => step(1)} className={`${controlClass} bg-black/40`}><ArrowRight aria-hidden="true" className="size-4" /></button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </section>
    </Dialog.Root>
  );
}
