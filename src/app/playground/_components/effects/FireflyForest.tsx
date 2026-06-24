"use client";

import { useRef } from "react";
import { rand, useCanvasScene } from "./canvas";

/** 반딧불 숲 — 어두운 숲 위로 반딧불이 무작위로 떠다니며 점멸하고, 커서 주위로 모여든다. */
const CONFIG = {
  density: 9000, // px²당 반딧불 1마리
  maxFireflies: 140,
  wanderAccel: 16, // 무작위 표류 가속(px/s²)
  maxSpeed: 26, // 최고 속도(px/s)
  friction: 0.985,
  attractRadius: 160, // 커서가 끌어모으는 반경(px)
  attractForce: 70,
  swirl: 0.6, // 끌려가며 맴도는 정도
} as const;

type Point = { x: number; y: number };
type Firefly = { x: number; y: number; vx: number; vy: number; phase: number; speed: number; size: number; hue: number; alpha: number };

export default function FireflyForest() {
  const ref = useRef<HTMLCanvasElement>(null);

  useCanvasScene(ref, ({ ctx, pointer }) => {
    let width = 0;
    let height = 0;
    let flies: Firefly[] = [];
    let treeline: Point[] = [];

    const render = (time: number) => {
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, "#040907");
      sky.addColorStop(1, "#01100c");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#010604"; // 숲 능선 실루엣
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (const p of treeline) ctx.lineTo(p.x, p.y);
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      ctx.globalCompositeOperation = "lighter";
      for (const f of flies) {
        const raw = Math.sin(time * f.speed + f.phase);
        const pulse = raw > 0 ? raw ** 4 : 0; // 빠르게 켜지고 오래 어두운 점멸
        const bright = (0.08 + 0.92 * pulse) * f.alpha;

        const glow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 5);
        glow.addColorStop(0, `hsla(${f.hue}, 100%, 75%, ${bright})`);
        glow.addColorStop(1, "hsla(60, 100%, 70%, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size * 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `hsla(${f.hue}, 100%, 90%, ${bright})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };

    return {
      resize(w, h) {
        width = w;
        height = h;

        const amp1 = rand(8, 18);
        const amp2 = rand(4, 10);
        const freq1 = rand(0.008, 0.02);
        const freq2 = rand(0.02, 0.05);
        const phase1 = rand(0, Math.PI * 2);
        const phase2 = rand(0, Math.PI * 2);
        const baseH = h * rand(0.12, 0.18);
        treeline = [];
        for (let x = 0; x <= w; x += 24) {
          treeline.push({
            x,
            y: h - baseH - Math.sin(x * freq1 + phase1) * amp1 - Math.sin(x * freq2 + phase2) * amp2,
          });
        }

        const n = Math.min(CONFIG.maxFireflies, Math.max(40, Math.floor((w * h) / CONFIG.density)));
        flies = Array.from({ length: n }, () => ({
          x: rand(0, w),
          y: rand(0, h * 0.85),
          vx: 0,
          vy: 0,
          phase: rand(0, Math.PI * 2),
          speed: rand(1.2, 3.2),
          size: rand(1.2, 2.4),
          hue: rand(45, 85),
          alpha: rand(0.6, 1),
        }));
      },
      frame(dt, time) {
        for (const f of flies) {
          f.vx += rand(-1, 1) * CONFIG.wanderAccel * dt;
          f.vy += rand(-1, 1) * CONFIG.wanderAccel * dt;

          if (pointer.inside) {
            const dx = pointer.x - f.x;
            const dy = pointer.y - f.y;
            const d = Math.hypot(dx, dy) || 1;
            if (d < CONFIG.attractRadius) {
              const pull = (1 - d / CONFIG.attractRadius) * CONFIG.attractForce * dt;
              f.vx += (dx / d) * pull - (dy / d) * pull * CONFIG.swirl;
              f.vy += (dy / d) * pull + (dx / d) * pull * CONFIG.swirl;
            }
          }

          f.vx *= CONFIG.friction;
          f.vy *= CONFIG.friction;
          const sp = Math.hypot(f.vx, f.vy);
          if (sp > CONFIG.maxSpeed) {
            f.vx = (f.vx / sp) * CONFIG.maxSpeed;
            f.vy = (f.vy / sp) * CONFIG.maxSpeed;
          }
          f.x += f.vx * dt;
          f.y += f.vy * dt;

          if (f.x < 0 || f.x > width) f.vx *= -1;
          if (f.y < 0 || f.y > height * 0.85) f.vy *= -1;
          f.x = Math.max(0, Math.min(width, f.x));
          f.y = Math.max(0, Math.min(height * 0.85, f.y));
        }
        render(time / 1000);
      },
      drawStatic() {
        render(0);
      },
    };
  });

  return <canvas ref={ref} aria-hidden className="absolute inset-0" />;
}
