"use client";

import { useRef } from "react";
import { rand, useCanvasScene } from "./canvas";

/**
 * 메타볼 — 발광하는 방울들이 완만하게 휘어지는 경로로 떠다니며 숨쉬듯 크기가 변하고,
 * 가까워지면 부드러운 falloff로 끈적하게 융합·분리되고, 커서가 닿으면 밀려난다.
 * field(흰색 알파 마스크)·paint(무지갯빛 색)를 각각 누적 합성한 뒤 destination-in으로 마스킹해
 * 부드러운 이리데센트 블롭을 만들고, 메인 캔버스에서 블룸(외광)과 스페큘러 하이라이트를 더한다.
 */
const TAU = Math.PI * 2;

const CONFIG = {
  count: 16,
  radiusFrac: [0.2, 0.275] as readonly [number, number], // 짧은 변 비율
  speed: 150, // 자율 드리프트 속도(px/초)
  turnJitter: 0.9, // 회전 속도에 더해지는 잡음(rad/s²)
  maxTurnRate: 1.8, // 최대 회전 속도(rad/s) — 곡선 드리프트의 휘는 정도
  speedVarAmp: 0.5, // 속도 증감 폭(비율)
  speedVarFreq: 0.4, // 속도 증감 주파수(rad/s)
  bounceJitter: 0.5, // 벽 반사 시 추가 각도 jitter(rad)
  breatheAmp: 0.18, // 반지름 맥동 폭(비율)
  breatheFreq: 0.6, // 반지름 맥동 주파수(rad/s)
  repelRadiusFrac: 0.24, // 커서 영향 반경(짧은 변 비율)
  repelStrength: 2600, // 반발 힘
  bg: "#06060a",
  hueBase: 190, // 기준 색상(청록)
  hueSpread: 140, // 방울 간 색상 폭
  hueSpeed: 5, // 색상 순환 속도(도/초)
  paintAlpha: 0.62, // 페인트 레이어 알파 상한(가산 시 화이트아웃 방지)
  overlapWhite: 0.4125, // 겹침 화이트 강도 — 가산이라 두 방울이 겹치면 흰색으로 포화된다
  bloomBlur: 28, // 외광 blur(px)
  bloomGain: 0.55, // 외광 강도
  specularSize: 0.22, // 하이라이트 반지름(방울 반지름 비율)
  specularAngle: -0.78, // 가상 광원 방향(라디안)
} as const;

// 가장자리 falloff(smoothstep 역곡선) — 두 단 그라디언트보다 부드러운 경계·융합을 만든다.
const FALLOFF_STOPS = [0, 0.25, 0.5, 0.75, 1].map((t) => ({ t, a: 1 - (3 * t * t - 2 * t * t * t) }));

type Blob = {
  x: number;
  y: number;
  angle: number; // 이동 방향(라디안)
  turnRate: number; // 각속도(rad/s) — 랜덤워크해 완만한 곡선을 만든다
  rBase: number; // 물리(벽 충돌)에 쓰는 기준 반지름
  rNow: number; // 맥동이 적용된 현재 표시 반지름
  phase: number; // 색상 위상(0~1)
  breathePhase: number; // 맥동 위상(0~TAU)
};

function spawnBlob(width: number, height: number): Blob {
  const rBase = rand(CONFIG.radiusFrac[0], CONFIG.radiusFrac[1]) * Math.min(width, height);
  return {
    x: rand(rBase, width - rBase),
    y: rand(rBase, height - rBase),
    angle: rand(0, TAU),
    turnRate: 0,
    rBase,
    rNow: rBase,
    phase: rand(0, 1),
    breathePhase: rand(0, TAU),
  };
}

const hueFor = (b: Blob, timeSec: number) => (CONFIG.hueBase + b.phase * CONFIG.hueSpread + timeSec * CONFIG.hueSpeed) % 360;

const SPECULAR_STOPS = [{ t: 0, a: 0.9 }, { t: 1, a: 0 }];

/** stops를 따라 색이 안→밖으로 옅어지는 원 하나를 채운다(가산 합성은 호출 측 책임) */
function fillRadialGradient(
  target: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  stops: readonly { t: number; a: number }[],
  colorAt: (alpha: number) => string,
) {
  const g = target.createRadialGradient(x, y, 0, x, y, r);
  for (const { t, a } of stops) g.addColorStop(t, colorAt(a));
  target.fillStyle = g;
  target.beginPath();
  target.arc(x, y, r, 0, TAU);
  target.fill();
}

export default function Metaballs() {
  const ref = useRef<HTMLCanvasElement>(null);

  useCanvasScene(ref, ({ ctx, pointer }) => {
    const field = document.createElement("canvas"); // 흰색 알파 마스크(방울 모양·융합)
    const paint = document.createElement("canvas"); // 무지갯빛 색 + 겹침 화이트 가산(겹칠수록 흰색 포화)
    const blob = document.createElement("canvas"); // paint를 field로 마스킹한 결과
    const fctx = field.getContext("2d")!;
    const pctx = paint.getContext("2d")!;
    const bctx = blob.getContext("2d")!;
    let width = 0;
    let height = 0;
    let blobs: Blob[] = [];

    const render = (timeSec: number) => {
      for (const b of blobs) {
        b.rNow = b.rBase * (1 + CONFIG.breatheAmp * Math.sin(timeSec * CONFIG.breatheFreq + b.breathePhase));
      }

      fctx.clearRect(0, 0, width, height);
      fctx.globalCompositeOperation = "lighter";
      pctx.clearRect(0, 0, width, height);
      pctx.globalCompositeOperation = "lighter";
      for (const b of blobs) {
        fillRadialGradient(fctx, b.x, b.y, b.rNow, FALLOFF_STOPS, (a) => `rgba(255, 255, 255, ${a})`);
        const hue = hueFor(b, timeSec);
        fillRadialGradient(pctx, b.x, b.y, b.rNow, FALLOFF_STOPS, (a) => `hsla(${hue}, 85%, 60%, ${a * CONFIG.paintAlpha})`);
        // 겹치면 가산되어 흰색으로 포화
        fillRadialGradient(pctx, b.x, b.y, b.rNow, FALLOFF_STOPS, (a) => `rgba(255, 255, 255, ${a * CONFIG.overlapWhite})`);
      }
      fctx.globalCompositeOperation = "source-over";
      pctx.globalCompositeOperation = "source-over";

      bctx.clearRect(0, 0, width, height);
      bctx.drawImage(paint, 0, 0);
      bctx.globalCompositeOperation = "destination-in";
      bctx.drawImage(field, 0, 0);
      bctx.globalCompositeOperation = "source-over";

      ctx.fillStyle = CONFIG.bg;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.filter = `blur(${CONFIG.bloomBlur}px)`;
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = CONFIG.bloomGain;
      ctx.drawImage(blob, 0, 0);
      ctx.restore();

      ctx.drawImage(blob, 0, 0);

      ctx.globalCompositeOperation = "lighter";
      for (const b of blobs) {
        const sx = b.x + Math.cos(CONFIG.specularAngle) * b.rNow * 0.35;
        const sy = b.y + Math.sin(CONFIG.specularAngle) * b.rNow * 0.35;
        const sr = b.rNow * CONFIG.specularSize;
        fillRadialGradient(ctx, sx, sy, sr, SPECULAR_STOPS, (a) => `rgba(255, 255, 255, ${a})`);
      }
      ctx.globalCompositeOperation = "source-over";
    };

    return {
      resize(w, h) {
        width = w;
        height = h;
        field.width = paint.width = blob.width = w;
        field.height = paint.height = blob.height = h;
        blobs = Array.from({ length: CONFIG.count }, () => spawnBlob(w, h));
      },
      frame(dt, time) {
        const timeSec = time / 1000;
        const repelR = CONFIG.repelRadiusFrac * Math.min(width, height);
        for (const b of blobs) {
          b.turnRate = Math.max(
            -CONFIG.maxTurnRate,
            Math.min(CONFIG.maxTurnRate, b.turnRate + rand(-1, 1) * CONFIG.turnJitter * dt),
          );
          b.angle += b.turnRate * dt;
          const speedMul = 1 + CONFIG.speedVarAmp * Math.sin(timeSec * CONFIG.speedVarFreq + b.phase * TAU);
          let vx = Math.cos(b.angle) * CONFIG.speed * speedMul;
          let vy = Math.sin(b.angle) * CONFIG.speed * speedMul;
          if (pointer.inside) {
            const dx = b.x - pointer.x;
            const dy = b.y - pointer.y;
            const d = Math.hypot(dx, dy);
            if (d < repelR && d > 0.01) {
              const f = (1 - d / repelR) * CONFIG.repelStrength;
              vx += (dx / d) * f;
              vy += (dy / d) * f;
            }
          }
          b.x += vx * dt;
          b.y += vy * dt;
          if (b.x < b.rBase) {
            b.x = b.rBase;
            b.angle = Math.PI - b.angle + rand(-CONFIG.bounceJitter, CONFIG.bounceJitter);
          } else if (b.x > width - b.rBase) {
            b.x = width - b.rBase;
            b.angle = Math.PI - b.angle + rand(-CONFIG.bounceJitter, CONFIG.bounceJitter);
          }
          if (b.y < b.rBase) {
            b.y = b.rBase;
            b.angle = -b.angle + rand(-CONFIG.bounceJitter, CONFIG.bounceJitter);
          } else if (b.y > height - b.rBase) {
            b.y = height - b.rBase;
            b.angle = -b.angle + rand(-CONFIG.bounceJitter, CONFIG.bounceJitter);
          }
        }
        render(timeSec);
      },
      drawStatic: () => render(0),
    };
  });

  return <canvas ref={ref} aria-hidden className="absolute inset-0" />;
}
