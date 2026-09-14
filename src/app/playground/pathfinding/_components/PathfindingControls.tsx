import { Eraser, Flag, MapPin, RotateCcw, Square } from "lucide-react";
import { memo, type Dispatch } from "react";
import { ALGORITHMS } from "../_lib/algorithms";
import type { PlaygroundAction, PlaygroundState } from "../_lib/playground-state";

const TOOLS = [
  { id: "wall", label: "벽", icon: Square }, { id: "erase", label: "지우개", icon: Eraser },
  { id: "start", label: "시작점", icon: MapPin }, { id: "goal", label: "도착점", icon: Flag },
] as const;

export const controlClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand disabled:pointer-events-none disabled:opacity-40";

export default memo(function PathfindingControls({ algorithm, tool, running, dispatch }: {
  algorithm: PlaygroundState["algorithm"]; tool: PlaygroundState["tool"]; running: boolean; dispatch: Dispatch<PlaygroundAction>;
}) {
  return (
    <section aria-label="탐색 설정" className="border-b border-border bg-muted/20 px-4 py-4 sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <fieldset disabled={running} className="flex min-w-0 flex-wrap items-center gap-3">
          <legend className="sr-only">탐색 알고리즘</legend>
          <span aria-hidden="true" className="text-sm text-muted-foreground">알고리즘</span>
          <div className="inline-grid grid-cols-3 gap-1 rounded-xl border border-border bg-background p-1" role="group" aria-label="알고리즘 선택">
            {ALGORITHMS.map(({ id, label }) => (
              <button key={id} type="button" aria-pressed={algorithm === id} onClick={() => dispatch({ type: "algorithm", value: id })}
                className={`min-h-11 rounded-lg px-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand disabled:cursor-not-allowed sm:px-5 ${algorithm === id ? "bg-accent-brand text-accent-brand-fg" : "text-muted-foreground hover:bg-muted"}`}>{label}</button>
            ))}
          </div>
        </fieldset>
        <a href="#pathfinding-help" className="inline-flex min-h-11 items-center self-start rounded-lg text-sm text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand lg:self-auto">알고리즘·조작 안내</a>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <fieldset disabled={running} className="min-w-0">
          <legend className="sr-only">지도 편집</legend>
          <div className="flex flex-wrap gap-2">
            {TOOLS.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" aria-pressed={tool === id} onClick={() => dispatch({ type: "tool", value: id })}
                className={`${controlClass} ${tool === id ? "border-accent-brand/50 bg-accent-brand/10 text-accent-brand" : "bg-background text-muted-foreground"}`}><Icon size={15} aria-hidden="true" />{label}</button>
            ))}
          </div>
        </fieldset>
        <button type="button" onClick={() => dispatch({ type: "reset" })} className={`${controlClass} border-transparent text-muted-foreground`}><RotateCcw size={15} aria-hidden="true" />지도 초기화</button>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">{running ? "탐색 중에는 지도 편집이 잠깁니다. 일시정지하면 다시 편집할 수 있어요." : "지도를 편집하면 이전 탐색과 비교 결과가 지워집니다."}</p>
    </section>
  );
});
