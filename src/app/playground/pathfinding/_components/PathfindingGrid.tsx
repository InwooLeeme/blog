"use client";

import { useRef, useState, type PointerEvent } from "react";
import { cellFromPoint, cellsOnLine, moveCell } from "../_lib/grid-input";
import type { Board } from "../_lib/pathfinding";
import type { Tool } from "../_lib/playground-state";

type Props = {
  board: Board; tool: Tool; locked: boolean;
  visited: ReadonlySet<number>; frontier: ReadonlySet<number>; path: ReadonlySet<number>;
  onEdit: (cells: number[]) => void;
};

export default function PathfindingGrid({ board, tool, locked, visited, frontier, path, onEdit }: Props) {
  const [activeCell, setActiveCell] = useState(board.start);
  const [panMode, setPanMode] = useState(false);
  const buttons = useRef(new Map<number, HTMLButtonElement>());
  const drag = useRef<{ pointer: number; last: number | null } | null>(null);
  const pointCell = (event: PointerEvent<HTMLDivElement>) => cellFromPoint(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect(), board.cols, board.rows);
  const focusCell = (cell: number) => {
    setActiveCell(cell);
    buttons.current.get(cell)?.focus({ preventScroll: true });
  };
  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointer !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <div className="min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-sm font-semibold">나만의 지도</h2><p className="mt-1 text-xs text-muted-foreground">21 × 15 격자 · 상하좌우 이동 · 한 칸의 비용 1</p></div>
        <button type="button" aria-pressed={panMode} onClick={() => setPanMode((value) => !value)} className="min-h-11 rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">{panMode ? "화면 이동 중 · 편집으로 전환" : "지도 편집 중 · 이동으로 전환"}</button>
      </div>
      <p id="pathfinding-grid-help" className="mb-3 text-xs leading-5 text-muted-foreground">벽은 드래그, 시작·도착점은 눌러서 배치하세요. 방향키로 이동하고 Enter 또는 Space로 편집할 수 있습니다. 좁은 화면에서는 ‘화면 이동’으로 전환해 좌우로 밀어보세요.</p>
      <div className="overflow-x-auto rounded-xl border border-slate-700 bg-[#101b2b] p-2 sm:p-3">
        <div
          role="grid" aria-label="경로 탐색 지도" aria-describedby="pathfinding-grid-help" aria-rowcount={board.rows} aria-colcount={board.cols} aria-readonly={locked}
          className="min-w-[588px] overflow-hidden rounded-md bg-slate-800"
          style={{ touchAction: panMode || locked ? "auto" : "none" }}
          onPointerDown={(event) => {
            if (locked || panMode || !event.isPrimary || event.button !== 0) return;
            const cell = pointCell(event);
            if (cell === null) return;
            event.preventDefault();
            focusCell(cell);
            onEdit([cell]);
            if (tool === "wall" || tool === "erase") {
              drag.current = { pointer: event.pointerId, last: cell };
              event.currentTarget.setPointerCapture(event.pointerId);
            }
          }}
          onPointerMove={(event) => {
            if (locked || panMode || !drag.current || drag.current.pointer !== event.pointerId) return;
            const cell = pointCell(event);
            if (cell !== null && cell !== drag.current.last) onEdit(drag.current.last === null ? [cell] : cellsOnLine(drag.current.last, cell, board.cols));
            drag.current.last = cell;
          }}
          onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={() => { drag.current = null; }}
        >
          {Array.from({ length: board.rows }, (_, row) => (
            <div key={row} role="row" aria-rowindex={row + 1} className="grid" style={{ gridTemplateColumns: `repeat(${board.cols}, minmax(0, 1fr))` }}>
              {Array.from({ length: board.cols }, (_, col) => {
                const cell = row * board.cols + col;
                const start = cell === board.start, goal = cell === board.goal, wall = board.walls.has(cell);
                const onPath = path.has(cell), seen = visited.has(cell), queued = frontier.has(cell);
                const label = start ? "시작점" : goal ? "도착점" : wall ? "벽" : onPath ? "최종 경로" : seen ? "탐색 완료" : queued ? "탐색 대기" : "빈 칸";
                const color = start ? "bg-emerald-400 text-emerald-950" : goal ? "bg-amber-300 text-amber-950" : wall ? "bg-slate-500 text-slate-200" : onPath ? "bg-amber-300/90 text-amber-950" : seen ? "bg-sky-800/80 text-sky-200" : queued ? "bg-sky-950 text-sky-300" : "bg-slate-900 text-slate-700";
                return <button
                  key={cell} ref={(element) => { if (element) buttons.current.set(cell, element); else buttons.current.delete(cell); }}
                  type="button" role="gridcell" aria-colindex={col + 1} aria-label={`${row + 1}행 ${col + 1}열, ${label}`} aria-disabled={locked}
                  tabIndex={activeCell === cell ? 0 : -1} onFocus={() => setActiveCell(cell)}
                  className={`relative flex aspect-square min-h-7 min-w-7 select-none items-center justify-center border-r border-b border-slate-700/40 text-[10px] font-bold outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white ${color} ${locked || panMode ? "cursor-default" : "cursor-crosshair hover:brightness-125"}`}
                  onClick={(event) => { if (event.detail === 0 && !locked && !panMode) onEdit([cell]); }}
                  onKeyDown={(event) => {
                    if (event.key.startsWith("Arrow")) {
                      event.preventDefault();
                      const next = moveCell(cell, event.key, board.cols, board.rows);
                      focusCell(next);
                      buttons.current.get(next)?.scrollIntoView({ block: "nearest", inline: "nearest" });
                    } else if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      if (!locked) onEdit([cell]);
                    }
                  }}
                >{start ? "S" : goal ? "G" : wall ? "▪" : onPath ? "●" : queued ? "◦" : seen ? "·" : null}</button>;
              })}
            </div>
          ))}
        </div>
      </div>
      <ul aria-label="지도 범례" className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
        {[["S", "시작", "bg-emerald-400 text-emerald-950"], ["G", "도착", "bg-amber-300 text-amber-950"], ["▪", "벽", "bg-slate-500 text-white"], ["◦", "대기", "bg-sky-950 text-sky-300"], ["·", "탐색", "bg-sky-800 text-sky-200"], ["●", "경로", "bg-amber-300 text-amber-950"]].map(([mark, label, color]) => <li key={label} className="flex items-center gap-1.5"><span aria-hidden="true" className={`inline-flex size-4 items-center justify-center rounded-sm text-[9px] font-bold ${color}`}>{mark}</span>{label}</li>)}
      </ul>
    </div>
  );
}
