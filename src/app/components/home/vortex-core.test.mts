import assert from "node:assert/strict";
import test from "node:test";
import { createVortexSeeds } from "./vortex-field.ts";
import * as vortexCore from "./vortex-core.ts";
import { getVortexCoreStyle } from "./vortex-core.ts";

type ClusterCore = typeof vortexCore & {
  createVortexCoreParticles?: (
    style: ReturnType<typeof getVortexCoreStyle>,
    seed?: number,
  ) => Array<{ x: number; y: number; z: number; size: number; brightness: number }>;
};

test("getVortexCoreStyle: 중심 항성을 주변 별보다 크지만 소용돌이를 가리지 않게 제한한다", () => {
  const style = getVortexCoreStyle(400);
  const largestOrbitStar = Math.max(
    ...createVortexSeeds(560, 20260909).map((star) => star.size),
  );

  assert.ok(style.coreRadius > largestOrbitStar);
  assert.ok(style.coreRadius <= largestOrbitStar * 4);
  assert.ok(style.coronaRadius > style.coreRadius);
  assert.ok(style.coronaRadius <= style.coreRadius * 2.8);
  assert.equal(style.coreColor, "#f2ffff");
});

test("getVortexCoreStyle: 단일 구체 대신 깊이가 있는 조밀한 항성군 값을 제공한다", () => {
  const style = getVortexCoreStyle(400);

  assert.ok(style.clusterParticleCount >= 48 && style.clusterParticleCount <= 96);
  assert.ok(style.clusterDepth >= style.coreRadius);
  assert.ok(style.clusterPointSize > 0 && style.clusterPointSize < style.coreRadius);
  assert.ok(style.rotationSpeed > 0 && style.rotationSpeed < 0.25);
  assert.notEqual(style.coreColor, style.edgeColor);
});

test("createVortexCoreParticles: 결정적인 구형 분포로 중심 항성의 앞뒤 깊이를 만든다", () => {
  const { createVortexCoreParticles } = vortexCore as ClusterCore;
  assert.equal(typeof createVortexCoreParticles, "function");
  if (!createVortexCoreParticles) return;

  const style = getVortexCoreStyle(400);
  const first = createVortexCoreParticles(style, 17);
  const second = createVortexCoreParticles(style, 17);

  assert.deepEqual(first, second);
  assert.equal(first.length, style.clusterParticleCount);
  assert.ok(first.some((particle) => particle.z > style.clusterDepth * 0.25));
  assert.ok(first.some((particle) => particle.z < -style.clusterDepth * 0.25));
  assert.ok(first.every((particle) => Math.hypot(particle.x, particle.y) <= style.coreRadius));
  assert.ok(first.every((particle) => particle.brightness >= 0.62));
});

test("getVortexCoreStyle: 비정상 반경에서도 유한한 최소 크기를 유지한다", () => {
  const style = getVortexCoreStyle(Number.NaN);

  assert.ok(Number.isFinite(style.coreRadius));
  assert.ok(Number.isFinite(style.coronaRadius));
  assert.ok(Number.isFinite(style.clusterDepth));
  assert.ok(style.coreRadius > 0);
});
