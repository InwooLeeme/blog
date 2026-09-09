import * as THREE from "three";
import {
  getPointerForce,
  writePointerRelease,
  writePointerVelocity,
  type Point,
  type PointerInfluenceInput,
} from "./particle-physics";
import {
  fitWebglDpr,
  getParticleFrameInterval,
  getParticlePolicy,
  isPointInsideRect,
  shouldAnimateParticleHero,
  shouldRenderParticleFrame,
} from "./particle-policy";
import {
  advanceVortexOrbit,
  createVortexSeeds,
  getFrameScale,
  getPerspectiveScale,
  getVortexStarLightProfile,
  getVortexStarPointSize,
  VORTEX_STAR_PERSPECTIVE_MAX,
  VORTEX_STAR_PERSPECTIVE_MIN,
  writeVortexPosition3D,
  type VortexPoint3D,
  type VortexSeed,
  type VortexStep,
} from "./vortex-field";
import { createVortexCoreParticles, getVortexCoreStyle } from "./vortex-core";

type StarParticle = VortexSeed & {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

type PointerState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  dragging: boolean;
  pointerId: number | null;
  lastTime: number;
};

const CAMERA_DISTANCE = 800;
const STAR_COLORS = [
  [0.949, 1, 1],
  [0.467, 0.91, 0.925],
  [0.533, 0.663, 1],
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
  varying vec3 vColor;
  varying float vAlpha;
  varying float vFlare;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    float twinkle = 0.82 + sin(uTime * 1.35 + aPhase) * 0.18;
    float perspective = clamp(
      ${CAMERA_DISTANCE.toFixed(1)} / -viewPosition.z,
      ${VORTEX_STAR_PERSPECTIVE_MIN.toFixed(2)},
      ${VORTEX_STAR_PERSPECTIVE_MAX.toFixed(2)}
    );
    gl_PointSize = max(2.0, aSize * uPixelRatio * perspective);
    gl_Position = projectionMatrix * viewPosition;
    vColor = aColor;
    vAlpha = min(1.0, aBrightness * twinkle * uAlphaBoost);
    vFlare = aFlare;
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

    float coreScale = mix(1.0, uFlareCoreScale, vFlare);
    float softCore = 1.0 - smoothstep(0.04, uSoftCoreRadius * coreScale, radius);
    float hotCore = 1.0 - smoothstep(0.0, uHotCoreRadius * coreScale, radius);
    float horizontal = exp(-uRaySharpness * point.y * point.y)
      * (1.0 - smoothstep(0.08, 1.0, abs(point.x)));
    float vertical = exp(-uRaySharpness * point.x * point.x)
      * (1.0 - smoothstep(0.08, 1.0, abs(point.y)));
    float rays = (horizontal + vertical) * vFlare * uRayStrength;
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
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    vec2 point = (vUv - 0.5) * 2.0;
    float radius = length(point);
    if (radius > 1.0) discard;

    float narrowGlow = (1.0 - smoothstep(0.22, 0.82, radius)) * 0.2;
    float horizontal = exp(-74.0 * point.y * point.y)
      * (1.0 - smoothstep(0.16, 1.0, abs(point.x)));
    float vertical = exp(-74.0 * point.x * point.x)
      * (1.0 - smoothstep(0.16, 1.0, abs(point.y)));
    vec2 diagonalPoint = mat2(0.707, -0.707, 0.707, 0.707) * point;
    float diagonal = exp(-105.0 * diagonalPoint.y * diagonalPoint.y)
      * (1.0 - smoothstep(0.2, 0.92, abs(diagonalPoint.x)));
    float pulse = 0.92 + sin(uTime * 0.7) * 0.08;
    float edgeFade = 1.0 - smoothstep(0.68, 1.0, radius);
    float alpha = (narrowGlow + horizontal * 0.35 + vertical * 0.35 + diagonal * 0.12)
      * edgeFade * pulse;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

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
      alpha: true,
      antialias: true,
      depth: true,
      powerPreference: "high-performance",
      premultipliedAlpha: false,
    });
  } catch {
    wrapper.dataset.canvasReady = "false";
    return () => undefined;
  }

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
  const particleGeometry = new THREE.BufferGeometry();
  const particleLightProfile = getVortexStarLightProfile("orbit");
  const particleUniforms = {
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
    uAlphaBoost: { value: particleLightProfile.alphaBoost },
    uHotCoreRadius: { value: particleLightProfile.hotCoreRadius },
    uSoftCoreRadius: { value: particleLightProfile.softCoreRadius },
    uEdgeFadeStart: { value: particleLightProfile.edgeFadeStart },
    uRayStrength: { value: particleLightProfile.rayStrength },
    uRaySharpness: { value: particleLightProfile.raySharpness },
    uFlareCoreScale: { value: particleLightProfile.flareCoreScale },
  };
  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: particleUniforms,
    vertexShader: STAR_VERTEX_SHADER,
    fragmentShader: STAR_FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
  });
  const particlePoints = new THREE.Points(particleGeometry, particleMaterial);
  particlePoints.frustumCulled = false;
  scene.add(particlePoints);

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
      (particle.size * 2.7 + 1.35) * (particle.flare ? 1.9 : 1);
    coreBrightness[index] = particle.brightness;
    corePhases[index] = particle.phase;
    coreFlares[index] = particle.flare ? 1 : 0;
    mixedCoreColor.copy(coreWhite).lerp(coreEdge, particle.colorMix * 0.52);
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
    depthTest: true,
    blending: THREE.AdditiveBlending,
  });
  const corePoints = new THREE.Points(coreGeometry, coreMaterial);
  corePoints.frustumCulled = false;
  corePoints.renderOrder = 2;

  const coronaUniforms = {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(coreStyle.coreColor) },
  };
  const coronaGeometry = new THREE.PlaneGeometry(
    coreStyle.coronaRadius * 2,
    coreStyle.coronaRadius * 2,
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
  coreGroup.add(coronaMesh, corePoints);
  scene.add(coreGroup);

  let width = 1;
  let height = 1;
  let centerX = 0;
  let centerY = 0;
  let maxRadius = 1;
  let particles: StarParticle[] = [];
  let positions = new Float32Array(0);
  let frameId = 0;
  let resizeFrameId = 0;
  let lastFrameTime = 0;
  let lastPaintTime = 0;
  let destroyed = false;
  let contextLost = false;
  let intersecting = false;
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = motionQuery.matches;
  const pointer: PointerState = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    active: false,
    dragging: false,
    pointerId: null,
    lastTime: 0,
  };
  const target: Point = { x: 0, y: 0 };
  const force: Point = { x: 0, y: 0 };
  const pointerVelocity: Point = { x: 0, y: 0 };
  const worldPosition: VortexPoint3D = { x: 0, y: 0, z: 0 };
  const orbitStep: VortexStep = {
    angle: 0,
    radiusRatio: 0,
    angularSpeed: 0,
    inwardSpeed: 0,
    recycled: false,
  };
  const forceInput: PointerInfluenceInput = {
    particle: target,
    pointer,
    pointerVelocity,
    active: false,
    dragging: false,
    reducedMotion: false,
    radius: 94,
    maxForce: 0.68,
  };

  const resetPointer = () => {
    pointer.active = false;
    pointer.dragging = false;
    pointer.pointerId = null;
    pointer.vx = 0;
    pointer.vy = 0;
    pointer.lastTime = 0;
  };

  const writeScreenTarget = (particle: StarParticle) => {
    writeVortexPosition3D(particle, maxRadius, worldPosition);
    const perspective = getPerspectiveScale(worldPosition.z, CAMERA_DISTANCE);
    target.x = centerX + worldPosition.x * perspective;
    target.y = centerY - worldPosition.y * perspective;
    return perspective;
  };

  const writeParticleBuffers = (time: number, animate: boolean) => {
    const deltaSeconds = animate
      ? lastFrameTime > 0
        ? (time - lastFrameTime) / 1000
        : 1 / 60
      : 0;
    const frameScale = getFrameScale(deltaSeconds);
    lastFrameTime = animate ? time : 0;
    const particleDamping = animate ? Math.pow(0.9, frameScale) : 1;

    if (animate) {
      writePointerVelocity(pointer, pointerVelocity);
      forceInput.active = pointer.active;
      forceInput.dragging = pointer.dragging;
      forceInput.reducedMotion = reducedMotion;
      forceInput.radius = pointer.dragging ? 132 : 94;
      forceInput.maxForce = pointer.dragging ? 1.95 : 0.68;
    }

    particles.forEach((particle, index) => {
      let recycled = false;
      if (animate) {
        const nextOrbit = advanceVortexOrbit(particle, deltaSeconds, orbitStep);
        particle.angle = nextOrbit.angle;
        particle.radiusRatio = nextOrbit.radiusRatio;
        recycled = nextOrbit.recycled;
      }

      const perspective = writeScreenTarget(particle);
      if (recycled) {
        particle.x = target.x;
        particle.y = target.y;
        particle.vx = 0;
        particle.vy = 0;
      } else if (animate) {
        forceInput.particle = particle;
        getPointerForce(forceInput, force);
        particle.vx += ((target.x - particle.x) * 0.014 + force.x) * frameScale;
        particle.vy += ((target.y - particle.y) * 0.014 + force.y) * frameScale;
        particle.vx *= particleDamping;
        particle.vy *= particleDamping;
        particle.x += particle.vx * frameScale;
        particle.y += particle.vy * frameScale;
      } else {
        particle.x = target.x;
        particle.y = target.y;
        particle.vx = 0;
        particle.vy = 0;
      }

      const offset = index * 3;
      positions[offset] = (particle.x - width / 2) / perspective;
      positions[offset + 1] = -(particle.y - height / 2) / perspective;
      positions[offset + 2] = worldPosition.z;
    });

    const positionAttribute = particleGeometry.getAttribute("position") as THREE.BufferAttribute;
    positionAttribute.needsUpdate = true;
    particleUniforms.uTime.value = time * 0.001;
    coreUniforms.uTime.value = time * 0.001;
    coronaUniforms.uTime.value = time * 0.001;

    if (animate) {
      corePoints.rotation.y += coreStyle.rotationSpeed * deltaSeconds;
      corePoints.rotation.x += coreStyle.rotationSpeed * 0.42 * deltaSeconds;
      coronaMesh.rotation.z -= coreStyle.rotationSpeed * 0.18 * deltaSeconds;
      const pointerDamping = Math.pow(0.84, frameScale);
      pointer.vx *= pointerDamping;
      pointer.vy *= pointerDamping;
    }
  };

  const render = (time: number, animate: boolean) => {
    if (contextLost) return;
    writeParticleBuffers(time, animate);
    renderer.render(scene, camera);
  };

  const canAnimate = () =>
    shouldAnimateParticleHero({
      intersecting,
      visibilityState: document.visibilityState,
      reducedMotion,
      rendererAvailable: !contextLost,
    });

  const tick = (time: number) => {
    frameId = 0;
    if (destroyed || !canAnimate()) return;
    const elapsedSincePaint = lastPaintTime > 0
      ? time - lastPaintTime
      : Number.POSITIVE_INFINITY;
    if (shouldRenderParticleFrame(elapsedSincePaint, pointer.active)) {
      render(time, true);
      const frameInterval = getParticleFrameInterval(pointer.active);
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
    if (canAnimate()) frameId = window.requestAnimationFrame(tick);
    else render(0, false);
  };

  const rebuildParticleAttributes = (count: number) => {
    particles = createVortexSeeds(count).map((seed) => ({
      ...seed,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
    }));
    positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const brightness = new Float32Array(count);
    const phases = new Float32Array(count);
    const flares = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    particles.forEach((particle, index) => {
      sizes[index] = getVortexStarPointSize(particle.size, particle.flare);
      brightness[index] = particle.brightness;
      phases[index] = particle.twinklePhase;
      flares[index] = particle.flare ? 1 : 0;
      colors.set(STAR_COLORS[particle.colorIndex], index * 3);
    });

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    particleGeometry.setAttribute("aBrightness", new THREE.BufferAttribute(brightness, 1));
    particleGeometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    particleGeometry.setAttribute("aFlare", new THREE.BufferAttribute(flares, 1));
    particleGeometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  };

  const rebuild = () => {
    if (contextLost) {
      wrapper.dataset.canvasReady = "false";
      return;
    }
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    centerX = width * (document.documentElement.clientWidth < 768 ? 0.5 : 0.54);
    centerY = height * 0.46;
    maxRadius = Math.min(width * 0.49, height * 0.66);

    const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
    const policy = getParticlePolicy(viewportWidth, window.devicePixelRatio);
    const renderDpr = fitWebglDpr(width, height, policy.dpr);
    renderer.setPixelRatio(renderDpr);
    renderer.setSize(width, height, false);
    configureCamera(camera, width, height);
    particleUniforms.uPixelRatio.value = renderDpr;
    coreUniforms.uPixelRatio.value = renderDpr;

    if (particles.length !== policy.maxParticles) {
      rebuildParticleAttributes(policy.maxParticles);
    }

    coreGroup.position.set(centerX - width / 2, height / 2 - centerY, 0);
    const responsiveCoreStyle = getVortexCoreStyle(maxRadius);
    const coreScale = responsiveCoreStyle.coreRadius / coreStyle.coreRadius;
    corePoints.scale.setScalar(coreScale);
    coronaMesh.scale.setScalar(coreScale);

    particles.forEach((particle) => {
      writeScreenTarget(particle);
      particle.x = target.x;
      particle.y = target.y;
      particle.vx = 0;
      particle.vy = 0;
    });

    wrapper.dataset.canvasReady = particles.length > 0 ? "true" : "false";
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
    const rect = canvas.getBoundingClientRect();
    const nextX = event.clientX - rect.left;
    const nextY = event.clientY - rect.top;
    const now = event.timeStamp || performance.now();
    const elapsed = pointer.lastTime > 0 ? Math.max(now - pointer.lastTime, 1) : 16.67;
    pointer.vx = clamp(((nextX - pointer.x) / elapsed) * 16.67, -32, 32);
    pointer.vy = clamp(((nextY - pointer.y) / elapsed) * 16.67, -32, 32);
    pointer.x = nextX;
    pointer.y = nextY;
    pointer.lastTime = now;
    pointer.active = true;
  };

  const cancelPointer = (event?: PointerEvent) => {
    if (
      event &&
      pointer.pointerId !== null &&
      event.pointerId !== pointer.pointerId
    ) return;
    const capturedId = pointer.pointerId;
    resetPointer();
    if (capturedId !== null && canvas.hasPointerCapture?.(capturedId)) {
      canvas.releasePointerCapture(capturedId);
    }
  };

  const handlePointerEnter = (event: PointerEvent) => updatePointer(event);
  const handlePointerMove = (event: PointerEvent) => {
    if (pointer.pointerId !== null && event.pointerId !== pointer.pointerId) return;
    if (
      pointer.dragging &&
      !isPointInsideRect(
        { x: event.clientX, y: event.clientY },
        canvas.getBoundingClientRect(),
      )
    ) {
      cancelPointer(event);
      return;
    }
    updatePointer(event);
  };
  const handlePointerDown = (event: PointerEvent) => {
    if (!event.isPrimary || reducedMotion) return;
    updatePointer(event);
    pointer.dragging = true;
    pointer.pointerId = event.pointerId;
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is progressive enhancement; native events still work.
    }
  };
  const handlePointerUp = (event: PointerEvent) => {
    if (pointer.pointerId !== null && event.pointerId !== pointer.pointerId) return;
    const capturedId = pointer.pointerId;
    updatePointer(event);
    const keepHover = isPointInsideRect(
      { x: event.clientX, y: event.clientY },
      canvas.getBoundingClientRect(),
    );
    writePointerRelease(pointer, keepHover);
    if (capturedId !== null && canvas.hasPointerCapture?.(capturedId)) {
      canvas.releasePointerCapture(capturedId);
    }
  };
  const handleLostPointerCapture = () => {
    if (pointer.dragging) resetPointer();
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
    contextLost = true;
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
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointercancel", cancelPointer);
  canvas.addEventListener("lostpointercapture", handleLostPointerCapture);
  canvas.addEventListener("pointerleave", cancelPointer);
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
    canvas.removeEventListener("pointerup", handlePointerUp);
    canvas.removeEventListener("pointercancel", cancelPointer);
    canvas.removeEventListener("lostpointercapture", handleLostPointerCapture);
    canvas.removeEventListener("pointerleave", cancelPointer);
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
    renderer.dispose();
  };
}
