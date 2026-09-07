import assert from "node:assert/strict";
import test from "node:test";
import { createCanvasAnimationController } from "./canvas-animation-controller.ts";

test("createCanvasAnimationController: 정리 뒤 전달된 교차 콜백은 프레임을 예약하지 않는다", () => {
  const pendingFrames = new Map<number, FrameRequestCallback>();
  let nextFrameId = 0;
  const controller = createCanvasAnimationController({
    getVisibilityState: () => "visible",
    onFrame: () => {},
    requestFrame: (callback) => {
      const id = ++nextFrameId;
      pendingFrames.set(id, callback);
      return id;
    },
    cancelFrame: (id) => pendingFrames.delete(id),
  });

  const deliverQueuedIntersection = () => controller.setIntersecting(true);
  controller.dispose();
  deliverQueuedIntersection();

  assert.equal(pendingFrames.size, 0);
});

test("createCanvasAnimationController: 초기 reduced-motion이면 교차 후에도 프레임을 예약하지 않는다", () => {
  const pendingFrames = new Map<number, FrameRequestCallback>();
  let nextFrameId = 0;
  const controller = createCanvasAnimationController({
    getVisibilityState: () => "visible",
    reducedMotion: true,
    onFrame: () => {},
    requestFrame: (callback) => {
      const id = ++nextFrameId;
      pendingFrames.set(id, callback);
      return id;
    },
    cancelFrame: (id) => pendingFrames.delete(id),
  });

  controller.setIntersecting(true);

  assert.equal(pendingFrames.size, 0);
});
