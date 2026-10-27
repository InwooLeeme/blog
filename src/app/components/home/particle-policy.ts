export type ParticlePolicy = {
  dpr: number;
  maxParticles: number;
  nebulaTextureSize: number;
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
const MAX_WEBGL_PIXELS = 1_250_000;
const ACTIVE_FRAME_INTERVAL_MS = 1000 / 60;
const IDLE_FRAME_INTERVAL_MS = 1000 / 30;

export type ParticleQuality = {
  scale: number;
  elapsedMs: number;
  samples: number;
  stableMs: number;
};

export function createParticleQuality(): ParticleQuality {
  return { scale: 1, elapsedMs: 0, samples: 0, stableMs: 0 };
}

export function resetParticleQualitySamples(quality: ParticleQuality): void {
  quality.elapsedMs = 0;
  quality.samples = 0;
  quality.stableMs = 0;
}

// Sample rAF cadence, not the intentionally capped desktop paint cadence.
// Two-second windows ignore brief stalls; recovery requires ten stable seconds.
export function sampleParticleQuality(quality: ParticleQuality, frameMs: number): void {
  if (!Number.isFinite(frameMs) || frameMs <= 0 || frameMs > 250) {
    resetParticleQualitySamples(quality);
    return;
  }
  quality.elapsedMs += frameMs;
  quality.samples++;
  if (quality.elapsedMs < 2000) return;
  const averageMs = quality.elapsedMs / quality.samples;
  if (averageMs > 24) {
    quality.scale = quality.scale > 0.85 ? 0.85 : 0.7;
    quality.stableMs = 0;
  } else if (averageMs < 19) {
    quality.stableMs += quality.elapsedMs;
    if (quality.stableMs >= 10000) {
      quality.scale = quality.scale < 0.85 ? 0.85 : 1;
      quality.stableMs = 0;
    }
  } else {
    quality.stableMs = 0;
  }
  quality.elapsedMs = 0;
  quality.samples = 0;
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
    dpr: Math.min(Math.max(safeDpr, 1), mobile ? 1.25 : 1.75),
    maxParticles: mobile ? 2400 : 5600,
    nebulaTextureSize: mobile ? 768 : 1536,
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
  mobile = false,
): boolean {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) return true;
  return elapsedMs >= getParticleFrameInterval(interactive, mobile);
}

export function getParticleFrameInterval(interactive: boolean, mobile = false): number {
  return interactive || mobile ? ACTIVE_FRAME_INTERVAL_MS : IDLE_FRAME_INTERVAL_MS;
}
