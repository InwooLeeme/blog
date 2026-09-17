export type Algorithm = "bfs" | "dijkstra" | "astar";
export type Board = { rows: number; cols: number; start: number; goal: number; walls: ReadonlySet<number> };
export type SearchEvent = { cell: number; discovered: number[] };
export type SearchResult = { events: SearchEvent[]; path: number[]; cost: number | null; found: boolean };

/** Fixed neighbor order makes equal-cost runs reproducible. */
function neighbors(cell: number, { rows, cols }: Board): number[] {
  const row = Math.floor(cell / cols), col = cell % cols;
  const cells: number[] = [];
  if (row > 0) cells.push(cell - cols);
  if (col < cols - 1) cells.push(cell + 1);
  if (row < rows - 1) cells.push(cell + cols);
  if (col > 0) cells.push(cell - 1);
  return cells;
}

export function findPath(board: Board, algorithm: Algorithm): SearchResult {
  const { rows, cols, start, goal, walls } = board;
  const size = rows * cols;
  const validCell = (cell: number) => Number.isInteger(cell) && cell >= 0 && cell < size;
  if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows < 1 || cols < 1 || size > 4096 ||
      !validCell(start) || !validCell(goal) || [...walls].some((cell) => !validCell(cell))) {
    throw new RangeError("격자 크기 또는 좌표가 유효하지 않습니다");
  }
  const result: SearchResult = { events: [], path: [], cost: null, found: false };
  if (walls.has(start) || walls.has(goal)) return result;

  const distance = new Array<number>(size).fill(Infinity);
  const parent = new Array<number>(size).fill(-1);
  const settled = new Set<number>();
  const frontier = [start];
  const heuristic = (cell: number) => algorithm === "astar"
    ? Math.abs(cell % cols - goal % cols) + Math.abs(Math.floor(cell / cols) - Math.floor(goal / cols)) : 0;
  distance[start] = 0;

  while (frontier.length) {
    // The playground is bounded to 315 cells. A stable linear minimum avoids
    // extra heap machinery while preserving Dijkstra/A* priority semantics.
    let best = 0;
    if (algorithm !== "bfs") {
      for (let i = 1; i < frontier.length; i++) {
        const candidate = frontier[i], previous = frontier[best];
        const delta = distance[candidate] + heuristic(candidate) - distance[previous] - heuristic(previous);
        if (delta < 0 || (delta === 0 && heuristic(candidate) < heuristic(previous))) best = i;
      }
    }
    const current = frontier.splice(best, 1)[0];
    settled.add(current);
    const event: SearchEvent = { cell: current, discovered: [] };
    result.events.push(event);
    if (current === goal) {
      for (let cell = goal; cell !== -1; cell = parent[cell]) result.path.push(cell);
      result.path.reverse();
      result.cost = distance[goal];
      result.found = true;
      return result;
    }
    for (const next of neighbors(current, board)) {
      if (walls.has(next) || settled.has(next) || distance[current] + 1 >= distance[next]) continue;
      if (distance[next] === Infinity) {
        frontier.push(next);
        event.discovered.push(next);
      }
      distance[next] = distance[current] + 1;
      parent[next] = current;
    }
  }
  return result;
}
