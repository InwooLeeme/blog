"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, Maximize2, X } from "lucide-react";
import type { RefObject } from "react";
import type { EffectMeta } from "./effect-catalog";
import EffectStage from "./EffectStage";

const controlBaseClass = "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md px-3 text-sm outline-none transition-colors focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-30";
const controlClass = `${controlBaseClass} text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring`;
const fullscreenControlClass = `${controlBaseClass} border border-white/20 bg-black/40 text-zinc-200 hover:bg-white/10 focus-visible:ring-sky-300`;

type NavigationProps = {
  active: boolean;
  index: number;
  total: number;
  onStep: (delta: -1 | 1) => void;
};

function SceneNavigation({ active, index, total, onStep }: NavigationProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 text-xs tabular-nums text-muted-foreground">{index + 1} / {total}</span>
      <button type="button" aria-label="이전 장면" disabled={!active || index === 0} onClick={() => onStep(-1)} className={controlClass}><ArrowLeft aria-hidden="true" className="size-4" /></button>
      <button type="button" aria-label="다음 장면" disabled={!active || index === total - 1} onClick={() => onStep(1)} className={controlClass}><ArrowRight aria-hidden="true" className="size-4" /></button>
    </div>
  );
}

export function StudioToolbar({ active, triggerRef }: { active: boolean; triggerRef: RefObject<HTMLButtonElement | null> }) {
  return (
    <Dialog.Trigger asChild>
      <button ref={triggerRef} type="button" disabled={!active} className={controlClass}>
        <Maximize2 aria-hidden="true" className="size-4" /> 전체 화면
      </button>
    </Dialog.Trigger>
  );
}

export function SceneDetails({ active, effect, index, total, onStep }: NavigationProps & { effect: EffectMeta }) {
  return (
    <div className="min-w-0 px-5 py-5 sm:px-6">
      <div aria-live="polite" aria-atomic="true" className="min-w-0">
        <h2 className="text-base font-semibold">{effect.title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{effect.description}</p>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border pt-3">
        <p id="studio-keyboard-help" className="text-xs leading-5 text-muted-foreground">← → 장면 이동 <span aria-hidden="true" className="mx-2">·</span> Enter 전체 화면</p>
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
          <Dialog.Close aria-label="전체 화면 닫기" className={`${fullscreenControlClass} pointer-events-auto`}><X aria-hidden="true" className="size-5" /></Dialog.Close>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex justify-center gap-3 bg-gradient-to-t from-black/70 to-transparent pt-12 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button type="button" aria-label="이전 장면" disabled={index === 0} onClick={() => onStep(-1)} className={fullscreenControlClass}><ArrowLeft aria-hidden="true" className="size-4" /></button>
          <button type="button" aria-label="다음 장면" disabled={index === total - 1} onClick={() => onStep(1)} className={fullscreenControlClass}><ArrowRight aria-hidden="true" className="size-4" /></button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
