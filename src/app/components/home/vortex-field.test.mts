import assert from "node:assert/strict";
import test from "node:test";
import * as vortexField from "./vortex-field.ts";
import {
  advanceVortexOrbit,
  createVortexSeeds,
  getFrameScale,
  SPIRAL_PITCH,
} from "./vortex-field.ts";

type VortexPoint3D = { x: number; y: number; z: number };
type ThreeDimensionalVortexField = typeof vortexField & {
  writeVortexPosition3D?: (
    star: { angle: number; radiusRatio: number; twinklePhase: number },
    maxRadius: number,
    output: VortexPoint3D,
  ) => VortexPoint3D;
  getPerspectiveScale?: (z: number, cameraDistance: number) => number;
  getVortexStarPointSize?: (
    size: number,
    flare: boolean,
    perspective?: number,
  ) => number;
  getVortexStarLightProfile?: (kind: "orbit" | "core") => {
    hotCoreRadius: number;
    softCoreRadius: number;
    edgeFadeStart: number;
    alphaBoost: number;
    rayStrength: number;
    raySharpness: number;
    flareCoreScale: number;
  };
};

test("createVortexSeeds: 요청한 수만큼 결정적인 별 궤도를 만든다", () => {
  const first = createVortexSeeds(420, 20260909);
  const second = createVortexSeeds(420, 20260909);

  assert.equal(first.length, 420);
  assert.deepEqual(first, second);
});

test("createVortexSeeds: 별의 반경·밝기·크기·색상 범위를 제한한다", () => {
  const stars = createVortexSeeds(420, 17);

  assert.ok(stars.every((star) => star.radiusRatio >= 0.08 && star.radiusRatio <= 1));
  assert.ok(stars.every((star) => star.brightness >= 0.44 && star.brightness <= 0.98));
  assert.ok(stars.every((star) => star.size >= 0.68 && star.size <= 2.85));
  assert.ok(stars.every((star) => [0, 1, 2].includes(star.colorIndex)));
  assert.ok(stars.some((star) => star.flare));
});

test("createVortexSeeds: 데스크톱 장면에 눈에 띄는 큰 별을 충분히 배치한다", () => {
  const flareCount = createVortexSeeds(560, 20260909).filter(
    (star) => star.flare,
  ).length;

  assert.ok(flareCount >= 20 && flareCount <= 25, `flare count was ${flareCount}`);
});

test("advanceVortexOrbit: 별을 천천히 회전시키며 중심으로 이동시킨다", () => {
  const orbit = {
    angle: 1,
    radiusRatio: 0.7,
    angularSpeed: 0.08,
    inwardSpeed: 0.02,
  };
  const next = advanceVortexOrbit(orbit, 1);

  assert.notEqual(next.angle, orbit.angle);
  assert.ok(next.radiusRatio < orbit.radiusRatio);
  assert.equal(next.recycled, false);
});

test("advanceVortexOrbit: 중심에 도달한 별을 바깥 나선으로 재순환한다", () => {
  const next = advanceVortexOrbit(
    {
      angle: 2,
      radiusRatio: 0.051,
      angularSpeed: 0.08,
      inwardSpeed: 0.02,
    },
    1,
  );

  assert.ok(next.radiusRatio >= 0.94 && next.radiusRatio <= 0.99);
  assert.ok(Number.isFinite(next.angle));
  assert.equal(next.recycled, true);
});

test("advanceVortexOrbit: 비정상 프레임 간격을 무시한다", () => {
  const orbit = {
    angle: 1,
    radiusRatio: 0.7,
    angularSpeed: 0.08,
    inwardSpeed: 0.02,
  };

  assert.deepEqual(advanceVortexOrbit(orbit, Number.NaN), {
    ...orbit,
    recycled: false,
  });
  assert.deepEqual(advanceVortexOrbit(orbit, -1), {
    ...orbit,
    recycled: false,
  });
});

test("advanceVortexOrbit: 20초 뒤에도 세 나선팔의 위상 응집도를 유지한다", () => {
  let stars = createVortexSeeds(420, 20260909).map((star) => ({
    angle: star.angle,
    radiusRatio: star.radiusRatio,
    angularSpeed: star.angularSpeed,
    inwardSpeed: star.inwardSpeed,
  }));

  for (let frame = 0; frame < 400; frame += 1) {
    stars = stars.map((star) => advanceVortexOrbit(star, 0.05));
  }

  const armStars = stars.filter((_, index) => index % 7 !== 0);
  const phaseVectors = armStars.map((star) => {
    const phase = (star.angle - SPIRAL_PITCH * star.radiusRatio) * 3;
    return { x: Math.cos(phase), y: Math.sin(phase) };
  });
  const concentration = Math.hypot(
    phaseVectors.reduce((sum, point) => sum + point.x, 0),
    phaseVectors.reduce((sum, point) => sum + point.y, 0),
  ) / phaseVectors.length;

  assert.ok(concentration > 0.7, `arm concentration was ${concentration}`);
});

test("getFrameScale: 60Hz를 기준으로 고주사율과 긴 프레임을 정규화한다", () => {
  assert.ok(Math.abs(getFrameScale(1 / 60) - 1) < 1e-9);
  assert.ok(Math.abs(getFrameScale(1 / 120) - 0.5) < 1e-9);
  assert.equal(getFrameScale(1), 3);
  assert.equal(getFrameScale(Number.NaN), 0);
});

test("writeVortexPosition3D: 나선 원반의 위아래 절반을 카메라 앞뒤 깊이에 배치한다", () => {
  const { writeVortexPosition3D } = vortexField as ThreeDimensionalVortexField;
  assert.equal(typeof writeVortexPosition3D, "function");
  if (!writeVortexPosition3D) return;

  const near = writeVortexPosition3D(
    { angle: Math.PI / 2, radiusRatio: 0.4, twinklePhase: -Math.PI * 2 },
    200,
    { x: 0, y: 0, z: 0 },
  );
  const far = writeVortexPosition3D(
    { angle: -Math.PI / 2, radiusRatio: 0.4, twinklePhase: Math.PI * 2 },
    200,
    { x: 0, y: 0, z: 0 },
  );

  assert.ok(near.z > 0);
  assert.ok(far.z < 0);
  assert.ok(Math.abs(Math.hypot(near.x, near.y, near.z) - 80) < 1e-9);
  assert.ok(Math.abs(Math.hypot(far.x, far.y, far.z) - 80) < 1e-9);
});

test("getPerspectiveScale: 가까운 별은 커지고 먼 별은 작아진다", () => {
  const { getPerspectiveScale } = vortexField as ThreeDimensionalVortexField;
  assert.equal(typeof getPerspectiveScale, "function");
  if (!getPerspectiveScale) return;

  assert.equal(getPerspectiveScale(0, 800), 1);
  assert.ok(getPerspectiveScale(120, 800) > 1);
  assert.ok(getPerspectiveScale(-120, 800) < 1);
  assert.equal(getPerspectiveScale(120, Number.NaN), 1);
});

test("getVortexStarPointSize: 주변 별을 읽을 수 있는 크기로 확대한다", () => {
  const { getVortexStarPointSize } = vortexField as ThreeDimensionalVortexField;
  assert.equal(typeof getVortexStarPointSize, "function");
  if (!getVortexStarPointSize) return;

  const smallest = getVortexStarPointSize(0.68, false);
  const largest = getVortexStarPointSize(2.85, false);

  assert.ok(smallest >= 4.2 && smallest <= 4.5, `smallest was ${smallest}`);
  assert.ok(largest >= 12.5 && largest <= 13, `largest was ${largest}`);
});

test("getVortexStarPointSize: 밝은 별과 가까운 별의 크기 대비를 강화한다", () => {
  const { getVortexStarPointSize } = vortexField as ThreeDimensionalVortexField;
  assert.equal(typeof getVortexStarPointSize, "function");
  if (!getVortexStarPointSize) return;

  const regular = getVortexStarPointSize(1.5, false, 1);
  const flare = getVortexStarPointSize(1.5, true, 1);
  const far = getVortexStarPointSize(1.5, false, 0.2);
  const near = getVortexStarPointSize(1.5, false, 2);

  assert.ok(flare / regular >= 1.8 && flare / regular <= 2.4);
  assert.ok(near / far >= 2.7);
});

test("getVortexStarLightProfile: 주변 별의 밝은 핵과 부드러운 외곽을 넓힌다", () => {
  const { getVortexStarLightProfile } = vortexField as ThreeDimensionalVortexField;
  assert.equal(typeof getVortexStarLightProfile, "function");
  if (!getVortexStarLightProfile) return;

  const orbit = getVortexStarLightProfile("orbit");
  const core = getVortexStarLightProfile("core");

  assert.ok(orbit.hotCoreRadius >= 0.38);
  assert.ok(orbit.softCoreRadius >= 0.82);
  assert.ok(orbit.alphaBoost >= 1.3);
  assert.ok(orbit.hotCoreRadius > core.hotCoreRadius);
  assert.ok(orbit.softCoreRadius > core.softCoreRadius);
});

test("getVortexStarLightProfile: 큰 별의 광선을 더 선명하고 길게 만든다", () => {
  const { getVortexStarLightProfile } = vortexField as ThreeDimensionalVortexField;
  assert.equal(typeof getVortexStarLightProfile, "function");
  if (!getVortexStarLightProfile) return;

  const orbit = getVortexStarLightProfile("orbit");

  assert.ok(orbit.rayStrength >= 0.8);
  assert.ok(orbit.raySharpness >= 70);
  assert.ok(orbit.edgeFadeStart >= 0.8);
  assert.ok(orbit.flareCoreScale <= 0.72);
});
