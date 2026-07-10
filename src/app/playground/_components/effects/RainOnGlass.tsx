"use client";

import { useEffect, useRef } from "react";
import { rand } from "./canvas";

/**
 * 빗방울 유리.
 * CPU 파티클(빗방울 충돌 생성·병합·stick-slip 흘러내림)을 높이맵 캔버스에 그리고,
 * 셰이더가 높이맵 기울기로 절차 보케 배경을 픽셀 단위 굴절시킨다.
 * 방울 안은 선명한 반전상, 밖은 김 서린 흐릿한 배경 — 흘러내린 자국이 김을 닦아낸다.
 * 응결 성장은 없음: 방울은 새 빗방울과의 충돌 병합으로만 커진다.
 * WebGL2 미지원이면 정적 보케 한 장으로 대체.
 */
const CONFIG = {
  mapScale: 0.5, // 높이맵·자국맵 해상도(CSS px 대비)
  maxDrops: 700,
  gravity: 0.1, // 흘러내림 구동력(크기 비례)
  friction: 0.92, // 미끄럼 마찰 — 작은 방울은 멈춰 붙음(stick-slip)
  slideMinR: 5,
  slideChance: 0.0012,
  maxR: 16,
  trailGap: 3,
  rainPerArea: 1 / 8000, // 초당·px²당 빗방울 충돌
  rainMin: 10,
  rainMax: 55,
  splashChance: 0.25, // 충돌 시 스플래시 링/위성 방울 비율
  evapChance: 0.005, // 작은 방울 증발 확률(프레임) — 자리 회전용
  heavyEvery: [0.7, 1.5], // 위에서 시작하는 큰 흘러내림 방울 간격(초)
  seedPerArea: 1 / 2800,
} as const;

const TAU = Math.PI * 2;
const SPRITE_SIZE = 64;

type Drop = { x: number; y: number; r: number; vx: number; vy: number; sliding: boolean; trail: number; drift: number; dead: boolean };
type Ring = { x: number; y: number; age: number; life: number };

// 보케 광원 — 위치(비율)·반경(비율)은 셰이더 상수와 동일(2D 폴백에서 공유)
const LIGHTS = [
  { x: 0.22, y: 0.28, r: 0.34, color: "#2a6f7a" },
  { x: 0.72, y: 0.22, r: 0.3, color: "#2d4f9a" },
  { x: 0.46, y: 0.62, r: 0.32, color: "#8a6330" },
  { x: 0.84, y: 0.68, r: 0.26, color: "#4a2f6a" },
  { x: 0.1, y: 0.82, r: 0.24, color: "#1f7a6a" },
  { x: 0.6, y: 0.9, r: 0.22, color: "#2d4f9a" },
];

const VERT = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
uniform sampler2D u_drops;
uniform sampler2D u_trail;
uniform vec2 u_res;
uniform vec2 u_eps;
uniform float u_time;
out vec4 outColor;

const vec4 LIGHTS[6] = vec4[6](
  vec4(0.22, 0.28, 0.34, 0.0),
  vec4(0.72, 0.22, 0.30, 0.0),
  vec4(0.46, 0.62, 0.32, 0.0),
  vec4(0.84, 0.68, 0.26, 0.0),
  vec4(0.10, 0.82, 0.24, 0.0),
  vec4(0.60, 0.90, 0.22, 0.0)
);
const vec3 LCOL[6] = vec3[6](
  vec3(0.165, 0.435, 0.478),
  vec3(0.176, 0.310, 0.604),
  vec3(0.541, 0.388, 0.188),
  vec3(0.290, 0.184, 0.416),
  vec3(0.122, 0.478, 0.416),
  vec3(0.176, 0.310, 0.604)
);

// 절차 보케 배경 — sharp 0: 유리 밖(크고 부드러운 글로우), 1: 방울 속(작고 또렷한 원반)
vec3 scene(vec2 s, float sharp) {
  vec3 col = mix(vec3(0.027, 0.043, 0.078), vec3(0.043, 0.071, 0.125), s.y);
  float aspect = u_res.x / u_res.y;
  vec2 p = vec2(s.x * aspect, s.y);
  float t = u_time * 0.0004;
  for (int i = 0; i < 6; i++) {
    vec4 L = LIGHTS[i];
    vec2 lp = vec2(L.x * aspect, L.y)
      + vec2(sin(t + float(i)), cos(t * 0.8 + float(i) * 1.3)) * 0.05;
    float lr = L.z * max(aspect, 1.0);
    float rr = lr * mix(1.0, 0.38, sharp);
    float a = 1.0 - smoothstep(rr * mix(0.0, 0.55, sharp), rr, distance(p, lp));
    a = pow(a, mix(1.7, 1.1, sharp));
    col += LCOL[i] * a * mix(0.5, 0.95, sharp);
  }
  return col;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 s = vec2(uv.x, 1.0 - uv.y); // y-down 화면 uv(시뮬 좌표계와 일치)

  float h = texture(u_drops, s).r;
  vec2 grad = vec2(
    texture(u_drops, s + vec2(u_eps.x, 0.0)).r - texture(u_drops, s - vec2(u_eps.x, 0.0)).r,
    texture(u_drops, s + vec2(0.0, u_eps.y)).r - texture(u_drops, s - vec2(0.0, u_eps.y)).r
  );
  float wipe = texture(u_trail, s).a;

  // 유리 밖 — 흐린 보케 + 김 서림. 닦인 자국은 김이 걷혀 또렷해진다
  vec3 col = scene(s, wipe * 0.5);
  float fog = 0.42 * (1.0 - wipe * 0.85);
  col = mix(col, vec3(0.10, 0.125, 0.17), fog);

  // 방울 안 — 선명한 배경을 기울기 방향으로 굴절(중심을 가로질러 반전상)
  float inDrop = smoothstep(0.06, 0.2, h);
  if (inDrop > 0.0) {
    vec2 ruv = clamp(s + grad * 0.55, 0.0, 1.0);
    vec3 dropCol = scene(ruv, 1.0) * 1.12;
    dropCol *= mix(0.55, 1.0, smoothstep(0.06, 0.4, h)); // 가장자리 감쇠 — 두께감
    vec3 n = normalize(vec3(-grad * 2.5, 0.6));
    float spec = pow(max(dot(n, normalize(vec3(-0.35, -0.5, 0.75))), 0.0), 28.0);
    col = mix(col, dropCol + spec * 0.9, inDrop);
  }

  // 미세 디더링 — 그라디언트 밴딩 방지
  col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 128.0;
  outColor = vec4(col, 1.0);
}`;

/** 높이맵용 방울 스프라이트 — 반구 단면(sqrt(1-d²))의 알파 프로파일 */
function makeHeightSprite(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = SPRITE_SIZE;
  const g = c.getContext("2d")!;
  const half = SPRITE_SIZE / 2;
  const grad = g.createRadialGradient(half, half, 0, half, half, half);
  for (let i = 0; i <= 10; i++) {
    const d = i / 10;
    grad.addColorStop(d, `rgba(255, 255, 255, ${Math.sqrt(Math.max(0, 1 - d * d)).toFixed(3)})`);
  }
  g.fillStyle = grad;
  g.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  return c;
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`셰이더 컴파일 실패: ${log}`);
  }
  return shader;
}

/** WebGL2 미지원 폴백 — 정적 보케 한 장 */
function drawStaticFallback(canvas: HTMLCanvasElement, parent: HTMLElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = (canvas.width = parent.clientWidth);
  const h = (canvas.height = parent.clientHeight);
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#070b14");
  grad.addColorStop(1, "#0b1220");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "lighter";
  const span = Math.max(w, h);
  for (const L of LIGHTS) {
    const g = ctx.createRadialGradient(L.x * w, L.y * h, 0, L.x * w, L.y * h, L.r * span);
    g.addColorStop(0, L.color);
    g.addColorStop(1, "transparent");
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
}

function setupRain(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement, parent: HTMLElement, reduced: boolean) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(`프로그램 링크 실패: ${gl.getProgramInfoLog(program)}`);
  gl.useProgram(program);
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const uRes = gl.getUniformLocation(program, "u_res");
  const uEps = gl.getUniformLocation(program, "u_eps");
  const uTime = gl.getUniformLocation(program, "u_time");
  gl.uniform1i(gl.getUniformLocation(program, "u_drops"), 0);
  gl.uniform1i(gl.getUniformLocation(program, "u_trail"), 1);

  const makeTexture = (unit: number) => {
    const tex = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tex;
  };
  const dropTex = makeTexture(0);
  const trailTex = makeTexture(1);

  const sprite = makeHeightSprite();
  const dropMap = document.createElement("canvas"); // 방울 높이맵
  const dctx = dropMap.getContext("2d")!;
  const trailMap = document.createElement("canvas"); // 닦인 자국(알파 누적)
  const tctx = trailMap.getContext("2d")!;

  let width = 0;
  let height = 0;
  let mw = 0;
  let mh = 0;
  let drops: Drop[] = [];
  let rings: Ring[] = [];
  let rainAcc = 0;
  let rainPerSec = 0;
  let spawnTimer = 0;
  let lastSpawnX = 0;
  let lastSpawnY = 0;
  const pointer = { x: 0, y: 0, inside: false };

  // 겹치는 기존 방울이 있으면 병합(면적 보존) — 응결 성장 대신 충돌로만 커진다
  const addBead = (x: number, y: number, r: number, sliding = false) => {
    if (!sliding) {
      for (const d of drops) {
        if (d.dead) continue;
        if (Math.hypot(d.x - x, d.y - y) < (d.r + r) * 0.6) {
          d.r = Math.min(CONFIG.maxR, Math.sqrt(d.r * d.r + r * r));
          return;
        }
      }
    }
    if (drops.length >= CONFIG.maxDrops) return;
    drops.push({ x, y, r, vx: 0, vy: 0, sliding, trail: CONFIG.trailGap, drift: 0, dead: false });
  };

  const step = (dt: number) => {
    if (pointer.inside && Math.hypot(pointer.x - lastSpawnX, pointer.y - lastSpawnY) >= 7) {
      lastSpawnX = pointer.x;
      lastSpawnY = pointer.y;
      addBead(pointer.x, pointer.y, rand(2.5, 5));
    }

    // 비 — 유리 전체에 빗방울이 계속 충돌해 맺힌다
    rainAcc += rainPerSec * dt;
    while (rainAcc >= 1) {
      rainAcc -= 1;
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      addBead(rx, ry, rand(1, 3.5));
      if (Math.random() < CONFIG.splashChance) {
        rings.push({ x: rx, y: ry, age: 0, life: 0.5 });
        const sat = 1 + Math.floor(Math.random() * 3);
        for (let k = 0; k < sat; k++) addBead(rx + rand(-6, 6), ry + rand(-6, 6), rand(0.8, 2));
      }
    }
    // 가끔 위에서 큰 방울이 흘러내리기 시작
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnTimer = rand(CONFIG.heavyEvery[0], CONFIG.heavyEvery[1]);
      addBead(Math.random() * width, rand(-10, height * 0.15), rand(7, 12), true);
    }
    for (const rg of rings) rg.age += dt;
    rings = rings.filter((rg) => rg.age < rg.life);

    const newBeads: Array<[number, number, number]> = [];
    const segs: Array<[number, number, number, number, number]> = []; // ox,oy,x,y,r
    for (const d of drops) {
      if (!d.sliding) {
        if (d.r < 1.8 && Math.random() < CONFIG.evapChance) d.dead = true; // 증발 → 자리 비움
        if (d.r > CONFIG.slideMinR && Math.random() < d.r * CONFIG.slideChance) d.sliding = true;
      }
      if (d.sliding) {
        const drive = CONFIG.gravity * (d.r - CONFIG.slideMinR * 0.7); // 작으면 멈춰 붙음
        d.vy = (d.vy + drive) * CONFIG.friction;
        if (d.vy < 0.06) {
          d.sliding = false;
          d.vy = 0;
        } else {
          const ox = d.x;
          const oy = d.y;
          d.y += d.vy;
          // 자연스러운 비주기 사행 — 드리프트 바이어스의 느린 무작위 보행
          d.drift = d.drift * 0.985 + (Math.random() - 0.5) * 0.12;
          d.vx = d.vx * 0.85 + (d.drift * 0.8) / (1 + d.r * 0.1);
          d.x += d.vx;
          segs.push([ox, oy, d.x, d.y, d.r]);
          if (--d.trail <= 0) {
            d.trail = CONFIG.trailGap;
            d.r *= 0.987;
            newBeads.push([d.x, d.y - d.r, Math.min(3, Math.max(1, d.r * 0.3))]);
          }
        }
      }
    }

    // 흘러내리는 방울이 지나는 작은 방울을 흡수
    for (const d of drops) {
      if (!d.sliding) continue;
      for (const b of drops) {
        if (b === d || b.dead || b.sliding) continue;
        if (Math.hypot(d.x - b.x, d.y - b.y) < d.r + b.r * 0.5) {
          d.r = Math.min(CONFIG.maxR * 1.4, Math.sqrt(d.r * d.r + b.r * b.r));
          b.dead = true;
        }
      }
    }

    drops = drops.filter((d) => !d.dead && d.y - d.r < height + 24);
    for (const [x, y, r] of newBeads) addBead(x, y, r);

    // 자국 맵: 김이 다시 서리며 천천히 사라지고, 이번 프레임 경로를 덧그린다
    tctx.setTransform(1, 0, 0, 1, 0, 0);
    tctx.globalCompositeOperation = "destination-out";
    tctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.06, dt * 0.25)})`;
    tctx.fillRect(0, 0, mw, mh);
    tctx.globalCompositeOperation = "source-over";
    tctx.setTransform(CONFIG.mapScale, 0, 0, CONFIG.mapScale, 0, 0);
    tctx.lineCap = "round";
    tctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    for (const [ox, oy, x, y, r] of segs) {
      tctx.lineWidth = Math.max(1.5, r * 0.9);
      tctx.beginPath();
      tctx.moveTo(ox, oy);
      tctx.lineTo(x, y);
      tctx.stroke();
    }
  };

  const drawSprite = (x: number, y: number, r: number) => dctx.drawImage(sprite, x - r, y - r, r * 2, r * 2);

  const drawMaps = () => {
    dctx.setTransform(1, 0, 0, 1, 0, 0);
    dctx.globalCompositeOperation = "source-over";
    dctx.fillStyle = "#000";
    dctx.fillRect(0, 0, mw, mh);
    dctx.setTransform(CONFIG.mapScale, 0, 0, CONFIG.mapScale, 0, 0);
    dctx.globalCompositeOperation = "lighter";
    for (const d of drops) {
      drawSprite(d.x, d.y, d.r);
      if (d.sliding && d.vy > 0.1) {
        // 흘러내릴 땐 눈물형 — 머리 위로 갈수록 가늘어지는 꼬리
        const k = Math.min(1, d.vy * 0.5);
        drawSprite(d.x, d.y - d.r * (0.7 + 0.4 * k), d.r * 0.78);
        drawSprite(d.x, d.y - d.r * (1.5 + 0.8 * k), d.r * (0.3 + 0.25 * k));
      }
    }
    // 스플래시 링 — 높이맵의 얇은 융기로 잠깐 일렁임
    dctx.lineWidth = 1.5;
    for (const rg of rings) {
      const t = rg.age / rg.life;
      dctx.strokeStyle = `rgba(255, 255, 255, ${((1 - t) * 0.35).toFixed(3)})`;
      dctx.beginPath();
      dctx.arc(rg.x, rg.y, 2 + t * 11, 0, TAU);
      dctx.stroke();
    }
  };

  const uploadTexture = (unit: number, tex: WebGLTexture, source: HTMLCanvasElement) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, source);
  };

  const render = (time: number) => {
    drawMaps();
    uploadTexture(0, dropTex, dropMap);
    uploadTexture(1, trailTex, trailMap);
    gl.uniform1f(uTime, time);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = parent.clientWidth;
    height = parent.clientHeight;
    canvas.width = Math.max(2, Math.round(width * dpr));
    canvas.height = Math.max(2, Math.round(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    gl.viewport(0, 0, canvas.width, canvas.height);
    mw = Math.max(2, Math.round(width * CONFIG.mapScale));
    mh = Math.max(2, Math.round(height * CONFIG.mapScale));
    dropMap.width = mw;
    dropMap.height = mh;
    trailMap.width = mw;
    trailMap.height = mh;
    for (const [unit, tex] of [[0, dropTex], [1, trailTex]] as const) {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, mw, mh, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    }
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform2f(uEps, 1.5 / mw, 1.5 / mh);
    rainPerSec = Math.max(CONFIG.rainMin, Math.min(CONFIG.rainMax, width * height * CONFIG.rainPerArea));
    drops = [];
    rings = [];
    const n = Math.min(CONFIG.maxDrops, Math.floor(width * height * CONFIG.seedPerArea));
    for (let i = 0; i < n; i++) addBead(Math.random() * width, Math.random() * height, rand(1.5, 4.5));
    if (reduced) render(0);
  };

  let rafId = 0;
  let lastTime = 0;
  let running = false;
  const tick = (time: number) => {
    const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
    lastTime = time;
    step(dt);
    render(time);
    rafId = requestAnimationFrame(tick);
  };
  const start = () => {
    if (running || reduced) return;
    running = true;
    lastTime = 0;
    rafId = requestAnimationFrame(tick);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(rafId);
  };

  resize();
  start();

  const onMove = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    pointer.inside = pointer.x >= 0 && pointer.x <= width && pointer.y >= 0 && pointer.y <= height;
  };
  if (!reduced) window.addEventListener("mousemove", onMove);
  window.addEventListener("resize", resize);
  const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { threshold: 0 });
  io.observe(canvas);

  return () => {
    stop();
    io.disconnect();
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("resize", resize);
    gl.deleteProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    gl.deleteTexture(dropTex);
    gl.deleteTexture(trailTex);
    gl.deleteVertexArray(vao);
  };
}

export default function RainOnGlass() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false, stencil: false }) as WebGL2RenderingContext | null;
    if (!gl) {
      drawStaticFallback(canvas, parent);
      return;
    }
    return setupRain(gl, canvas, parent, reduced);
  }, []);

  return <canvas ref={ref} aria-hidden className="absolute inset-0" />;
}
