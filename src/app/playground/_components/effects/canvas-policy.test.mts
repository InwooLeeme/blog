import assert from "node:assert/strict";
import test from "node:test";
import { shouldAnimateCanvas } from "./canvas-policy.ts";

test("shouldAnimateCanvas: 보이는 문서의 교차 중인 일반 모션 캔버스만 실행한다", () => {
  assert.equal(
    shouldAnimateCanvas({ intersecting: true, visibilityState: "visible", reducedMotion: false }),
    true,
  );
  assert.equal(
    shouldAnimateCanvas({ intersecting: false, visibilityState: "visible", reducedMotion: false }),
    false,
  );
  assert.equal(
    shouldAnimateCanvas({ intersecting: true, visibilityState: "hidden", reducedMotion: false }),
    false,
  );
  assert.equal(
    shouldAnimateCanvas({ intersecting: true, visibilityState: "visible", reducedMotion: true }),
    false,
  );
});
