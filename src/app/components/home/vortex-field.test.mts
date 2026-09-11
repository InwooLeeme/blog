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
  getVortexFlowMotion?: (
    angularSpeed: number,
    phase: number,
    elapsedSeconds: number,
  ) => { angleOffset: number; opacity: number };
  getVortexFlowProfile?: (radiusRatio: number) => {
    angularSpeed: number;
    inwardSpeed: number;
  };
  getVortexFlowRadius?: (
    radiusRatio: number,
    inwardSpeed: number,
    elapsedSeconds: number,
  ) => number;
  getVortexFieldRadius?: (width: number, height: number) => number;
  getVortexHaloStyle?: (
    tier: "dust" | "star" | "highlight" | "flare",
  ) => { scale: number; brightnessScale: number; flareMix: number } | null;
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

test("getVortexFlowMotion: 별은 나선팔 안에서 이동하고 경계에서 투명하게 순환한다", () => {
  const { getVortexFlowMotion } = vortexField as ThreeDimensionalVortexField;
  assert.equal(typeof getVortexFlowMotion, "function");
  if (!getVortexFlowMotion) return;

  assert.equal(getVortexFlowMotion(-0.1, Math.PI, 0).angleOffset, 0);
  const times = [0, 8, 20, 60];
  const offsets = times.map((time) =>
    getVortexFlowMotion(-0.1, Math.PI, time).angleOffset,
  );
  assert.ok(offsets.every(Number.isFinite));
  assert.ok(offsets.every((offset, index) =>
    Math.abs(offset + 0.026 * times[index]) <= 0.46,
  ));

  const beforeReset = getVortexFlowMotion(-0.1, 0, 5.9);
  assert.ok(beforeReset.opacity < 0.25);
  assert.ok(beforeReset.opacity >= 0);
});

test("getVortexFlowProfile: 중심부는 외곽보다 빠르게 돌면서 안쪽으로 흐른다", () => {
  const { getVortexFlowProfile } = vortexField as ThreeDimensionalVortexField;
  assert.equal(typeof getVortexFlowProfile, "function");
  if (!getVortexFlowProfile) return;

  const inner = getVortexFlowProfile(0.12);
  const middle = getVortexFlowProfile(0.55);
  const outer = getVortexFlowProfile(0.95);

  assert.ok(inner.angularSpeed < middle.angularSpeed);
  assert.ok(middle.angularSpeed < outer.angularSpeed);
  assert.ok(inner.angularSpeed <= -0.09);
  assert.ok(outer.angularSpeed <= -0.02);
  assert.ok(Math.abs(inner.angularSpeed) > Math.abs(outer.angularSpeed) * 3);
  assert.ok([inner, middle, outer].every((flow) => flow.inwardSpeed > 0));
  assert.ok(inner.inwardSpeed > outer.inwardSpeed);
});

test("createVortexSeeds: 같은 반경대의 별도 서로 다른 속도로 흘러 원판처럼 고정되지 않는다", () => {
  const { getVortexFlowProfile } = vortexField as ThreeDimensionalVortexField;
  assert.equal(typeof getVortexFlowProfile, "function");
  if (!getVortexFlowProfile) return;

  const speedRatios = createVortexSeeds(5600, 23)
    .filter((star) => star.radiusRatio >= 0.48 && star.radiusRatio <= 0.52)
    .map((star) => star.angularSpeed / getVortexFlowProfile(star.radiusRatio).angularSpeed);

  assert.ok(speedRatios.length > 150);
  assert.ok(Math.max(...speedRatios) - Math.min(...speedRatios) >= 0.5);
});

test("getVortexFlowRadius: 첫 프레임의 외곽 별을 순간적으로 중심에 보내지 않는다", () => {
  const { getVortexFlowRadius } = vortexField as ThreeDimensionalVortexField;
  assert.equal(typeof getVortexFlowRadius, "function");
  if (!getVortexFlowRadius) return;

  assert.equal(getVortexFlowRadius(1, 0.002, 0), 1);
  const after = getVortexFlowRadius(1, 0.002, 20);
  assert.ok(after < 1 && after > 0.9);
});

test("createVortexSeeds: 요청한 수만큼 결정적인 별 궤도를 만든다", () => {
  const first = createVortexSeeds(420, 20260909);
  const second = createVortexSeeds(420, 20260909);

  assert.equal(first.length, 420);
  assert.deepEqual(first, second);
});

test("createVortexSeeds: 별의 반경·밝기·크기·색상 범위를 제한한다", () => {
  const stars = createVortexSeeds(420, 17);

  assert.ok(stars.every((star) => star.radiusRatio >= 0.08 && star.radiusRatio <= 1));
  assert.ok(stars.every((star) => star.brightness >= 0.04 && star.brightness <= 1));
  assert.ok(stars.every((star) => star.size >= 0.16 && star.size <= 3));
  assert.ok(stars.every((star) => [0, 1, 2].includes(star.colorIndex)));
  assert.ok(stars.every((star) => star.depthRatio >= -0.1 && star.depthRatio <= 0.1));
  assert.ok(stars.some((star) => star.depthRatio < -0.02));
  assert.ok(stars.some((star) => star.depthRatio > 0.02));
});

test("createVortexSeeds: 어두운 먼지·일반 별·하이라이트·플레어의 대비를 만든다", () => {
  const stars = createVortexSeeds(5600);
  const countTier = (tier: string) => stars.filter((star) => star.lightTier === tier).length;
  assert.ok(countTier("dust") > stars.length * 0.65);
  assert.ok(countTier("star") > stars.length * 0.15);
  assert.ok(countTier("highlight") > stars.length * 0.045);
  assert.ok(countTier("highlight") < stars.length * 0.08);
  assert.ok(countTier("flare") > stars.length * 0.01);
  assert.ok(countTier("flare") < stars.length * 0.025);
  assert.ok(stars.filter((star) => star.colorIndex === 0).length > stars.length * 0.6);
  assert.ok(stars.every((star) => star.flare === (star.lightTier === "flare")));

  const brightIndexes = stars
    .map((star, index) => star.lightTier === "flare" ? index : -1)
    .filter((index) => index >= 0);
  const flareGaps = brightIndexes.slice(1).map((index, position) => index - brightIndexes[position]);
  assert.ok(new Set(flareGaps).size > 5, "flare spacing should be irregular");

  const radialBins = Array.from({ length: 60 }, () => 0);
  stars.forEach((star, index) => {
    if (star.lightTier !== "highlight" && star.lightTier !== "flare") return;
    const arm = index % 3;
    const radialBin = Math.min(19, Math.floor(((star.radiusRatio - 0.08) / 0.92) * 20));
    const bin = arm * 20 + radialBin;
    radialBins[bin] += 1;
  });
  const binMean = radialBins.reduce((sum, count) => sum + count, 0) / radialBins.length;
  const binDeviation = Math.sqrt(
    radialBins.reduce((sum, count) => sum + (count - binMean) ** 2, 0)
      / radialBins.length,
  );
  assert.ok(binDeviation / binMean > 0.6, "bright stars should gather into knots");
});

test("createVortexSeeds: 먼지와 일반 별이 나선 팔을 잇는 중간톤을 만든다", () => {
  const stars = createVortexSeeds(5600);
  const mean = (tier: "dust" | "star", field: "brightness" | "size") => {
    const selected = stars.filter((star) => star.lightTier === tier);
    return selected.reduce((sum, star) => sum + star[field], 0) / selected.length;
  };

  assert.ok(mean("dust", "brightness") >= 0.14);
  assert.ok(mean("dust", "brightness") <= 0.18);
  assert.ok(mean("star", "brightness") >= 0.36);
  assert.ok(mean("star", "brightness") <= 0.43);
  assert.ok(mean("dust", "size") >= 0.34);
  assert.ok(mean("star", "size") >= 0.6);
});

test("getVortexFieldRadius: 외곽 나선이 화면 가장자리까지 뻗도록 전체 반경을 유지한다", () => {
  const { getVortexFieldRadius } = vortexField as ThreeDimensionalVortexField;
  assert.equal(typeof getVortexFieldRadius, "function");
  if (!getVortexFieldRadius) return;

  assert.equal(getVortexFieldRadius(1000, 1000), 500);
  assert.equal(getVortexFieldRadius(400, 800), 260);
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

test("advanceVortexOrbit: 눈에 띄게 움직인 뒤에도 세 나선팔의 위상 응집도를 유지한다", () => {
  let stars = createVortexSeeds(420, 20260909).map((star) => ({
    angle: star.angle,
    radiusRatio: star.radiusRatio,
    angularSpeed: star.angularSpeed,
    inwardSpeed: star.inwardSpeed,
  }));

  for (let frame = 0; frame < 160; frame += 1) {
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

  assert.ok(concentration > 0.65, `arm concentration was ${concentration}`);
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

test("getVortexStarPointSize: 밝은 별과 가까운 별의 크기 대비를 강화한다", () => {
  const { getVortexStarPointSize } = vortexField as ThreeDimensionalVortexField;
  assert.equal(typeof getVortexStarPointSize, "function");
  if (!getVortexStarPointSize) return;

  const regular = getVortexStarPointSize(1.5, false, 1);
  const flare = getVortexStarPointSize(1.5, true, 1);
  const far = getVortexStarPointSize(1.5, false, 0.2);
  const near = getVortexStarPointSize(1.5, false, 2);

  assert.ok(flare / regular >= 1.3 && flare / regular <= 1.7);
  assert.ok(near / far >= 2.7);
});

test("getVortexStarLightProfile: 주변은 어둡게 두고 밝은 별과 중심의 대비를 유지한다", () => {
  const { getVortexStarLightProfile } = vortexField as ThreeDimensionalVortexField;
  assert.equal(typeof getVortexStarLightProfile, "function");
  if (!getVortexStarLightProfile) return;

  assert.ok(getVortexStarLightProfile("orbit").alphaBoost >= 1.05);
  assert.ok(getVortexStarLightProfile("orbit").alphaBoost <= 1.2);
  assert.ok(getVortexStarLightProfile("orbit").rayStrength >= 0.4);
  assert.ok(getVortexStarLightProfile("core").alphaBoost >= 1.35);
});

test("getVortexHaloStyle: 일반 별부터 단계적으로 넓은 확산광을 적용한다", () => {
  const { getVortexHaloStyle } = vortexField as ThreeDimensionalVortexField;
  assert.equal(typeof getVortexHaloStyle, "function");
  if (!getVortexHaloStyle) return;

  const star = getVortexHaloStyle("star");
  const highlight = getVortexHaloStyle("highlight");
  const flare = getVortexHaloStyle("flare");
  assert.equal(getVortexHaloStyle("dust"), null);
  assert.ok(star && star.scale >= 2 && star.scale <= 2.4);
  assert.ok(highlight && highlight.scale >= 2.6 && highlight.scale <= 3);
  assert.ok(flare && flare.scale >= 3 && flare.scale <= 3.4);
  assert.ok(star && star.brightnessScale >= 0.45);
  assert.equal(flare?.flareMix, 1);
});
