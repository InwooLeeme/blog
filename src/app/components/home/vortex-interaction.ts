const TAU = Math.PI * 2;
const MAX_PITCH = Math.PI * 35 / 180;
// The idle group rotation only keeps the composition alive. Most visible motion
// comes from the stars' differential flow in the vertex shader.
const AUTO_SPEED = -0.004;
const RESUME_DELAY = 2;
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export type VortexRotation = {
  yaw: number;
  pitch: number;
  targetYaw: number;
  targetPitch: number;
  velocityYaw: number;
  velocityPitch: number;
  dragging: boolean;
  idleSeconds: number;
  secondsSinceMove: number;
};

export function createVortexRotation(): VortexRotation {
  return {
    yaw: 0, pitch: 0, targetYaw: 0, targetPitch: 0,
    velocityYaw: 0, velocityPitch: 0, dragging: false,
    idleSeconds: RESUME_DELAY + 1, secondsSinceMove: 0,
  };
}

export function beginVortexDrag(state: VortexRotation): void {
  state.dragging = true;
  state.velocityYaw = state.velocityPitch = 0;
  state.targetYaw = state.yaw;
  state.targetPitch = state.pitch;
  state.idleSeconds = state.secondsSinceMove = 0;
}

export function dragVortex(
  state: VortexRotation,
  dx: number,
  dy: number,
  width: number,
  height: number,
  deltaSeconds: number,
): void {
  if (!state.dragging || ![dx, dy, width, height, deltaSeconds].every(Number.isFinite)) return;
  if (width <= 0 || height <= 0 || deltaSeconds <= 0) return;
  const yawDelta = dx / width * TAU;
  const pitch = clamp(state.targetPitch + dy / height * 1.4, -MAX_PITCH, MAX_PITCH);
  const elapsed = Math.max(1 / 120, deltaSeconds);
  state.velocityYaw = clamp(yawDelta / elapsed, -2, 2);
  state.velocityPitch = clamp((pitch - state.targetPitch) / elapsed, -0.8, 0.8);
  state.targetYaw += yawDelta;
  state.targetPitch = pitch;
  state.secondsSinceMove = 0;
}

export function endVortexDrag(state: VortexRotation, cancelled = false): void {
  state.dragging = false;
  state.idleSeconds = 0;
  if (cancelled || state.secondsSinceMove > 0.1) {
    state.velocityYaw = state.velocityPitch = 0;
  }
  if (cancelled) {
    state.targetYaw = state.yaw;
    state.targetPitch = state.pitch;
  }
}

export function stepVortexRotation(
  state: VortexRotation,
  deltaSeconds: number,
  reducedMotion = false,
): void {
  if (reducedMotion || !Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return;
  const delta = Math.min(deltaSeconds, 0.05);
  state.secondsSinceMove += delta;
  if (!state.dragging) {
    state.idleSeconds += delta;
    const damping = Math.exp(-5 * delta);
    state.targetYaw += state.velocityYaw * (1 - damping) / 5;
    state.targetPitch = clamp(
      state.targetPitch + state.velocityPitch * (1 - damping) / 5,
      -MAX_PITCH, MAX_PITCH,
    );
    state.velocityYaw *= damping;
    state.velocityPitch *= damping;
    const resume = clamp(state.idleSeconds - RESUME_DELAY, 0, 1);
    state.targetYaw += AUTO_SPEED * resume * delta;
  }
  const follow = 1 - Math.exp(-12 * delta);
  state.yaw += (state.targetYaw - state.yaw) * follow;
  state.pitch += (state.targetPitch - state.pitch) * follow;
}

export function stepVortexFlowScale(
  currentScale: number,
  dragging: boolean,
  deltaSeconds: number,
  reducedMotion = false,
): number {
  if (reducedMotion) return 0;
  const current = Number.isFinite(currentScale)
    ? clamp(currentScale, 0, 1)
    : 1;
  if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return current;

  const delta = Math.min(deltaSeconds, 0.05);
  const target = dragging ? 0.36 : 1;
  const response = dragging ? 8 : 5;
  return current + (target - current) * (1 - Math.exp(-response * delta));
}
