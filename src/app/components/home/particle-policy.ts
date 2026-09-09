export type ParticlePolicy = {
  dpr: number;
  maxParticles: number;
  sampleGap: number;
};

export type AnimationPolicyInput = {
  intersecting: boolean;
  visibilityState: DocumentVisibilityState;
  reducedMotion: boolean;
  rendererAvailable?: boolean;
};

export type RectBounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

const MAX_CANVAS_PIXELS = 480_000;
const MAX_WEBGL_PIXELS = 1_250_000;
const ACTIVE_FRAME_INTERVAL_MS = 1000 / 60;
const IDLE_FRAME_INTERVAL_MS = 1000 / 30;

export function fitCanvasDpr(
  width: number,
  height: number,
  requestedDpr: number,
): number {
  const safeWidth = Number.isFinite(width) && width > 0 ? width : 1;
  const safeHeight = Number.isFinite(height) && height > 0 ? height : 1;
  const safeDpr =
    Number.isFinite(requestedDpr) && requestedDpr > 0 ? requestedDpr : 1;
  const pixelLimitedDpr = Math.sqrt(
    MAX_CANVAS_PIXELS / (safeWidth * safeHeight),
  );

  return Math.min(safeDpr, pixelLimitedDpr);
}

export function fitWebglDpr(
  width: number,
  height: number,
  requestedDpr: number,
): number {
  const safeWidth = Number.isFinite(width) && width > 0 ? width : 1;
  const safeHeight = Number.isFinite(height) && height > 0 ? height : 1;
  const safeDpr =
    Number.isFinite(requestedDpr) && requestedDpr > 0 ? requestedDpr : 1;
  const pixelLimitedDpr = Math.sqrt(
    MAX_WEBGL_PIXELS / (safeWidth * safeHeight),
  );

  return Math.min(safeDpr, 1.5, pixelLimitedDpr);
}

export function isPointInsideRect(
  point: { x: number; y: number },
  rect: RectBounds,
): boolean {
  return (
    point.x >= rect.left &&
    point.x <= rect.right &&
    point.y >= rect.top &&
    point.y <= rect.bottom
  );
}

export function getParticlePolicy(
  viewportWidth: number,
  devicePixelRatio: number,
): ParticlePolicy {
  const mobile = viewportWidth < 768;
  const safeDpr = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0
    ? devicePixelRatio
    : 1;

  return {
    dpr: Math.min(Math.max(safeDpr, 1), mobile ? 1.5 : 1.75),
    maxParticles: mobile ? 420 : 560,
    sampleGap: mobile ? 6 : 5,
  };
}

export function shouldAnimateParticleHero({
  intersecting,
  visibilityState,
  reducedMotion,
  rendererAvailable = true,
}: AnimationPolicyInput): boolean {
  return (
    rendererAvailable &&
    intersecting &&
    visibilityState === "visible" &&
    !reducedMotion
  );
}

export function shouldRenderParticleFrame(
  elapsedMs: number,
  interactive: boolean,
): boolean {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) return true;
  return elapsedMs >= getParticleFrameInterval(interactive);
}

export function getParticleFrameInterval(interactive: boolean): number {
  return interactive ? ACTIVE_FRAME_INTERVAL_MS : IDLE_FRAME_INTERVAL_MS;
}
