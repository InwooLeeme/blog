import assert from "node:assert/strict";
import test from "node:test";
import {
  getParticlePolicy,
  createParticleQuality,
  sampleParticleQuality,
  resetParticleQualitySamples,
  isPointInsideRect,
  shouldRenderParticleFrame,
  shouldAnimateParticleHero,
} from "./particle-policy.ts";
import * as particlePolicy from "./particle-policy.ts";

test("지속적인 프레임 저하에만 해상도를 낮추고 충분히 안정된 뒤 복구한다", () => {
  const quality = createParticleQuality();
  for (let i = 0; i < 50; i++) sampleParticleQuality(quality, 33);
  assert.equal(quality.scale, 1, "짧은 저하는 무시한다");
  for (let i = 0; i < 20; i++) sampleParticleQuality(quality, 33);
  assert.equal(quality.scale, 0.85);
  for (let i = 0; i < 300; i++) sampleParticleQuality(quality, 16.7);
  assert.equal(quality.scale, 0.85, "빠른 품질 왕복을 방지한다");
  for (let i = 0; i < 450; i++) sampleParticleQuality(quality, 16.7);
  assert.equal(quality.scale, 1);
});

test("품질 조절은 하한을 지키며 중단·복귀 시간을 성능 저하로 세지 않는다", () => {
  const quality = createParticleQuality();
  for (let i = 0; i < 400; i++) sampleParticleQuality(quality, 40);
  assert.equal(quality.scale, 0.7);
  resetParticleQualitySamples(quality);
  for (const gap of [5000, Number.NaN, 0, -1]) sampleParticleQuality(quality, gap);
  assert.equal(quality.scale, 0.7);
  for (let i = 0; i < 1250; i++) sampleParticleQuality(quality, 16.7);
  assert.equal(quality.scale, 1);
  for (let i = 0; i < 50; i++) sampleParticleQuality(quality, 33);
  resetParticleQualitySamples(quality);
  for (let i = 0; i < 20; i++) sampleParticleQuality(quality, 33);
  assert.equal(quality.scale, 1);
});

test("고주사율이나 간헐적인 긴 프레임은 해상도를 떨어뜨리지 않는다", () => {
  const quality = createParticleQuality();
  for (let i = 0; i < 1500; i++) sampleParticleQuality(quality, i % 200 === 0 ? 100 : 8.3);
  assert.equal(quality.scale, 1);
});

type WebglParticlePolicy = typeof particlePolicy & {
  fitWebglDpr?: (width: number, height: number, requestedDpr: number) => number;
};

test("fitWebglDpr: GPU 렌더링은 선명도를 유지하면서 픽셀 예산을 제한한다", () => {
  const { fitWebglDpr } = particlePolicy as WebglParticlePolicy;
  assert.equal(typeof fitWebglDpr, "function");
  if (!fitWebglDpr) return;

  const desktopDpr = fitWebglDpr(1026, 844, 2);
  assert.ok(desktopDpr >= 1);
  assert.ok(1026 * 844 * desktopDpr * desktopDpr <= 1_250_001);
  assert.equal(fitWebglDpr(367, 444, 1.5), 1.5);
  assert.equal(fitWebglDpr(0, 0, Number.NaN), 1);
});

test("getParticlePolicy: 모바일 예산과 DPR을 제한한다", () => {
  assert.deepEqual(getParticlePolicy(390, 3), {
    dpr: 1.25,
    maxParticles: 2400,
    nebulaTextureSize: 768,
  });
});

test("getParticlePolicy: 데스크톱 예산과 DPR을 제한한다", () => {
  assert.deepEqual(getParticlePolicy(1440, 2), {
    dpr: 1.75,
    maxParticles: 5600,
    nebulaTextureSize: 1536,
  });
});

test("getParticlePolicy: 767px와 768px에서 모바일·데스크톱 정책을 나눈다", () => {
  assert.equal(getParticlePolicy(767, 2).maxParticles, 2400);
  assert.equal(getParticlePolicy(768, 2).maxParticles, 5600);
});

test("getParticlePolicy: 비정상 DPR도 안전한 범위로 정규화한다", () => {
  assert.equal(getParticlePolicy(390, 0).dpr, 1);
  assert.equal(getParticlePolicy(1440, Number.POSITIVE_INFINITY).dpr, 1);
});

test("shouldAnimateParticleHero: 화면에 보이는 일반 모션 Canvas만 실행한다", () => {
  assert.equal(
    shouldAnimateParticleHero({
      intersecting: true,
      visibilityState: "visible",
      reducedMotion: false,
    }),
    true,
  );
  assert.equal(
    shouldAnimateParticleHero({
      intersecting: false,
      visibilityState: "visible",
      reducedMotion: false,
    }),
    false,
  );
  assert.equal(
    shouldAnimateParticleHero({
      intersecting: true,
      visibilityState: "hidden",
      reducedMotion: false,
    }),
    false,
  );
  assert.equal(
    shouldAnimateParticleHero({
      intersecting: true,
      visibilityState: "visible",
      reducedMotion: true,
    }),
    false,
  );
  assert.equal(
    shouldAnimateParticleHero({
      intersecting: true,
      visibilityState: "visible",
      reducedMotion: false,
      rendererAvailable: false,
    }),
    false,
  );
});

test("shouldRenderParticleFrame: 유휴 상태는 30fps, 상호작용 중에는 최대 60fps로 제한한다", () => {
  assert.equal(shouldRenderParticleFrame(16, false), false);
  assert.equal(shouldRenderParticleFrame(34, false), true);
  assert.equal(shouldRenderParticleFrame(8, true), false);
  assert.equal(shouldRenderParticleFrame(17, true), true);
});

test("모바일은 드래그하지 않아도 60fps 주기로 그리고 고밀도 화면 비용을 제한한다", () => {
  assert.equal(shouldRenderParticleFrame(17, false, true), true);
  assert.equal(shouldRenderParticleFrame(8, false, true), false);
  assert.equal(shouldRenderParticleFrame(17, true, true), true);
  const policy = getParticlePolicy(390, 3);
  const dpr = particlePolicy.fitWebglDpr(390, 400, policy.dpr);
  assert.ok(390 * 400 * dpr ** 2 <= 244_000);
  assert.ok(policy.nebulaTextureSize ** 2 * 4 < 3 * 1024 ** 2);
});

test("isPointInsideRect: 경계 안쪽과 바깥쪽을 구분한다", () => {
  const rect = { left: 10, top: 20, right: 110, bottom: 220 };
  assert.equal(isPointInsideRect({ x: 10, y: 20 }, rect), true);
  assert.equal(isPointInsideRect({ x: 110, y: 220 }, rect), true);
  assert.equal(isPointInsideRect({ x: 9, y: 20 }, rect), false);
  assert.equal(isPointInsideRect({ x: 50, y: 221 }, rect), false);
});
