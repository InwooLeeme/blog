import assert from "node:assert/strict";
import test from "node:test";
import * as selection from "./effect-selection.ts";
import { getEffectIdFromSearch, resolveEffectId, stepEffectId, withEffectId } from "./effect-selection.ts";

const ids = ["cluster", "meteor-sky", "warp"];

test("effect history: 효과만 바뀐 이동을 처리하고 경로·해시·다른 쿼리 이동은 전달한다", () => {
  assert.equal(typeof selection.isEffectOnlyHistoryChange, "function");
  const previous = "https://example.com/playground?effect=warp&lang=ko#stage";
  const cases = [
    ["https://example.com/playground?effect=aurora&lang=ko#stage", true],
    ["https://example.com/playground?lang=ko#stage", true],
    ["https://example.com/playground?effect=missing&lang=ko#stage", true],
    [previous, false],
    ["https://example.com/about?effect=aurora&lang=ko#stage", false],
    ["https://example.com/playground?effect=aurora&lang=ko#other", false],
    ["https://example.com/playground?effect=aurora&lang=en#stage", false],
    ["https://example.com/playground?effect=aurora&lang=ko&tag=x#stage", false],
    ["https://other.example/playground?effect=aurora&lang=ko#stage", false],
  ] as const;
  for (const [next, expected] of cases) {
    assert.equal(selection.isEffectOnlyHistoryChange(previous, next), expected, next);
  }
  assert.equal(selection.isEffectOnlyHistoryChange("https://example.com/playground?lang=ko#stage", previous), true);
  assert.equal(selection.isEffectOnlyHistoryChange("https://example.com/playground?effect=warp&tag=a&tag=b", "https://example.com/playground?effect=aurora&tag=a&tag=c"), false);
});

test("effect query: 다른 쿼리와 해시를 보존하면서 효과 ID만 읽고 쓴다", () => {
  assert.equal(getEffectIdFromSearch("?effect=warp&lang=ko"), "warp");
  assert.equal(getEffectIdFromSearch("?lang=ko"), null);
  assert.equal(withEffectId("https://example.com/playground?lang=ko#stage", "warp"), "https://example.com/playground?lang=ko&effect=warp#stage");
  assert.equal(withEffectId("https://example.com/playground?effect=cluster&lang=ko#stage", "warp"), "https://example.com/playground?effect=warp&lang=ko#stage");
});

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
