import * as THREE from "three";
import {
  beginVortexDrag, createVortexRotation, dragVortex,
  endVortexDrag, stepVortexFlowScale, stepVortexRotation,
} from "./vortex-interaction";
import {
  fitWebglDpr,
  createParticleQuality,
  resetParticleQualitySamples,
  sampleParticleQuality,
  getParticleFrameInterval,
  getParticlePolicy,
  isPointInsideRect,
  shouldAnimateParticleHero,
  shouldRenderParticleFrame,
} from "./particle-policy";
import {
  createVortexSeeds,
  getVortexFieldRadius,
  getVortexHaloStyle,
  getVortexStarLightProfile,
  getVortexStarPointSize,
  SPIRAL_PITCH,
  VORTEX_FLOW_INNER_RADIUS,
  VORTEX_FLOW_OUTER_RADIUS,
  VORTEX_PATTERN_SPEED,
  VORTEX_STAR_DRIFT_SPAN,
  VORTEX_STAR_PERSPECTIVE_MAX,
  VORTEX_STAR_PERSPECTIVE_MIN,
} from "./vortex-field";
import { createVortexCoreParticles, getVortexCoreStyle } from "./vortex-core";
import { createMeteorFlight } from "./vortex-meteor";

const CAMERA_DISTANCE = 800;
const STAR_COLORS = [
  [0.72, 0.85, 1],
  [0.32, 0.58, 1],
  [0.9, 0.42, 0.78],
] as const;

const STAR_VERTEX_SHADER = /* glsl */ `
  attribute float aSize;
  attribute float aBrightness;
  attribute float aPhase;
  attribute float aFlare;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uAlphaBoost;
  uniform float uDepthMotion;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vFlare;

  void main() {
    float proximity = smoothstep(-480.0, 100.0, position.z) * uDepthMotion;
    vec3 driftingPosition = position;
    driftingPosition.xy += vec2(
      sin(uTime * 0.035 + aPhase) - sin(aPhase),
      cos(uTime * 0.028 + aPhase) - cos(aPhase)
    ) * vec2(12.0, 7.0) * proximity;
    vec4 viewPosition = modelViewMatrix * vec4(driftingPosition, 1.0);
    float twinkle = 0.82 + sin(uTime * (0.35 + fract(aPhase) * 0.5) + aPhase) * 0.18;
    float glintSpeed = mix(0.19, 0.41, fract(aPhase * 2.37));
    float glintThreshold = mix(0.78, 0.94, fract(aPhase * 4.13));
    float glint = smoothstep(glintThreshold, 0.995, sin(uTime * glintSpeed + aPhase))
      * aFlare * uDepthMotion;
    float perspective = clamp(
      ${CAMERA_DISTANCE.toFixed(1)} / -viewPosition.z,
      ${VORTEX_STAR_PERSPECTIVE_MIN.toFixed(2)},
      ${VORTEX_STAR_PERSPECTIVE_MAX.toFixed(2)}
    );
    gl_PointSize = max(1.0, aSize * uPixelRatio * perspective * (1.0 + glint * 0.16));
    gl_Position = projectionMatrix * viewPosition;
    vColor = aColor;
    vAlpha = min(1.0, aBrightness * (twinkle + glint * 0.32) * uAlphaBoost);
    vFlare = aFlare * mix(1.0, 0.45 + glint * 0.95, uDepthMotion);
  }
`;

const FLOW_STAR_VERTEX_SHADER = /* glsl */ `
  attribute float aSize;
  attribute float aBrightness;
  attribute float aPhase;
  attribute float aFlare;
  attribute float aRadiusRatio;
  attribute float aAngularSpeed;
  attribute float aInwardSpeed;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uFlowTime;
  uniform float uPixelRatio;
  uniform float uAlphaBoost;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vFlare;

  void main() {
    const float innerRadius = ${VORTEX_FLOW_INNER_RADIUS.toFixed(3)};
    const float outerRadius = ${VORTEX_FLOW_OUTER_RADIUS.toFixed(3)};
    const float radiusSpan = outerRadius - innerRadius;
    float travelled = aInwardSpeed * uFlowTime;
    float flowedRadius = innerRadius + mod(
      aRadiusRatio - innerRadius - travelled + radiusSpan,
      radiusSpan
    );
    float baseRadius = length(position.xy);
    float baseAngle = atan(position.y, position.x);
    float wavePhase = aRadiusRatio * 10.0 + baseAngle * 3.0;
    float armWave =
      (sin(uFlowTime * 0.19 + wavePhase) - sin(wavePhase)) * 0.022 +
      (sin(uFlowTime * 0.11 - wavePhase * 0.53) + sin(wavePhase * 0.53)) * 0.012;
    float orbitPhase = aPhase + uFlowTime * (0.23 + abs(aAngularSpeed) * 1.7);
    float radialWobble = sin(orbitPhase + aRadiusRatio * 13.0)
      * mix(0.006, 0.024, aRadiusRatio);
    const float patternSpeed = ${VORTEX_PATTERN_SPEED.toFixed(6)};
    const float driftSpan = ${VORTEX_STAR_DRIFT_SPAN.toFixed(6)};
    float startProgress = fract(aPhase / 6.28318530718);
    float driftProgress = fract(
      startProgress - (aAngularSpeed - patternSpeed) * uFlowTime / driftSpan
    );
    float starDrift = (startProgress - driftProgress) * driftSpan;
    float lifeFade = smoothstep(0.04, 0.1, driftProgress)
      * (1.0 - smoothstep(0.9, 0.96, driftProgress));
    float angleOffset =
      ${SPIRAL_PITCH.toFixed(8)} * (flowedRadius - aRadiusRatio) +
      patternSpeed * uFlowTime +
      starDrift +
      armWave +
      cos(orbitPhase * 0.81 + aRadiusRatio * 7.0) * 0.025;
    float cosine = cos(angleOffset);
    float sine = sin(angleOffset);
    float radiusScale = flowedRadius * (1.0 + radialWobble)
      / max(aRadiusRatio, 0.001);
    vec2 flowedPosition = vec2(
      position.x * cosine - position.y * sine,
      position.x * sine + position.y * cosine
    ) * radiusScale;
    float depthWave =
      (sin(uFlowTime * 0.16 + wavePhase * 0.7) - sin(wavePhase * 0.7))
        * baseRadius * 0.018 +
      sin(orbitPhase * 0.67 + baseAngle) * baseRadius * 0.012;
    vec4 viewPosition = modelViewMatrix * vec4(
      flowedPosition,
      position.z + depthWave,
      1.0
    );
    float twinkle = 0.9 + sin(uTime * (0.35 + fract(aPhase) * 0.5) + aPhase) * 0.1;
    float glintSpeed = mix(0.16, 0.36, fract(aPhase * 2.37));
    float glintThreshold = mix(0.82, 0.95, fract(aPhase * 4.13));
    float glint = smoothstep(glintThreshold, 0.995, sin(uTime * glintSpeed + aPhase)) * aFlare;
    float perspective = clamp(
      ${CAMERA_DISTANCE.toFixed(1)} / -viewPosition.z,
      ${VORTEX_STAR_PERSPECTIVE_MIN.toFixed(2)},
      ${VORTEX_STAR_PERSPECTIVE_MAX.toFixed(2)}
    );
    float centerFade = smoothstep(innerRadius, 0.09, flowedRadius);
    float edgeFade = 1.0 - smoothstep(0.94, outerRadius, flowedRadius);
    gl_PointSize = max(1.0, aSize * uPixelRatio * perspective);
    gl_Position = projectionMatrix * viewPosition;
    vColor = aColor;
    vAlpha = min(1.0, aBrightness * (twinkle + glint * 0.18) * uAlphaBoost)
      * centerFade * edgeFade * lifeFade;
    vFlare = aFlare * (0.55 + glint * 0.85);
  }
`;

const STAR_FRAGMENT_SHADER = /* glsl */ `
  uniform float uHotCoreRadius;
  uniform float uSoftCoreRadius;
  uniform float uEdgeFadeStart;
  uniform float uRayStrength;
  uniform float uRaySharpness;
  uniform float uFlareCoreScale;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vFlare;

  void main() {
    vec2 point = (gl_PointCoord - 0.5) * 2.0;
    float radius = length(point);
    if (radius > 1.0) discard;

    // Glints can exceed 1.0 for brighter rays, but core interpolation must not
    // extrapolate into negative radii and reverse the smoothstep falloff.
    float coreScale = mix(1.0, uFlareCoreScale, clamp(vFlare, 0.0, 1.0));
    float softCore = 1.0 - smoothstep(0.04, uSoftCoreRadius * coreScale, radius);
    float hotCore = 1.0 - smoothstep(0.0, uHotCoreRadius * coreScale, radius);
    float horizontal = exp(-uRaySharpness * point.y * point.y)
      * (1.0 - smoothstep(0.08, 1.0, abs(point.x)));
    float vertical = exp(-uRaySharpness * point.x * point.x)
      * (1.0 - smoothstep(0.08, 1.0, abs(point.y)));
    vec2 diagonal = vec2(point.x + point.y, point.x - point.y) * 0.7071;
    float diagonalRays = exp(-uRaySharpness * diagonal.x * diagonal.x)
      + exp(-uRaySharpness * diagonal.y * diagonal.y);
    float rays = (horizontal + vertical + diagonalRays * 0.18
      * (1.0 - smoothstep(0.1, 0.8, radius))) * vFlare * uRayStrength;
    float edgeFade = 1.0 - smoothstep(uEdgeFadeStart, 1.0, radius);
    float alpha = (softCore + rays) * edgeFade * vAlpha;
    vec3 color = mix(vColor, vec3(1.0), hotCore * 0.9);

    gl_FragColor = vec4(color, alpha);
  }
`;

const CORONA_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const CORONA_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uFalloff;
  uniform float uStrength;
  uniform float uCoreFalloff;
  uniform float uCoreStrength;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    vec2 point = (vUv - 0.5) * 2.0;
    float radius = length(point);
    if (radius > 1.0) discard;

    float glow = exp(-uFalloff * radius * radius) * uStrength;
    float coreGlow = exp(-uCoreFalloff * radius * radius) * uCoreStrength;
    float edgeFade = 1.0 - smoothstep(0.65, 1.0, radius);
    float pulse = 0.96 + sin(uTime * 0.45) * 0.04;
    float streak = exp(-point.y * point.y * 4800.0)
      * exp(-abs(point.x) * 3.2) * 0.6;
    vec2 tilted = mat2(0.866, -0.5, 0.5, 0.866) * point;
    float spikes = exp(-tilted.x * tilted.x * 3500.0)
      * exp(-abs(tilted.y) * 9.0) * 0.32;
    float aureole = exp(-radius * radius * 5.5) * 0.12;
    vec3 light = uColor * (glow * 0.8 + coreGlow + spikes)
      + vec3(0.48, 0.76, 1.0) * (aureole + streak);
    gl_FragColor = vec4(light, edgeFade * pulse);
  }
`;

// One translucent disk adds gaseous arms without a bloom pass or extra particles.
// It shares the stars' pitch, pattern clock and drag transform.
const NEBULA_FRAGMENT_SHADER = /* glsl */ `
  uniform float uFlowTime;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 cell = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(cell), hash(cell + vec2(1.0, 0.0)), f.x),
      mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0)), f.x), f.y);
  }

  void main() {
    vec2 p = (vUv - 0.5) * 2.0;
    float radius = length(p);
    if (radius > 1.0) discard;
    float rotation = ${VORTEX_PATTERN_SPEED.toFixed(6)} * uFlowTime;
    float c = cos(rotation);
    float s = sin(rotation);
    vec2 cloudPosition = mat2(c, -s, s, c) * p;
    vec2 warped = cloudPosition + vec2(
      noise(cloudPosition * 6.0), noise(cloudPosition * 6.0 + 41.0)
    ) * 0.09;
    float fineDust = noise(warped * 180.0);
    float clouds = noise(warped * 8.0) * 0.44
      + noise(warped * 23.0) * 0.3
      + noise(warped * 61.0) * 0.18 + fineDust * 0.08;
    float angle = atan(p.y, p.x);
    float phase = angle - radius * ${SPIRAL_PITCH.toFixed(8)} - rotation;
    float arm = sin(phase * 1.5 + (clouds - 0.5) * 1.25);
    float armVariation = noise(cloudPosition * 3.5 + 73.0);
    float ribbons = exp(-arm * arm * mix(6.0, 12.0, armVariation));
    float mist = exp(-arm * arm * 2.0);
    float dustLane = smoothstep(0.28, 0.72, clouds);
    float envelope = smoothstep(0.035, 0.18, radius)
      * (1.0 - smoothstep(0.65, 1.0, radius));
    float armDensity = mix(0.66, 1.16, armVariation);
    float gaps = 1.0 - smoothstep(0.61, 0.81, noise(warped * 11.0 + 93.0)) * 0.55;
    float gas = (ribbons * 0.82 + mist * 0.4) * (0.18 + dustLane) * envelope * armDensity;
    float violet = smoothstep(0.38, 0.75, noise(cloudPosition * 5.0 + 17.0));
    vec3 gasColor = mix(vec3(0.12, 0.44, 1.0), vec3(0.95, 0.19, 0.65), violet);
    gasColor = mix(vec3(1.0, 0.53, 0.22), gasColor, smoothstep(0.12, 0.42, radius));
    float ionized = smoothstep(0.48, 0.78, clouds) * ribbons;
    gasColor = mix(gasColor, vec3(0.3, 0.9, 1.0), ionized * 0.55);
    float filamentWave = sin(phase * 1.5 + 0.38 + clouds * 0.6);
    float filament = exp(-filamentWave * filamentWave * 32.0);
    float knots = smoothstep(0.58, 0.78, clouds) * ribbons * envelope;
    float bulge = exp(-radius * radius * 85.0);
    float halo = exp(-radius * radius * 2.5) * (0.12 + clouds * 0.28);
    float branchWave = sin(phase * 1.5 - 0.55 + clouds * 1.8);
    float branches = exp(-branchWave * branchWave * 15.0) * envelope;
    float dustWave = sin(phase * 1.5 - 0.2 + clouds * 0.7);
    float extinction = 1.0 - exp(-dustWave * dustWave * 90.0)
      * smoothstep(0.3, 0.65, clouds) * 0.82;
    float laceWave = sin(phase * 4.5 + clouds * 3.0);
    float lace = exp(-laceWave * laceWave * 55.0) * ribbons * envelope;
    float starDust = pow(smoothstep(0.55, 0.95, fineDust), 6.0)
      * ribbons * envelope;
    vec3 light = gasColor * gas + vec3(1.0, 0.72, 0.42) * bulge * 0.48
      + vec3(0.4, 0.25, 0.8) * halo
      + vec3(0.68, 0.18, 0.78) * branches * dustLane * 0.4
      + vec3(0.38, 0.6, 1.0) * filament * envelope * clouds * 0.23
      + vec3(0.72, 0.85, 1.0) * knots * (0.3 + fineDust * 0.3)
      + vec3(0.26, 0.7, 1.0) * lace * clouds * 0.55
      + vec3(0.8, 0.9, 1.0) * starDust * 1.4;
    light *= extinction * mix(1.0, gaps, envelope);
    // Compress the baked highlights while retaining warm midtones and dust detail.
    light = light / (vec3(1.0) + light * 0.22);
    float edge = 1.0 - smoothstep(0.82, 1.0, radius);
    gl_FragColor = vec4(light, edge);
  }
`;

// Each trail occupies a small quad instead of shading the entire canvas.
const METEOR_FRAGMENT_SHADER = /* glsl */ `
  uniform float uFade;
  varying vec2 vUv;
  void main() {
    vec2 offset = vec2(vUv.x * 120.0 - 8.0, (vUv.y - 0.5) * 12.0);
    float tail = exp(-offset.y * offset.y / 1.8)
      * exp(-max(offset.x, 0.0) / 28.0) * step(0.0, offset.x)
      * (1.0 - smoothstep(90.0, 112.0, offset.x));
    float spark = exp(-dot(offset, offset) / 5.0);
    vec3 light = vec3(0.28, 0.65, 1.0) * tail + vec3(0.85, 0.95, 1.0) * spark;
    gl_FragColor = vec4(light, 0.7 * uFade);
  }
`;

function configureCamera(camera: THREE.PerspectiveCamera, width: number, height: number) {
  camera.aspect = width / height;
  camera.fov = THREE.MathUtils.radToDeg(
    2 * Math.atan(height / (2 * CAMERA_DISTANCE)),
  );
  camera.position.set(0, 0, CAMERA_DISTANCE);
  camera.updateProjectionMatrix();
}

export function mountThreeVortex(
  wrapper: HTMLDivElement,
  canvas: HTMLCanvasElement,
): () => void {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: false,
      antialias: false,
      depth: false,
      powerPreference: "high-performance",
      premultipliedAlpha: true,
    });
  } catch {
    wrapper.dataset.canvasReady = "false";
    return () => undefined;
  }

  renderer.setClearColor(0x08090b, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
  const particleGeometry = new THREE.BufferGeometry();
  const particleLightProfile = getVortexStarLightProfile("orbit");
  const particleUniforms = {
    uTime: { value: 0 },
    uFlowTime: { value: 0 },
    uPixelRatio: { value: 1 },
    uAlphaBoost: { value: particleLightProfile.alphaBoost },
    uDepthMotion: { value: 0 },
    uHotCoreRadius: { value: particleLightProfile.hotCoreRadius },
    uSoftCoreRadius: { value: particleLightProfile.softCoreRadius },
    uEdgeFadeStart: { value: particleLightProfile.edgeFadeStart },
    uRayStrength: { value: particleLightProfile.rayStrength },
    uRaySharpness: { value: particleLightProfile.raySharpness },
    uFlareCoreScale: { value: particleLightProfile.flareCoreScale },
  };
  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: particleUniforms,
    vertexShader: FLOW_STAR_VERTEX_SHADER,
    fragmentShader: STAR_FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const particlePoints = new THREE.Points(particleGeometry, particleMaterial);
  particlePoints.frustumCulled = false;
  const galaxy = new THREE.Group();
  const orientation = new THREE.Group();
  orientation.rotation.order = "ZXY";
  orientation.rotation.z = -0.32;
  galaxy.add(particlePoints);
  orientation.add(galaxy);
  scene.add(orientation);

  const nebulaGeometry = new THREE.PlaneGeometry(2, 2);
  // Bake the expensive noise once; a small UV drift animates the cached disk.
  // Keep the baking resources for responsive quality changes and context recovery.
  const nebulaTarget = new THREE.WebGLRenderTarget(1, 1, {
    depthBuffer: false,
    stencilBuffer: false,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    generateMipmaps: false,
  });
  const nebulaBakeMaterial = new THREE.ShaderMaterial({
    uniforms: { uFlowTime: { value: 0 } },
    vertexShader: CORONA_VERTEX_SHADER,
    fragmentShader: NEBULA_FRAGMENT_SHADER,
    depthTest: false,
    depthWrite: false,
    blending: THREE.NoBlending,
  });
  const nebulaBakeScene = new THREE.Scene();
  nebulaBakeScene.add(new THREE.Mesh(nebulaGeometry, nebulaBakeMaterial));
  const nebulaBakeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 2);
  nebulaBakeCamera.position.z = 1;
  let nebulaTextureReady = false;
  const bakeNebula = (size: number) => {
    if (nebulaTextureReady && nebulaTarget.width === size) return;
    nebulaTarget.setSize(size, size);
    renderer.setRenderTarget(nebulaTarget);
    renderer.setClearColor(0x000000, 0);
    renderer.render(nebulaBakeScene, nebulaBakeCamera);
    renderer.setRenderTarget(null);
    renderer.setClearColor(0x08090b, 1);
    nebulaTextureReady = true;
  };
  const nebulaColorShift = new THREE.Matrix3();
  const nebulaMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: nebulaTarget.texture },
      uColorShift: { value: nebulaColorShift },
      uDrift: { value: new THREE.Vector2() },
    },
    vertexShader: CORONA_VERTEX_SHADER,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform mat3 uColorShift;
      uniform vec2 uDrift;
      varying vec2 vUv;
      void main() {
        vec2 center = (vUv - 0.5) * 2.0;
        float radiusSquared = dot(center, center);
        float outerArms = smoothstep(0.015, 0.12, radiusSquared);
        float driftMask = outerArms * (1.0 - smoothstep(0.55, 0.95, radiusSquared));
        vec2 drift = vec2(-center.y, center.x) * uDrift.x
          + center * (center.x - center.y) * uDrift.y;
        vec4 gas = texture2D(uMap, vUv + drift * driftMask);
        vec3 shifted = max(vec3(0.0), uColorShift * gas.rgb);
        gl_FragColor = vec4(mix(gas.rgb, shifted, outerArms), gas.a);
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const nebulaMesh = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
  nebulaMesh.renderOrder = -1;
  galaxy.add(nebulaMesh);

  // A second, sparse point layer gives only the brightest stars a soft halo.
  const haloGeometry = new THREE.BufferGeometry();
  const haloMaterial = particleMaterial.clone();
  haloMaterial.fragmentShader = /* glsl */ `
    varying vec3 vColor;
    varying float vAlpha;
    varying float vFlare;
    void main() {
      float radius = length((gl_PointCoord - 0.5) * 2.0);
      float falloff = mix(7.5, 4.2, vFlare);
      float glow = exp(-falloff * radius * radius)
        * (1.0 - smoothstep(0.7, 1.0, radius));
      float strength = mix(0.14, 0.32, vFlare);
      gl_FragColor = vec4(vColor, glow * vAlpha * strength);
    }
  `;
  const haloPoints = new THREE.Points(haloGeometry, haloMaterial);
  haloPoints.frustumCulled = false;
  galaxy.add(haloPoints);

  const backgroundGeometry = new THREE.BufferGeometry();
  const backgroundMaterial = particleMaterial.clone();
  backgroundMaterial.vertexShader = STAR_VERTEX_SHADER;
  backgroundMaterial.uniforms.uDepthMotion.value = 1;
  backgroundMaterial.uniforms.uFlareCoreScale.value = 0.28;
  backgroundMaterial.uniforms.uRaySharpness.value = 220;
  backgroundMaterial.uniforms.uRayStrength.value = 0.8;
  const backgroundPoints = new THREE.Points(backgroundGeometry, backgroundMaterial);
  backgroundPoints.frustumCulled = false;
  scene.add(backgroundPoints);

  const meteorGeometry = new THREE.PlaneGeometry(1, 1);
  const meteorFlights = Array.from({ length: 3 }, (_, index) => ({
    sequence: 0,
    flight: createMeteorFlight(index, 0, 4 + index * 9),
  }));
  const meteors = Array.from({ length: 3 }, () => {
    const material = new THREE.ShaderMaterial({
      uniforms: { uFade: { value: 0 } },
      vertexShader: CORONA_VERTEX_SHADER,
      fragmentShader: METEOR_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(meteorGeometry, material);
    mesh.scale.set(120, 12, 1);
    mesh.renderOrder = 3;
    scene.add(mesh);
    return mesh;
  });

  const coreStyle = getVortexCoreStyle(400);
  const coreParticles = createVortexCoreParticles(coreStyle);
  const coreGeometry = new THREE.BufferGeometry();
  const corePositions = new Float32Array(coreParticles.length * 3);
  const coreSizes = new Float32Array(coreParticles.length);
  const coreBrightness = new Float32Array(coreParticles.length);
  const corePhases = new Float32Array(coreParticles.length);
  const coreFlares = new Float32Array(coreParticles.length);
  const coreColors = new Float32Array(coreParticles.length * 3);
  const coreWhite = new THREE.Color(coreStyle.coreColor);
  const coreEdge = new THREE.Color(coreStyle.edgeColor);
  const mixedCoreColor = new THREE.Color();

  coreParticles.forEach((particle, index) => {
    corePositions.set([particle.x, particle.y, particle.z], index * 3);
    coreSizes[index] =
      (particle.size * coreStyle.clusterPointScale + 1.35)
      * (particle.flare ? coreStyle.clusterFlareScale : 1);
    coreBrightness[index] = particle.brightness * 0.82;
    corePhases[index] = particle.phase;
    coreFlares[index] = particle.flare ? 1 : 0;
    mixedCoreColor.copy(coreWhite).lerp(coreEdge, 0.12 + particle.colorMix * 0.6);
    coreColors.set(mixedCoreColor.toArray(), index * 3);
  });
  coreGeometry.setAttribute("position", new THREE.BufferAttribute(corePositions, 3));
  coreGeometry.setAttribute("aSize", new THREE.BufferAttribute(coreSizes, 1));
  coreGeometry.setAttribute("aBrightness", new THREE.BufferAttribute(coreBrightness, 1));
  coreGeometry.setAttribute("aPhase", new THREE.BufferAttribute(corePhases, 1));
  coreGeometry.setAttribute("aFlare", new THREE.BufferAttribute(coreFlares, 1));
  coreGeometry.setAttribute("aColor", new THREE.BufferAttribute(coreColors, 3));
  const coreLightProfile = getVortexStarLightProfile("core");
  const coreUniforms = {
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
    uAlphaBoost: { value: coreLightProfile.alphaBoost },
    uDepthMotion: { value: 0 },
    uHotCoreRadius: { value: coreLightProfile.hotCoreRadius },
    uSoftCoreRadius: { value: coreLightProfile.softCoreRadius },
    uEdgeFadeStart: { value: coreLightProfile.edgeFadeStart },
    uRayStrength: { value: coreLightProfile.rayStrength },
    uRaySharpness: { value: coreLightProfile.raySharpness },
    uFlareCoreScale: { value: coreLightProfile.flareCoreScale },
  };
  const coreMaterial = new THREE.ShaderMaterial({
    uniforms: coreUniforms,
    vertexShader: STAR_VERTEX_SHADER,
    fragmentShader: STAR_FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const corePoints = new THREE.Points(coreGeometry, coreMaterial);
  corePoints.frustumCulled = false;
  corePoints.renderOrder = 2;

  const coronaUniforms = {
    uTime: { value: 0 },
    uFalloff: { value: coreStyle.coronaFalloff },
    uStrength: { value: coreStyle.coronaStrength * 0.85 },
    uCoreFalloff: { value: coreStyle.coronaCoreFalloff * 1.3 },
    uCoreStrength: { value: coreStyle.coronaCoreStrength * 0.72 },
    uColor: { value: new THREE.Color("#ffe1b1") },
  };
  const coronaGeometry = new THREE.PlaneGeometry(
    coreStyle.coronaRadius * coreStyle.coronaRenderScale,
    coreStyle.coronaRadius * coreStyle.coronaRenderScale,
  );
  const coronaMaterial = new THREE.ShaderMaterial({
    uniforms: coronaUniforms,
    vertexShader: CORONA_VERTEX_SHADER,
    fragmentShader: CORONA_FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const coronaMesh = new THREE.Mesh(coronaGeometry, coronaMaterial);
  coronaMesh.renderOrder = 1;

  const coreGroup = new THREE.Group();
  coreGroup.add(corePoints);
  galaxy.add(coreGroup);
  // The halo faces the camera so it never becomes a thin streak when tilted.
  scene.add(coronaMesh);

  let width = 1;
  let height = 1;
  let centerX = 0;
  let centerY = 0;
  let maxRadius = 1;
  let particleCount = 0;
  let mobile = false;
  let sceneTime = 0;
  let flowTime = 0;
  let flowScale = 1;
  const rotation = createVortexRotation();
  let frameId = 0;
  let resizeFrameId = 0;
  let lastFrameTime = 0;
  let lastPaintTime = 0;
  let lastTickTime = 0;
  let baseRenderDpr = 1;
  const quality = createParticleQuality();
  let destroyed = false;
  let contextLost = false;
  let intersecting = false;
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = motionQuery.matches;
  const pointer = {
    x: 0, y: 0, active: false,
    pointerId: null as number | null,
    lastTime: 0,
  };

  const resetPointer = () => {
    const capturedId = pointer.pointerId;
    pointer.active = false;
    pointer.pointerId = null;
    pointer.lastTime = 0;
    endVortexDrag(rotation, true);
    wrapper.dataset.dragging = "false";
    if (capturedId !== null && canvas.hasPointerCapture?.(capturedId)) {
      canvas.releasePointerCapture(capturedId);
    }
  };

  const updateScene = (time: number, animate: boolean) => {
    const delta = animate && lastFrameTime > 0
      ? Math.min((time - lastFrameTime) / 1000, 0.05) : 0;
    lastFrameTime = animate ? time : 0;
    if (animate) {
      stepVortexRotation(rotation, delta, reducedMotion);
      sceneTime += delta;
      flowScale = stepVortexFlowScale(
        flowScale,
        pointer.active || rotation.dragging,
        delta,
        reducedMotion,
      );
      flowTime += delta * flowScale;
    }
    orientation.rotation.x = 0.9 + rotation.pitch;
    galaxy.rotation.z = rotation.yaw;
    coreGroup.rotation.z = flowTime * -0.085;
    particleUniforms.uTime.value = sceneTime;
    particleUniforms.uFlowTime.value = flowTime;
    nebulaMesh.rotation.z = VORTEX_PATTERN_SPEED * flowTime;
    // CPU trigonometry and one texture lookup keep per-pixel work small.
    const driftStrength = (mobile ? 0.0025 : 0.004) * quality.scale;
    nebulaMaterial.uniforms.uDrift.value.set(
      Math.sin(flowTime * 0.13) * driftStrength,
      Math.sin(flowTime * 0.09) * driftStrength * 0.6,
    );
    // Rotate the outer arms' colors slowly around the neutral RGB axis.
    // CPU uniforms keep trigonometry out of the cached-texture fragment pass.
    const hue = Math.sin(sceneTime * 0.075) * 0.45;
    const cosine = Math.cos(hue);
    const sine = Math.sin(hue) / Math.sqrt(3);
    const neutral = (1 - cosine) / 3;
    nebulaColorShift.set(
      cosine + neutral, neutral - sine, neutral + sine,
      neutral + sine, cosine + neutral, neutral - sine,
      neutral - sine, neutral + sine, cosine + neutral,
    );
    haloMaterial.uniforms.uTime.value = sceneTime;
    haloMaterial.uniforms.uFlowTime.value = flowTime;
    coreUniforms.uTime.value = sceneTime;
    backgroundMaterial.uniforms.uTime.value = sceneTime;
    coronaUniforms.uTime.value = sceneTime;
    meteors.forEach((meteor, index) => {
      const state = meteorFlights[index];
      if (sceneTime >= state.flight.nextStart) {
        state.sequence++;
        state.flight = createMeteorFlight(index, state.sequence, state.flight.nextStart);
      }
      const flight = state.flight;
      const progress = (sceneTime - flight.start) / flight.duration;
      meteor.visible = progress > 0 && progress < 1;
      if (!meteor.visible) return;
      const distance = progress * width * flight.distance;
      meteor.scale.x = flight.length;
      meteor.rotation.z = Math.atan2(flight.dy, flight.dx);
      meteor.position.set(
        flight.x * width - width / 2 + flight.dx * (flight.length * 0.433 - distance),
        flight.y * height - height / 2 + flight.dy * (flight.length * 0.433 - distance),
        0,
      );
      meteor.material.uniforms.uFade.value = THREE.MathUtils.smoothstep(progress, 0, 0.15)
        * (1 - THREE.MathUtils.smoothstep(progress, 0.6, 1));
    });
  };

  const render = (time: number, animate: boolean) => {
    if (contextLost) return;
    updateScene(time, animate);
    renderer.render(scene, camera);
  };

  const canAnimate = () =>
    shouldAnimateParticleHero({
      intersecting,
      visibilityState: document.visibilityState,
      reducedMotion,
      rendererAvailable: !contextLost,
    });

  const applyRenderDpr = () => {
    const renderDpr = baseRenderDpr * quality.scale;
    renderer.setPixelRatio(renderDpr);
    particleUniforms.uPixelRatio.value = renderDpr;
    coreUniforms.uPixelRatio.value = renderDpr;
    haloMaterial.uniforms.uPixelRatio.value = renderDpr;
    backgroundMaterial.uniforms.uPixelRatio.value = renderDpr;
  };

  const tick = (time: number) => {
    frameId = 0;
    if (destroyed || !canAnimate()) return;
    const previousScale = quality.scale;
    if (lastTickTime > 0) sampleParticleQuality(quality, time - lastTickTime);
    lastTickTime = time;
    if (quality.scale !== previousScale) applyRenderDpr();
    const elapsedSincePaint = lastPaintTime > 0
      ? time - lastPaintTime
      : Number.POSITIVE_INFINITY;
    const interactive = pointer.active || rotation.dragging || Math.abs(rotation.velocityYaw) > 0.01
      || Math.abs(rotation.velocityPitch) > 0.01;
    if (shouldRenderParticleFrame(elapsedSincePaint, interactive, mobile)) {
      render(time, true);
      const frameInterval = getParticleFrameInterval(interactive, mobile);
      lastPaintTime = Number.isFinite(elapsedSincePaint)
        ? time - (elapsedSincePaint % frameInterval)
        : time;
    }
    frameId = window.requestAnimationFrame(tick);
  };

  const syncAnimation = () => {
    if (frameId) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    }
    lastFrameTime = 0;
    lastPaintTime = 0;
    lastTickTime = 0;
    resetParticleQualitySamples(quality);
    if (canAnimate()) frameId = window.requestAnimationFrame(tick);
    else render(0, false);
  };

  const rebuildParticleAttributes = (count: number) => {
    const seeds = createVortexSeeds(count);
    const haloCount = seeds.reduce(
      (total, particle) => total + (getVortexHaloStyle(particle.lightTier) ? 1 : 0),
      0,
    );
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const brightness = new Float32Array(count);
    const phases = new Float32Array(count);
    const flares = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const radiusRatios = new Float32Array(count);
    const angularSpeeds = new Float32Array(count);
    const inwardSpeeds = new Float32Array(count);
    const haloPositions = new Float32Array(haloCount * 3);
    const haloSizes = new Float32Array(haloCount);
    const haloBrightness = new Float32Array(haloCount);
    const haloPhases = new Float32Array(haloCount);
    const haloFlares = new Float32Array(haloCount);
    const haloColors = new Float32Array(haloCount * 3);
    const haloRadiusRatios = new Float32Array(haloCount);
    const haloAngularSpeeds = new Float32Array(haloCount);
    const haloInwardSpeeds = new Float32Array(haloCount);
    let haloIndex = 0;

    seeds.forEach((particle, index) => {
      const radius = particle.radiusRatio * maxRadius;
      const offset = index * 3;
      positions[offset] = Math.cos(particle.angle) * radius;
      positions[offset + 1] = Math.sin(particle.angle) * radius;
      positions[offset + 2] = particle.depthRatio * maxRadius;
      sizes[index] = getVortexStarPointSize(particle.size, particle.flare)
        * (particle.flare ? 1.65 : 1);
      // Uneven clusters travel with the stars without adding per-frame noise.
      const clusterLight = 0.82 + 0.18 * Math.sin(
        particle.angle * 2 + particle.radiusRatio * 19,
      );
      brightness[index] = particle.brightness * clusterLight;
      phases[index] = particle.twinklePhase;
      flares[index] = particle.flare ? 1 : 0;
      radiusRatios[index] = particle.radiusRatio;
      angularSpeeds[index] = particle.angularSpeed;
      inwardSpeeds[index] = particle.inwardSpeed;
      const coolColor = STAR_COLORS[particle.colorIndex];
      const warmth = (1 - Math.min(1, particle.radiusRatio / 0.42)) ** 2;
      const color = coolColor.map((channel, i) =>
        THREE.MathUtils.lerp(channel, [1, 0.78, 0.5][i], warmth),
      );
      colors.set(color, offset);
      const haloStyle = getVortexHaloStyle(particle.lightTier);
      if (haloStyle) {
        const haloOffset = haloIndex * 3;
        haloPositions.set(positions.subarray(offset, offset + 3), haloOffset);
        haloSizes[haloIndex] = sizes[index] * haloStyle.scale;
        haloBrightness[haloIndex] = brightness[index] * haloStyle.brightnessScale;
        haloPhases[haloIndex] = particle.twinklePhase;
        haloFlares[haloIndex] = haloStyle.flareMix;
        haloRadiusRatios[haloIndex] = particle.radiusRatio;
        haloAngularSpeeds[haloIndex] = particle.angularSpeed;
        haloInwardSpeeds[haloIndex] = particle.inwardSpeed;
        haloColors.set(color, haloOffset);
        haloIndex += 1;
      }
    });

    const attributes = {
      position: new THREE.BufferAttribute(positions, 3),
      aSize: new THREE.BufferAttribute(sizes, 1),
      aBrightness: new THREE.BufferAttribute(brightness, 1),
      aPhase: new THREE.BufferAttribute(phases, 1),
      aFlare: new THREE.BufferAttribute(flares, 1),
      aRadiusRatio: new THREE.BufferAttribute(radiusRatios, 1),
      aAngularSpeed: new THREE.BufferAttribute(angularSpeeds, 1),
      aInwardSpeed: new THREE.BufferAttribute(inwardSpeeds, 1),
      aColor: new THREE.BufferAttribute(colors, 3),
    };
    // Dispose old GPU buffers before replacement (also on responsive resizes).
    particleGeometry.dispose();
    haloGeometry.dispose();
    Object.entries(attributes).forEach(([name, attribute]) => {
      particleGeometry.setAttribute(name, attribute);
    });
    // Upload only visible halos; regular stars never allocate transparent halo vertices.
    haloGeometry.setAttribute("position", new THREE.BufferAttribute(haloPositions, 3));
    haloGeometry.setAttribute("aSize", new THREE.BufferAttribute(haloSizes, 1));
    haloGeometry.setAttribute("aBrightness", new THREE.BufferAttribute(haloBrightness, 1));
    haloGeometry.setAttribute("aPhase", new THREE.BufferAttribute(haloPhases, 1));
    haloGeometry.setAttribute("aFlare", new THREE.BufferAttribute(haloFlares, 1));
    haloGeometry.setAttribute("aRadiusRatio", new THREE.BufferAttribute(haloRadiusRatios, 1));
    haloGeometry.setAttribute("aAngularSpeed", new THREE.BufferAttribute(haloAngularSpeeds, 1));
    haloGeometry.setAttribute("aInwardSpeed", new THREE.BufferAttribute(haloInwardSpeeds, 1));
    haloGeometry.setAttribute("aColor", new THREE.BufferAttribute(haloColors, 3));
    particleCount = count;
  };

  const rebuildBackground = (count: number) => {
    const seeds = createVortexSeeds(count, 413);
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const brightness = new Float32Array(count);
    const phases = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const flares = new Float32Array(count);
    seeds.forEach((seed, index) => {
      // Hashes of the stable seed distribute the distant field over the canvas.
      const x = Math.sin(index * 127.1 + 31) * 43758.5453;
      const y = Math.sin(index * 269.5 + 17) * 43758.5453;
      positions[index * 3] = ((x - Math.floor(x)) - 0.5) * width * 1.4;
      positions[index * 3 + 1] = ((y - Math.floor(y)) - 0.5) * height * 1.4;
      // A few nearby diffraction stars frame the galaxy; the rest remain distant.
      const foreground = index % 29 === 0;
      const middleDistance = !foreground && index % 7 === 0;
      positions[index * 3 + 2] = foreground ? 100 : middleDistance ? -180 : -480;
      sizes[index] = foreground ? 18 + seed.size * 6
        : middleDistance ? 2.4 + seed.size * 0.8 : 1.4 + seed.size * 0.6;
      brightness[index] = foreground ? 0.76
        : middleDistance ? 0.4 + seed.brightness * 0.25 : 0.22 + seed.brightness * 0.28;
      flares[index] = foreground ? 1 : 0;
      phases[index] = seed.twinklePhase;
      colors.set(STAR_COLORS[seed.colorIndex], index * 3);
    });
    backgroundGeometry.dispose();
    backgroundGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    backgroundGeometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    backgroundGeometry.setAttribute("aBrightness", new THREE.BufferAttribute(brightness, 1));
    backgroundGeometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    backgroundGeometry.setAttribute("aFlare", new THREE.BufferAttribute(flares, 1));
    backgroundGeometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  };

  const rebuild = () => {
    if (contextLost) {
      wrapper.dataset.canvasReady = "false";
      return;
    }
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
    mobile = viewportWidth < 768;
    // Keep the bright nucleus clear of the copy on narrow phones.
    centerX = width * (viewportWidth < 480 ? 0.78 : viewportWidth < 768 ? 0.64 : 0.68);
    centerY = height * 0.46;
    maxRadius = getVortexFieldRadius(width, height);

    const policy = getParticlePolicy(viewportWidth, window.devicePixelRatio);
    baseRenderDpr = fitWebglDpr(width, height, policy.dpr);
    applyRenderDpr();
    renderer.setSize(width, height, false);
    configureCamera(camera, width, height);
    bakeNebula(policy.nebulaTextureSize);
    rebuildParticleAttributes(policy.maxParticles);
    rebuildBackground(viewportWidth < 768 ? 160 : 360);

    orientation.position.set(centerX - width / 2, height / 2 - centerY, 0);
    nebulaMesh.scale.setScalar(maxRadius);
    coronaMesh.position.copy(orientation.position);
    const responsiveCoreStyle = getVortexCoreStyle(maxRadius);
    const coreScale = responsiveCoreStyle.coreRadius / coreStyle.coreRadius;
    corePoints.scale.setScalar(coreScale);
    coronaMesh.scale.setScalar(coreScale);

    wrapper.dataset.canvasReady = particleCount > 0 ? "true" : "false";
    render(0, false);
    syncAnimation();
  };

  const queueRebuild = () => {
    if (resizeFrameId) window.cancelAnimationFrame(resizeFrameId);
    resizeFrameId = window.requestAnimationFrame(() => {
      resizeFrameId = 0;
      rebuild();
    });
  };

  const updatePointer = (event: PointerEvent) => {
    const now = event.timeStamp || performance.now();
    if (rotation.dragging) {
      dragVortex(rotation, event.clientX - pointer.x, event.clientY - pointer.y,
        width, height, Math.max((now - pointer.lastTime) / 1000, 1 / 120));
    }
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.lastTime = now;
    pointer.active = event.pointerType !== "touch";
  };

  const cancelPointer = (event?: PointerEvent) => {
    if (event && event.pointerId !== pointer.pointerId) return;
    resetPointer();
  };
  const handlePointerEnter = (event: PointerEvent) => {
    if (pointer.pointerId === null && event.isPrimary) updatePointer(event);
  };
  const handlePointerLeave = () => {
    if (pointer.pointerId === null) pointer.active = false;
  };
  const handlePointerMove = (event: PointerEvent) => {
    if (!event.isPrimary || (pointer.pointerId !== null && event.pointerId !== pointer.pointerId)) return;
    updatePointer(event);
  };
  const handlePointerDown = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0 || reducedMotion || contextLost || pointer.pointerId !== null) return;
    updatePointer(event);
    beginVortexDrag(rotation);
    pointer.pointerId = event.pointerId;
    wrapper.dataset.dragging = "true";
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      // Window-level release handlers still end drags when capture is unavailable.
    }
  };
  const handlePointerUp = (event: PointerEvent) => {
    if (pointer.pointerId === null || event.pointerId !== pointer.pointerId) return;
    // Do not replace the last drag velocity with a zero-distance pointerup sample.
    if (event.timeStamp - pointer.lastTime > 100) rotation.secondsSinceMove = 1;
    endVortexDrag(rotation);
    const capturedId = pointer.pointerId;
    pointer.pointerId = null;
    pointer.active = event.pointerType !== "touch" && isPointInsideRect(
      { x: event.clientX, y: event.clientY }, canvas.getBoundingClientRect(),
    );
    wrapper.dataset.dragging = "false";
    if (canvas.hasPointerCapture?.(capturedId)) canvas.releasePointerCapture(capturedId);
  };
  const handleLostPointerCapture = () => {
    if (rotation.dragging) resetPointer();
  };
  const handleVisibility = () => {
    if (document.visibilityState !== "visible") resetPointer();
    syncAnimation();
  };
  const handleMotionChange = (event: MediaQueryListEvent) => {
    reducedMotion = event.matches;
    if (reducedMotion) resetPointer();
    syncAnimation();
  };
  const handleContextLost = (event: Event) => {
    event.preventDefault();
    resetPointer();
    contextLost = true;
    nebulaTextureReady = false;
    wrapper.dataset.canvasReady = "false";
    if (frameId) window.cancelAnimationFrame(frameId);
    frameId = 0;
  };
  const handleContextRestored = () => {
    if (destroyed) return;
    contextLost = false;
    rebuild();
  };

  const intersectionObserver = new IntersectionObserver(([entry]) => {
    intersecting = entry?.isIntersecting ?? false;
    if (!intersecting) resetPointer();
    syncAnimation();
  });
  const resizeObserver = new ResizeObserver(queueRebuild);

  canvas.addEventListener("pointerenter", handlePointerEnter);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerdown", handlePointerDown);
  window.addEventListener("pointerup", handlePointerUp);
  window.addEventListener("pointercancel", cancelPointer);
  canvas.addEventListener("lostpointercapture", handleLostPointerCapture);
  canvas.addEventListener("pointerleave", handlePointerLeave);
  canvas.addEventListener("webglcontextlost", handleContextLost);
  canvas.addEventListener("webglcontextrestored", handleContextRestored);
  window.addEventListener("blur", resetPointer);
  document.addEventListener("visibilitychange", handleVisibility);
  motionQuery.addEventListener("change", handleMotionChange);
  intersectionObserver.observe(canvas);
  resizeObserver.observe(canvas);
  rebuild();

  return () => {
    destroyed = true;
    resetPointer();
    if (frameId) window.cancelAnimationFrame(frameId);
    if (resizeFrameId) window.cancelAnimationFrame(resizeFrameId);
    intersectionObserver.disconnect();
    resizeObserver.disconnect();
    canvas.removeEventListener("pointerenter", handlePointerEnter);
    canvas.removeEventListener("pointermove", handlePointerMove);
    canvas.removeEventListener("pointerdown", handlePointerDown);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("pointercancel", cancelPointer);
    canvas.removeEventListener("lostpointercapture", handleLostPointerCapture);
    canvas.removeEventListener("pointerleave", handlePointerLeave);
    canvas.removeEventListener("webglcontextlost", handleContextLost);
    canvas.removeEventListener("webglcontextrestored", handleContextRestored);
    window.removeEventListener("blur", resetPointer);
    document.removeEventListener("visibilitychange", handleVisibility);
    motionQuery.removeEventListener("change", handleMotionChange);
    particleGeometry.dispose();
    particleMaterial.dispose();
    coreGeometry.dispose();
    coreMaterial.dispose();
    coronaGeometry.dispose();
    coronaMaterial.dispose();
    haloGeometry.dispose();
    haloMaterial.dispose();
    backgroundGeometry.dispose();
    backgroundMaterial.dispose();
    nebulaGeometry.dispose();
    nebulaMaterial.dispose();
    nebulaBakeMaterial.dispose();
    nebulaTarget.dispose();
    meteorGeometry.dispose();
    meteors.forEach((meteor) => meteor.material.dispose());
    renderer.dispose();
  };
}
