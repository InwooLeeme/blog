// Generate only when a flight changes, never allocate in the per-frame path.
export function createMeteorFlight(index: number, sequence: number, start: number) {
  let seed = (Math.imul(index + 1, 73856093) ^ Math.imul(sequence + 1, 19349663)) >>> 0;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  const duration = 1.6 + random() * 1.2;
  const angle = 0.28 + random() * 0.36;
  return {
    start,
    duration,
    nextStart: start + duration + 11 + random() * 13,
    x: 0.78 + random() * 0.3,
    y: 0.65 + random() * 0.33,
    length: 80 + random() * 50,
    distance: 0.2 + random() * 0.13,
    dx: Math.cos(angle),
    dy: Math.sin(angle),
  };
}
