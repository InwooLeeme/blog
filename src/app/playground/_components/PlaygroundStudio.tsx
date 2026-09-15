"use client";

import { useCallback, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { contentCardClass } from "@/lib/ui-styles";
import { cn } from "@/lib/utils";
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
      <section aria-label="인터랙티브 스튜디오" aria-describedby="studio-keyboard-help" tabIndex={0} onKeyDown={onKeyDown} className={cn(contentCardClass, "min-w-0 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ring")}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-3 sm:px-5">
          <EffectRail activeId={activeId} onSelect={selectEffect} />
          <StudioToolbar active={Boolean(activeId)} triggerRef={triggerRef} />
        </div>

        <div id="playground-stage" role="region" aria-label={`${selected.title} 감상 화면`} tabIndex={0} className="relative min-w-0 overflow-hidden bg-[#05060a] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
          {!fullscreen && (activeId ? <EffectStage effectId={activeId} /> : <div className="relative aspect-[16/10]"><StageLoading /></div>)}
          {fullscreen && <div className="grid aspect-[16/10] place-items-center text-sm text-zinc-400">전체 화면에서 표시 중</div>}
        </div>

        <SceneDetails active={Boolean(activeId)} effect={selected} index={index} total={total} onStep={step} />
        <FullscreenViewer activeId={activeId} effect={selected} fullscreen={fullscreen} index={index} total={total} triggerRef={triggerRef} onStep={step} />
      </section>
    </Dialog.Root>
  );
}
