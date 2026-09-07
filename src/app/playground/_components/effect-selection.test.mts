import assert from "node:assert/strict";
import test from "node:test";
import * as selection from "./effect-selection.ts";
import { getEffectIdFromSearch, resolveEffectId, stepEffectId, withEffectId } from "./effect-selection.ts";

const ids = ["cluster", "meteor-sky", "warp"];

function historyFixture(initial: string) {
  const events = new EventTarget();
  const entries = [initial];
  let index = 0;
  const location = { href: initial };
  const history = {
    pushState(_state: unknown, _unused: string, href?: string | URL | null) {
      if (href == null) return;
      location.href = new URL(href, location.href).href;
      entries.splice(++index, entries.length, location.href);
    },
    replaceState(_state: unknown, _unused: string, href?: string | URL | null) {
      if (href == null) return;
      location.href = new URL(href, location.href).href;
      entries[index] = location.href;
    },
  };
  const target = Object.assign(events, { location, history });
  return { target, go(delta: number) { index += delta; location.href = entries[index]; events.dispatchEvent(new Event("popstate")); } };
}

test("effect history handler: 외부 같은 경로 push 후 Back의 효과 전환을 처리한다", () => {
  assert.equal(typeof selection.subscribeEffectHistory, "function");
  const { target, go } = historyFixture("https://example.com/playground?effect=warp");
  let selected = "";
  const stop = selection.subscribeEffectHistory(target, () => { selected = target.location.href; });
  let propagated = 0;
  target.addEventListener("popstate", () => propagated++);
  target.history.pushState({}, "", "/playground");
  go(-1);
  assert.equal(propagated, 0);
  assert.equal(selected, "https://example.com/playground?effect=warp");
  stop();
});

test("effect history handler: 외부 push 이후 go(-2)의 다른 query와 hash 이동은 전달한다", async () => {
  assert.equal(typeof selection.subscribeEffectHistory, "function");
  const { target, go } = historyFixture("https://example.com/playground?effect=aurora&lang=ko#stage");
  const stop = selection.subscribeEffectHistory(target, () => {});
  let observedHash = "#stage";
  target.addEventListener("hashchange", () => { observedHash = new URL(target.location.href).hash; });
  let propagated = 0;
  target.addEventListener("popstate", () => propagated++);
  target.history.pushState({}, "", "/playground?effect=warp&lang=ko#stage");
  target.history.pushState({}, "", "/playground");
  assert.equal(observedHash, "#stage", "Next insertion effect 안에서는 hash 구독 업데이트를 실행하지 않는다");
  await Promise.resolve();
  assert.equal(observedHash, "", "전역 hash 구독이 외부 push의 hash 제거를 먼저 관측해야 한다");
  go(-2);
  assert.equal(propagated, 1);
  assert.equal(target.location.href, "https://example.com/playground?effect=aurora&lang=ko#stage");
  stop();
});

test("effect history handler: replaceState와 pop 정규화를 추적하고 구독 해제 뒤 전파를 복원한다", () => {
  assert.equal(typeof selection.subscribeEffectHistory, "function");
  const { target, go } = historyFixture("https://example.com/playground?effect=warp");
  const originalPush = target.history.pushState;
  const originalReplace = target.history.replaceState;
  const stop = selection.subscribeEffectHistory(target, () => {
    if (!new URL(target.location.href).searchParams.has("effect")) target.history.replaceState({}, "", "?effect=cluster");
  });
  let propagated = 0;
  target.addEventListener("popstate", () => propagated++);
  target.history.pushState({}, "", "?effect=aurora&lang=ko#stage");
  target.history.replaceState({}, "", "/playground");
  go(-1);
  assert.equal(propagated, 0);
  go(1);
  assert.equal(target.location.href, "https://example.com/playground?effect=cluster");
  go(-1);
  assert.equal(propagated, 0);
  stop();
  assert.equal(target.history.pushState, originalPush);
  assert.equal(target.history.replaceState, originalReplace);
  go(1);
  assert.equal(propagated, 1);
});

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
