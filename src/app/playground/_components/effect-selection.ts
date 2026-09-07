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

export function resolveEffectId(candidate: string | null, ids: readonly string[]) {
  if (ids.length === 0) return null;
  return candidate && ids.includes(candidate) ? candidate : ids[0];
}

export function stepEffectId(current: string | null, delta: -1 | 1, ids: readonly string[]) {
  const resolved = resolveEffectId(current, ids);
  if (!resolved) return null;
  const index = ids.indexOf(resolved);
  return ids[Math.max(0, Math.min(ids.length - 1, index + delta))];
}
