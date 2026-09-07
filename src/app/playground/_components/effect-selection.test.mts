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

test("effect history handler: Header처럼 외부 push하면 Back 전에 선택과 새로고침 URL이 일치한다", async () => {
  const { target, go } = historyFixture("https://example.com/playground?effect=warp");
  let selected: string | null = "warp";
  let notifications = 0;
  const stop = selection.subscribeEffectHistory(target, () => {
    notifications++;
    const candidate = getEffectIdFromSearch(new URL(target.location.href).search);
    selected = resolveEffectId(candidate, ids);
    if (selected && candidate !== selected) target.history.replaceState({}, "", withEffectId(target.location.href, selected));
  });
  target.history.pushState({}, "", "/playground");
  assert.equal(selected, "warp", "Next insertion-effect 호출 스택에서는 선택을 업데이트하지 않는다");
  await Promise.resolve();
  assert.equal(selected, "cluster", "Back을 누르기 전에 외부 URL에 맞게 선택을 복원한다");
  assert.equal(target.location.href, "https://example.com/playground?effect=cluster");
  assert.equal(resolveEffectId(getEffectIdFromSearch(new URL(target.location.href).search), ids), selected, "새로고침 시 같은 효과를 선택한다");
  await Promise.resolve();
  assert.equal(notifications, 1, "정규화 replaceState가 알림을 재귀 예약하지 않는다");
  go(-1);
  assert.equal(selected, "warp", "정규화는 새 히스토리 항목을 만들지 않는다");
  go(1);
  assert.equal(selected, "cluster");
  stop();
});

test("effect history handler: 외부 replace를 반영하고 같은 URL 재선택은 알림을 반복하지 않는다", async () => {
  const { target } = historyFixture("https://example.com/playground?effect=warp");
  let selected = "warp";
  let notifications = 0;
  const stop = selection.subscribeEffectHistory(target, () => {
    notifications++;
    selected = new URL(target.location.href).searchParams.get("effect")!;
  });
  target.history.replaceState({}, "", "?effect=cluster");
  await Promise.resolve();
  assert.equal(selected, "cluster");
  target.history.pushState({}, "", "?effect=warp");
  await Promise.resolve();
  assert.equal(selected, "warp");
  target.history.replaceState({}, "", "?effect=warp");
  await Promise.resolve();
  assert.equal(notifications, 2);
  stop();
});

test("effect history handler: 해제하면 대기 중인 외부 write와 hash 알림도 취소한다", async () => {
  const { target } = historyFixture("https://example.com/playground?effect=warp#stage");
  const originalPush = target.history.pushState;
  const originalReplace = target.history.replaceState;
  let notifications = 0;
  let hashNotifications = 0;
  const stop = selection.subscribeEffectHistory(target, () => notifications++);
  target.addEventListener("hashchange", () => hashNotifications++);
  target.history.pushState({}, "", "/playground");
  stop();
  await Promise.resolve();
  assert.equal(notifications, 0);
  assert.equal(hashNotifications, 0);
  assert.equal(target.history.pushState, originalPush);
  assert.equal(target.history.replaceState, originalReplace);
  target.history.pushState({}, "", "?effect=cluster");
  await Promise.resolve();
  assert.equal(notifications, 0);
});

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
