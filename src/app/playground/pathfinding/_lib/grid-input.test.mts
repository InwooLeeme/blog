import assert from "node:assert/strict";
import test from "node:test";
import { cellFromPoint, cellsOnLine, moveCell } from "./grid-input.ts";
import * as input from "./grid-input.ts";

test("격자 편집 정책: 화면 이동 모드와 재생 잠금에서는 입력 방식과 무관하게 편집을 막는다", () => {
  assert.equal(typeof input.canEditGrid, "function");
  assert.equal(input.canEditGrid(false, false), true);
  assert.equal(input.canEditGrid(false, true), false);
  assert.equal(input.canEditGrid(true, false), false);
  assert.equal(input.canEditGrid(true, true), false);
});

test("격자 좌표: 스크롤된 사각형의 상대 좌표로 셀을 구하고 밖은 무시한다", () => {
  const rect = { left: -100, top: 50, width: 210, height: 150 };
  assert.equal(cellFromPoint(-95, 55, rect, 21, 15), 0);
  assert.equal(cellFromPoint(109, 199, rect, 21, 15), 314);
  assert.equal(cellFromPoint(-101, 55, rect, 21, 15), null);
  assert.equal(cellFromPoint(110, 55, rect, 21, 15), null);
  assert.equal(cellFromPoint(0, 200, rect, 21, 15), null);
  assert.equal(cellFromPoint(0, 0, { ...rect, width: 0 }, 21, 15), null);
});

test("드래그: 빠른 포인터 이동 사이의 셀도 빈틈 없이 그린다", () => {
  assert.deepEqual(cellsOnLine(0, 4, 5), [0, 1, 2, 3, 4]);
  assert.deepEqual(cellsOnLine(0, 20, 5), [0, 5, 10, 15, 20]);
  assert.deepEqual(cellsOnLine(24, 0, 5), [24, 18, 12, 6, 0]);
  assert.deepEqual(cellsOnLine(7, 7, 5), [7]);
});

test("키보드: 방향키는 행을 감거나 격자 밖으로 나가지 않는다", () => {
  assert.equal(moveCell(0, "ArrowLeft", 5, 5), 0);
  assert.equal(moveCell(0, "ArrowUp", 5, 5), 0);
  assert.equal(moveCell(4, "ArrowRight", 5, 5), 4);
  assert.equal(moveCell(24, "ArrowDown", 5, 5), 24);
  assert.equal(moveCell(6, "ArrowRight", 5, 5), 7);
  assert.equal(moveCell(6, "ArrowUp", 5, 5), 1);
  assert.equal(moveCell(6, "Tab", 5, 5), 6);
});
