import assert from "node:assert/strict";
import test from "node:test";
import { startPlayback } from "./playback.ts";

function fixture() {
  let hidden = false, reduced = false, ticks = 0, pauses = 0, finishes = 0, id = 0;
  const timers = new Map<number, () => void>();
  const visibility = new Set<() => void>(), motion = new Set<() => void>();
  const stop = startPlayback({
    schedule: (callback) => { timers.set(++id, callback); return id; },
    cancel: (handle) => { timers.delete(handle); },
    isHidden: () => hidden, isReduced: () => reduced,
    onVisibility: (callback) => { visibility.add(callback); return () => { visibility.delete(callback); }; },
    onMotion: (callback) => { motion.add(callback); return () => { motion.delete(callback); }; },
    onTick: () => { ticks++; }, onPause: () => { pauses++; }, onFinish: () => { finishes++; },
  }, 45);
  return {
    timers, visibility, motion, stop,
    counts: () => ({ ticks, pauses, finishes }),
    tick: () => { const [handle, callback] = [...timers][0]; timers.delete(handle); callback(); },
    hide: () => { hidden = true; visibility.forEach((callback) => callback()); },
    reduce: () => { reduced = true; motion.forEach((callback) => callback()); },
  };
}

test("재생 수명주기: 한 개의 타이머만 예약하고 숨김 시 정지한다", () => {
  const f = fixture();
  assert.equal(f.timers.size, 1);
  f.tick(); f.tick();
  assert.equal(f.timers.size, 1);
  assert.equal(f.counts().ticks, 2);
  f.hide();
  assert.equal(f.timers.size, 0);
  assert.equal(f.counts().pauses, 1);
  f.stop();
});

test("재생 수명주기: 모션 감소 변경 시 끝내고 예약을 취소한다", () => {
  const f = fixture();
  f.reduce();
  assert.equal(f.counts().finishes, 1);
  assert.equal(f.timers.size, 0);
  f.stop();
});

test("재생 수명주기: 해제 후 늦은 콜백도 실행하지 않는다", () => {
  const f = fixture();
  const late = [...f.timers.values()][0];
  f.stop(); f.stop(); late();
  assert.deepEqual(f.counts(), { ticks: 0, pauses: 0, finishes: 0 });
  assert.equal(f.timers.size, 0);
  assert.equal(f.visibility.size, 0);
  assert.equal(f.motion.size, 0);
});
