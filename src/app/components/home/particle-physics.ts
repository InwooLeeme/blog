export type Point = { x: number; y: number };
export type VelocityPoint = { vx: number; vy: number };
export type PointerReleaseState = VelocityPoint & {
  active: boolean;
  dragging: boolean;
  pointerId: number | null;
};

export type PointerInfluenceInput = {
  particle: Point;
  pointer: Point;
  pointerVelocity: Point;
  active: boolean;
  dragging: boolean;
  reducedMotion: boolean;
  radius: number;
  maxForce: number;
};

function isFinitePoint(point: Point): boolean {
  return Number.isFinite(point.x) && Number.isFinite(point.y);
}

export function writePointerVelocity(
  source: VelocityPoint,
  output: Point,
): Point {
  output.x = source.vx;
  output.y = source.vy;
  return output;
}

export function writePointerRelease<T extends PointerReleaseState>(
  pointer: T,
  keepHover: boolean,
): T {
  pointer.active = keepHover && pointer.active;
  pointer.dragging = false;
  pointer.pointerId = null;
  pointer.vx = 0;
  pointer.vy = 0;
  return pointer;
}

export function getPointerForce(
  input: PointerInfluenceInput,
  output: Point = { x: 0, y: 0 },
): Point {
  if (
    !input.active ||
    input.reducedMotion ||
    !isFinitePoint(input.particle) ||
    !isFinitePoint(input.pointer) ||
    !isFinitePoint(input.pointerVelocity) ||
    !Number.isFinite(input.radius) ||
    !Number.isFinite(input.maxForce) ||
    input.radius <= 0 ||
    input.maxForce <= 0
  ) {
    output.x = 0;
    output.y = 0;
    return output;
  }

  const dx = input.particle.x - input.pointer.x;
  const dy = input.particle.y - input.pointer.y;
  const distance = Math.hypot(dx, dy);
  if (!Number.isFinite(distance) || distance >= input.radius) {
    output.x = 0;
    output.y = 0;
    return output;
  }

  const normalX = distance > 1e-6 ? dx / distance : 1;
  const normalY = distance > 1e-6 ? dy / distance : 0;
  const falloff = 1 - distance / input.radius;

  let x = normalX * falloff * input.maxForce * 0.55;
  let y = normalY * falloff * input.maxForce * 0.55;

  if (input.dragging) {
    const tangentX = -normalY;
    const tangentY = normalX;
    const tangentProjection = Math.max(
      -32,
      Math.min(
        32,
        input.pointerVelocity.x * tangentX +
          input.pointerVelocity.y * tangentY,
      ),
    );
    const tangentStrength = tangentProjection * 0.035 * falloff;

    x += tangentX * tangentStrength;
    y += tangentY * tangentStrength;
  }

  const magnitude = Math.hypot(x, y);
  if (!Number.isFinite(magnitude)) {
    output.x = 0;
    output.y = 0;
    return output;
  }

  if (magnitude > input.maxForce) {
    output.x = (x / magnitude) * input.maxForce;
    output.y = (y / magnitude) * input.maxForce;
  } else {
    output.x = x;
    output.y = y;
  }
  return output;
}
