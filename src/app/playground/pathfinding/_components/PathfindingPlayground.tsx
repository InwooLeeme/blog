"use client";

import { useEffect, useMemo, useReducer } from "react";
import { startPlayback } from "../_lib/playback";
import { createPlaygroundState, getSearchLayers, playgroundReducer, SPEED_MS } from "../_lib/playground-state";
import PathfindingControls from "./PathfindingControls";
import PathfindingGrid from "./PathfindingGrid";
import PathfindingResults from "./PathfindingResults";

export default function PathfindingPlayground() {
  const [state, dispatch] = useReducer(playgroundReducer, undefined, createPlaygroundState);
  const layers = useMemo(() => getSearchLayers(state), [state]);

  useEffect(() => {
    if (state.status !== "running") return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    return startPlayback({
      schedule: (callback, delay) => window.setTimeout(callback, delay),
      cancel: (handle) => window.clearTimeout(handle),
      isHidden: () => document.hidden, isReduced: () => motion.matches,
      onVisibility: (callback) => { document.addEventListener("visibilitychange", callback); return () => document.removeEventListener("visibilitychange", callback); },
      onMotion: (callback) => { motion.addEventListener("change", callback); return () => motion.removeEventListener("change", callback); },
      onTick: () => dispatch({ type: "tick" }), onPause: () => dispatch({ type: "pause" }), onFinish: () => dispatch({ type: "finish" }),
    }, SPEED_MS[state.speed]);
  }, [state.status, state.speed]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm sm:rounded-3xl">
      <div className="grid min-w-0 lg:grid-cols-[280px_minmax(0,1fr)]">
        <PathfindingControls state={state} dispatch={dispatch} onPlay={() => dispatch({ type: "play", reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches })} />
        <div className="min-w-0 p-4 sm:p-6 lg:p-7">
          <PathfindingGrid board={state.board} tool={state.tool} locked={state.status === "running"} {...layers} onEdit={(cells) => dispatch({ type: "edit", cells })} />
          <PathfindingResults state={state} />
        </div>
      </div>
      <div className="border-t border-border bg-muted/20 px-5 py-3 text-xs leading-5 text-muted-foreground sm:px-6">잠깐 자리를 비우면 재생도 쉬어갑니다. 다른 탭으로 이동하면 일시정지하며, 모션 감소 설정에서는 애니메이션 없이 결과를 표시합니다.</div>
    </div>
  );
}
