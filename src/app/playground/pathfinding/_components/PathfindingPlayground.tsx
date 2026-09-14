"use client";

import { useEffect, useMemo, useReducer } from "react";
import { startPlayback } from "../_lib/playback";
import { createPlaygroundState, getSearchLayers, playgroundReducer, SPEED_MS } from "../_lib/playground-state";
import PathfindingControls from "./PathfindingControls";
import PathfindingGrid from "./PathfindingGrid";
import PathfindingResults from "./PathfindingResults";
import PathfindingTransport from "./PathfindingTransport";
import PathfindingHelp from "./PathfindingHelp";

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
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <PathfindingControls state={state} dispatch={dispatch} />
      <div className="min-w-0 p-4 sm:p-6">
        <PathfindingGrid board={state.board} tool={state.tool} locked={state.status === "running"} {...layers} onEdit={(cells) => dispatch({ type: "edit", cells })} />
      </div>
      <PathfindingTransport state={state} dispatch={dispatch} onPlay={() => dispatch({ type: "play", reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches })} />
      <div className="px-4 pb-6 sm:px-6"><PathfindingResults state={state} /></div>
      <PathfindingHelp />
    </div>
  );
}
