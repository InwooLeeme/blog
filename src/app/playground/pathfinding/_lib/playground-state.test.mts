import assert from "node:assert/strict";
import test from "node:test";
import { createPlaygroundState, getSearchLayers, playgroundReducer as reduce } from "./playground-state.ts";

test("지도 편집: 점은 벽으로 덮거나 서로 겹칠 수 없다", () => {
  const state = createPlaygroundState();
  assert.equal(reduce(state, { type: "edit", cells: [state.board.start, state.board.goal, -1, 999] }), state);
  const startTool = reduce(state, { type: "tool", value: "start" });
  assert.equal(reduce(startTool, { type: "edit", cells: [state.board.goal] }), startTool);
});

test("지도 편집: 여러 벽을 불변으로 그리고 지우거나 벽 위에 점을 배치한다", () => {
  const initial = createPlaygroundState();
  const walls = reduce(initial, { type: "edit", cells: [0, 1, 2] });
  assert.deepEqual([...walls.board.walls], [0, 1, 2]);
  assert.equal(initial.board.walls.size, 0);
  const erased = reduce(reduce(walls, { type: "tool", value: "erase" }), { type: "edit", cells: [1] });
  assert.deepEqual([...erased.board.walls], [0, 2]);
  const moved = reduce(reduce(walls, { type: "tool", value: "goal" }), { type: "edit", cells: [0] });
  assert.equal(moved.board.goal, 0);
  assert.ok(!moved.board.walls.has(0));
});

test("재생: 실행 중 편집·알고리즘 변경·수동 단계를 막고 정지 후 이어간다", () => {
  const running = reduce(createPlaygroundState(), { type: "play" });
  assert.equal(running.status, "running");
  assert.equal(reduce(running, { type: "edit", cells: [0] }), running);
  assert.equal(reduce(running, { type: "algorithm", value: "astar" }), running);
  assert.equal(reduce(running, { type: "step" }), running);
  const ticked = reduce(running, { type: "tick" });
  assert.equal(ticked.cursor, 1);
  const paused = reduce(ticked, { type: "pause" });
  assert.equal(paused.status, "paused");
  assert.equal(reduce(paused, { type: "tick" }), paused);
  const resumed = reduce(paused, { type: "play" });
  assert.equal(resumed.cursor, 1);
  assert.equal(resumed.result, ticked.result);
});

test("한 단계: 한 칸씩 확정하고 마지막 단계에 결과를 저장한다", () => {
  let state = reduce(createPlaygroundState(), { type: "step" });
  assert.equal(state.cursor, 1);
  assert.equal(state.status, "paused");
  while (state.status !== "complete") state = reduce(state, { type: "step" });
  assert.equal(state.summaries.bfs?.cost, 14);
  assert.equal(state.summaries.bfs?.visited, state.result!.events.length);
  assert.equal(reduce(state, { type: "play" }).cursor, 0);
});

test("비교 결과: 알고리즘을 바꾸면 보존하고 지도 편집 시 모두 지운다", () => {
  const done = reduce(createPlaygroundState(), { type: "play", reducedMotion: true });
  assert.equal(done.status, "complete");
  const astar = reduce(done, { type: "algorithm", value: "astar" });
  assert.equal(astar.result, null);
  assert.equal(astar.cursor, 0);
  assert.ok(astar.summaries.bfs);
  const compared = reduce(astar, { type: "play", reducedMotion: true });
  assert.ok(compared.summaries.bfs && compared.summaries.astar);
  const edited = reduce(compared, { type: "edit", cells: [0] });
  assert.deepEqual(edited.summaries, {});
  assert.equal(edited.result, null);
  assert.equal(edited.status, "idle");
});

test("초기화: 결과 지우기는 지도를 유지하고 전체 초기화는 빈 지도를 복원한다", () => {
  const walls = reduce(createPlaygroundState(), { type: "edit", cells: [0] });
  const done = reduce(walls, { type: "play", reducedMotion: true });
  const clear = reduce(done, { type: "clear" });
  assert.equal(clear.board, done.board);
  assert.equal(clear.result, null);
  assert.deepEqual(clear.summaries, {});
  assert.equal(reduce(done, { type: "reset" }).board.walls.size, 0);
});

test("일시정지 중 편집은 재생 위치를 초기화하고 무효 편집은 유지한다", () => {
  const paused = reduce(createPlaygroundState(), { type: "step" });
  assert.equal(reduce(paused, { type: "edit", cells: [paused.board.start] }), paused);
  const edited = reduce(paused, { type: "edit", cells: [0] });
  assert.equal(edited.cursor, 0);
  assert.equal(edited.status, "idle");
});

test("도달 불가 완료 결과는 비용 없음으로 저장한다", () => {
  let state = createPlaygroundState();
  const start = state.board.start;
  state = reduce(state, { type: "edit", cells: [start - 21, start + 21, start - 1, start + 1] });
  state = reduce(state, { type: "play", reducedMotion: true });
  assert.equal(state.status, "complete");
  assert.equal(state.summaries.bfs?.cost, null);
  assert.equal(state.summaries.bfs?.found, false);
  assert.equal(state.summaries.bfs?.visited, 1);
});

test("화면 레이어: 현재 단계까지만 보여주고 경로는 완료 후 공개한다", () => {
  const initial = createPlaygroundState();
  assert.equal(getSearchLayers(initial).visited.size, 0);
  const step = reduce(initial, { type: "step" });
  const layers = getSearchLayers(step);
  assert.deepEqual([...layers.visited], [150]);
  assert.deepEqual([...layers.frontier], [129, 151, 171, 149]);
  assert.equal(layers.path.size, 0);
  const next = getSearchLayers(reduce(step, { type: "step" }));
  assert.ok(next.visited.has(129));
  assert.ok(!next.frontier.has(129));
  assert.equal(getSearchLayers(reduce(initial, { type: "play", reducedMotion: true })).path.size, 15);
});
