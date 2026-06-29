"use client";

import { useRef } from "react";
import { rand, useCanvasScene } from "./canvas";

/** 일식 — 달이 태양을 가리며 지나가고, 가릴수록 하늘이 어두워지며 별과 코로나가 드러난다. */
const TAU = Math.PI * 2;

const CONFIG = {
  sunRFrac: 0.15, // 태양 반경(화면 짧은 변 비율)
  moonRFactor: 1.05, // 달이 태양보다 살짝 큰 비율(개기일식처럼)
  followEase: 0.06, // 달이 목표 위치를 따라가는 속도
  coverageEase: 0.1, // 밝기 전환 스무딩
  autoSpeed: 0.05, // 커서가 없을 때 자동 이동 각속도
  starDensity: 9000, // px²당 별 1개
  maxStars: 260,
  coronaStart: 0.85, // 코로나가 나타나기 시작하는 가림 비율
  coronaStreamers: 18, // 코로나 스트리머 개수
  coronaSegments: 14, // 스트리머 하나를 그리는 폴리라인 세그먼트 수
  coronaCurl: 0.6, // 스트리머가 휘는 정도(자기장 곡률)
  coronaEquatorBias: 1.2, // 적도 방향 스트리머가 더 길어지는 가중치
  veilRFactor: 2.8, // 디퓨즈 베일 반경(태양 반경 비율)
  veilInnerFactor: 0.9, // 베일이 시작되는 안쪽 경계(태양 반경 비율)
  veilSquash: 0.82, // 베일의 적도 방향 타원 압축 비율
  veilAlpha: 0.35, // 베일 최대 불투명도
} as const;

const SKY_DAY = "#163a66";
const SKY_NIGHT = "#020207";

type Point = { x: number; y: number };
type Star = { x: number; y: number; r: number; phase: number; speed: number };
type Streamer = {
  angle: number; // 기준 각도(라디안)
  length: number; // 길이(태양 반경 비율)
  curl: number; // 끝으로 갈수록 휘는 정도(자기장 아치)
  width: number; // 기준 굵기
  brightness: number; // 기준 밝기
  phase: number; // 명멸 위상
  flickerSpeed: number; // 명멸 속도
};

/** 적도 방향(좌우)일수록 길게 뻗는 헬멧 스트리머들을 생성한다 */
function spawnStreamers(count: number): Streamer[] {
  return Array.from({ length: count }, () => {
    const angle = rand(0, TAU);
    const equatorWeight = Math.abs(Math.cos(angle));
    return {
      angle,
      length: rand(1.2, 1.6) + equatorWeight * CONFIG.coronaEquatorBias * rand(0.6, 1.4),
      curl: rand(-CONFIG.coronaCurl, CONFIG.coronaCurl),
      width: rand(0.6, 1.8),
      brightness: rand(0.35, 0.85),
      phase: rand(0, TAU),
      flickerSpeed: rand(0.3, 0.9),
    };
  });
}

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
    let streamers: Streamer[] = [];
    let veilGradient: CanvasGradient | null = null;

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

      if (displayCoverage > CONFIG.coronaStart) {
        // 개기일식 코로나 — 디퓨즈 진주빛 베일 + 곡선 스트리머(자기장 아치)
        const a = (displayCoverage - CONFIG.coronaStart) / (1 - CONFIG.coronaStart);

        ctx.save();
        ctx.translate(sunX, sunY);
        ctx.scale(1, CONFIG.veilSquash);
        ctx.globalAlpha = a * CONFIG.veilAlpha;
        ctx.fillStyle = veilGradient!;
        ctx.beginPath();
        ctx.arc(0, 0, sunR * CONFIG.veilRFactor, 0, TAU);
        ctx.fill();
        ctx.restore();

        const rotation = time * 0.015;
        for (const s of streamers) {
          const len = s.length * sunR;
          const flicker = 0.7 + 0.3 * Math.sin(time * s.flickerSpeed + s.phase);
          const baseAngle = s.angle + rotation;
          let prevX = sunX + Math.cos(baseAngle) * sunR;
          let prevY = sunY + Math.sin(baseAngle) * sunR;
          for (let i = 1; i <= CONFIG.coronaSegments; i++) {
            const t = i / CONFIG.coronaSegments;
            const r = sunR + len * t;
            const ang = baseAngle + s.curl * t * t;
            const x = sunX + Math.cos(ang) * r;
            const y = sunY + Math.sin(ang) * r;
            const fade = (1 - t) ** 2;
            const alpha = s.brightness * a * flicker * fade;
            if (alpha > 0.01) {
              ctx.strokeStyle = `rgba(255, 244, 214, ${alpha})`;
              ctx.lineWidth = s.width * fade + 0.3;
              ctx.beginPath();
              ctx.moveTo(prevX, prevY);
              ctx.lineTo(x, y);
              ctx.stroke();
            }
            prevX = x;
            prevY = y;
          }
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
        streamers = spawnStreamers(CONFIG.coronaStreamers);
        veilGradient = ctx.createRadialGradient(0, 0, sunR * CONFIG.veilInnerFactor, 0, 0, sunR * CONFIG.veilRFactor);
        veilGradient.addColorStop(0, "rgba(255, 244, 214, 1)");
        veilGradient.addColorStop(1, "rgba(255, 244, 214, 0)");
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
