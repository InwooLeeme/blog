"use client";

import { useRef } from "react";
import { rand, useCanvasScene } from "./canvas";

/** 블랙홀 — 별빛이 중력 렌즈로 휘어 사건의 지평선 너머로 사라지고, 강착원반이 지평선 앞뒤로 감싼다. */
const CONFIG = {
  horizonRFrac: 0.185, // 사건의 지평선 반경(화면 짧은 변 비율)
  diskInnerFactor: 1.15, // 원반 안쪽 반경(지평선 배수)
  diskOuterFactor: 2.6, // 원반 바깥 반경(지평선 배수)
  diskTiltY: 0.32, // 원반 기울임(세로 축 비율)
  ringCount: 20,
  followEase: 0.07, // 블랙홀이 목표 위치를 따라가는 속도
  autoSpeed: 0.05, // 커서가 없을 때 자동 표류 각속도
  driftFrac: 0.16, // 자동 표류 범위(화면 짧은 변 비율)
  lensStrength: 1.4, // 중력 렌즈 왜곡 세기
  spin: 1.2, // 원반 회전 속도(차등 회전)
  starDensity: 5500,
  maxStars: 420,
} as const;

type Point = { x: number; y: number };
type Star = { x: number; y: number; r: number; alpha: number };

function autoTarget(t: number, w: number, h: number): Point {
  const amp = Math.min(w, h) * CONFIG.driftFrac;
  return { x: w / 2 + Math.sin(t) * amp, y: h / 2 + Math.cos(t * 0.7) * amp * 0.5 };
}

export default function BlackHole() {
  const ref = useRef<HTMLCanvasElement>(null);

  useCanvasScene(ref, ({ ctx, pointer }) => {
    let width = 0;
    let height = 0;
    let bhX = 0;
    let bhY = 0;
    let horizonR = 0;
    let autoT = 0;
    let stars: Star[] = [];

    const render = (time: number) => {
      ctx.fillStyle = "#03030a";
      ctx.fillRect(0, 0, width, height);

      // 별빛 — 사건의 지평선 쪽으로 휘어지고, 가까울수록 방사형으로 길게 늘어남
      for (const s of stars) {
        const dx = s.x - bhX;
        const dy = s.y - bhY;
        const dist = Math.hypot(dx, dy) || 0.001;
        const bend = (horizonR * horizonR * CONFIG.lensStrength) / dist;
        const bentDist = dist - bend;
        if (bentDist <= horizonR * 1.02) continue; // 지평선 너머로 사라짐
        const ang = Math.atan2(dy, dx) + (horizonR * 0.6) / dist; // 살짝 휘감기는 각도
        const bx = bhX + Math.cos(ang) * bentDist;
        const by = bhY + Math.sin(ang) * bentDist;
        const stretch = Math.min(1.8, 1 + bend / dist);
        ctx.globalAlpha = s.alpha;
        if (stretch > 1.15) {
          const len = s.r * stretch * 3;
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = s.r;
          ctx.beginPath();
          ctx.moveTo(bx - Math.cos(ang) * len * 0.5, by - Math.sin(ang) * len * 0.5);
          ctx.lineTo(bx + Math.cos(ang) * len * 0.5, by + Math.sin(ang) * len * 0.5);
          ctx.stroke();
        } else {
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(bx, by, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // 강착원반 — 안쪽일수록 빠르게 도는 차등 회전(케플러 회전 흉내)
      const innerR = horizonR * CONFIG.diskInnerFactor;
      const outerR = horizonR * CONFIG.diskOuterFactor;
      const rings = Array.from({ length: CONFIG.ringCount }, (_, i) => {
        const t = i / (CONFIG.ringCount - 1);
        const r = innerR + (outerR - innerR) * t;
        return {
          r,
          ry: r * CONFIG.diskTiltY,
          lw: ((outerR - innerR) / CONFIG.ringCount) * 1.5,
          hue: 42 - t * 28,
          bright: (1 - t * 0.6) * (0.85 + 0.15 * Math.sin(time * CONFIG.spin * (1.6 - t) + i)),
        };
      });

      for (const rg of rings) {
        // 뒤쪽 절반 — 사건의 지평선 뒤로 지나가는 부분(지평선보다 먼저 그려 가려짐)
        ctx.strokeStyle = `hsla(${rg.hue}, 100%, ${55 * rg.bright}%, ${0.45 * rg.bright})`;
        ctx.lineWidth = rg.lw;
        ctx.beginPath();
        ctx.ellipse(bhX, bhY, rg.r, rg.ry, 0, Math.PI, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = "#000000"; // 사건의 지평선
      ctx.beginPath();
      ctx.arc(bhX, bhY, horizonR, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 232, 200, 0.85)"; // 포톤 링
      ctx.lineWidth = Math.max(1.5, horizonR * 0.04);
      ctx.beginPath();
      ctx.arc(bhX, bhY, horizonR * 1.02, 0, Math.PI * 2);
      ctx.stroke();

      for (const rg of rings) {
        // 앞쪽 절반 — 지평선 위로 그려져 항상 보임
        ctx.strokeStyle = `hsla(${rg.hue}, 100%, ${65 * rg.bright}%, ${0.85 * rg.bright})`;
        ctx.lineWidth = rg.lw;
        ctx.beginPath();
        ctx.ellipse(bhX, bhY, rg.r, rg.ry, 0, 0, Math.PI);
        ctx.stroke();
      }
    };

    return {
      resize(w, h) {
        width = w;
        height = h;
        bhX = w / 2;
        bhY = h / 2;
        horizonR = Math.min(w, h) * CONFIG.horizonRFrac;
        autoT = rand(0, Math.PI * 2);
        const n = Math.min(CONFIG.maxStars, Math.floor((w * h) / CONFIG.starDensity));
        stars = Array.from({ length: n }, () => ({
          x: rand(0, w),
          y: rand(0, h),
          r: rand(0.4, 1.6),
          alpha: rand(0.3, 1),
        }));
      },
      frame(dt, time) {
        autoT += dt * CONFIG.autoSpeed;
        const target = pointer.inside ? pointer : autoTarget(autoT, width, height);
        bhX += (target.x - bhX) * CONFIG.followEase;
        bhY += (target.y - bhY) * CONFIG.followEase;
        render(time / 1000);
      },
      drawStatic() {
        bhX = width / 2;
        bhY = height / 2;
        render(0);
      },
    };
  });

  return <canvas ref={ref} aria-hidden className="absolute inset-0" />;
}
