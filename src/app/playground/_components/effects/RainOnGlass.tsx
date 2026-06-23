"use client";

import { useRef } from "react";
import { rand, useCanvasScene } from "./canvas";

/**
 * 빗방울 유리 — 흐릿한 보케 배경 위에서 물방울이 렌즈처럼 배경을 굴절(상하 반전·확대)시킨다.
 * 비가 유리 전체에 맺히고(충돌 링), 응결로 커지다 흘러내리며(stick-slip) 굽이치는 자국을 남기고
 * 지나는 방울을 흡수한다. 커서를 움직이면 그 자리에 물방울이 맺힌다.
 */
const CONFIG = {
  areaPerBead: 2600,
  maxDrops: 800,
  gravity: 0.1, // 흘러내림 구동력(크기 비례)
  friction: 0.92, // 미끄럼 마찰 — 작은 방울은 멈춰 붙음(stick-slip)
  slideMinR: 5,
  slideChance: 0.0009,
  growth: 0.6, // 응결 성장(px/초)
  maxR: 16,
  trailGap: 3,
  rainPerArea: 1 / 14000, // 초당·px²당 빗방울 충돌
  rainMin: 8,
  rainMax: 48,
  ringChance: 0.22, // 충돌 시 스플래시 링/위성 방울 비율
  evapChance: 0.0025, // 작은 방울 증발 확률(프레임)
  heavyEvery: [0.6, 1.4], // 위에서 시작하는 큰 흘러내림 방울 간격(초)
  refractMin: 4.5, // 이 반지름 이상이면 렌즈 굴절
  refractZoom: 1.9, // 렌즈 확대율
  bgScale: 0.4, // 배경 렌더 축소율(확대해 흐릿하게)
} as const;

const TAU = Math.PI * 2;
const SPRITE_SIZE = 96;
const SPRITE_R = 42;

// 보케 광원 — 위치(화면 비율)·반경(긴 변 비율)·색
const LIGHTS = [
  { x: 0.22, y: 0.28, r: 0.34, color: "#2a6f7a" },
  { x: 0.72, y: 0.22, r: 0.3, color: "#2d4f9a" },
  { x: 0.46, y: 0.62, r: 0.32, color: "#8a6330" },
  { x: 0.84, y: 0.68, r: 0.26, color: "#4a2f6a" },
  { x: 0.1, y: 0.82, r: 0.24, color: "#1f7a6a" },
  { x: 0.6, y: 0.9, r: 0.22, color: "#2d4f9a" },
];

type Drop = { x: number; y: number; r: number; vx: number; vy: number; sliding: boolean; trail: number; drift: number; dead: boolean };
type Ring = { x: number; y: number; age: number; life: number };

/** 유리 위 물방울 음영 스프라이트(몸체는 투명 — 아래 굴절/배경이 비침) */
function makeShadeSprite(): HTMLCanvasElement {
  const S = SPRITE_SIZE;
  const R = SPRITE_R;
  const cx = S / 2;
  const cy = S / 2;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;

  // 접지 그림자(아래) — 입체감
  const sh = g.createRadialGradient(cx, cy + R * 0.35, R * 0.2, cx, cy + R * 0.35, R * 1.15);
  sh.addColorStop(0, "rgba(0, 0, 0, 0.42)");
  sh.addColorStop(1, "rgba(0, 0, 0, 0)");
  g.fillStyle = sh;
  g.fillRect(0, 0, S, S);

  g.save();
  g.beginPath();
  g.arc(cx, cy, R, 0, TAU);
  g.clip();

  // 굴절 림 — 가장자리만 밝게(중심 투명)
  const rim = g.createRadialGradient(cx, cy, R * 0.55, cx, cy, R);
  rim.addColorStop(0, "rgba(190, 220, 245, 0)");
  rim.addColorStop(0.72, "rgba(160, 195, 225, 0.06)");
  rim.addColorStop(0.9, "rgba(195, 222, 248, 0.34)");
  rim.addColorStop(1, "rgba(222, 240, 255, 0.72)");
  g.fillStyle = rim;
  g.fillRect(0, 0, S, S);

  // 하단-우측 굴절 초점(밝은 초승달)
  const focus = g.createRadialGradient(cx + R * 0.3, cy + R * 0.45, 0, cx + R * 0.3, cy + R * 0.45, R * 0.7);
  focus.addColorStop(0, "rgba(232, 244, 255, 0.4)");
  focus.addColorStop(1, "rgba(232, 244, 255, 0)");
  g.fillStyle = focus;
  g.fillRect(0, 0, S, S);

  g.restore();

  // 정반사 하이라이트(상단-좌측)
  const spec = g.createRadialGradient(cx - R * 0.36, cy - R * 0.4, 0, cx - R * 0.36, cy - R * 0.4, R * 0.5);
  spec.addColorStop(0, "rgba(255, 255, 255, 0.95)");
  spec.addColorStop(0.4, "rgba(255, 255, 255, 0.35)");
  spec.addColorStop(1, "rgba(255, 255, 255, 0)");
  g.fillStyle = spec;
  g.beginPath();
  g.arc(cx - R * 0.36, cy - R * 0.4, R * 0.5, 0, TAU);
  g.fill();

  return c;
}

export default function RainOnGlass() {
  const ref = useRef<HTMLCanvasElement>(null);

  useCanvasScene(ref, ({ ctx, pointer }) => {
    const sprite = makeShadeSprite();
    const bg = document.createElement("canvas"); // 흐릿한 보케 배경
    const bgctx = bg.getContext("2d")!;
    const trail = document.createElement("canvas"); // 흘러내린 자국 누적
    const tctx = trail.getContext("2d")!;

    let width = 0;
    let height = 0;
    let bw = 0;
    let bh = 0;
    let drops: Drop[] = [];
    let rings: Ring[] = [];
    let rainAcc = 0;
    let rainPerSec = 0;
    let spawnTimer = 0;
    let lastSpawnX = 0;
    let lastSpawnY = 0;

    const addBead = (x: number, y: number, r: number, sliding = false) => {
      if (drops.length >= CONFIG.maxDrops) return;
      drops.push({ x, y, r, vx: 0, vy: 0, sliding, trail: CONFIG.trailGap, drift: 0, dead: false });
    };

    const buildBg = (time: number) => {
      const grad = bgctx.createLinearGradient(0, 0, 0, bh);
      grad.addColorStop(0, "#070b14");
      grad.addColorStop(1, "#0b1220");
      bgctx.globalCompositeOperation = "source-over";
      bgctx.fillStyle = grad;
      bgctx.fillRect(0, 0, bw, bh);
      bgctx.globalCompositeOperation = "lighter";
      const t = time * 0.0004;
      const span = Math.max(bw, bh);
      for (let i = 0; i < LIGHTS.length; i++) {
        const L = LIGHTS[i];
        const lx = L.x * bw + Math.sin(t + i) * bw * 0.05;
        const ly = L.y * bh + Math.cos(t * 0.8 + i * 1.3) * bh * 0.05;
        const lr = L.r * span;
        const g = bgctx.createRadialGradient(lx, ly, 0, lx, ly, lr);
        g.addColorStop(0, L.color);
        g.addColorStop(1, "transparent");
        bgctx.globalAlpha = 0.55;
        bgctx.fillStyle = g;
        bgctx.beginPath();
        bgctx.arc(lx, ly, lr, 0, TAU);
        bgctx.fill();
      }
      bgctx.globalAlpha = 1;
      bgctx.globalCompositeOperation = "source-over";
    };

    // 방울 내부에 배경을 상하 반전·확대로 그려 렌즈 굴절
    const drawRefraction = (d: Drop) => {
      const rr = d.r;
      const s = CONFIG.bgScale;
      const half = (rr / CONFIG.refractZoom) * s;
      ctx.save();
      ctx.beginPath();
      ctx.arc(d.x, d.y, rr, 0, TAU);
      ctx.clip();
      ctx.translate(d.x, d.y);
      ctx.scale(1, -1);
      ctx.drawImage(bg, d.x * s - half, d.y * s - half, half * 2, half * 2, -rr, -rr, rr * 2, rr * 2);
      ctx.restore();
    };

    const drawDrop = (d: Drop) => {
      const w = (d.r / SPRITE_R) * SPRITE_SIZE;
      const h = d.sliding ? w * 1.3 : w; // 흘러내릴 땐 길쭉한 물방울
      ctx.drawImage(sprite, d.x - w / 2, d.y - h / 2, w, h);
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(bg, 0, 0, bw, bh, 0, 0, width, height); // 흐릿한 배경
      ctx.fillStyle = "rgba(7, 11, 19, 0.5)"; // 유리 너머 디밍(안개)
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = "lighter"; // 자국·충돌 링은 배경을 밝혀 드러냄
      ctx.globalAlpha = 0.5;
      ctx.drawImage(trail, 0, 0, width, height);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(195, 218, 242, 1)";
      for (const rg of rings) {
        const t = rg.age / rg.life;
        ctx.globalAlpha = (1 - t) * 0.3;
        ctx.beginPath();
        ctx.arc(rg.x, rg.y, 2 + t * 11, 0, TAU);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      for (const d of drops) {
        if (d.r >= CONFIG.refractMin) drawRefraction(d);
        drawDrop(d);
      }
    };

    return {
      resize(w, h) {
        width = w;
        height = h;
        ctx.imageSmoothingEnabled = true;
        bw = Math.max(2, Math.round(w * CONFIG.bgScale));
        bh = Math.max(2, Math.round(h * CONFIG.bgScale));
        bg.width = bw;
        bg.height = bh;
        trail.width = w;
        trail.height = h;
        tctx.clearRect(0, 0, w, h);
        rainPerSec = Math.max(CONFIG.rainMin, Math.min(CONFIG.rainMax, w * h * CONFIG.rainPerArea));
        drops = [];
        rings = [];
        const n = Math.min(CONFIG.maxDrops, Math.floor((w * h) / CONFIG.areaPerBead));
        for (let i = 0; i < n; i++) addBead(Math.random() * w, Math.random() * h, rand(1.5, 4));
      },
      frame(dt, time) {
        // 커서가 지나간 자리에 물방울이 맺힘
        if (pointer.inside && Math.hypot(pointer.x - lastSpawnX, pointer.y - lastSpawnY) >= 7) {
          lastSpawnX = pointer.x;
          lastSpawnY = pointer.y;
          addBead(pointer.x, pointer.y, rand(3, 6));
        }

        // 비 — 작은 방울이 유리 전체에 계속 맺힘(빗방울 충돌)
        rainAcc += rainPerSec * dt;
        while (rainAcc >= 1) {
          rainAcc -= 1;
          const rx = Math.random() * width;
          const ry = Math.random() * height;
          addBead(rx, ry, rand(1, 3.5));
          if (Math.random() < CONFIG.ringChance) {
            rings.push({ x: rx, y: ry, age: 0, life: 0.5 }); // 스플래시 링
            const sat = 1 + Math.floor(Math.random() * 3);
            for (let k = 0; k < sat; k++) addBead(rx + rand(-6, 6), ry + rand(-6, 6), rand(0.8, 2));
          }
        }
        // 가끔 위에서 큰 방울이 흘러내림
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
            if (d.r < CONFIG.maxR) d.r += CONFIG.growth * dt * (0.5 + d.r * 0.08);
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
              d.r = Math.sqrt(d.r * d.r + b.r * b.r);
              b.dead = true;
            }
          }
        }

        drops = drops.filter((d) => !d.dead && d.y - d.r < height + 24);
        for (const [x, y, r] of newBeads) addBead(x, y, r);

        // 자국 레이어: 천천히 페이드 + 이번 프레임 연속 자국
        tctx.globalCompositeOperation = "destination-out";
        tctx.fillStyle = "rgba(0, 0, 0, 0.02)";
        tctx.fillRect(0, 0, width, height);
        tctx.globalCompositeOperation = "source-over";
        tctx.lineCap = "round";
        tctx.strokeStyle = "rgba(150, 185, 215, 0.18)";
        for (const [ox, oy, x, y, r] of segs) {
          tctx.lineWidth = Math.max(1, r * 0.5);
          tctx.beginPath();
          tctx.moveTo(ox, oy);
          tctx.lineTo(x, y);
          tctx.stroke();
        }

        buildBg(time);
        render();
      },
      drawStatic() {
        buildBg(0);
        render();
      },
    };
  });

  return <canvas ref={ref} aria-hidden className="absolute inset-0" />;
}
