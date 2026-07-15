"use client";

import { useEffect, useRef } from "react";

/**
 * 구상성단 밤하늘 + 별똥별 — 3D Canvas 2D.
 */

const CONFIG = {
  areaPerStar: 1500, // 별 1개당 면적(px²)
  maxStars: 1200,
  starRadius: 1.3,
  fieldRatio: 0.6, // 화면 전체에 흩뿌리는 배경 별 비율(나머지는 성단)
  // 의사 3D 카메라
  zNear: 320,
  zFar: 1700,
  focal: 620, // 초점거리 — 클수록 원근 강함
  // 성단 — 중심 농축 구형 분포
  clusterZ: 880, // 성단 중심 깊이
  clusterRadius: 560, // 성단 반경(월드 단위)
  clusterFlatten: 0.82, // 세로로 살짝 납작
  clusterConcentration: 5.5, // 클수록 중심에 더 몰림
  // 성운 글로우(코어 뒤 헤일로)
  nebulaRadius: 480,
  nebulaColor: "#7ea8de",
  camRange: 70, // 마우스 시차 이동 범위(월드 단위)
  camEase: 4, // 카메라 추적 속도(초당)
  idleAmp: 14, // 마우스 없을 때 자동 부유 진폭
  idleSpeed: 0.22, // 자동 부유 속도
  zoomAmp: 0.15, // 카메라 줌 인·아웃 진폭(±배율)
  zoomSpeed: 0.12, // 줌 호흡 속도
  // 유성 — 월드 단위(투영 전)
  maxMeteors: 3,
  spawnDelay: [0.6, 2.4], // 다음 별똥별까지 대기(초)
  meteorZ: [900, 1500], // 등장 깊이
  meteorSpeed: [800, 1400], // 월드 속도(단위/초)
  meteorTail: [300, 700], // 꼬리 길이(월드 단위)
  meteorSize: [3, 14], // 머리 기본 반지름(월드 단위)
  meteorApproach: 0.45, // 카메라 쪽 접근 비율(vz = -speed·approach)
  meteorZCull: 160, // 카메라를 지나치면 제거하는 깊이
  meteorAccentRatio: 0.5, // 브랜드 색 별똥별 비율
  sparkleRate: 26, // 초당 꼬리 스파클 수(유성당)
  burstCount: [10, 16], // 착지 버스트 입자 수
  burstSpeed: [80, 240], // 버스트 입자 속도(px/초)
  particleGravity: 220, // 입자 낙하 가속(px/초²)
  maxParticles: 260,
  cometDelay: [10, 26], // 희귀 대형 혜성 등장 간격(초)
  // 혜성 — 더 가깝고 크고 수평에 가깝게
  cometZ: [480, 760],
  cometSpeed: [700, 1000],
  cometTail: [600, 1000],
  cometSize: [16, 24],
  cometApproach: 0.18,
  maxDpr: 2,
  darkStar: "#ffffff",
  lightStar: "#1e293b", // slate-800
} as const;

/** 별 색 팔레트 — 푸른 백색 위주, 따뜻한 금색 약간 (구상성단 느낌) */
const COOL_STARS = ["#ffffff", "#dfeaff", "#bcd4ff", "#9fc2ff"];
const WARM_STARS = ["#ffd9a8", "#ffc079", "#ffcf8f"];
const STAR_COLORS = [...COOL_STARS, ...WARM_STARS];

// 월드 좌표(z=깊이) + 글로우 스프라이트 색
type Star = { x: number; y: number; z: number; baseR: number; phase: number; phaseSpeed: number; color: string };
type Meteor = { x: number; y: number; z: number; vx: number; vy: number; vz: number; tail: number; size: number; age: number; accent: boolean; comet: boolean };
type Particle = { x: number; y: number; vx: number; vy: number; age: number; life: number; size: number; color: string };
type Ring = { x: number; y: number; age: number; life: number; radius: number; color: string };

/** 애니메이션 상태 한 묶음 */
type Scene = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  dark: boolean; // 어두운 테마 — 가산 합성·글로우 사용 여부
  meteorsEnabled: boolean;
  stars: Star[];
  starSprites: Map<string, HTMLCanvasElement>; // 색별 글로우 스프라이트(1회 생성)
  meteors: Meteor[];
  particles: Particle[];
  rings: Ring[];
  spawnTimer: number;
  cometTimer: number;
  time: number;
  zoom: number;
  camX: number; // 현재 카메라(월드)
  camY: number;
  camTargetX: number; // 마우스가 가리키는 목표(월드)
  camTargetY: number;
  baseColor: string;
  accentColor: string;
};

const rand = ([min, max]: readonly [number, number]) =>
  min + Math.random() * (max - min);

const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];

/** 월드 좌표(x,y,z)를 화면 좌표 + 배율로 원근 투영한다 (카메라 시차 포함) */
function project(s: Scene, x: number, y: number, z: number) {
  const scale = (CONFIG.focal * s.zoom) / z; // zoom으로 전체 원근 배율을 한 곳에서 조절
  return {
    sx: s.width / 2 + (x - s.camX) * scale,
    sy: s.height / 2 + (y - s.camY) * scale,
    scale,
  };
}

/** 현재 테마(.dark 클래스)에 맞는 별 색을 읽는다. forceDark면 테마와 무관하게 다크 */
function resolveColors(forceDark: boolean) {
  const root = document.documentElement;
  const accent = getComputedStyle(root).getPropertyValue("--accent-brand").trim();
  const dark = forceDark || root.classList.contains("dark");
  return {
    base: dark ? CONFIG.darkStar : CONFIG.lightStar,
    accent: accent || "#31CED2",
    dark,
  };
}

/** 백열 코어 → 색 헤일로로 페이드되는 별 글로우 스프라이트 (가산 합성용) */
function makeStarSprite(color: string): HTMLCanvasElement {
  const size = 32;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, "#ffffff");
  grd.addColorStop(0.28, color);
  grd.addColorStop(1, "transparent");
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  return c;
}

const buildStarSprites = () =>
  new Map(STAR_COLORS.map((c) => [c, makeStarSprite(c)] as const));

/** 중심에 농축된 3D 구형 성단 좌표 한 점 */
function clusterPoint() {
  const r = Math.pow(Math.random(), CONFIG.clusterConcentration) * CONFIG.clusterRadius;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1); // 구면 균일
  const sinPhi = Math.sin(phi);
  return {
    x: r * sinPhi * Math.cos(theta),
    y: r * sinPhi * Math.sin(theta) * CONFIG.clusterFlatten,
    z: CONFIG.clusterZ + r * Math.cos(phi),
  };
}

/**
 * 성단(중심 농축) + 배경 field(화면 전체 산포) 별을 채운다.
 * field는 z를 뽑고 화면을 균일 샘플링한 뒤 월드 좌표를 역산해 가장자리까지 덮는다.
 */
function populateStars(width: number, height: number): Star[] {
  const count = Math.min(
    CONFIG.maxStars,
    Math.floor((width * height) / CONFIG.areaPerStar),
  );
  const fieldCount = Math.round(count * CONFIG.fieldRatio);
  const cx = width / 2;
  const cy = height / 2;

  const base = (extra: object): Star => ({
    x: 0,
    y: 0,
    z: 0,
    baseR: Math.pow(Math.random(), 1.6) * CONFIG.starRadius + 0.25, // 작은 별로 치우쳐 미세한 알갱이 질감
    phase: Math.random() * Math.PI * 2,
    phaseSpeed: Math.random() * 0.02 + 0.004,
    color: Math.random() < 0.2 ? pick(WARM_STARS) : pick(COOL_STARS),
    ...extra,
  });

  const stars: Star[] = [];
  for (let i = 0; i < count - fieldCount; i++) {
    stars.push(base(clusterPoint()));
  }
  // 줌 아웃 시 가장자리가 비지 않도록 화면보다 넓게(±zoomAmp) 샘플링
  const spread = 1 + CONFIG.zoomAmp * 2;
  for (let i = 0; i < fieldCount; i++) {
    const z = rand([CONFIG.zNear, CONFIG.zFar]);
    const scale = CONFIG.focal / z;
    stars.push(
      base({
        x: ((Math.random() * spread - CONFIG.zoomAmp) * width - cx) / scale,
        y: ((Math.random() * spread - CONFIG.zoomAmp) * height - cy) / scale,
        z,
        baseR: Math.random() * 0.8 + 0.2,
      }),
    );
  }
  return stars;
}

/** 깊이·각도·속도로 월드 속도 벡터를 채워 별똥별을 만든다 */
type MeteorSpec = Omit<Meteor, "vx" | "vy" | "vz" | "age"> & {
  angle: number;
  speed: number;
  approach: number;
};
function makeMeteor({ angle, speed, approach, ...rest }: MeteorSpec): Meteor {
  return {
    ...rest,
    vx: -Math.sin(angle) * speed,
    vy: Math.cos(angle) * speed,
    vz: -speed * approach, // 음수 = 카메라 쪽으로 접근
    age: 0,
  };
}

/** 깊이 z에서, 화면 위쪽을 지나도록 월드 시작 좌표를 잡는다 */
function spawnAt(width: number, height: number, z: number, sxRatio: readonly [number, number]) {
  const scale = CONFIG.focal / z;
  const sx = width * rand(sxRatio);
  const sy = -height * rand([0.05, 0.3]);
  return { x: (sx - width / 2) / scale, y: (sy - height / 2) / scale, z };
}

/** 카메라 쪽으로 다가오며 대각선 아래로 떨어지는 별똥별 */
function createMeteor(width: number, height: number): Meteor {
  const z = rand(CONFIG.meteorZ);
  return makeMeteor({
    ...spawnAt(width, height, z, [0.3, 1.05]),
    angle: (Math.PI / 180) * rand([20, 48]),
    speed: rand(CONFIG.meteorSpeed),
    approach: CONFIG.meteorApproach,
    tail: rand(CONFIG.meteorTail),
    size: rand(CONFIG.meteorSize),
    accent: Math.random() < CONFIG.meteorAccentRatio,
    comet: false,
  });
}

/** 아주 가끔 화면을 가로지르는 초대형 혜성 (긴 글로우 꼬리) */
function createComet(width: number, height: number): Meteor {
  const z = rand(CONFIG.cometZ);
  return makeMeteor({
    ...spawnAt(width, height, z, [0.6, 1.05]),
    angle: (Math.PI / 180) * rand([50, 68]), // 더 수평에 가깝게 가로지름
    speed: rand(CONFIG.cometSpeed),
    approach: CONFIG.cometApproach,
    tail: rand(CONFIG.cometTail),
    size: rand(CONFIG.cometSize),
    accent: true,
    comet: true,
  });
}

/** 유성 머리 색 */
function meteorColor(s: Scene, m: Meteor) {
  return m.accent ? s.accentColor : s.baseColor;
}

/** 떨어지는 유성 꼬리에서 흩날리는 반짝임 입자 (화면 좌표 기준) */
function spawnSparkle(s: Scene, m: Meteor, sx: number, sy: number, psize: number) {
  const speed = Math.hypot(m.vx, m.vy) || 1;
  const bx = -m.vx / speed; // 진행 반대(꼬리) 방향
  const by = -m.vy / speed;
  s.particles.push({
    x: sx,
    y: sy,
    vx: bx * rand([20, 90]) + (Math.random() - 0.5) * 40,
    vy: by * rand([20, 90]) + (Math.random() - 0.5) * 40,
    age: 0,
    life: rand([0.3, 0.6]),
    size: rand([0.6, 1.4]) * (0.6 + psize * 0.12),
    color: meteorColor(s, m),
  });
}

/** 바닥 착지 시 위쪽 반구로 튀어오르는 버스트 입자 */
function spawnBurst(s: Scene, x: number, y: number, m: Meteor, psize: number) {
  const n = Math.round(rand(CONFIG.burstCount));
  for (let i = 0; i < n; i++) {
    if (s.particles.length >= CONFIG.maxParticles) break;
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
    const sp = rand(CONFIG.burstSpeed) * (0.6 + psize * 0.1);
    s.particles.push({
      x,
      y,
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp,
      age: 0,
      life: rand([0.4, 0.8]),
      size: rand([1, 2.4]) * (0.6 + psize * 0.1),
      color: meteorColor(s, m),
    });
  }
}

/** 착지 충격파 링 */
function spawnRing(s: Scene, x: number, y: number, m: Meteor, psize: number) {
  s.rings.push({ x, y, age: 0, life: 0.6, radius: 20 + psize * 8, color: meteorColor(s, m) });
}

/** 별 반짝임·카메라 추적·별똥별 이동·생성·입자를 dt만큼 진행한다 */
function updateScene(s: Scene, dt: number) {
  s.time += dt;
  for (const star of s.stars) star.phase += star.phaseSpeed;

  // 카메라: 마우스 목표 + 자동 부유 + 줌 호흡
  const idleX = Math.sin(s.time * CONFIG.idleSpeed) * CONFIG.idleAmp;
  const idleY = Math.cos(s.time * CONFIG.idleSpeed * 0.8) * CONFIG.idleAmp;
  const ease = Math.min(1, dt * CONFIG.camEase);
  s.camX += (s.camTargetX + idleX - s.camX) * ease;
  s.camY += (s.camTargetY + idleY - s.camY) * ease;
  s.zoom = 1 + Math.sin(s.time * CONFIG.zoomSpeed) * CONFIG.zoomAmp;

  for (const p of s.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += CONFIG.particleGravity * dt;
    p.age += dt;
  }
  s.particles = s.particles.filter((p) => p.age < p.life);

  for (const r of s.rings) r.age += dt;
  s.rings = s.rings.filter((r) => r.age < r.life);

  // 월드에서 이동(접근 포함) → 투영으로 화면 판정. 바닥 착지 시 버스트·링 후 제거
  const survivors: Meteor[] = [];
  for (const m of s.meteors) {
    m.x += m.vx * dt;
    m.y += m.vy * dt;
    m.z += m.vz * dt;
    m.age += dt;
    if (m.z < CONFIG.meteorZCull) continue;
    const { sx, sy, scale } = project(s, m.x, m.y, m.z);
    const psize = m.size * scale;
    if (sy >= s.height) {
      spawnBurst(s, sx, s.height, m, psize);
      spawnRing(s, sx, s.height, m, psize);
      continue;
    }
    if (sx < -200) continue;
    if (s.particles.length < CONFIG.maxParticles && Math.random() < CONFIG.sparkleRate * dt) {
      spawnSparkle(s, m, sx, sy, psize);
    }
    survivors.push(m);
  }
  s.meteors = survivors;

  if (!s.meteorsEnabled) return;

  s.spawnTimer -= dt;
  if (s.spawnTimer <= 0) {
    if (s.meteors.length < CONFIG.maxMeteors) s.meteors.push(createMeteor(s.width, s.height));
    s.spawnTimer = rand(CONFIG.spawnDelay);
  }

  s.cometTimer -= dt;
  if (s.cometTimer <= 0) {
    if (!s.meteors.some((m) => m.comet)) s.meteors.push(createComet(s.width, s.height));
    s.cometTimer = rand(CONFIG.cometDelay);
  }
}

/** 코어 뒤에 깔리는 성운 헤일로 — 어두운 테마는 가산 합성, 밝은 테마는 옅은 일반 합성으로 성단 형태를 드러낸다 */
function drawNebula(s: Scene) {
  const { ctx } = s;
  const { sx, sy, scale } = project(s, 0, 0, CONFIG.clusterZ);
  const alphaScale = s.dark ? 1 : 0.35;
  for (const [mul, a] of [[1, 0.1], [0.5, 0.16]] as const) {
    const r = CONFIG.nebulaRadius * scale * mul;
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
    g.addColorStop(0, CONFIG.nebulaColor);
    g.addColorStop(1, "transparent");
    ctx.globalAlpha = a * alphaScale;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * 별똥별 렌더 — 어두운 테마는 가산 합성으로 백열 핵 + 색 헤일로,
 * 방추형 꼬리가 원근으로 수렴해 부피감을 준다. 밝은 테마는 일반 합성 + 색 핵.
 */
function drawMeteor(s: Scene, m: Meteor) {
  const { ctx } = s;
  const { sx, sy, scale } = project(s, m.x, m.y, m.z);
  const psize = m.size * scale;
  const color = meteorColor(s, m);
  const appear = Math.min(1, m.age / 0.15);
  const hot = s.dark ? "#ffffff" : color; // 밝은 테마에선 백열 핵이 안 보임

  // 꼬리 끝을 월드에서 잡아 투영 — z가 멀어지며 소실점으로 수렴(원근 단축)
  const speed = Math.hypot(m.vx, m.vy, m.vz) || 1;
  const tail = project(
    s,
    m.x - (m.vx / speed) * m.tail,
    m.y - (m.vy / speed) * m.tail,
    m.z - (m.vz / speed) * m.tail,
  );

  ctx.globalCompositeOperation = s.dark ? "lighter" : "source-over";

  // 방추형 꼬리 — 머리에서 넓다가 끝으로 뾰족하게, 밝기는 머리→끝으로 페이드
  const dx = sx - tail.sx;
  const dy = sy - tail.sy;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len; // 진행 방향의 수직(꼬리 폭)
  const py = dx / len;
  const wHead = Math.max(0.6, psize * 0.8);
  const tailGrad = ctx.createLinearGradient(tail.sx, tail.sy, sx, sy);
  tailGrad.addColorStop(0, "transparent");
  tailGrad.addColorStop(1, color);
  ctx.globalAlpha = appear * 0.75;
  ctx.fillStyle = tailGrad;
  ctx.beginPath();
  ctx.moveTo(tail.sx, tail.sy);
  ctx.lineTo(sx + px * wHead, sy + py * wHead);
  ctx.lineTo(sx - px * wHead, sy - py * wHead);
  ctx.closePath();
  ctx.fill();

  // 머리 글로우를 층층이 쌓아 바깥 색 헤일로 → 백열 핵
  const glow = (r: number, col: string, a: number) => {
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
    g.addColorStop(0, col);
    g.addColorStop(1, "transparent");
    ctx.globalAlpha = appear * a;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  };
  glow(6 * psize, color, 0.3);
  glow(2.8 * psize, color, 0.5);
  glow(1.4 * psize, hot, 0.9);

  ctx.globalAlpha = appear;
  ctx.fillStyle = hot;
  ctx.beginPath();
  ctx.arc(sx, sy, Math.max(0.6, psize * 0.5), 0, Math.PI * 2);
  ctx.fill();

  ctx.globalCompositeOperation = "source-over";
}

/** 한 프레임을 그린다 (성운 → 성단 별 → 별똥별 → 링 → 입자) */
function drawScene(s: Scene) {
  const { ctx } = s;
  ctx.clearRect(0, 0, s.width, s.height);
  const depthSpan = CONFIG.zFar - CONFIG.zNear;

  // 어두운 테마: 가산 합성으로 겹친 별이 백열 코어로 타오른다. 밝은 테마도 옅게 성운을 깔아 성단 형태를 살린다
  ctx.globalCompositeOperation = s.dark ? "lighter" : "source-over";
  drawNebula(s);

  for (const star of s.stars) {
    const { sx, sy, scale } = project(s, star.x, star.y, star.z);
    if (sx < -16 || sx > s.width + 16 || sy < -16 || sy > s.height + 16) continue;
    const depth = Math.max(0, Math.min(1, (CONFIG.zFar - star.z) / depthSpan)); // 0(멀다)~1(가깝다)
    const twinkle = 0.35 + Math.sin(star.phase) * 0.25;
    if (s.dark) {
      ctx.globalAlpha = Math.min(1, twinkle * (0.5 + depth * 0.5));
      const r = star.baseR * scale * 3 + 1;
      ctx.drawImage(s.starSprites.get(star.color)!, sx - r, sy - r, r * 2, r * 2);
    } else {
      // 밝은 배경에서는 작은 단색 점이 묻히기 쉬워 최소 크기·불투명도를 높여 별 무리가 드러나게 한다
      ctx.globalAlpha = Math.min(1, 0.55 + twinkle * (0.3 + depth * 0.3));
      ctx.fillStyle = s.baseColor;
      ctx.beginPath();
      ctx.arc(sx, sy, star.baseR * scale * 1.6 + 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  for (const m of s.meteors) drawMeteor(s, m);

  for (const r of s.rings) {
    const t = r.age / r.life;
    ctx.globalAlpha = Math.max(0, 1 - t);
    ctx.strokeStyle = r.color;
    ctx.lineWidth = 2 * (1 - t) + 0.5;
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.radius * t, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (const p of s.particles) {
    ctx.globalAlpha = Math.max(0, 1 - p.age / p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

export default function ShootingStars(
  { meteors = true, forceDark = false }: { meteors?: boolean; forceDark?: boolean } = {},
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const parent = canvas?.parentElement;
    if (!canvas || !ctx || !parent) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const colors = resolveColors(forceDark);
    const scene: Scene = {
      ctx,
      width: 0,
      height: 0,
      dark: colors.dark,
      meteorsEnabled: meteors,
      stars: [],
      starSprites: buildStarSprites(),
      meteors: [],
      particles: [],
      rings: [],
      spawnTimer: rand(CONFIG.spawnDelay),
      cometTimer: rand(CONFIG.cometDelay),
      time: 0,
      zoom: 1,
      camX: 0,
      camY: 0,
      camTargetX: 0,
      camTargetY: 0,
      baseColor: colors.base,
      accentColor: colors.accent,
    };

    let rafId = 0;
    let lastTime = 0;
    let running = false;

    // 부모 크기에 맞춰 캔버스 재설정 + 별 재생성
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDpr);
      scene.width = parent.clientWidth;
      scene.height = parent.clientHeight;
      canvas.width = scene.width * dpr;
      canvas.height = scene.height * dpr;
      canvas.style.width = `${scene.width}px`;
      canvas.style.height = `${scene.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scene.stars = populateStars(scene.width, scene.height);
    };

    const tick = (time: number) => {
      const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
      lastTime = time;
      updateScene(scene, dt);
      drawScene(scene);
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

    resize();
    if (prefersReducedMotion) drawScene(scene);
    else start();

    // 마우스 시차 — 커서를 캔버스 기준 [-1,1]로 정규화해 카메라 목표로
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      scene.camTargetX = Math.max(-1, Math.min(1, nx)) * CONFIG.camRange;
      scene.camTargetY = Math.max(-1, Math.min(1, ny)) * CONFIG.camRange;
    };
    if (!prefersReducedMotion) window.addEventListener("mousemove", handleMouseMove);

    // 화면에 보일 때만 애니메이션
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        if (prefersReducedMotion) return;
        if (entry.isIntersecting) start();
        else stop();
      },
      { threshold: 0 },
    );
    visibilityObserver.observe(canvas);

    // 테마 변경 시 별 색 갱신
    const themeObserver = new MutationObserver(() => {
      const next = resolveColors(forceDark);
      scene.baseColor = next.base;
      scene.accentColor = next.accent;
      scene.dark = next.dark;
      if (prefersReducedMotion) drawScene(scene);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const handleResize = () => {
      resize();
      if (prefersReducedMotion) drawScene(scene);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      stop();
      visibilityObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, [meteors, forceDark]);

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0" />;
}
