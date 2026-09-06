type FrameLoopOptions = {
  requestFrame: (callback: (time: number) => void) => number;
  cancelFrame: (id: number) => void;
  onFrame: (time: number) => void;
};

export function createFrameLoop({ requestFrame, cancelFrame, onFrame }: FrameLoopOptions) {
  let running = false;
  let destroyed = false;
  let frameId: number | null = null;

  const tick = (time: number) => {
    frameId = null;
    if (!running) return;

    onFrame(time);
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
      frameId = requestFrame(tick);
    },
    stop,
    destroy() {
      destroyed = true;
      stop();
    },
  };
}
