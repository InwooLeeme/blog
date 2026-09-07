"use client";

import { useCallback, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import EffectRail from "./EffectRail";
import EffectStage, { StageLoading } from "./EffectStage";
import { FullscreenViewer, SceneDetails, StudioToolbar } from "./StudioControls";
import { usePlaygroundKeyboard } from "./usePlaygroundKeyboard";
import { usePlaygroundSelection } from "./usePlaygroundSelection";

export default function PlaygroundStudio() {
  const [fullscreen, setFullscreen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { activeId, selected, index, total, selectEffect, step } = usePlaygroundSelection();
  const openFullscreen = useCallback(() => setFullscreen(true), []);
  const onKeyDown = usePlaygroundKeyboard({ activeId, fullscreen, onOpenFullscreen: openFullscreen, onStep: step });

  return (
    <Dialog.Root open={fullscreen} onOpenChange={setFullscreen}>
      <section aria-label="인터랙티브 스튜디오" aria-describedby="studio-keyboard-help" tabIndex={0} onKeyDown={onKeyDown} className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#101115] text-zinc-100 shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-sky-300 sm:rounded-3xl">
        <StudioToolbar active={Boolean(activeId)} triggerRef={triggerRef} total={total} />

        <div className="grid min-w-0 lg:grid-cols-[232px_minmax(0,1fr)]">
          <div id="playground-stage" role="region" aria-label={`${selected.title} 감상 화면`} tabIndex={0} className="relative min-w-0 overflow-hidden bg-[#05060a] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-300 lg:col-start-2 lg:row-start-1">
            {!fullscreen && (activeId ? <EffectStage effectId={activeId} /> : <div className="relative aspect-[16/10]"><StageLoading /></div>)}
            {fullscreen && <div className="grid aspect-[16/10] place-items-center text-sm text-zinc-500">전체 화면에서 감상 중</div>}
          </div>

          <EffectRail activeId={activeId} onSelect={selectEffect} />

          <SceneDetails active={Boolean(activeId)} effect={selected} index={index} total={total} onStep={step} />
        </div>

        <FullscreenViewer activeId={activeId} effect={selected} fullscreen={fullscreen} index={index} total={total} triggerRef={triggerRef} onStep={step} />
      </section>
    </Dialog.Root>
  );
}
