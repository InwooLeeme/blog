import assert from "node:assert/strict";
import test from "node:test";
import { findPath, type Algorithm, type Board } from "./pathfinding.ts";

const algorithms: Algorithm[] = ["bfs", "dijkstra", "astar"];
for (const algorithm of algorithms) {
  test(`${algorithm}: 빈 지도에서 상하좌우 최단 경로와 중복 없는 이벤트를 반환한다`, () => {
    const board: Board = { rows: 3, cols: 3, start: 0, goal: 8, walls: new Set() };
    const result = findPath(board, algorithm);
    assert.equal(result.cost, 4);
    assert.equal(result.found, true);
    assert.equal(result.path[0], 0);
    assert.equal(result.path.at(-1), 8);
    assert.equal(result.events[0].cell, 0);
    assert.equal(result.events.at(-1)?.cell, 8);
    assert.equal(new Set(result.events.map((event) => event.cell)).size, result.events.length);
    assert.deepEqual(findPath(board, algorithm), result, "동률 처리도 재현 가능하다");
  });

  test(`${algorithm}: 벽을 우회하고 입력을 변경하지 않는다`, () => {
    const board: Board = { rows: 3, cols: 3, start: 0, goal: 2, walls: new Set([1, 4]) };
    const before = structuredClone(board);
    const result = findPath(board, algorithm);
    assert.deepEqual(result.path, [0, 3, 6, 7, 8, 5, 2]);
    assert.equal(result.cost, 6);
    assert.deepEqual(board, before);
    assert.ok(result.events.every(({ cell, discovered }) => !board.walls.has(cell) && discovered.every((id) => !board.walls.has(id))));
  });

  test(`${algorithm}: 도달 불가와 막힌 끝점을 경로 없음으로 반환한다`, () => {
    for (const walls of [new Set([1, 3]), new Set([0]), new Set([8])]) {
      const result = findPath({ rows: 3, cols: 3, start: 0, goal: 8, walls }, algorithm);
      assert.equal(result.found, false);
      assert.equal(result.cost, null);
      assert.deepEqual(result.path, []);
    }
  });

  test(`${algorithm}: 행 끝에서 다음 행으로 감기지 않는다`, () => {
    const result = findPath({ rows: 2, cols: 3, start: 2, goal: 3, walls: new Set() }, algorithm);
    assert.equal(result.cost, 3);
  });

  test(`${algorithm}: 시작점과 도착점이 같은 한 칸 지도`, () => {
    assert.deepEqual(findPath({ rows: 1, cols: 1, start: 0, goal: 0, walls: new Set() }, algorithm), {
      events: [{ cell: 0, discovered: [] }], path: [0], cost: 0, found: true,
    });
  });
}

test("A*: 열린 지도에서 최단 비용을 유지하며 목표 방향으로 탐색한다", () => {
  const board: Board = { rows: 15, cols: 21, start: 0, goal: 314, walls: new Set() };
  const bfs = findPath(board, "bfs");
  const astar = findPath(board, "astar");
  assert.equal(astar.cost, 34);
  assert.ok(astar.events.length < bfs.events.length);
});

test("findPath: 유효하지 않은 크기나 좌표를 거부한다", () => {
  for (const patch of [{ rows: 0 }, { cols: 1.5 }, { start: -1 }, { goal: 9 }, { walls: new Set([9]) }]) {
    assert.throws(() => findPath({ rows: 3, cols: 3, start: 0, goal: 8, walls: new Set(), ...patch }, "bfs"), RangeError);
  }
});

test("세 알고리즘: 작은 지도의 모든 장애물 조합에서 동일한 최단 비용을 찾는다", () => {
  for (let mask = 0; mask < 128; mask++) {
    const walls = new Set<number>();
    for (let bit = 0; bit < 7; bit++) if (mask & (1 << bit)) walls.add(bit + 1);
    const board = { rows: 3, cols: 3, start: 0, goal: 8, walls };
    const bfs = findPath(board, "bfs");
    for (const algorithm of ["dijkstra", "astar"] as const) {
      const result = findPath(board, algorithm);
      assert.equal(result.cost, bfs.cost, `${algorithm}, mask=${mask}`);
      for (let i = 1; i < result.path.length; i++) {
        const a = result.path[i - 1], b = result.path[i];
        assert.equal(Math.abs(a % 3 - b % 3) + Math.abs(Math.floor(a / 3) - Math.floor(b / 3)), 1);
        assert.ok(!walls.has(b));
      }
    }
  }
});
