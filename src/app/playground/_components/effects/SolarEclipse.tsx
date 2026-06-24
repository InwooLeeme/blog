"use client";

import { useRef } from "react";
import { rand, useCanvasScene } from "./canvas";

/** 일식 — 달이 태양을 가리며 지나가고, 가릴수록 하늘이 어두워지며 별과 코로나가 드러난다. */
const CONFIG = {
  sunRFrac: 0.15, // 태양 반경(화면 짧은 변 비율)
  moonRFactor: 1.05, // 달이 태양보다 살짝 큰 비율(개기일식처럼)
  followEase: 0.06, // 달이 목표 위치를 따라가는 속도
  coverageEase: 0.1, // 밝기 전환 스무딩
  autoSpeed: 0.05, // 커서가 없을 때 자동 이동 각속도
  starDensity: 9000, // px²당 별 1개
  maxStars: 260,
} as const;

const SKY_DAY = "#163a66";
const SKY_NIGHT = "#020207";

type Point = { x: number; y: number };
type Star = { x: number; y: number; r: number; phase: number; speed: number };

function lerpHex(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ar = (pa >> 16) & 255, ag = (pa >> 8) & 255, ab = pa & 255;
  const br = (pb >> 16) & 255, bg = (pb >> 8) & 255, bb = pb & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

/** 커서가 없을 때 달이 태양 앞을 천천히 가로지르는 경로 */
function autoTarget(t: number, sunX: number, sunY: number, sunR: number): Point {
  return { x: sunX + Math.sin(t) * sunR * 4, y: sunY + Math.sin(t * 0.37) * sunR * 0.6 };
}

export default function SolarEclipse() {
  const ref = useRef<HTMLCanvasElement>(null);

  useCanvasScene(ref, ({ ctx, pointer }) => {
    let width = 0;
    let height = 0;
    let sunX = 0;
    let sunY = 0;
    let sunR = 0;
    let moonR = 0;
    let moonX = 0;
    let moonY = 0;
    let autoT = 0;
    let displayCoverage = 0;
    let stars: Star[] = [];

    const render = (time: number) => {
      ctx.fillStyle = lerpHex(SKY_DAY, SKY_NIGHT, displayCoverage);
      ctx.fillRect(0, 0, width, height);

      if (displayCoverage > 0.05) {
        ctx.fillStyle = "#ffffff";
        for (const s of stars) {
          const tw = 0.5 + 0.5 * Math.sin(time * s.speed + s.phase);
          ctx.globalAlpha = displayCoverage * displayCoverage * tw;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      ctx.globalCompositeOperation = "lighter";
      const haloR = sunR * (2.4 + displayCoverage * 1.2);
      const halo = ctx.createRadialGradient(sunX, sunY, sunR * 0.6, sunX, sunY, haloR);
      halo.addColorStop(0, "rgba(255, 226, 150, 0.55)");
      halo.addColorStop(1, "rgba(255, 226, 150, 0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(sunX, sunY, haloR, 0, Math.PI * 2);
      ctx.fill();

      if (displayCoverage > 0.85) {
        // 개기일식 코로나 스트리머
        const a = (displayCoverage - 0.85) / 0.15;
        ctx.strokeStyle = `rgba(255, 244, 214, ${a * 0.5})`;
        ctx.lineWidth = 1;
        const rays = 28;
        for (let i = 0; i < rays; i++) {
          const ang = (i / rays) * Math.PI * 2 + time * 0.02;
          const len = sunR * (1.3 + ((i * 7) % 5) * 0.25 + a * 0.6);
          ctx.beginPath();
          ctx.moveTo(sunX + Math.cos(ang) * sunR, sunY + Math.sin(ang) * sunR);
          ctx.lineTo(sunX + Math.cos(ang) * len, sunY + Math.sin(ang) * len);
          ctx.stroke();
        }
      }
      ctx.globalCompositeOperation = "source-over";

      const core = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
      core.addColorStop(0, "#fff6da");
      core.addColorStop(0.7, "#ffd479");
      core.addColorStop(1, "#ff9d3d");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#040406"; // 달 — 태양을 가림
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fill();

      // 다이아몬드 링 — 개기일식 직전/직후, 가려지지 않은 마지막 빛
      const d = Math.hypot(moonX - sunX, moonY - sunY) || 1;
      const ring = Math.exp(-((displayCoverage - 0.97) ** 2) / (2 * 0.02 * 0.02));
      if (ring > 0.05) {
        const rx = sunX + ((sunX - moonX) / d) * sunR;
        const ry = sunY + ((sunY - moonY) / d) * sunR;
        ctx.globalCompositeOperation = "lighter";
        const flare = ctx.createRadialGradient(rx, ry, 0, rx, ry, sunR * 0.35);
        flare.addColorStop(0, `rgba(255, 255, 255, ${ring})`);
        flare.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = flare;
        ctx.beginPath();
        ctx.arc(rx, ry, sunR * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
      }
    };

    return {
      resize(w, h) {
        width = w;
        height = h;
        sunX = w / 2;
        sunY = h / 2;
        sunR = Math.min(w, h) * CONFIG.sunRFrac;
        moonR = sunR * CONFIG.moonRFactor;
        moonX = sunX - sunR * 3;
        moonY = sunY;
        autoT = 0;
        displayCoverage = 0;
        const n = Math.min(CONFIG.maxStars, Math.floor((w * h) / CONFIG.starDensity));
        stars = Array.from({ length: n }, () => ({
          x: rand(0, w),
          y: rand(0, h),
          r: rand(0.5, 1.6),
          phase: rand(0, Math.PI * 2),
          speed: rand(0.5, 2),
        }));
      },
      frame(dt, time) {
        autoT += dt * CONFIG.autoSpeed;
        const target = pointer.inside ? pointer : autoTarget(autoT, sunX, sunY, sunR);
        moonX += (target.x - moonX) * CONFIG.followEase;
        moonY += (target.y - moonY) * CONFIG.followEase;
        const d = Math.hypot(moonX - sunX, moonY - sunY);
        const coverage = Math.max(0, Math.min(1, (sunR + moonR - d) / (2 * Math.min(sunR, moonR))));
        displayCoverage += (coverage - displayCoverage) * CONFIG.coverageEase;
        render(time / 1000);
      },
      drawStatic() {
        moonX = sunX - sunR * 0.4;
        moonY = sunY;
        displayCoverage = 0.65;
        render(0);
      },
    };
  });

  return <canvas ref={ref} aria-hidden className="absolute inset-0" />;
}
