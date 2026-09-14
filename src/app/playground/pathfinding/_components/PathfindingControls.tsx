import { Eraser, Flag, MapPin, Pause, Play, RotateCcw, SkipForward, Square } from "lucide-react";
import type { Dispatch } from "react";
import type { Algorithm } from "../_lib/pathfinding";
import type { PlaygroundAction, PlaygroundState, Speed, Tool } from "../_lib/playground-state";

export const ALGORITHMS: { id: Algorithm; label: string; description: string }[] = [
  { id: "bfs", label: "BFS", description: "가까운 칸부터 한 겹씩 넓혀 갑니다. 모든 이동 비용이 같을 때 최단 경로를 찾습니다." },
  { id: "dijkstra", label: "Dijkstra", description: "누적 비용이 가장 작은 칸부터 탐색합니다. 이 지도는 모든 비용이 1이라 BFS와 탐색 양상이 같습니다." },
  { id: "astar", label: "A*", description: "누적 비용에 목표까지의 예상 거리를 더합니다. 상하좌우 거리인 맨해튼 거리로 목표 방향을 먼저 살펴봅니다." },
];
const TOOLS = [
  { id: "wall", label: "벽 그리기", icon: Square }, { id: "erase", label: "지우개", icon: Eraser },
  { id: "start", label: "시작점", icon: MapPin }, { id: "goal", label: "도착점", icon: Flag },
] as const;
const button = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-3 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:pointer-events-none disabled:opacity-40";

export default function PathfindingControls({ state, dispatch, onPlay }: {
  state: PlaygroundState; dispatch: Dispatch<PlaygroundAction>; onPlay: () => void;
}) {
  const running = state.status === "running";
  const selected = ALGORITHMS.find(({ id }) => id === state.algorithm)!;
  return (
    <aside aria-label="탐색 설정" className="min-w-0 border-b border-border bg-muted/20 p-5 lg:border-r lg:border-b-0 lg:p-6">
      <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground"><span className="size-1.5 rounded-full bg-sky-500" /> EXPERIMENT 01</div>
      <fieldset disabled={running} className="mt-6">
        <legend className="mb-3 text-sm font-semibold">탐색 알고리즘</legend>
        <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-border bg-background p-1" role="group" aria-label="알고리즘 선택">
          {ALGORITHMS.map(({ id, label }) => <button key={id} type="button" aria-pressed={state.algorithm === id} onClick={() => dispatch({ type: "algorithm", value: id })} className={`min-h-10 rounded-lg text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed ${state.algorithm === id ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:bg-muted"}`}>{label}</button>)}
        </div>
        <p className="mt-3 min-h-16 text-xs leading-6 text-muted-foreground">{selected.description}</p>
      </fieldset>

      <fieldset disabled={running} className="mt-6">
        <legend className="mb-3 text-sm font-semibold">지도 편집</legend>
        <div className="grid grid-cols-2 gap-2">
          {TOOLS.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-pressed={state.tool === id} onClick={() => dispatch({ type: "tool", value: id as Tool })} className={`${button} ${state.tool === id ? "border-sky-500/60 bg-sky-500/10 text-sky-700 dark:text-sky-300" : "bg-background text-muted-foreground"}`}><Icon size={14} aria-hidden="true" />{label}</button>)}
        </div>
      </fieldset>

      <div className="mt-6">
        <label htmlFor="pathfinding-speed" className="mb-3 block text-sm font-semibold">재생 속도</label>
        <select id="pathfinding-speed" value={state.speed} onChange={(event) => dispatch({ type: "speed", value: event.target.value as Speed })} className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
          <option value="slow">느리게 · 한 칸씩 관찰</option><option value="normal">보통</option><option value="fast">빠르게 · 전체 흐름</option>
        </select>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <button type="button" onClick={running ? () => dispatch({ type: "pause" }) : onPlay} className={`${button} col-span-2 border-transparent bg-sky-600 font-semibold text-white hover:bg-sky-700`}>
          {running ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
          {running ? "일시정지" : state.status === "paused" ? "이어서 실행" : state.status === "complete" ? "다시 실행" : "탐색 시작"}
        </button>
        <button type="button" className={button} disabled={running} onClick={() => dispatch({ type: "step" })}><SkipForward size={14} aria-hidden="true" />한 단계</button>
        <button type="button" className={button} onClick={() => dispatch({ type: "clear" })}>결과 지우기</button>
        <button type="button" className={`${button} col-span-2 border-transparent text-muted-foreground`} onClick={() => dispatch({ type: "reset" })}><RotateCcw size={14} aria-hidden="true" />격자 초기화</button>
      </div>
      <p className="mt-4 text-xs leading-5 text-muted-foreground">실행 중에는 편집이 잠깁니다. 지도를 바꾸면 이전 탐색·비교 결과가 지워집니다.</p>
    </aside>
  );
}
