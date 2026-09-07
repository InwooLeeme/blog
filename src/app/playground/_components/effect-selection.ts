export function getEffectIdFromSearch(search: string) {
  return new URLSearchParams(search).get("effect");
}

export function withEffectId(href: string, effectId: string) {
  const url = new URL(href);
  url.searchParams.set("effect", effectId);
  return url.toString();
}

export function isEffectOnlyHistoryChange(previousHref: string, nextHref: string) {
  const previous = new URL(previousHref);
  const next = new URL(nextHref);
  if (previous.origin !== next.origin || previous.pathname !== next.pathname || previous.hash !== next.hash) return false;
  if (JSON.stringify(previous.searchParams.getAll("effect")) === JSON.stringify(next.searchParams.getAll("effect"))) return false;
  previous.searchParams.delete("effect");
  next.searchParams.delete("effect");
  return previous.searchParams.toString() === next.searchParams.toString();
}

type EffectHistoryTarget = {
  location: { href: string };
  history: Pick<History, "pushState" | "replaceState">;
  addEventListener: EventTarget["addEventListener"];
  removeEventListener: EventTarget["removeEventListener"];
  dispatchEvent: EventTarget["dispatchEvent"];
};

export function subscribeEffectHistory(target: EffectHistoryTarget, onLocationChange: () => void) {
  let subscribed = true;
  let notifying = false;
  let notificationQueued = false;
  let previousHref = target.location.href;
  const originalPush = target.history.pushState;
  const originalReplace = target.history.replaceState;
  const notifyLocationChange = () => {
    notifying = true;
    try {
      onLocationChange();
    } finally {
      notifying = false;
      previousHref = target.location.href;
    }
  };
  const recordWrite = (beforeHref: string) => {
    previousHref = target.location.href;
    if (beforeHref !== previousHref && !notifying && !notificationQueued) {
      notificationQueued = true;
      // Next writes in an insertion effect. Sync from the latest location after its
      // commit stack; normalization performed by the subscriber must not recurse.
      queueMicrotask(() => {
        notificationQueued = false;
        if (subscribed) notifyLocationChange();
      });
    }
    if (new URL(beforeHref).hash !== new URL(previousHref).hash) {
      // push/replaceState do not notify the global route transition's hash subscription.
      // Next may write history in an insertion effect; notify only after that commit stack.
      queueMicrotask(() => {
        if (subscribed) target.dispatchEvent(new Event("hashchange"));
      });
    }
  };
  // Delegate to the existing Next.js/native methods and observe successful writes from any caller.
  const pushState: History["pushState"] = function (this: History, ...args) {
    const beforeHref = target.location.href;
    originalPush.apply(this, args);
    recordWrite(beforeHref);
  };
  const replaceState: History["replaceState"] = function (this: History, ...args) {
    const beforeHref = target.location.href;
    originalReplace.apply(this, args);
    recordWrite(beforeHref);
  };
  target.history.pushState = pushState;
  target.history.replaceState = replaceState;
  const onPopState = (event: Event) => {
    if (isEffectOnlyHistoryChange(previousHref, target.location.href)) event.stopImmediatePropagation();
    previousHref = target.location.href;
    notifyLocationChange();
  };
  target.addEventListener("popstate", onPopState, { capture: true });
  return () => {
    subscribed = false;
    target.removeEventListener("popstate", onPopState, { capture: true });
    if (target.history.pushState === pushState) target.history.pushState = originalPush;
    if (target.history.replaceState === replaceState) target.history.replaceState = originalReplace;
  };
}

export function resolveEffectId(candidate: string | null, ids: readonly string[]) {
  if (ids.length === 0) return null;
  return candidate && ids.includes(candidate) ? candidate : ids[0];
}

export function resolveEffectSelection<T extends { id: string }>(activeId: string | null, catalog: readonly T[]) {
  const selected = catalog.find((effect) => effect.id === activeId) ?? catalog[0] ?? null;
  return { selected, index: selected ? catalog.indexOf(selected) : -1 };
}

export function stepEffectId(current: string | null, delta: -1 | 1, ids: readonly string[]) {
  const resolved = resolveEffectId(current, ids);
  if (!resolved) return null;
  const index = ids.indexOf(resolved);
  return ids[Math.max(0, Math.min(ids.length - 1, index + delta))];
}
