import assert from "node:assert/strict";
import test from "node:test";
import { createEffectLoaderRegistry } from "./effect-loader-utils.ts";

test("createEffectLoaderRegistry: catalog 밖의 상속 속성은 null을 반환한다", () => {
  const clusterLoader = { load: async () => "cluster" };
  const registry = createEffectLoaderRegistry({ cluster: clusterLoader });

  assert.equal(registry.getEffectLoader("cluster"), clusterLoader);
  assert.equal(registry.getEffectLoader("toString"), null);
  assert.equal(registry.getEffectLoader("__proto__"), null);
});
