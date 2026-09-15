import assert from "node:assert/strict";
import test from "node:test";
import { subscribeTocViewport } from "./toc-viewport.ts";

test("viewport changes activate only the visible TOC and release its subscriptions", () => {
  const media = Object.assign(new EventTarget(), { matches: false });
  const active = new Set<string>();
  const starts: string[] = [];
  const mount = (name: string) => () => {
    assert.equal(active.has(name), false);
    active.add(name);
    starts.push(name);
    return () => { active.delete(name); };
  };
  const stopDesktop = subscribeTocViewport(media, true, mount("desktop"));
  const stopMobile = subscribeTocViewport(media, false, mount("mobile"));
  assert.deepEqual([...active], ["mobile"]);

  media.matches = true;
  media.dispatchEvent(new Event("change"));
  assert.deepEqual([...active], ["desktop"]);
  media.dispatchEvent(new Event("change"));
  assert.deepEqual(starts, ["mobile", "desktop"]);

  media.matches = false;
  media.dispatchEvent(new Event("change"));
  assert.deepEqual([...active], ["mobile"]);
  stopDesktop();
  stopMobile();
  assert.equal(active.size, 0);
  media.matches = true;
  media.dispatchEvent(new Event("change"));
  assert.equal(active.size, 0);
});
