import type { PlaygroundState } from "../_lib/playground-state";
import { ALGORITHMS } from "./PathfindingControls";

export default function PathfindingResults({ state }: { state: PlaygroundState }) {
  const done = state.status === "complete";
  const status = state.status === "running" ? "탐색 중" : state.status === "paused" ? "일시정지" : done ? state.result?.found ? "경로를 찾았습니다" : "도착점에 도달할 수 없습니다" : "지도를 그리고 탐색을 시작해 보세요";
  return (
    <section aria-label="탐색 결과" className="mt-6 border-t border-border pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="flex items-center gap-2 text-sm font-medium"><span aria-hidden="true" className={`size-2 rounded-full ${state.status === "running" ? "bg-sky-500" : done ? state.result?.found ? "bg-emerald-500" : "bg-amber-500" : "bg-muted-foreground/50"}`} />{status}</p>
        <p className="text-xs tabular-nums text-muted-foreground">탐색한 칸 <span className="ml-1 font-semibold text-foreground">{state.cursor}</span><span className="mx-3 text-border">/</span>경로 비용 <span className="ml-1 font-semibold text-foreground">{done ? state.result?.cost ?? "없음" : "—"}</span></p>
      </div>
      <div className="mt-5 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-xs tabular-nums">
          <caption className="sr-only">같은 지도에서 완료한 알고리즘별 탐색 결과</caption>
          <thead className="bg-muted/40 text-muted-foreground"><tr><th scope="col" className="px-4 py-3 font-medium">알고리즘</th><th scope="col" className="px-3 py-3 font-medium">탐색한 칸</th><th scope="col" className="px-3 py-3 font-medium">이동 수 / 비용</th><th scope="col" className="px-3 py-3 font-medium">결과</th></tr></thead>
          <tbody>{ALGORITHMS.map(({ id, label }) => {
            const summary = state.summaries[id];
            return <tr key={id} className={`border-t border-border ${id === state.algorithm ? "bg-sky-500/5" : ""}`}><th scope="row" className="px-4 py-3 font-semibold">{label}<span className="sr-only">{id === state.algorithm ? " (선택됨)" : ""}</span></th><td className="px-3 py-3">{summary?.visited ?? "—"}</td><td className="px-3 py-3">{summary ? summary.cost ?? "없음" : "—"}</td><td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{summary ? summary.found ? "도착" : "경로 없음" : "실행 전"}</td></tr>;
          })}</tbody>
        </table>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">같은 지도에서 알고리즘을 바꿔 실행하면 결과를 비교할 수 있어요. 탐색한 칸은 시작·도착점을 포함한 확정 처리 수입니다. 모든 이동 비용이 1이라 이동 수와 경로 비용은 같습니다.</p>
    </section>
  );
}
