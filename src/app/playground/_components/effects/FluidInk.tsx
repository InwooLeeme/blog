"use client";

import { useEffect, useRef } from "react";
import { rand } from "./canvas";

/**
 * 잉크 유체 — WebGL2 Stable Fluids(Navier-Stokes) 시뮬레이션.
 * 밝은 배경 위에서 커서가 끄는 방향·속도로 색 염료를 주입하면 와류(vorticity confinement)와
 * 함께 번지고 섞이며, 시간이 지나면 흰 배경으로 가라앉는다. 커서가 없으면 일정 간격으로
 * 자동 스플랫을 찍어 계속 휘젓는다. WebGL2 + EXT_color_buffer_half_float 미지원이면 정적 배경으로 대체.
 */
const CONFIG = {
  simRes: 128, // 속도/압력 시뮬레이션 그리드 해상도(긴 변 기준)
  dyeRes: 512, // 염료(색) 그리드 해상도
  pressureIterations: 20,
  pressureDecay: 0.8, // 자코비 솔버 워밍스타트 시 이전 압력 감쇠율
  velocityDecay: 0.18, // 속도장 소산 속도(/초)
  densityDecay: 0.28, // 염료가 흰 배경으로 되돌아가는 속도(/초)
  curl: 22, // 와류 강도(vorticity confinement)
  splatRadius: 0.0022, // 스플랫 반경(정규화 좌표 기준)
  dragForce: 9000, // 드래그 속도 → 속도장 주입 힘 스케일
  idleInterval: 1.6, // 유휴 시 자동 스플랫 간격(초)
  idleForce: 2600,
  idleHueJump: [20, 60] as readonly [number, number], // 자동 스플랫마다 색상이 점프하는 범위(도)
  hueSpeed: 26, // 색상 순환 속도(도/초, 드래그 거리에 비례해 추가 가산)
  hueSpeedRefFps: 60, // hueSpeed가 가정하는 기준 프레임레이트(드래그 거리 → 색상 가산 변환용)
  minDragDist: 0.5, // 드래그로 인정할 최소 픽셀 이동량
  intensityDistDivisor: 40, // 드래그 거리를 스플랫 강도(0~1)로 변환하는 나눗값
  reducedSplatCount: 5, // reduced-motion 정적 프레임을 위해 미리 찍는 시드 스플랫 수
  reducedSettleSteps: 30, // reduced-motion 정적 프레임 전 미리 진행하는 시뮬레이션 스텝 수
  fixedDt: 1 / 60, // reduced-motion 시드 스텝에 쓰는 고정 dt(초)
  resizeDebounceMs: 150, // 리사이즈 후 FBO 재생성까지 대기 시간(ms) — 드래그 중 과도한 재할당 방지
  maxDpr: 1.5,
} as const;

const BASE_VERTEX_SHADER = `#version 300 es
precision highp float;
in vec2 aPosition;
out vec2 vUv;
out vec2 vL;
out vec2 vR;
out vec2 vT;
out vec2 vB;
uniform vec2 texelSize;
void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const ADVECTION_SHADER = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform vec2 dyeTexelSize;
uniform float dt;
uniform vec3 decayTarget;
uniform float decayRate;
out vec4 fragColor;

vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
  vec2 st = uv / tsize - 0.5;
  vec2 iuv = floor(st);
  vec2 fuv = fract(st);
  vec4 a = texture(sam, (iuv + vec2(0.5, 0.5)) * tsize);
  vec4 b = texture(sam, (iuv + vec2(1.5, 0.5)) * tsize);
  vec4 c = texture(sam, (iuv + vec2(0.5, 1.5)) * tsize);
  vec4 d = texture(sam, (iuv + vec2(1.5, 1.5)) * tsize);
  return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
}

void main () {
  vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize;
  vec4 result = bilerp(uSource, coord, dyeTexelSize);
  fragColor = vec4(mix(result.rgb, decayTarget, clamp(decayRate * dt, 0.0, 1.0)), 1.0);
}`;

const DIVERGENCE_SHADER = `#version 300 es
precision highp float;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
uniform sampler2D uVelocity;
out vec4 fragColor;
void main () {
  float L = texture(uVelocity, vL).x;
  float R = texture(uVelocity, vR).x;
  float T = texture(uVelocity, vT).y;
  float B = texture(uVelocity, vB).y;
  vec2 C = texture(uVelocity, vUv).xy;
  if (vL.x < 0.0) { L = -C.x; }
  if (vR.x > 1.0) { R = -C.x; }
  if (vT.y > 1.0) { T = -C.y; }
  if (vB.y < 0.0) { B = -C.y; }
  float div = 0.5 * (R - L + T - B);
  fragColor = vec4(div, 0.0, 0.0, 1.0);
}`;

const CURL_SHADER = `#version 300 es
precision highp float;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
uniform sampler2D uVelocity;
out vec4 fragColor;
void main () {
  float L = texture(uVelocity, vL).y;
  float R = texture(uVelocity, vR).y;
  float T = texture(uVelocity, vT).x;
  float B = texture(uVelocity, vB).x;
  float vort = R - L - T + B;
  fragColor = vec4(0.5 * vort, 0.0, 0.0, 1.0);
}`;

const VORTICITY_SHADER = `#version 300 es
precision highp float;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curlStrength;
uniform float dt;
out vec4 fragColor;
void main () {
  float L = texture(uCurl, vL).x;
  float R = texture(uCurl, vR).x;
  float T = texture(uCurl, vT).x;
  float B = texture(uCurl, vB).x;
  float C = texture(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curlStrength * C;
  force.y *= -1.0;
  vec2 vel = texture(uVelocity, vUv).xy;
  fragColor = vec4(vel + force * dt, 0.0, 1.0);
}`;

const PRESSURE_SHADER = `#version 300 es
precision highp float;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
out vec4 fragColor;
void main () {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  float divergence = texture(uDivergence, vUv).x;
  float pressure = (L + R + B + T - divergence) * 0.25;
  fragColor = vec4(pressure, 0.0, 0.0, 1.0);
}`;

const GRADIENT_SUBTRACT_SHADER = `#version 300 es
precision highp float;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
out vec4 fragColor;
void main () {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  vec2 vel = texture(uVelocity, vUv).xy;
  vel -= vec2(R - L, T - B) * 0.5;
  fragColor = vec4(vel, 0.0, 1.0);
}`;

const CLEAR_SHADER = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTexture;
uniform float value;
out vec4 fragColor;
void main () {
  fragColor = value * texture(uTexture, vUv);
}`;

const SPLAT_VELOCITY_SHADER = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
out vec4 fragColor;
void main () {
  vec2 p = vUv - point;
  p.x *= aspectRatio;
  vec3 splat = exp(-dot(p, p) / radius) * color;
  vec3 base = texture(uTarget, vUv).xyz;
  fragColor = vec4(base + splat, 1.0);
}`;

const SPLAT_DYE_SHADER = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
uniform float intensity;
out vec4 fragColor;
void main () {
  vec2 p = vUv - point;
  p.x *= aspectRatio;
  float w = intensity * exp(-dot(p, p) / radius);
  vec3 base = texture(uTarget, vUv).xyz;
  fragColor = vec4(mix(base, color, w), 1.0);
}`;

const DISPLAY_SHADER = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTexture;
out vec4 fragColor;
void main () {
  fragColor = vec4(texture(uTexture, vUv).rgb, 1.0);
}`;

type GLProgram = { uniforms: Record<string, WebGLUniformLocation>; bind: () => void };

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(log ?? "shader compile failed");
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vsSource: string, fsSource: string): GLProgram {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.bindAttribLocation(program, 0, "aPosition");
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? "program link failed");
  }
  const uniforms: Record<string, WebGLUniformLocation> = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(program, i);
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name)!;
  }
  return { uniforms, bind: () => gl.useProgram(program) };
}

type FBO = { texture: WebGLTexture; fbo: WebGLFramebuffer; width: number; height: number; texelSizeX: number; texelSizeY: number };

function createFBO(gl: WebGL2RenderingContext, w: number, h: number, filter: number): FBO {
  gl.activeTexture(gl.TEXTURE0);
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);

  const fbo = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.viewport(0, 0, w, h);
  gl.clear(gl.COLOR_BUFFER_BIT);

  return { texture, fbo, width: w, height: h, texelSizeX: 1 / w, texelSizeY: 1 / h };
}

type DoubleFBO = { width: number; height: number; texelSizeX: number; texelSizeY: number; read: FBO; write: FBO; swap: () => void };

function createDoubleFBO(gl: WebGL2RenderingContext, w: number, h: number, filter: number): DoubleFBO {
  let a = createFBO(gl, w, h, filter);
  let b = createFBO(gl, w, h, filter);
  return {
    width: w,
    height: h,
    texelSizeX: a.texelSizeX,
    texelSizeY: a.texelSizeY,
    get read() {
      return a;
    },
    get write() {
      return b;
    },
    swap() {
      const tmp = a;
      a = b;
      b = tmp;
    },
  };
}

function deleteFBO(gl: WebGL2RenderingContext, fbo: FBO) {
  gl.deleteTexture(fbo.texture);
  gl.deleteFramebuffer(fbo.fbo);
}

function deleteDoubleFBO(gl: WebGL2RenderingContext, fbo: DoubleFBO) {
  deleteFBO(gl, fbo.read);
  deleteFBO(gl, fbo.write);
}

function paintWhite(gl: WebGL2RenderingContext, fbo: FBO) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.fbo);
  gl.viewport(0, 0, fbo.width, fbo.height);
  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function bindTexture(gl: WebGL2RenderingContext, texture: WebGLTexture, unit: number) {
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
}

/** 캔버스 종횡비에 맞춰 시뮬레이션 그리드의 가로/세로 해상도를 정한다(긴 변 = resolution) */
function getResolution(gl: WebGL2RenderingContext, resolution: number) {
  const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
  const a = aspect < 1 ? 1 / aspect : aspect;
  const min = Math.round(resolution);
  const max = Math.round(resolution * a);
  return gl.drawingBufferWidth > gl.drawingBufferHeight ? { width: max, height: min } : { width: min, height: max };
}

/** HSL(h, 75%, 55%) → RGB(0~1) — 잉크 색 순환에 사용 */
function colorForHue(h: number): [number, number, number] {
  const s = 0.75;
  const l = 0.55;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return [r + m, g + m, b + m];
}

/** WebGL2 컨텍스트가 준비된 뒤 시뮬레이션 전체(프로그램·FBO·루프·입력)를 구성하고 정리 함수를 반환한다 */
function setupFluidSim(
  gl: WebGL2RenderingContext,
  canvas: HTMLCanvasElement,
  parent: HTMLElement,
  reduced: boolean,
): () => void {
  const advectionProgram = createProgram(gl, BASE_VERTEX_SHADER, ADVECTION_SHADER);
  const divergenceProgram = createProgram(gl, BASE_VERTEX_SHADER, DIVERGENCE_SHADER);
  const curlProgram = createProgram(gl, BASE_VERTEX_SHADER, CURL_SHADER);
  const vorticityProgram = createProgram(gl, BASE_VERTEX_SHADER, VORTICITY_SHADER);
  const pressureProgram = createProgram(gl, BASE_VERTEX_SHADER, PRESSURE_SHADER);
  const gradientSubtractProgram = createProgram(gl, BASE_VERTEX_SHADER, GRADIENT_SUBTRACT_SHADER);
  const clearProgram = createProgram(gl, BASE_VERTEX_SHADER, CLEAR_SHADER);
  const splatVelocityProgram = createProgram(gl, BASE_VERTEX_SHADER, SPLAT_VELOCITY_SHADER);
  const splatDyeProgram = createProgram(gl, BASE_VERTEX_SHADER, SPLAT_DYE_SHADER);
  const displayProgram = createProgram(gl, BASE_VERTEX_SHADER, DISPLAY_SHADER);

  const quadBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const blit = (target: FBO | null) => {
    if (target == null) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      gl.viewport(0, 0, target.width, target.height);
    }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  };

  let velocity: DoubleFBO;
  let dye: DoubleFBO;
  let pressure: DoubleFBO;
  let curlFBO: FBO;
  let divergenceFBO: FBO;
  let hasFramebuffers = false;

  const initFramebuffers = () => {
    if (hasFramebuffers) {
      deleteDoubleFBO(gl, velocity);
      deleteDoubleFBO(gl, dye);
      deleteDoubleFBO(gl, pressure);
      deleteFBO(gl, curlFBO);
      deleteFBO(gl, divergenceFBO);
    }
    hasFramebuffers = true;

    const simRes = getResolution(gl, CONFIG.simRes);
    const dyeRes = getResolution(gl, CONFIG.dyeRes);
    velocity = createDoubleFBO(gl, simRes.width, simRes.height, gl.LINEAR);
    dye = createDoubleFBO(gl, dyeRes.width, dyeRes.height, gl.LINEAR);
    pressure = createDoubleFBO(gl, simRes.width, simRes.height, gl.NEAREST);
    curlFBO = createFBO(gl, simRes.width, simRes.height, gl.NEAREST);
    divergenceFBO = createFBO(gl, simRes.width, simRes.height, gl.NEAREST);
    paintWhite(gl, dye.read);
    paintWhite(gl, dye.write);
  };

  const splat = (x: number, y: number, dx: number, dy: number, color: [number, number, number], intensity: number) => {
    const aspectRatio = canvas.width / canvas.height;

    splatVelocityProgram.bind();
    gl.uniform2f(splatVelocityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    bindTexture(gl, velocity.read.texture, 0);
    gl.uniform1i(splatVelocityProgram.uniforms.uTarget, 0);
    gl.uniform1f(splatVelocityProgram.uniforms.aspectRatio, aspectRatio);
    gl.uniform2f(splatVelocityProgram.uniforms.point, x, y);
    gl.uniform3f(splatVelocityProgram.uniforms.color, dx, dy, 0);
    gl.uniform1f(splatVelocityProgram.uniforms.radius, CONFIG.splatRadius);
    blit(velocity.write);
    velocity.swap();

    splatDyeProgram.bind();
    gl.uniform2f(splatDyeProgram.uniforms.texelSize, dye.texelSizeX, dye.texelSizeY);
    bindTexture(gl, dye.read.texture, 0);
    gl.uniform1i(splatDyeProgram.uniforms.uTarget, 0);
    gl.uniform1f(splatDyeProgram.uniforms.aspectRatio, aspectRatio);
    gl.uniform2f(splatDyeProgram.uniforms.point, x, y);
    gl.uniform3f(splatDyeProgram.uniforms.color, color[0], color[1], color[2]);
    gl.uniform1f(splatDyeProgram.uniforms.radius, CONFIG.splatRadius);
    gl.uniform1f(splatDyeProgram.uniforms.intensity, intensity);
    blit(dye.write);
    dye.swap();
  };

  /** 속도장을 따라 target(자기 자신)을 이류시키고 decayTarget으로 서서히 되돌린다 */
  const advect = (target: DoubleFBO, sourceUnit: number, decayTarget: readonly [number, number, number], decayRate: number, dt: number) => {
    advectionProgram.bind();
    gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    bindTexture(gl, velocity.read.texture, 0);
    gl.uniform1i(advectionProgram.uniforms.uVelocity, 0);
    bindTexture(gl, target.read.texture, sourceUnit);
    gl.uniform1i(advectionProgram.uniforms.uSource, sourceUnit);
    gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, target.texelSizeX, target.texelSizeY);
    gl.uniform1f(advectionProgram.uniforms.dt, dt);
    gl.uniform3f(advectionProgram.uniforms.decayTarget, decayTarget[0], decayTarget[1], decayTarget[2]);
    gl.uniform1f(advectionProgram.uniforms.decayRate, decayRate);
    blit(target.write);
    target.swap();
  };

  const step = (dt: number) => {
    gl.disable(gl.BLEND);

    curlProgram.bind();
    gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    bindTexture(gl, velocity.read.texture, 0);
    gl.uniform1i(curlProgram.uniforms.uVelocity, 0);
    blit(curlFBO);

    vorticityProgram.bind();
    gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    bindTexture(gl, velocity.read.texture, 0);
    gl.uniform1i(vorticityProgram.uniforms.uVelocity, 0);
    bindTexture(gl, curlFBO.texture, 1);
    gl.uniform1i(vorticityProgram.uniforms.uCurl, 1);
    gl.uniform1f(vorticityProgram.uniforms.curlStrength, CONFIG.curl);
    gl.uniform1f(vorticityProgram.uniforms.dt, dt);
    blit(velocity.write);
    velocity.swap();

    divergenceProgram.bind();
    gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    bindTexture(gl, velocity.read.texture, 0);
    gl.uniform1i(divergenceProgram.uniforms.uVelocity, 0);
    blit(divergenceFBO);

    clearProgram.bind();
    gl.uniform2f(clearProgram.uniforms.texelSize, pressure.texelSizeX, pressure.texelSizeY);
    bindTexture(gl, pressure.read.texture, 0);
    gl.uniform1i(clearProgram.uniforms.uTexture, 0);
    gl.uniform1f(clearProgram.uniforms.value, CONFIG.pressureDecay);
    blit(pressure.write);
    pressure.swap();

    pressureProgram.bind();
    gl.uniform2f(pressureProgram.uniforms.texelSize, pressure.texelSizeX, pressure.texelSizeY);
    bindTexture(gl, divergenceFBO.texture, 1);
    gl.uniform1i(pressureProgram.uniforms.uDivergence, 1);
    for (let i = 0; i < CONFIG.pressureIterations; i++) {
      bindTexture(gl, pressure.read.texture, 0);
      gl.uniform1i(pressureProgram.uniforms.uPressure, 0);
      blit(pressure.write);
      pressure.swap();
    }

    gradientSubtractProgram.bind();
    gl.uniform2f(gradientSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    bindTexture(gl, pressure.read.texture, 0);
    gl.uniform1i(gradientSubtractProgram.uniforms.uPressure, 0);
    bindTexture(gl, velocity.read.texture, 1);
    gl.uniform1i(gradientSubtractProgram.uniforms.uVelocity, 1);
    blit(velocity.write);
    velocity.swap();

    advect(velocity, 0, [0, 0, 0], CONFIG.velocityDecay, dt);
    advect(dye, 1, [1, 1, 1], CONFIG.densityDecay, dt);
  };

  const render = () => {
    gl.disable(gl.BLEND);
    displayProgram.bind();
    bindTexture(gl, dye.read.texture, 0);
    gl.uniform1i(displayProgram.uniforms.uTexture, 0);
    blit(null);
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDpr);
    const w = Math.max(1, Math.round(parent.clientWidth * dpr));
    const h = Math.max(1, Math.round(parent.clientHeight * dpr));
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${parent.clientWidth}px`;
    canvas.style.height = `${parent.clientHeight}px`;
    initFramebuffers();
  };

  let hue = rand(0, 360);
  let lastX = 0;
  let lastY = 0;
  let hasLast = false;

  const onPointerMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    if (px < 0 || py < 0 || px > rect.width || py > rect.height) {
      hasLast = false;
      return;
    }
    const u = px / rect.width;
    const v = 1 - py / rect.height;
    if (hasLast) {
      const dx = px - lastX;
      const dy = -(py - lastY);
      const dist = Math.hypot(dx, dy);
      if (dist > CONFIG.minDragDist) {
        hue = (hue + dist * (CONFIG.hueSpeed / CONFIG.hueSpeedRefFps)) % 360;
        const intensity = Math.min(1, dist / CONFIG.intensityDistDivisor);
        splat(u, v, dx * CONFIG.dragForce, dy * CONFIG.dragForce, colorForHue(hue), intensity);
        idleTimer = 0;
      }
    }
    lastX = px;
    lastY = py;
    hasLast = true;
  };

  let idleTimer = 0;
  const autoSplat = () => {
    hue = (hue + rand(CONFIG.idleHueJump[0], CONFIG.idleHueJump[1])) % 360;
    const u = rand(0.2, 0.8);
    const v = rand(0.2, 0.8);
    const angle = rand(0, Math.PI * 2);
    splat(u, v, Math.cos(angle) * CONFIG.idleForce, Math.sin(angle) * CONFIG.idleForce, colorForHue(hue), 1);
  };

  resize();

  if (reduced) {
    for (let i = 0; i < CONFIG.reducedSplatCount; i++) autoSplat();
    for (let i = 0; i < CONFIG.reducedSettleSteps; i++) step(CONFIG.fixedDt);
    render();
    return () => {};
  }

  let rafId = 0;
  let lastTime = 0;
  let running = false;
  const tick = (time: number) => {
    const dt = lastTime ? Math.min((time - lastTime) / 1000, 1 / 30) : 0;
    lastTime = time;
    idleTimer += dt;
    if (idleTimer > CONFIG.idleInterval) {
      idleTimer = 0;
      autoSplat();
    }
    if (dt > 0) step(dt);
    render();
    rafId = requestAnimationFrame(tick);
  };
  const start = () => {
    if (running) return;
    running = true;
    lastTime = 0;
    rafId = requestAnimationFrame(tick);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(rafId);
  };

  let resizeTimer = 0;
  const scheduleResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, CONFIG.resizeDebounceMs);
  };

  start();
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("resize", scheduleResize);

  const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { threshold: 0 });
  io.observe(canvas);

  return () => {
    stop();
    window.clearTimeout(resizeTimer);
    io.disconnect();
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("resize", scheduleResize);
  };
}

export default function FluidInk() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false, stencil: false }) as WebGL2RenderingContext | null;

    if (!gl || !gl.getExtension("EXT_color_buffer_half_float")) {
      if (!gl) {
        // WebGL2 자체를 못 만든 경우에만 2D 컨텍스트로 정적 배경을 대신 그릴 수 있다
        const ctx2d = canvas.getContext("2d");
        if (ctx2d) {
          canvas.width = parent.clientWidth;
          canvas.height = parent.clientHeight;
          ctx2d.fillStyle = "#f6f5f3";
          ctx2d.fillRect(0, 0, canvas.width, canvas.height);
        }
      } else {
        // gl은 있지만 half-float 렌더 타겟 확장이 없는 경우 — 같은 캔버스라 2D 컨텍스트를 새로 못 얻으므로 WebGL로 정적 배경만 채운다
        gl.clearColor(0.965, 0.96, 0.955, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      return;
    }
    gl.getExtension("OES_texture_float_linear");

    return setupFluidSim(gl, canvas, parent, reduced);
  }, []);

  return <canvas ref={ref} aria-hidden className="absolute inset-0" />;
}
