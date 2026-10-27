import assert from "node:assert/strict";
import test from "node:test";
import { createMeteorFlight } from "./vortex-meteor.ts";

test("유성은 재현 가능하지만 차례마다 경로·길이·등장 간격이 달라진다", () => {
  const first = createMeteorFlight(0, 0, 4);
  assert.deepEqual(createMeteorFlight(0, 0, 4), first);
  const next = createMeteorFlight(0, 1, first.nextStart);
  assert.notEqual(next.x, first.x);
  assert.notEqual(next.length, first.length);
  assert.notEqual(next.nextStart - next.start, first.nextStart - first.start);
  for (let index = 0; index < 3; index++) {
    for (let sequence = 0; sequence < 100; sequence++) {
      const flight = createMeteorFlight(index, sequence, 4);
      assert.ok(flight.nextStart > flight.start + flight.duration + 8);
      assert.ok(flight.duration >= 1.6 && flight.duration <= 2.8);
      assert.ok(flight.length >= 80 && flight.length <= 130);
      assert.ok(flight.x >= 0.78 && flight.x <= 1.08);
      assert.ok(flight.y >= 0.65 && flight.y <= 0.98);
      assert.ok(Math.abs(Math.hypot(flight.dx, flight.dy) - 1) < 1e-10);
    }
  }
});
