import assert from "node:assert/strict";
import test from "node:test";
import { createScrollSubscriber } from "./scroll-subscriber.ts";

type Listener = () => void;

function createHarness() {
  const listeners = new Set<Listener>();
  const frames = new Map<number, () => void>();
  const cancelled: number[] = [];
  let nextFrameId = 1;

  return {
    target: {
      addEventListener(_type: "scroll", listener: Listener) {
        listeners.add(listener);
      },
      removeEventListener(_type: "scroll", listener: Listener) {
        listeners.delete(listener);
      },
    },
    requestFrame(callback: () => void) {
      const id = nextFrameId++;
      frames.set(id, callback);
      return id;
    },
    cancelFrame(id: number) {
      cancelled.push(id);
      frames.delete(id);
    },
    emitScroll() {
      for (const listener of listeners) listener();
    },
    runFrame(id: number) {
      const callback = frames.get(id);
      assert.ok(callback, `frame ${id} should be pending`);
      frames.delete(id);
      callback();
    },
    listeners,
    frames,
    cancelled,
  };
}

test("createScrollSubscriber: shares one listener across subscribers", () => {
  const harness = createHarness();
  const subscriber = createScrollSubscriber(harness);
  const firstNotifications: number[] = [];
  const secondNotifications: number[] = [];

  const unsubscribeFirst = subscriber.subscribe(() => firstNotifications.push(1));
  const unsubscribeSecond = subscriber.subscribe(() => secondNotifications.push(1));

  assert.equal(harness.listeners.size, 1);
  harness.emitScroll();
  harness.emitScroll();
  assert.deepEqual([...harness.frames.keys()], [1]);

  harness.runFrame(1);
  assert.deepEqual(firstNotifications, [1]);
  assert.deepEqual(secondNotifications, [1]);

  unsubscribeFirst();
  assert.equal(harness.listeners.size, 1);
  unsubscribeSecond();
  assert.equal(harness.listeners.size, 0);
});

test("createScrollSubscriber: cancels a pending frame after the last unsubscribe", () => {
  const harness = createHarness();
  const subscriber = createScrollSubscriber(harness);
  const unsubscribe = subscriber.subscribe(() => {});

  harness.emitScroll();
  unsubscribe();

  assert.deepEqual(harness.cancelled, [1]);
  assert.equal(harness.frames.size, 0);
});
