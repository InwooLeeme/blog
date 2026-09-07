import assert from "node:assert/strict";
import test from "node:test";
import { resolveEffectId, stepEffectId } from "./effect-selection.ts";

const ids = ["cluster", "meteor-sky", "warp"];

test("resolveEffectId: 유효한 URL ID를 유지한다", () => {
  assert.equal(resolveEffectId("meteor-sky", ids), "meteor-sky");
});

test("resolveEffectId: 알 수 없거나 비어 있는 ID는 첫 효과로 복구한다", () => {
  assert.equal(resolveEffectId("missing", ids), "cluster");
  assert.equal(resolveEffectId(null, ids), "cluster");
  assert.equal(resolveEffectId("cluster", []), null);
});

test("stepEffectId: 양 끝을 넘지 않고 현재 효과를 기준으로 이동한다", () => {
  assert.equal(stepEffectId("cluster", -1, ids), "cluster");
  assert.equal(stepEffectId("cluster", 1, ids), "meteor-sky");
  assert.equal(stepEffectId("warp", 1, ids), "warp");
  assert.equal(stepEffectId("missing", 1, ids), "meteor-sky");
  assert.equal(stepEffectId("cluster", 1, []), null);
});
