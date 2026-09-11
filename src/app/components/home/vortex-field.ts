export type VortexSeed = {
  angle: number;
  radiusRatio: number;
  angularSpeed: number;
  inwardSpeed: number;
  size: number;
  brightness: number;
  twinklePhase: number;
  depthRatio: number;
  colorIndex: 0 | 1 | 2;
  lightTier: "dust" | "star" | "highlight" | "flare";
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

export type VortexHaloStyle = {
  scale: number;
  brightnessScale: number;
  flareMix: number;
};

export type VortexFlowProfile = {
  angularSpeed: number;
  inwardSpeed: number;
};

export const SPIRAL_PITCH = Math.PI * 2.8;
export const VORTEX_FLOW_INNER_RADIUS = 0.055;
export const VORTEX_FLOW_OUTER_RADIUS = 1.005;
export const VORTEX_PATTERN_SPEED = -0.026;
export const VORTEX_STAR_DRIFT_SPAN = 0.46;
export const VORTEX_STAR_PERSPECTIVE_MIN = 0.58;
export const VORTEX_STAR_PERSPECTIVE_MAX = 1.62;
const DISK_TILT = 0.86;
const DISK_ROTATION = -0.16;
const DISK_TILT_COS = Math.cos(DISK_TILT);
const DISK_TILT_SIN = Math.sin(DISK_TILT);
const DISK_ROTATION_COS = Math.cos(DISK_ROTATION);
const DISK_ROTATION_SIN = Math.sin(DISK_ROTATION);

const ORBIT_STAR_LIGHT_PROFILE: VortexStarLightProfile = {
  hotCoreRadius: 0.2,
  softCoreRadius: 0.74,
  edgeFadeStart: 0.82,
  alphaBoost: 1.12,
  rayStrength: 0.52,
  raySharpness: 78,
  flareCoreScale: 0.6,
};

const CORE_STAR_LIGHT_PROFILE: VortexStarLightProfile = {
  hotCoreRadius: 0.2,
  softCoreRadius: 0.7,
  edgeFadeStart: 0.72,
  alphaBoost: 1.38,
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

export function getVortexHaloStyle(
  tier: VortexSeed["lightTier"],
): VortexHaloStyle | null {
  if (tier === "dust") return null;
  if (tier === "star") {
    return { scale: 2.2, brightnessScale: 0.55, flareMix: 0 };
  }
  if (tier === "highlight") {
    return { scale: 2.8, brightnessScale: 0.75, flareMix: 0.25 };
  }
  return { scale: 3.2, brightnessScale: 1, flareMix: 1 };
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
  const flareScale = flare ? 1.5 : 1;

  return (safeSize * 1.7 + 0.65) * flareScale * depthScale;
}

export function getFrameScale(deltaSeconds: number): number {
  if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return 0;
  return Math.min(deltaSeconds, 0.05) * 60;
}

export function getVortexFieldRadius(width: number, height: number): number {
  const safeWidth = Number.isFinite(width) && width > 0 ? width : 1;
  const safeHeight = Number.isFinite(height) && height > 0 ? height : 1;
  return Math.min(safeWidth * 0.65, safeHeight * 0.86, 500);
}

export function getVortexFlowProfile(radiusRatio: number): VortexFlowProfile {
  const radius = Math.min(1, Math.max(0, Number.isFinite(radiusRatio) ? radiusRatio : 1));
  const innerInfluence = (1 - radius) ** 1.45;
  return {
    angularSpeed: -(0.024 + innerInfluence * 0.105),
    inwardSpeed: 0.0038 + innerInfluence * 0.0052,
  };
}

export function getVortexFlowMotion(
  angularSpeed: number,
  phase: number,
  elapsedSeconds: number,
): { angleOffset: number; opacity: number } {
  const speed = Number.isFinite(angularSpeed) ? angularSpeed : VORTEX_PATTERN_SPEED;
  const safePhase = Number.isFinite(phase) ? phase : 0;
  const elapsed = Number.isFinite(elapsedSeconds) && elapsedSeconds > 0
    ? elapsedSeconds
    : 0;
  const positiveModulo = (value: number, divisor: number) =>
    ((value % divisor) + divisor) % divisor;
  const startProgress = positiveModulo(safePhase / (Math.PI * 2), 1);
  const progress = positiveModulo(
    startProgress -
      (speed - VORTEX_PATTERN_SPEED) * elapsed / VORTEX_STAR_DRIFT_SPAN,
    1,
  );
  const localDrift = (startProgress - progress) * VORTEX_STAR_DRIFT_SPAN;
  const smoothstep = (edge0: number, edge1: number, value: number) => {
    const normalized = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
    return normalized * normalized * (3 - 2 * normalized);
  };
  const opacity = smoothstep(0.04, 0.1, progress)
    * (1 - smoothstep(0.9, 0.96, progress));

  return {
    angleOffset: VORTEX_PATTERN_SPEED * elapsed + localDrift,
    opacity,
  };
}

export function getVortexFlowRadius(
  radiusRatio: number,
  inwardSpeed: number,
  elapsedSeconds: number,
): number {
  const radius = Math.min(
    VORTEX_FLOW_OUTER_RADIUS,
    Math.max(
      VORTEX_FLOW_INNER_RADIUS,
      Number.isFinite(radiusRatio) ? radiusRatio : VORTEX_FLOW_OUTER_RADIUS,
    ),
  );
  const speed = Number.isFinite(inwardSpeed) && inwardSpeed > 0 ? inwardSpeed : 0;
  const elapsed = Number.isFinite(elapsedSeconds) && elapsedSeconds > 0
    ? elapsedSeconds
    : 0;
  const span = VORTEX_FLOW_OUTER_RADIUS - VORTEX_FLOW_INNER_RADIUS;
  const offset = radius - VORTEX_FLOW_INNER_RADIUS - speed * elapsed;
  return VORTEX_FLOW_INNER_RADIUS + ((offset % span) + span) % span;
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
    const sample = random();
    const radiusRatio = 0.08 + (sample + Math.sin(sample * Math.PI * 12) * 0.012) * 0.92;
    const arm = index % 3;
    const clusterWave =
      Math.sin(radiusRatio * 21 + arm * 1.7) * 0.5 +
      Math.sin(radiusRatio * 47 - arm * 2.3) * 0.3 +
      Math.sin(radiusRatio * 91 + arm * 0.8) * 0.2;
    const clusterStrength = ((clusterWave + 1) * 0.5) ** 2;
    const tierRoll = random();
    const flareChance = 0.004 + clusterStrength * 0.06;
    const highlightChance = 0.015 + clusterStrength * 0.2;
    const starChance = 0.17 + clusterStrength * 0.1;
    const lightTier = tierRoll < flareChance
      ? "flare"
      : tierRoll < flareChance + highlightChance
        ? "highlight"
        : tierRoll < flareChance + highlightChance + starChance
          ? "star"
          : "dust";
    const scatterRoll = random();
    const armWidth = lightTier === "dust"
      ? scatterRoll < 0.18 ? 0.48 : 0.14
      : lightTier === "star" ? 0.085 : 0.055;
    const angularJitter = (random() + random() - 1) * armWidth;
    const armWarp =
      Math.sin(radiusRatio * 8.5 + arm * 2.1) * 0.055 +
      Math.sin(radiusRatio * 19 - arm) * 0.025;
    const angle =
      (arm / 3) * Math.PI * 2 +
      radiusRatio * SPIRAL_PITCH +
      armWarp +
      angularJitter;
    const brightnessNoise = random();
    const brightness = lightTier === "dust"
      ? 0.11 + brightnessNoise ** 2 * 0.14
      : lightTier === "star"
        ? 0.3 + brightnessNoise ** 2 * 0.32
        : lightTier === "highlight"
          ? 0.62 + brightnessNoise * 0.28
          : 0.92 + brightnessNoise * 0.08;
    const sizeNoise = random();
    const size = lightTier === "dust"
      ? 0.24 + sizeNoise ** 4 * 0.58
      : lightTier === "star"
        ? 0.36 + sizeNoise ** 3 * 1.1
        : lightTier === "highlight"
          ? 0.75 + sizeNoise * 1.1
          : 1.3 + sizeNoise * 1.7;
    const depthRatio = (random() + random() - 1) * (0.025 + radiusRatio * 0.065);
    const color = random();

    const flow = getVortexFlowProfile(radiusRatio);
    const speedVariation = 0.72 + random() * 0.62;

    return {
      angle,
      radiusRatio,
      angularSpeed: flow.angularSpeed * speedVariation,
      inwardSpeed: flow.inwardSpeed * (1.64 - speedVariation * 0.64),
      size,
      brightness,
      twinklePhase: random() * Math.PI * 2,
      depthRatio,
      colorIndex: color < 0.68 ? 0 : color < 0.9 ? 1 : 2,
      lightTier,
      flare: lightTier === "flare",
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
