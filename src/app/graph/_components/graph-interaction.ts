/** Choose the frontmost visible dot within the pointer's hit area. */
export function frontmostHit<T extends { x?: number; y?: number; depth?: number }>(nodes: T[], x: number, y: number, hitRadius: (node: T) => number): T | null {
  let result: T | null = null, nearest = Infinity;
  for (const node of nodes) {
    const distance = Math.hypot(node.x! - x, node.y! - y);
    if (distance > hitRadius(node)) continue;
    if (!result || (node.depth ?? 0) > (result.depth ?? 0) || ((node.depth ?? 0) === (result.depth ?? 0) && distance < nearest)) {
      result = node; nearest = distance;
    }
  }
  return result;
}

/** A short exit delay prevents repeated stop/start at a sphere boundary. */
export function createHoverLatch(delay = 220) {
  let current: string | null = null, releaseAt = Infinity;
  return {
    enter(id: string | null, time: number) {
      if (id) { current = id; releaseAt = Infinity; }
      else if (current && releaseAt === Infinity) releaseAt = time + delay;
    },
    value(time: number) { if (time >= releaseAt) { current = null; releaseAt = Infinity; } return current; },
    clear() { current = null; releaseAt = Infinity; },
  };
}
