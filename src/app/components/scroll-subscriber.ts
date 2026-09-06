type ScrollListener = () => void;

type ScrollSubscriberOptions = {
  target: {
    addEventListener: (
      type: "scroll",
      listener: ScrollListener,
      options?: AddEventListenerOptions,
    ) => void;
    removeEventListener: (type: "scroll", listener: ScrollListener) => void;
  };
  requestFrame: (callback: ScrollListener) => number;
  cancelFrame: (id: number) => void;
};

export function createScrollSubscriber({
  target,
  requestFrame,
  cancelFrame,
}: ScrollSubscriberOptions) {
  const subscribers = new Set<ScrollListener>();
  let frameId: number | null = null;

  const notify = () => {
    frameId = null;
    for (const subscriber of subscribers) subscriber();
  };

  const schedule = () => {
    if (frameId === null) frameId = requestFrame(notify);
  };

  return {
    subscribe(subscriber: ScrollListener) {
      subscribers.add(subscriber);
      if (subscribers.size === 1) {
        target.addEventListener("scroll", schedule, { passive: true });
      }

      let subscribed = true;
      return () => {
        if (!subscribed) return;
        subscribed = false;
        subscribers.delete(subscriber);

        if (subscribers.size === 0) {
          target.removeEventListener("scroll", schedule);
          if (frameId !== null) cancelFrame(frameId);
          frameId = null;
        }
      };
    },
  };
}

let browserSubscriber: ReturnType<typeof createScrollSubscriber> | null = null;

export function subscribeToScroll(subscriber: ScrollListener) {
  if (typeof window === "undefined") return () => {};

  browserSubscriber ??= createScrollSubscriber({
    target: window,
    requestFrame: (callback) => window.requestAnimationFrame(callback),
    cancelFrame: (id) => window.cancelAnimationFrame(id),
  });

  return browserSubscriber.subscribe(subscriber);
}
