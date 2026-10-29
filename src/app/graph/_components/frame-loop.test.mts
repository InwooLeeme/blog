import assert from "node:assert/strict";
import test from "node:test";
import { createFrameLoop } from "./frame-loop.ts";

type FrameCallback = (time: number) => void;

function createScheduler() {
  let nextId = 1;
  const callbacks = new Map<number, FrameCallback>();
  const cancelled: number[] = [];

  return {
    callbacks,
    cancelled,
    requestFrame(callback: FrameCallback) {
      const id = nextId++;
      callbacks.set(id, callback);
      return id;
    },
    cancelFrame(id: number) {
      cancelled.push(id);
      callbacks.delete(id);
    },
    run(id: number, time: number) {
      const callback = callbacks.get(id);
      assert.ok(callback, `frame ${id} should be pending`);
      callbacks.delete(id);
      callback(time);
    },
  };
}

test("createFrameLoop: repeated start schedules only one frame", () => {
  const scheduler = createScheduler();
  const frameTimes: number[] = [];
  const loop = createFrameLoop({
    requestFrame: scheduler.requestFrame,
    cancelFrame: scheduler.cancelFrame,
    onFrame: (time) => frameTimes.push(time),
  });

  loop.start();
  loop.start();

  assert.deepEqual([...scheduler.callbacks.keys()], [1]);
  scheduler.run(1, 16);
  assert.deepEqual(frameTimes, [16]);
  assert.deepEqual([...scheduler.callbacks.keys()], [2]);
});

test("createFrameLoop: stop cancels the pending frame and allows restart", () => {
  const scheduler = createScheduler();
  const loop = createFrameLoop({
    requestFrame: scheduler.requestFrame,
    cancelFrame: scheduler.cancelFrame,
    onFrame: () => {},
  });

  loop.start();
  loop.stop();

  assert.deepEqual(scheduler.cancelled, [1]);
  assert.equal(scheduler.callbacks.size, 0);

  loop.start();
  assert.deepEqual([...scheduler.callbacks.keys()], [2]);
});

test("createFrameLoop: destroy cancels work and permanently prevents restart", () => {
  const scheduler = createScheduler();
  const loop = createFrameLoop({
    requestFrame: scheduler.requestFrame,
    cancelFrame: scheduler.cancelFrame,
    onFrame: () => {},
  });

  loop.start();
  loop.destroy();
  loop.start();

  assert.deepEqual(scheduler.cancelled, [1]);
  assert.equal(scheduler.callbacks.size, 0);
});

test("frame limit skips work between intervals and resets time on resume", () => {
  const scheduler = createScheduler();
  const times: number[] = [];
  const loop = createFrameLoop({requestFrame:scheduler.requestFrame,cancelFrame:scheduler.cancelFrame,onFrame:t=>times.push(t), intervalMs: 1000/30});
  loop.start();
  for (const t of [0,16,34,50,68]) scheduler.run([...scheduler.callbacks.keys()][0],t);
  assert.deepEqual(times,[0,34,68]);
  loop.stop();loop.start();scheduler.run([...scheduler.callbacks.keys()][0],70);
  assert.deepEqual(times,[0,34,68,70]);
  loop.destroy();assert.equal(scheduler.callbacks.size,0);
});

test("frame limit carries timing jitter forward instead of lowering the target rate", () => {
  const scheduler=createScheduler(); let frames=0;
  const loop=createFrameLoop({requestFrame:scheduler.requestFrame,cancelFrame:scheduler.cancelFrame,onFrame:()=>frames++,intervalMs:1000/30});
  loop.start();
  for(let t=0;t<2000;t+=17) scheduler.run([...scheduler.callbacks.keys()][0],t);
  assert.ok(frames>=59 && frames<=61, `expected about 60 frames in two seconds, got ${frames}`);
  loop.destroy();
});
