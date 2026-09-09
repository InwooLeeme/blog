export type VortexSeed = {
  angle: number;
  radiusRatio: number;
  angularSpeed: number;
  inwardSpeed: number;
  size: number;
  brightness: number;
  twinklePhase: number;
  colorIndex: 0 | 1 | 2;
  flare: boolean;
};

export type VortexOrbit = Pick<
  VortexSeed,
  "angle" | "radiusRatio" | "angularSpeed" | "inwardSpeed"
>;

export type VortexStep = VortexOrbit & { recycled: boolean };

export type VortexPoint3D = {
  x: number;
  y: number;
  z: number;
};

export type VortexPositionSeed = Pick<
  VortexSeed,
  "angle" | "radiusRatio" | "twinklePhase"
>;

export type VortexStarLightProfile = {
  hotCoreRadius: number;
  softCoreRadius: number;
  edgeFadeStart: number;
  alphaBoost: number;
  rayStrength: number;
  raySharpness: number;
  flareCoreScale: number;
};

export const SPIRAL_PITCH = Math.PI * 4.8;
export const VORTEX_STAR_PERSPECTIVE_MIN = 0.58;
export const VORTEX_STAR_PERSPECTIVE_MAX = 1.62;
const DISK_TILT = 0.86;
const DISK_ROTATION = -0.16;
const DISK_TILT_COS = Math.cos(DISK_TILT);
const DISK_TILT_SIN = Math.sin(DISK_TILT);
const DISK_ROTATION_COS = Math.cos(DISK_ROTATION);
const DISK_ROTATION_SIN = Math.sin(DISK_ROTATION);

const ORBIT_STAR_LIGHT_PROFILE: VortexStarLightProfile = {
  hotCoreRadius: 0.42,
  softCoreRadius: 0.86,
  edgeFadeStart: 0.82,
  alphaBoost: 1.38,
  rayStrength: 0.94,
  raySharpness: 90,
  flareCoreScale: 0.68,
};

const CORE_STAR_LIGHT_PROFILE: VortexStarLightProfile = {
  hotCoreRadius: 0.2,
  softCoreRadius: 0.7,
  edgeFadeStart: 0.72,
  alphaBoost: 1.2,
  rayStrength: 0.58,
  raySharpness: 52,
  flareCoreScale: 1,
};

export function getVortexStarLightProfile(
  kind: "orbit" | "core",
): VortexStarLightProfile {
  return kind === "orbit"
    ? ORBIT_STAR_LIGHT_PROFILE
    : CORE_STAR_LIGHT_PROFILE;
}

export function getVortexStarPointSize(
  size: number,
  flare: boolean,
  perspective = 1,
): number {
  const safeSize = Number.isFinite(size) && size >= 0 ? size : 0;
  const safePerspective = Number.isFinite(perspective) ? perspective : 1;
  const depthScale = Math.min(
    Math.max(safePerspective, VORTEX_STAR_PERSPECTIVE_MIN),
    VORTEX_STAR_PERSPECTIVE_MAX,
  );
  const flareScale = flare ? 2.3 : 1;

  return (safeSize * 3.9 + 1.65) * flareScale * depthScale;
}

export function getFrameScale(deltaSeconds: number): number {
  if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return 0;
  return Math.min(deltaSeconds, 0.05) * 60;
}

export function writeVortexPosition3D(
  star: VortexPositionSeed,
  maxRadius: number,
  output: VortexPoint3D,
): VortexPoint3D {
  const safeRadius = Number.isFinite(maxRadius) && maxRadius > 0 ? maxRadius : 1;
  const radius = safeRadius * star.radiusRatio;
  const wobble = Math.sin(star.radiusRatio * Math.PI * 5 + star.twinklePhase) * 0.055;
  const angle = star.angle + wobble;
  const planeX = Math.cos(angle) * radius;
  const planeY = Math.sin(angle) * radius;
  const tiltedY = planeY * DISK_TILT_COS;

  output.x = planeX * DISK_ROTATION_COS - tiltedY * DISK_ROTATION_SIN;
  output.y = planeX * DISK_ROTATION_SIN + tiltedY * DISK_ROTATION_COS;
  output.z = planeY * DISK_TILT_SIN;
  return output;
}

export function getPerspectiveScale(z: number, cameraDistance: number): number {
  if (
    !Number.isFinite(z) ||
    !Number.isFinite(cameraDistance) ||
    cameraDistance <= 0
  ) return 1;

  const clampedZ = Math.min(Math.max(z, -cameraDistance * 0.8), cameraDistance * 0.8);
  return cameraDistance / (cameraDistance - clampedZ);
}

function createRandom(seed: number) {
  let state = (seed >>> 0) || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export function createVortexSeeds(count: number, seed = 20260909): VortexSeed[] {
  const random = createRandom(seed);
  const safeCount = Math.max(0, Math.floor(count));

  return Array.from({ length: safeCount }, (_, index) => {
    const radiusRatio = 0.08 + Math.sqrt(random()) * 0.92;
    const arm = index % 3;
    const looseDust = index % 7 === 0;
    const angularJitter = (random() - 0.5) * (looseDust ? 1.35 : 0.42);
    const angle =
      (arm / 3) * Math.PI * 2 +
      radiusRatio * SPIRAL_PITCH +
      angularJitter;
    const brightness = 0.44 + random() * 0.54;
    const size = 0.68 + random() ** 2 * 2.17;

    return {
      angle,
      radiusRatio,
      angularSpeed: 0.07 + random() * 0.012,
      inwardSpeed: 0.008 + random() * 0.014,
      size,
      brightness,
      twinklePhase: random() * Math.PI * 2,
      colorIndex: Math.floor(random() * 3) as 0 | 1 | 2,
      flare: index % 23 === 0 && brightness > 0.55,
    };
  });
}

export function advanceVortexOrbit(
  orbit: VortexOrbit,
  deltaSeconds: number,
  output?: VortexStep,
): VortexStep {
  const result = output ?? {
    angle: orbit.angle,
    radiusRatio: orbit.radiusRatio,
    angularSpeed: orbit.angularSpeed,
    inwardSpeed: orbit.inwardSpeed,
    recycled: false,
  };

  result.angularSpeed = orbit.angularSpeed;
  result.inwardSpeed = orbit.inwardSpeed;

  if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) {
    result.angle = orbit.angle;
    result.radiusRatio = orbit.radiusRatio;
    result.recycled = false;
    return result;
  }

  const delta = Math.min(deltaSeconds, 0.05);
  const phase = orbit.angle - SPIRAL_PITCH * orbit.radiusRatio;
  const radiusRatio = orbit.radiusRatio - orbit.inwardSpeed * delta;
  const angle =
    phase +
    SPIRAL_PITCH * radiusRatio +
    orbit.angularSpeed * delta;

  if (radiusRatio > 0.055) {
    result.angle = angle;
    result.radiusRatio = radiusRatio;
    result.recycled = false;
    return result;
  }

  const cycleNoise = Math.abs(Math.sin(angle * 12.9898) * 43758.5453) % 1;
  result.radiusRatio = 0.94 + cycleNoise * 0.05;
  result.angle =
    phase + (Math.PI * 2) / 3 + SPIRAL_PITCH * result.radiusRatio;
  result.recycled = true;
  return result;
}
