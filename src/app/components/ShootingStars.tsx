"use client";

import { useEffect, useRef } from "react";

/**
 * 밤하늘 + 별똥별 — 의존성 없는 Canvas 2D.
 * 잔잔히 반짝이는 배경 별 위로 별똥별이 대각선으로 떨어지고 꼬리가 페이드된다.
 * reduced-motion 시 배경 별만 정적, 화면 밖이면 정지, DPR 상한.
 */

const CONFIG = {
  areaPerStar: 9000, // 배경 별 1개당 면적(px²)
  maxStars: 160,
  starRadius: 1.3,
  maxMeteors: 3,
  spawnDelay: [0.6, 2.4], // 다음 별똥별까지 대기(초)
  meteorSpeed: [420, 680], // px/초
  meteorTail: [160, 320], // 꼬리 길이(px)
  meteorSize: [0.6, 1.8], // 별똥별 크기 배수 (선 두께·머리 크기)
  meteorAccentRatio: 0.5, // 브랜드 색 별똥별 비율
  maxDpr: 2,
  darkStar: "#ffffff",
  lightStar: "#1e293b", // slate-800
} as const;

type Star = { x: number; y: number; phase: number; phaseSpeed: number; radius: number };
type Meteor = { x: number; y: number; vx: number; vy: number; tail: number; size: number; age: number; accent: boolean };

/** 애니메이션 상태 한 묶음 */
type Scene = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  stars: Star[];
  meteors: Meteor[];
  spawnTimer: number;
  baseColor: string;
  accentColor: string;
};

const rand = ([min, max]: readonly [number, number]) =>
  min + Math.random() * (max - min);

const lerp = ([min, max]: readonly [number, number], t: number) =>
  min + (max - min) * t;

/** 현재 테마(.dark 클래스)에 맞는 별 색을 읽는다 */
function resolveColors() {
  const root = document.documentElement;
  const accent = getComputedStyle(root).getPropertyValue("--accent-brand").trim();
  return {
    base: root.classList.contains("dark") ? CONFIG.darkStar : CONFIG.lightStar,
    accent: accent || "#31CED2",
  };
}

/** 면적 기반 개수로 배경 별을 채운다 */
function populateStars(width: number, height: number): Star[] {
  const count = Math.min(
    CONFIG.maxStars,
    Math.floor((width * height) / CONFIG.areaPerStar),
  );
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    phase: Math.random() * Math.PI * 2,
    phaseSpeed: Math.random() * 0.02 + 0.004,
    radius: Math.random() * CONFIG.starRadius + 0.3,
  }));
}

/**
 * 화면 위쪽에서 시작해 대각선 아래로 떨어지는 별똥별.
 * 크기를 원근(깊이)으로 삼아 클수록 빠르고 꼬리도 길게 연동(±10% jitter).
 */
function createMeteor(width: number, height: number): Meteor {
  const size = rand(CONFIG.meteorSize);
  const depth =
    (size - CONFIG.meteorSize[0]) / (CONFIG.meteorSize[1] - CONFIG.meteorSize[0]);
  const jitter = () => 0.9 + Math.random() * 0.2;
  const speed = lerp(CONFIG.meteorSpeed, depth) * jitter();
  const tail = lerp(CONFIG.meteorTail, depth) * jitter();
  const angle = (Math.PI / 180) * rand([28, 52]); // 수직축 기준 기울기
  return {
    x: width * (0.3 + Math.random() * 0.8),
    y: -Math.random() * height * 0.2,
    vx: -Math.sin(angle) * speed,
    vy: Math.cos(angle) * speed,
    tail,
    size,
    age: 0,
    accent: Math.random() < CONFIG.meteorAccentRatio,
  };
}

/** 별 반짝임·별똥별 이동·생성을 dt만큼 진행한다 */
function updateScene(s: Scene, dt: number) {
  for (const star of s.stars) star.phase += star.phaseSpeed;

  for (const m of s.meteors) {
    m.x += m.vx * dt;
    m.y += m.vy * dt;
    m.age += dt;
  }
  s.meteors = s.meteors.filter((m) => m.x > -m.tail && m.y < s.height + m.tail);

  s.spawnTimer -= dt;
  if (s.spawnTimer <= 0) {
    if (s.meteors.length < CONFIG.maxMeteors) {
      s.meteors.push(createMeteor(s.width, s.height));
    }
    s.spawnTimer = rand(CONFIG.spawnDelay);
  }
}

/** 한 프레임을 그린다 (배경 별 → 별똥별 순) */
function drawScene(s: Scene) {
  const { ctx } = s;
  ctx.clearRect(0, 0, s.width, s.height);

  ctx.fillStyle = s.baseColor;
  for (const star of s.stars) {
    ctx.globalAlpha = Math.max(0, 0.3 + Math.sin(star.phase) * 0.25);
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.lineCap = "round";
  for (const m of s.meteors) {
    const speed = Math.hypot(m.vx, m.vy) || 1;
    const tx = m.x - (m.vx / speed) * m.tail;
    const ty = m.y - (m.vy / speed) * m.tail;
    const head = m.accent ? s.accentColor : s.baseColor;

    const grad = ctx.createLinearGradient(m.x, m.y, tx, ty);
    grad.addColorStop(0, head);
    grad.addColorStop(1, "transparent");

    ctx.globalAlpha = Math.min(1, m.age / 0.15); // 등장 시 짧게 페이드인
    ctx.lineWidth = 2 * m.size;
    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    ctx.fillStyle = head;
    ctx.beginPath();
    ctx.arc(m.x, m.y, 1.6 * m.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export default function ShootingStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const parent = canvas?.parentElement;
    if (!canvas || !ctx || !parent) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const colors = resolveColors();
    const scene: Scene = {
      ctx,
      width: 0,
      height: 0,
      stars: [],
      meteors: [],
      spawnTimer: rand(CONFIG.spawnDelay),
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
      const next = resolveColors();
      scene.baseColor = next.base;
      scene.accentColor = next.accent;
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
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0" />;
}
