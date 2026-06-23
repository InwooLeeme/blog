"use client";

import { useRef } from "react";
import { rand, readAccent, useCanvasScene } from "./canvas";

/** 입자 중력 폭발 — 입자가 커서(중력원)로 끌려 궤도를 그리다 주기적으로 폭발해 흩어진다. */
const CONFIG = {
  areaPerParticle: 1500,
  maxParticles: 700,
  attract: 2200, // 중력 세기
  soft: 22, // 소프트닝(가까울 때 폭주 방지)
  friction: 0.94,
  fade: "rgba(9, 9, 11, 0.16)", // 궤적 페이드
  burstEvery: [2.4, 4.2], // 자동 폭발 간격(초)
  burstSpeed: 7, // 폭발 시 바깥 속도
} as const;

type P = { x: number; y: number; vx: number; vy: number };

export default function GravityBurst() {
  const ref = useRef<HTMLCanvasElement>(null);

  useCanvasScene(ref, ({ ctx, pointer }) => {
    const accent = readAccent();
    const soft2 = CONFIG.soft * CONFIG.soft;
    let width = 0;
    let height = 0;
    let particles: P[] = [];
    let burstTimer = rand(CONFIG.burstEvery[0], CONFIG.burstEvery[1]);

    return {
      resize(w, h) {
        width = w;
        height = h;
        ctx.clearRect(0, 0, w, h);
        const n = Math.min(CONFIG.maxParticles, Math.floor((w * h) / CONFIG.areaPerParticle));
        particles = Array.from({ length: n }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: 0,
          vy: 0,
        }));
      },
      frame(dt) {
        const wx = pointer.inside ? pointer.x : width / 2;
        const wy = pointer.inside ? pointer.y : height / 2;
        burstTimer -= dt;
        const burst = burstTimer <= 0;
        if (burst) burstTimer = rand(CONFIG.burstEvery[0], CONFIG.burstEvery[1]);

        ctx.fillStyle = CONFIG.fade;
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = "lighter";
        for (const p of particles) {
          const dx = wx - p.x;
          const dy = wy - p.y;
          const d2 = dx * dx + dy * dy;
          const d = Math.sqrt(d2) || 1;
          if (burst) {
            p.vx -= (dx / d) * CONFIG.burstSpeed * rand(0.6, 1.2);
            p.vy -= (dy / d) * CONFIG.burstSpeed * rand(0.6, 1.2);
          } else {
            const f = CONFIG.attract / (d2 + soft2); // 인버스-제곱 끌림
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
          p.vx *= CONFIG.friction;
          p.vy *= CONFIG.friction;
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -40 || p.x > width + 40 || p.y < -40 || p.y > height + 40) {
            p.x = Math.random() * width;
            p.y = Math.random() * height;
            p.vx = 0;
            p.vy = 0;
          }
          const sp = Math.hypot(p.vx, p.vy);
          ctx.globalAlpha = Math.min(1, 0.35 + sp * 0.12);
          ctx.fillStyle = sp > 3 ? "#ffffff" : accent;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1 + Math.min(sp * 0.3, 2), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      },
      drawStatic() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.6;
        for (const p of particles) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      },
    };
  });

  return <canvas ref={ref} aria-hidden className="absolute inset-0" />;
}
