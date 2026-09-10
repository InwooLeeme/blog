export type VortexCoreStyle = {
  coreRadius: number;
  coronaRadius: number;
  coreColor: string;
  edgeColor: string;
  clusterParticleCount: number;
  clusterDepth: number;
  clusterPointSize: number;
  rotationSpeed: number;
};

export type VortexCoreParticle = {
  x: number;
  y: number;
  z: number;
  size: number;
  brightness: number;
  phase: number;
  flare: boolean;
  colorMix: number;
};

function createRandom(seed: number) {
  let state = (seed >>> 0) || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export function getVortexCoreStyle(maxRadius: number): VortexCoreStyle {
  const safeRadius = Number.isFinite(maxRadius) && maxRadius > 0 ? maxRadius : 1;
  const coreRadius = Math.min(10, Math.max(7, safeRadius * 0.025));

  return {
    coreRadius,
    coronaRadius: coreRadius * 2.35,
    coreColor: "#f2ffff",
    edgeColor: "#9eeff2",
    clusterParticleCount: 64,
    clusterDepth: coreRadius * 1.2,
    clusterPointSize: coreRadius * 0.2,
    rotationSpeed: 0.075,
  };
}

export function createVortexCoreParticles(
  style: VortexCoreStyle,
  seed = 20260909,
): VortexCoreParticle[] {
  const random = createRandom(seed);

  return Array.from({ length: style.clusterParticleCount }, (_, index) => {
    if (index === 0) {
      return {
        x: 0,
        y: 0,
        z: 0,
        size: style.clusterPointSize * 1.55,
        brightness: 1,
        phase: 0,
        flare: true,
        colorMix: 0,
      };
    }

    const distance = Math.cbrt(random()) * style.coreRadius;
    const polar = Math.acos(1 - random() * 2);
    const azimuth = random() * Math.PI * 2;
    const radial = Math.sin(polar) * distance;

    return {
      x: Math.cos(azimuth) * radial,
      y: Math.sin(azimuth) * radial,
      z: Math.cos(polar) * distance * (style.clusterDepth / style.coreRadius),
      size: style.clusterPointSize * (0.42 + random() * 0.76),
      brightness: 0.62 + random() * 0.38,
      phase: random() * Math.PI * 2,
      flare: index % 19 === 0,
      colorMix: random(),
    };
  });
}
