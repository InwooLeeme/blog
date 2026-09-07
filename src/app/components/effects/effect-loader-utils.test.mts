import assert from "node:assert/strict";
import test from "node:test";
import { createRetryableLoader } from "../retryable-loader.ts";
import { createEffectLoaderRegistry, createLazyComponentFactory } from "./effect-loader-utils.ts";

test("createEffectLoaderRegistry: catalog 밖의 상속 속성은 null을 반환한다", () => {
  const clusterLoader = { load: async () => "cluster" };
  const registry = createEffectLoaderRegistry({ cluster: clusterLoader });

  assert.equal(registry.getEffectLoader("cluster"), clusterLoader);
  assert.equal(registry.getEffectLoader("toString"), null);
  assert.equal(registry.getEffectLoader("__proto__"), null);
});

test("createLazyComponentFactory: 실패한 로더는 새 lazy 타입에서 다시 시도한다", async () => {
  let attempts = 0;
  const loader = createRetryableLoader(async () => {
    attempts += 1;
    if (attempts === 1) throw new Error("temporary failure");
    return "loaded";
  });
  const createLazyEffect = createLazyComponentFactory((load) => ({ load }), loader);

  const failedLazyEffect = createLazyEffect();
  await assert.rejects(failedLazyEffect.load(), /temporary failure/);

  const retriedLazyEffect = createLazyEffect();
  assert.notEqual(retriedLazyEffect, failedLazyEffect);
  assert.equal(await retriedLazyEffect.load(), "loaded");
  assert.equal(attempts, 2);
});
