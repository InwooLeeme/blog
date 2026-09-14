"use client";

import { useCallback, useEffect, useMemo, useReducer } from "react";
import { startPlayback } from "../_lib/playback";
import { createPlaygroundState, getSearchLayers, playgroundReducer, SPEED_MS } from "../_lib/playground-state";
import PathfindingControls from "./PathfindingControls";
import PathfindingGrid from "./PathfindingGrid";
import PathfindingResults from "./PathfindingResults";
import PathfindingTransport from "./PathfindingTransport";
import PathfindingHelp from "./PathfindingHelp";

export default function PathfindingPlayground() {
  const [state, dispatch] = useReducer(playgroundReducer, undefined, createPlaygroundState);
  const { result, cursor, status } = state;
  const layers = useMemo(() => getSearchLayers({ result, cursor, status }), [result, cursor, status]);
  const onEdit = useCallback((cells: number[]) => dispatch({ type: "edit", cells }), []);
  const onPlay = useCallback(() => dispatch({ type: "play", reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches }), []);

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
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <PathfindingControls algorithm={state.algorithm} tool={state.tool} running={status === "running"} dispatch={dispatch} />
      <div className="min-w-0 p-4 sm:p-6">
        <PathfindingGrid board={state.board} tool={state.tool} locked={status === "running"} {...layers} onEdit={onEdit} />
      </div>
      <PathfindingTransport status={status} speed={state.speed} dispatch={dispatch} onPlay={onPlay} />
      <div className="px-4 pb-6 sm:px-6"><PathfindingResults state={state} /></div>
      <PathfindingHelp />
    </div>
  );
}
