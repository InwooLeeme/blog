import { Pause, Play, SkipForward } from "lucide-react";
import { memo, type Dispatch } from "react";
import type { PlaygroundAction, Speed, Status } from "../_lib/playground-state";
import { controlClass } from "./PathfindingControls";

export default memo(function PathfindingTransport({ status, speed, dispatch, onPlay }: {
  status: Status; speed: Speed; dispatch: Dispatch<PlaygroundAction>; onPlay: () => void;
}) {
  const running = status === "running";
  return (
    <section aria-label="탐색 재생" className="flex flex-wrap items-center gap-3 border-y border-border bg-muted/20 px-4 py-4 sm:px-6">
      <button type="button" onClick={running ? () => dispatch({ type: "pause" }) : onPlay} className={`${controlClass} grow border-transparent bg-accent-brand px-5 text-accent-brand-fg hover:bg-accent-brand/90 sm:grow-0`}>
        {running ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
        {running ? "일시정지" : status === "paused" ? "이어서 실행" : status === "complete" ? "다시 실행" : "탐색 시작"}
      </button>
      <button type="button" className={`${controlClass} bg-background`} disabled={running} onClick={() => dispatch({ type: "step" })}><SkipForward size={16} aria-hidden="true" />한 단계</button>
      <div className="flex grow flex-wrap items-center gap-3 sm:justify-end">
        <label htmlFor="pathfinding-speed" className="text-sm text-muted-foreground">속도</label>
        <select id="pathfinding-speed" value={speed} onChange={(event) => dispatch({ type: "speed", value: event.target.value as Speed })} className="min-h-11 grow rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand sm:grow-0">
          <option value="slow">느리게</option><option value="normal">보통</option><option value="fast">빠르게</option>
        </select>
        <button type="button" className={`${controlClass} border-transparent text-muted-foreground`} onClick={() => dispatch({ type: "clear" })}>결과 지우기</button>
      </div>
    </section>
  );
});
