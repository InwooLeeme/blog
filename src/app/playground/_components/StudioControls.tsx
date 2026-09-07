"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, Maximize2, X } from "lucide-react";
import type { RefObject } from "react";
import type { EffectMeta } from "./effect-catalog";
import EffectStage from "./EffectStage";

const controlClass = "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-white/15 px-4 text-sm text-zinc-200 outline-none transition-opacity duration-200 hover:opacity-70 focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transition-none";

type NavigationProps = {
  active: boolean;
  index: number;
  total: number;
  onStep: (delta: -1 | 1) => void;
};

function SceneNavigation({ active, index, total, onStep }: NavigationProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="mr-2 font-mono text-xs tabular-nums text-zinc-500">{String(index + 1).padStart(2, "0")} / {total}</span>
      <button type="button" aria-label="이전 장면" disabled={!active || index === 0} onClick={() => onStep(-1)} className={controlClass}><ArrowLeft aria-hidden="true" className="size-4" /></button>
      <button type="button" aria-label="다음 장면" disabled={!active || index === total - 1} onClick={() => onStep(1)} className={controlClass}><ArrowRight aria-hidden="true" className="size-4" /></button>
    </div>
  );
}

export function StudioToolbar({ active, triggerRef, total }: { active: boolean; triggerRef: RefObject<HTMLButtonElement | null>; total: number }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-sky-300" />
        <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-zinc-400">Immersive Studio <span className="ml-2 text-zinc-500">/ {String(total).padStart(2, "0")} scenes</span></p>
      </div>
      <Dialog.Trigger asChild>
        <button ref={triggerRef} type="button" disabled={!active} className={controlClass}>
          <Maximize2 aria-hidden="true" className="size-4" /> 전체 화면
        </button>
      </Dialog.Trigger>
    </div>
  );
}

export function SceneDetails({ active, effect, index, total, onStep }: NavigationProps & { effect: EffectMeta }) {
  return (
    <div className="flex min-w-0 flex-col gap-6 px-5 py-6 sm:px-7 sm:py-7 lg:col-start-2 lg:row-start-2">
      <div aria-live="polite" aria-atomic="true" className="min-w-0">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-sky-300">Scene {String(index + 1).padStart(2, "0")}</p>
        <h2 className="text-xl font-medium tracking-tight sm:text-2xl">{effect.title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">{effect.description}</p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
        <p id="studio-keyboard-help" className="text-xs leading-5 text-zinc-500">← → 장면 이동 <span aria-hidden="true" className="mx-2">·</span> Enter 전체 화면</p>
        <SceneNavigation active={active} index={index} total={total} onStep={onStep} />
      </div>
    </div>
  );
}

type FullscreenViewerProps = {
  activeId: string | null;
  effect: EffectMeta;
  fullscreen: boolean;
  index: number;
  total: number;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onStep: (delta: -1 | 1) => void;
};

export function FullscreenViewer({ activeId, effect, fullscreen, index, total, triggerRef, onStep }: FullscreenViewerProps) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black" />
      <Dialog.Content onCloseAutoFocus={(event) => { event.preventDefault(); triggerRef.current?.focus(); }} className="fixed inset-x-0 top-0 z-50 h-svh overflow-hidden bg-[#05060a] text-zinc-100 outline-none">
        <Dialog.Title className="sr-only">{effect.title} 전체 화면</Dialog.Title>
        <Dialog.Description className="sr-only">{effect.description} 좌우 방향키로 장면을 이동하고 Escape로 닫습니다.</Dialog.Description>
        {fullscreen && activeId && <EffectStage effectId={activeId} fullscreen />}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 bg-gradient-to-b from-black/70 to-transparent pb-12 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(1rem,env(safe-area-inset-top))]">
          <p className="pt-3 text-sm text-zinc-200">{effect.title}</p>
          <Dialog.Close aria-label="전체 화면 닫기" className={`${controlClass} pointer-events-auto bg-black/40`}><X aria-hidden="true" className="size-5" /></Dialog.Close>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex justify-center gap-3 bg-gradient-to-t from-black/70 to-transparent pt-12 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button type="button" aria-label="이전 장면" disabled={index === 0} onClick={() => onStep(-1)} className={`${controlClass} bg-black/40`}><ArrowLeft aria-hidden="true" className="size-4" /></button>
          <button type="button" aria-label="다음 장면" disabled={index === total - 1} onClick={() => onStep(1)} className={`${controlClass} bg-black/40`}><ArrowRight aria-hidden="true" className="size-4" /></button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
