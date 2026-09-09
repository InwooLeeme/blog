import assert from "node:assert/strict";
import test from "node:test";
import * as particlePhysics from "./particle-physics.ts";
import {
  getPointerForce,
  writePointerVelocity,
} from "./particle-physics.ts";

type PointerReleasePhysics = typeof particlePhysics & {
  writePointerRelease?: <T extends {
    active: boolean;
    dragging: boolean;
    pointerId: number | null;
    vx: number;
    vy: number;
  }>(pointer: T, keepHover: boolean) => T;
};

const base = {
  particle: { x: 10, y: 0 },
  pointer: { x: 0, y: 0 },
  pointerVelocity: { x: 0, y: 0 },
  active: true,
  dragging: false,
  reducedMotion: false,
  radius: 80,
  maxForce: 2,
};

test("writePointerVelocity: 포인터 위치가 아닌 vx/vy를 힘 입력으로 옮긴다", () => {
  const output = { x: 0, y: 0 };
  const result = writePointerVelocity(
    { x: 140, y: 90, vx: -12, vy: 4 },
    output,
  );

  assert.equal(result, output);
  assert.deepEqual(result, { x: -12, y: 4 });
});

test("writePointerRelease: 캔버스 안에서 놓으면 hover 위치만 유지한다", () => {
  const { writePointerRelease } = particlePhysics as PointerReleasePhysics;
  assert.equal(typeof writePointerRelease, "function");
  if (!writePointerRelease) return;

  const pointer = {
    x: 140,
    y: 90,
    active: true,
    dragging: true,
    pointerId: 7,
    vx: 12,
    vy: -4,
  };
  const result = writePointerRelease(pointer, true);

  assert.equal(result, pointer);
  assert.deepEqual(result, {
    x: 140,
    y: 90,
    active: true,
    dragging: false,
    pointerId: null,
    vx: 0,
    vy: 0,
  });
});

test("writePointerRelease: 캔버스 밖에서 놓으면 pointer를 비활성화한다", () => {
  const { writePointerRelease } = particlePhysics as PointerReleasePhysics;
  assert.equal(typeof writePointerRelease, "function");
  if (!writePointerRelease) return;

  const pointer = {
    active: true,
    dragging: true,
    pointerId: 7,
    vx: 12,
    vy: -4,
  };
  writePointerRelease(pointer, false);

  assert.equal(pointer.active, false);
  assert.equal(pointer.dragging, false);
  assert.equal(pointer.pointerId, null);
});

test("getPointerForce: 비활성 또는 모션 감소 상태이면 힘이 없다", () => {
  assert.deepEqual(getPointerForce({ ...base, active: false }), { x: 0, y: 0 });
  assert.deepEqual(getPointerForce({ ...base, reducedMotion: true }), { x: 0, y: 0 });
});

test("getPointerForce: 영향 반경 밖이면 힘이 없다", () => {
  assert.deepEqual(
    getPointerForce({ ...base, particle: { x: 100, y: 0 } }),
    { x: 0, y: 0 },
  );
});

test("getPointerForce: 호버는 포인터 바깥 방향으로 밀어낸다", () => {
  const force = getPointerForce(base);
  assert.ok(force.x > 0);
  assert.ok(Math.abs(force.y) < 1e-9);
});

test("getPointerForce: 드래그는 이동 방향에 대응하는 접선력을 더한다", () => {
  const force = getPointerForce({
    ...base,
    particle: { x: 0, y: 10 },
    dragging: true,
    pointerVelocity: { x: 20, y: 0 },
  });
  assert.ok(force.x > 0);
});

test("getPointerForce: 우세 축이 바뀌어도 접선력 방향이 불연속적으로 뒤집히지 않는다", () => {
  const horizontalDominant = getPointerForce({
    ...base,
    dragging: true,
    pointerVelocity: { x: 10, y: -9.9 },
  });
  const verticalDominant = getPointerForce({
    ...base,
    dragging: true,
    pointerVelocity: { x: 9.9, y: -10 },
  });

  assert.ok(horizontalDominant.y < 0);
  assert.ok(verticalDominant.y < 0);
  assert.ok(Math.abs(horizontalDominant.y - verticalDominant.y) < 0.02);
});

test("getPointerForce: 거리 0과 과도한 속도에서도 유한한 상한을 지킨다", () => {
  const force = getPointerForce({
    ...base,
    particle: { x: 0, y: 0 },
    dragging: true,
    pointerVelocity: { x: 1e9, y: -1e9 },
  });
  assert.ok(Number.isFinite(force.x) && Number.isFinite(force.y));
  assert.ok(Math.hypot(force.x, force.y) <= 2.000001);
});

test("getPointerForce: 비정상 입력을 0의 힘으로 격리한다", () => {
  assert.deepEqual(
    getPointerForce({
      ...base,
      pointerVelocity: { x: Number.NaN, y: Number.POSITIVE_INFINITY },
      dragging: true,
    }),
    { x: 0, y: 0 },
  );
});
