import { findPath, type Algorithm, type Board, type SearchResult } from "./pathfinding.ts";

export type Tool = "wall" | "erase" | "start" | "goal";
export type Speed = "slow" | "normal" | "fast";
export type Status = "idle" | "running" | "paused" | "complete";
export type Summary = { visited: number; cost: number | null; found: boolean };
export type PlaygroundState = {
  board: Board;
  algorithm: Algorithm;
  tool: Tool;
  speed: Speed;
  status: Status;
  result: SearchResult | null;
  cursor: number;
  summaries: Partial<Record<Algorithm, Summary>>;
};
export type PlaygroundAction =
  | { type: "edit"; cells: number[] }
  | { type: "algorithm"; value: Algorithm }
  | { type: "tool"; value: Tool }
  | { type: "speed"; value: Speed }
  | { type: "play"; reducedMotion?: boolean }
  | { type: "step" | "tick" | "pause" | "finish" | "clear" | "reset" };

export const SPEED_MS: Record<Speed, number> = { slow: 160, normal: 45, fast: 12 };

export function createPlaygroundState(): PlaygroundState {
  return {
    board: { rows: 15, cols: 21, start: 150, goal: 164, walls: new Set() },
    algorithm: "bfs", tool: "wall", speed: "normal", status: "idle",
    result: null, cursor: 0, summaries: {},
  };
}

function clearPlayback(state: PlaygroundState): PlaygroundState {
  return { ...state, result: null, cursor: 0, status: "idle" };
}

function complete(state: PlaygroundState, result: SearchResult): PlaygroundState {
  return {
    ...state, result, cursor: result.events.length, status: "complete",
    summaries: { ...state.summaries, [state.algorithm]: { visited: result.events.length, cost: result.cost, found: result.found } },
  };
}

function editBoard(state: PlaygroundState, cells: number[]): PlaygroundState {
  if (state.status === "running") return state;
  const { board, tool } = state;
  let { start, goal } = board;
  const walls = new Set(board.walls);
  for (const cell of cells) {
    if (!Number.isInteger(cell) || cell < 0 || cell >= board.rows * board.cols) continue;
    if (tool === "wall" && cell !== start && cell !== goal) walls.add(cell);
    if (tool === "erase") walls.delete(cell);
    if (tool === "start" && cell !== goal) { start = cell; walls.delete(cell); }
    if (tool === "goal" && cell !== start) { goal = cell; walls.delete(cell); }
  }
  if (start === board.start && goal === board.goal && walls.size === board.walls.size && [...walls].every((cell) => board.walls.has(cell))) return state;
  return { ...clearPlayback(state), board: { ...board, start, goal, walls }, summaries: {} };
}

export function playgroundReducer(state: PlaygroundState, action: PlaygroundAction): PlaygroundState {
  switch (action.type) {
    case "edit": return editBoard(state, action.cells);
    case "tool": return { ...state, tool: action.value };
    case "speed": return { ...state, speed: action.value };
    case "algorithm":
      return state.status === "running" || state.algorithm === action.value ? state
        : { ...clearPlayback(state), algorithm: action.value };
    case "clear": return { ...clearPlayback(state), summaries: {} };
    case "reset": return { ...createPlaygroundState(), algorithm: state.algorithm, tool: state.tool, speed: state.speed };
    case "pause": return state.status === "running" ? { ...state, status: "paused" } : state;
    case "finish": return state.status === "running" && state.result ? complete(state, state.result) : state;
    case "play": {
      if (state.status === "running") return state;
      const resume = state.status === "paused" && state.result;
      const result = resume || findPath(state.board, state.algorithm);
      if (action.reducedMotion) return complete(state, result);
      return { ...state, result, cursor: resume ? state.cursor : 0, status: "running" };
    }
    case "step":
    case "tick": {
      if (action.type === "tick" && state.status !== "running") return state;
      if (action.type === "step" && state.status === "running") return state;
      const restart = state.status === "complete" || !state.result;
      const result = restart ? findPath(state.board, state.algorithm) : state.result!;
      const cursor = (restart ? 0 : state.cursor) + 1;
      if (cursor >= result.events.length) return complete(state, result);
      return { ...state, result, cursor, status: action.type === "step" ? "paused" : "running" };
    }
  }
}

/** Derive only the visible prefix; computed search results never leak ahead. */
export function getSearchLayers(state: Pick<PlaygroundState, "result" | "cursor" | "status">) {
  const visited = new Set<number>(), frontier = new Set<number>();
  for (const event of state.result?.events.slice(0, state.cursor) ?? []) {
    visited.add(event.cell);
    frontier.delete(event.cell);
    for (const cell of event.discovered) if (!visited.has(cell)) frontier.add(cell);
  }
  const path = new Set(state.status === "complete" ? state.result?.path : []);
  return { visited, frontier, path };
}
