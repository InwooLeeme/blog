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
