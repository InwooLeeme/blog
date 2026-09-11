import assert from "node:assert/strict";
import test from "node:test";
import {
  fitCanvasDpr,
  getParticlePolicy,
  isPointInsideRect,
  shouldRenderParticleFrame,
  shouldAnimateParticleHero,
} from "./particle-policy.ts";
import * as particlePolicy from "./particle-policy.ts";

type WebglParticlePolicy = typeof particlePolicy & {
  fitWebglDpr?: (width: number, height: number, requestedDpr: number) => number;
};

test("fitCanvasDpr: 큰 히어로는 백킹 캔버스 픽셀 예산을 넘지 않는다", () => {
  const dpr = fitCanvasDpr(1026, 844, 1.75);

  assert.ok(1026 * 844 * dpr * dpr <= 480_001);
  assert.ok(dpr > 0 && dpr < 1);
});

test("fitCanvasDpr: 작은 모바일 캔버스는 정책 DPR을 유지한다", () => {
  assert.equal(fitCanvasDpr(367, 444, 1.5), 1.5);
});

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
    dpr: 1.5,
    maxParticles: 2400,
    sampleGap: 6,
  });
});

test("getParticlePolicy: 데스크톱 예산과 DPR을 제한한다", () => {
  assert.deepEqual(getParticlePolicy(1440, 2), {
    dpr: 1.75,
    maxParticles: 5600,
    sampleGap: 5,
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

test("isPointInsideRect: 경계 안쪽과 바깥쪽을 구분한다", () => {
  const rect = { left: 10, top: 20, right: 110, bottom: 220 };
  assert.equal(isPointInsideRect({ x: 10, y: 20 }, rect), true);
  assert.equal(isPointInsideRect({ x: 110, y: 220 }, rect), true);
  assert.equal(isPointInsideRect({ x: 9, y: 20 }, rect), false);
  assert.equal(isPointInsideRect({ x: 50, y: 221 }, rect), false);
});
