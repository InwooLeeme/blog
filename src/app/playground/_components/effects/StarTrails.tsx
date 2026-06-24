"use client";

import { useRef } from "react";
import { rand, useCanvasScene } from "./canvas";

/** 별의 궤적 — 천구의 극을 중심으로 별이 점으로 떠 있다가, 커서를 올리면 장노출 사진처럼 호를 그리며 돈다. */
const CONFIG = {
  poleXFrac: 0.5, // 극(천구 북극) x 위치(화면 비율)
  poleYFrac: 0.5, // 극 y 위치(화면 비율, 정중앙)
  angularSpeed: 0.5, // 호버 중 회전 각속도(rad/s)
  decaySpeed: 0.22, // 손을 떼면 줄어드는 각속도(rad/s)
  maxSweep: Math.PI * 1.5, // 트레일 최대 길이(라디안)
  starDensity: 4200,
  maxStars: 260,
} as const;

const COLORS = ["#ffffff", "#cfe3ff", "#fff3d6", "#ffd9b0"];

type Star = { angle0: number; radius: number; sweep: number; color: string; alpha: number; lw: number };

export default function StarTrails() {
  const ref = useRef<HTMLCanvasElement>(null);

  useCanvasScene(ref, ({ ctx, pointer }) => {
    let width = 0;
    let height = 0;
    let poleX = 0;
    let poleY = 0;
    let stars: Star[] = [];

    const render = () => {
      ctx.fillStyle = "#05050c";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#ffffff"; // 극(폴라리스 위치) 표시
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(poleX, poleY, 1.6, 0, Math.PI * 2);
      ctx.fill();

      for (const s of stars) {
        const head = s.angle0 + s.sweep;
        ctx.globalAlpha = s.alpha;
        if (s.sweep > 0.001) {
          ctx.strokeStyle = s.color;
          ctx.lineWidth = s.lw;
          ctx.beginPath();
          ctx.arc(poleX, poleY, s.radius, s.angle0, head);
          ctx.stroke();
        }
        ctx.fillStyle = s.color; // 현재 위치(머리) 강조
        ctx.beginPath();
        ctx.arc(poleX + Math.cos(head) * s.radius, poleY + Math.sin(head) * s.radius, s.lw * 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    return {
      resize(w, h) {
        width = w;
        height = h;
        poleX = w * CONFIG.poleXFrac;
        poleY = h * CONFIG.poleYFrac;
        const n = Math.min(CONFIG.maxStars, Math.floor((w * h) / CONFIG.starDensity));
        stars = Array.from({ length: n }, () => {
          const x = rand(0, w);
          const y = rand(0, h);
          const dx = x - poleX;
          const dy = y - poleY;
          return {
            angle0: Math.atan2(dy, dx),
            radius: Math.hypot(dx, dy),
            sweep: 0,
            color: COLORS[Math.floor(rand(0, COLORS.length))],
            alpha: rand(0.5, 1),
            lw: rand(0.8, 1.8),
          };
        });
      },
      frame(dt) {
        const dir = pointer.inside ? CONFIG.angularSpeed : -CONFIG.decaySpeed;
        for (const s of stars) {
          s.sweep = Math.max(0, Math.min(CONFIG.maxSweep, s.sweep + dir * dt));
        }
        render();
      },
      drawStatic: render,
    };
  });

  return <canvas ref={ref} aria-hidden className="absolute inset-0" />;
}
