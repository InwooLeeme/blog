import assert from "node:assert/strict";
import test from "node:test";
import * as vortexField from "./vortex-field.ts";
import {
  createVortexSeeds,
} from "./vortex-field.ts";

type ThreeDimensionalVortexField = typeof vortexField & {
  getVortexFieldRadius?: (width: number, height: number) => number;
  getVortexHaloStyle?: (
    tier: "dust" | "star" | "highlight" | "flare",
  ) => { scale: number; brightnessScale: number; flareMix: number } | null;
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
