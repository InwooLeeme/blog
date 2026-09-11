import assert from "node:assert/strict";
import test from "node:test";
import * as vortexInteraction from "./vortex-interaction.ts";
import {
  createVortexRotation,
  beginVortexDrag,
  dragVortex,
  endVortexDrag,
  stepVortexRotation,
} from "./vortex-interaction.ts";

type FlowAwareVortexInteraction = typeof vortexInteraction & {
  stepVortexFlowScale?: (
    scale: number,
    dragging: boolean,
    deltaSeconds: number,
    reducedMotion?: boolean,
  ) => number;
};

test("좌우 드래그는 한 바퀴를 넘어 연속 회전하고 상하 기울기는 제한된다", () => {
  const state = createVortexRotation();
  beginVortexDrag(state);
  for (let i = 0; i < 20; i++) {
    dragVortex(state, 100, 100, 600, 400, 0.016);
    stepVortexRotation(state, 0.016);
  }
  assert.ok(state.targetYaw > Math.PI * 2);
  assert.ok(state.targetPitch > 0 && state.targetPitch < Math.PI / 4);
  dragVortex(state, 0, -10000, 600, 400, 0.016);
  assert.ok(state.targetPitch < 0 && state.targetPitch > -Math.PI / 4);
});

test("잡고 멈춰 있으면 자동 회전과 릴리스 관성이 발생하지 않는다", () => {
  const state = createVortexRotation();
  beginVortexDrag(state);
  const yaw = state.yaw;
  for (let i = 0; i < 180; i++) stepVortexRotation(state, 1 / 60);
  assert.equal(state.yaw, yaw);
  dragVortex(state, 60, 0, 600, 400, 0.016);
  for (let i = 0; i < 30; i++) stepVortexRotation(state, 1 / 60);
  endVortexDrag(state);
  assert.equal(state.velocityYaw, 0);
});

test("놓으면 같은 방향으로 진행하면서 약 1초 동안 관성이 감속한다", () => {
  const state = createVortexRotation();
  beginVortexDrag(state);
  dragVortex(state, 20, 0, 600, 400, 0.016);
  endVortexDrag(state);
  const velocity = state.velocityYaw;
  const target = state.targetYaw;
  for (let i = 0; i < 60; i++) stepVortexRotation(state, 1 / 60);
  assert.ok(state.targetYaw > target);
  assert.ok(state.velocityYaw >= 0 && state.velocityYaw < velocity * 0.02);
});

test("취소하면 관성을 제거하고 자동 회전은 잠시 기다린 뒤 반대 방향으로 재개한다", () => {
  const state = createVortexRotation();
  beginVortexDrag(state);
  dragVortex(state, 20, 0, 600, 400, 0.016);
  endVortexDrag(state, true);
  const target = state.targetYaw;
  for (let i = 0; i < 90; i++) stepVortexRotation(state, 1 / 60);
  assert.equal(state.targetYaw, target);
  for (let i = 0; i < 150; i++) stepVortexRotation(state, 1 / 60);
  assert.ok(state.targetYaw < target);
  assert.ok(state.targetYaw > target - 0.01);
});

test("내부 흐름은 드래그 중 느려지고 놓으면 끊김 없이 원래 속도로 돌아온다", () => {
  const { stepVortexFlowScale } = vortexInteraction as FlowAwareVortexInteraction;
  assert.equal(typeof stepVortexFlowScale, "function");
  if (!stepVortexFlowScale) return;

  let scale = 1;
  for (let frame = 0; frame < 30; frame += 1) {
    scale = stepVortexFlowScale(scale, true, 1 / 60);
  }
  assert.ok(scale >= 0.3 && scale <= 0.5);

  const slowed = scale;
  scale = stepVortexFlowScale(scale, false, 1 / 60);
  assert.ok(scale > slowed && scale < 1);
  for (let frame = 0; frame < 60; frame += 1) {
    scale = stepVortexFlowScale(scale, false, 1 / 60);
  }
  assert.ok(scale > 0.98 && scale <= 1);
  assert.equal(stepVortexFlowScale(scale, false, 1 / 60, true), 0);
});

test("모션 감소와 비정상 시간 간격은 회전을 진행하지 않는다", () => {
  const state = createVortexRotation();
  const before = { ...state };
  stepVortexRotation(state, Number.NaN);
  stepVortexRotation(state, -1);
  stepVortexRotation(state, 1 / 60, true);
  assert.deepEqual(state, before);
});

test("30fps와 120fps에서 관성의 최종 회전 거리가 같다", () => {
  const run = (fps: number) => {
    const state = createVortexRotation();
    beginVortexDrag(state);
    dragVortex(state, 20, 10, 600, 400, 0.016);
    endVortexDrag(state);
    for (let i = 0; i < fps; i++) stepVortexRotation(state, 1 / fps);
    return state;
  };
  const slow = run(30);
  const fast = run(120);
  assert.ok(Math.abs(slow.targetYaw - fast.targetYaw) < 0.0001);
  assert.ok(Math.abs(slow.yaw - fast.yaw) < 0.01);
});
