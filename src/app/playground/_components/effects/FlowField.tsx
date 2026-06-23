"use client";

import { useRef } from "react";
import { useCanvasScene } from "./canvas";

/** 플로우 필드 — 입자가 노이즈 벡터장을 따라 흐르며 궤적을 남기고, 커서가 소용돌이를 만든다. */
const CONFIG = {
  areaPerParticle: 2200,
  maxParticles: 600,
  speed: 1.4, // 이동 속도(px/프레임)
  fieldScale: 0.0026, // 벡터장 공간 주파수
  fade: "rgba(9, 9, 11, 0.07)", // 매 프레임 덮어 궤적을 페이드
  maxLife: 220, // 입자 수명(프레임)
} as const;

type Particle = { x: number; y: number; life: number };

/** 위치·시간에 따른 흐름 각도(값싼 의사 노이즈) */
function fieldAngle(x: number, y: number, t: number) {
  return (
    (Math.sin(x * CONFIG.fieldScale + t * 0.0003) +
      Math.cos(y * CONFIG.fieldScale - t * 0.0002) +
      Math.sin((x + y) * CONFIG.fieldScale * 0.6)) *
    Math.PI
  );
}

const strokeFor = (a: number, alpha = 0.5) => `hsla(${190 + 70 * Math.sin(a)}, 75%, 62%, ${alpha})`;

export default function FlowField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useCanvasScene(ref, ({ ctx, pointer }) => {
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];

    const spawn = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      life: Math.random() * CONFIG.maxLife,
    });

    return {
      resize(w, h) {
        width = w;
        height = h;
        ctx.clearRect(0, 0, w, h);
        const n = Math.min(CONFIG.maxParticles, Math.floor((w * h) / CONFIG.areaPerParticle));
        particles = Array.from({ length: n }, spawn);
      },
      frame(_dt, time) {
        ctx.fillStyle = CONFIG.fade;
        ctx.fillRect(0, 0, width, height);
        const R = Math.min(width, height) * 0.5; // 커서 소용돌이 반경
        for (const p of particles) {
          const a = fieldAngle(p.x, p.y, time);
          let vx = Math.cos(a);
          let vy = Math.sin(a);
          let boost = 0;
          if (pointer.inside) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const d = Math.hypot(dx, dy);
            if (d < R && d > 0.01) {
              boost = 1 - d / R; // 접선(소용돌이) + 끌림
              vx += ((-dy / d) * 2.6 - (dx / d) * 0.7) * boost;
              vy += ((dx / d) * 2.6 - (dy / d) * 0.7) * boost;
            }
          }
          const len = Math.hypot(vx, vy) || 1;
          const nx = p.x + (vx / len) * CONFIG.speed;
          const ny = p.y + (vy / len) * CONFIG.speed;
          ctx.strokeStyle = boost ? strokeFor(a, 0.5 + 0.5 * boost) : strokeFor(a);
          ctx.lineWidth = 1.2 + boost * 2.2; // 휘감기는 입자는 밝고 굵게
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(nx, ny);
          ctx.stroke();
          p.x = nx;
          p.y = ny;
          p.life -= 1;
          if (p.life <= 0 || nx < 0 || nx > width || ny < 0 || ny > height) {
            Object.assign(p, spawn(), { life: CONFIG.maxLife });
          }
        }
        if (pointer.inside) {
          ctx.globalCompositeOperation = "lighter"; // 소용돌이 중심 빛
          const gr = Math.min(width, height) * 0.16;
          const g = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, gr);
          g.addColorStop(0, "hsla(195, 90%, 70%, 0.5)");
          g.addColorStop(1, "transparent");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(pointer.x, pointer.y, gr, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalCompositeOperation = "source-over";
        }
      },
      drawStatic() {
        for (const p of particles) {
          const a = fieldAngle(p.x, p.y, 0);
          ctx.strokeStyle = strokeFor(a);
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + Math.cos(a) * 14, p.y + Math.sin(a) * 14);
          ctx.stroke();
        }
      },
    };
  });

  return <canvas ref={ref} aria-hidden className="absolute inset-0" />;
}
