import { shouldAnimateCanvas } from "./canvas-policy.ts";

type CanvasAnimationControllerOptions = {
  getVisibilityState: () => DocumentVisibilityState;
  reducedMotion: boolean;
  onFrame: (dt: number, time: number) => void;
  requestFrame: (callback: FrameRequestCallback) => number;
  cancelFrame: (id: number) => void;
};

export function createCanvasAnimationController({
  getVisibilityState,
  reducedMotion: initialReducedMotion,
  onFrame,
  requestFrame,
  cancelFrame,
}: CanvasAnimationControllerOptions) {
  let disposed = false;
  let intersecting = false;
  let reducedMotion = initialReducedMotion;
  let rafId: number | null = null;
  let lastTime = 0;

  const stop = () => {
    if (rafId !== null) cancelFrame(rafId);
    rafId = null;
    lastTime = 0;
  };
  const start = () => {
    if (disposed || rafId !== null) return;
    lastTime = 0;
    rafId = requestFrame(tick);
  };
  const canAnimate = () =>
    shouldAnimateCanvas({ intersecting, visibilityState: getVisibilityState(), reducedMotion });
  const tick = (time: number) => {
    rafId = null;
    if (disposed || !canAnimate()) return;

    const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
    lastTime = time;
    onFrame(dt, time);
    if (canAnimate() && !disposed) rafId = requestFrame(tick);
  };
  const sync = () => {
    if (disposed) return;
    if (canAnimate()) start();
    else stop();
  };

  return {
    setIntersecting(next: boolean) {
      if (disposed) return;
      intersecting = next;
      sync();
    },
    setReducedMotion(next: boolean) {
      if (disposed) return;
      reducedMotion = next;
      sync();
    },
    sync,
    dispose() {
      if (disposed) return;
      disposed = true;
      stop();
    },
  };
}
