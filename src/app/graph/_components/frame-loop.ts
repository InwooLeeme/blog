type FrameLoopOptions = {
  intervalMs?: number | (() => number);
  requestFrame: (callback: (time: number) => void) => number;
  cancelFrame: (id: number) => void;
  onFrame: (time: number) => void;
};

export function createFrameLoop({ requestFrame, cancelFrame, onFrame, intervalMs = 0 }: FrameLoopOptions) {
  let running = false;
  let lastTime: number | null = null;
  let destroyed = false;
  let frameId: number | null = null;

  const tick = (time: number) => {
    frameId = null;
    if (!running) return;

    const interval = typeof intervalMs === "function" ? intervalMs() : intervalMs;
    if (lastTime === null || time - lastTime >= interval - 0.5) {
      // Carry fractional frame time forward rather than dropping it on every tick.
      lastTime = lastTime === null || interval <= 0
        ? time
        : lastTime + Math.max(1, Math.floor((time - lastTime + .5) / interval)) * interval;
      onFrame(time);
    }
    if (running) frameId = requestFrame(tick);
  };

  const stop = () => {
    if (!running) return;
    running = false;
    if (frameId !== null) cancelFrame(frameId);
    frameId = null;
  };

  return {
    start() {
      if (running || destroyed) return;
      running = true;
      lastTime = null;
      frameId = requestFrame(tick);
    },
    stop,
    destroy() {
      destroyed = true;
      stop();
    },
  };
}
