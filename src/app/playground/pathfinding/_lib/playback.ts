type PlaybackEnvironment = {
  schedule: (callback: () => void, delay: number) => number;
  cancel: (handle: number) => void;
  isHidden: () => boolean;
  isReduced: () => boolean;
  onVisibility: (callback: () => void) => () => void;
  onMotion: (callback: () => void) => () => void;
  onTick: () => void;
  onPause: () => void;
  onFinish: () => void;
};

/** Owns exactly one timer; a stopped run cannot restart from a late callback. */
export function startPlayback(env: PlaybackEnvironment, delay: number): () => void {
  let stopped = false;
  let timer: number | null = null;
  const cancel = () => {
    if (timer !== null) env.cancel(timer);
    timer = null;
  };
  const sync = () => {
    if (stopped) return;
    if (env.isHidden() || env.isReduced()) {
      stopped = true;
      cancel();
      if (env.isHidden()) env.onPause();
      else env.onFinish();
    }
  };
  const tick = () => {
    timer = null;
    sync();
    if (stopped) return;
    env.onTick();
    if (!stopped) timer = env.schedule(tick, delay);
  };
  const offVisibility = env.onVisibility(sync);
  const offMotion = env.onMotion(sync);
  // Initial visibility/motion checks happen at the first scheduled tick too.
  timer = env.schedule(tick, delay);
  return () => {
    stopped = true;
    cancel();
    offVisibility();
    offMotion();
  };
}
