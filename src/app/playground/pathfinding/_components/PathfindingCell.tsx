import { memo, useCallback } from "react";

const APPEARANCES = {
  start: { label: "시작점", color: "bg-emerald-400 text-emerald-950", mark: "S" },
  goal: { label: "도착점", color: "bg-amber-300 text-amber-950", mark: "G" },
  wall: { label: "벽", color: "bg-slate-500 text-slate-200", mark: "▪" },
  path: { label: "최종 경로", color: "bg-amber-300/90 text-amber-950", mark: "●" },
  visited: { label: "탐색 완료", color: "bg-sky-800/80 text-sky-200", mark: "·" },
  frontier: { label: "탐색 대기", color: "bg-sky-950 text-sky-300", mark: "◦" },
  empty: { label: "빈 칸", color: "bg-slate-900 text-slate-700", mark: null },
} as const;

type Props = {
  cell: number; row: number; col: number;
  appearance: keyof typeof APPEARANCES;
  active: boolean; editable: boolean;
  registerCell: (cell: number, element: HTMLButtonElement | null) => void;
  onFocus: (cell: number) => void;
  onMove: (cell: number, key: string) => void;
  onEdit: (cells: number[]) => void;
};

// Primitive visual props let unchanged cells skip each playback update.
export default memo(function PathfindingCell({ cell, row, col, appearance, active, editable, registerCell, onFocus, onMove, onEdit }: Props) {
  const ref = useCallback((element: HTMLButtonElement | null) => registerCell(cell, element), [cell, registerCell]);
  const { label, color, mark } = APPEARANCES[appearance];
  return (
    <button
      ref={ref} type="button" role="gridcell" aria-colindex={col + 1}
      aria-label={`${row + 1}행 ${col + 1}열, ${label}`} aria-disabled={!editable}
      tabIndex={active ? 0 : -1} onFocus={() => onFocus(cell)}
      className={`relative flex aspect-square min-h-7 min-w-7 select-none items-center justify-center border-r border-b border-slate-700/40 text-[10px] font-bold outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white ${color} ${editable ? "cursor-crosshair hover:brightness-125" : "cursor-default"}`}
      onClick={(event) => { if (event.detail === 0 && editable) onEdit([cell]); }}
      onKeyDown={(event) => {
        if (event.key.startsWith("Arrow")) {
          event.preventDefault();
          onMove(cell, event.key);
        } else if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (editable) onEdit([cell]);
        }
      }}
    >{mark}</button>
  );
});
