"use client";

import { useRef } from "react";
import { useCanvasScene } from "./canvas";

/** 오로라 웨이브 — 색 다른 빛 커튼이 사인파로 일렁이고, 커서 위치에서 솟아오른다. */
const TAU = Math.PI * 2;
const BAND = 0.5; // 커튼이 아래로 페이드되는 높이(화면 비율)
const STEP = 14; // 윤곽 샘플 간격(px)
const BUMP_FRAC = 0.34; // 커서가 끌어올리는 높이(화면 비율)
const SIGMA_FRAC = 0.15; // 커서 영향 범위(폭 비율)

type Layer = { color: string; baseY: number; amp: number; speed: number; freq: number; phase: number };

const LAYERS: Layer[] = [
  { color: "#31CED2", baseY: 0.42, amp: 0.1, speed: 0.5, freq: 1.3, phase: 0 },
  { color: "#3ad29f", baseY: 0.5, amp: 0.12, speed: 0.36, freq: 1.7, phase: 1.8 },
  { color: "#7c5cff", baseY: 0.38, amp: 0.09, speed: 0.62, freq: 1.0, phase: 3.4 },
];

export default function AuroraWaves() {
  const ref = useRef<HTMLCanvasElement>(null);

  useCanvasScene(ref, ({ ctx, pointer }) => {
    let width = 0;
    let height = 0;
    let mx = 0; // 커서 x(스무딩)
    let act = 0; // 커서 영향 강도 0~1(스무딩)

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      const sigma = SIGMA_FRAC * width || 1;
      for (const L of LAYERS) {
        const top = (L.baseY - L.amp) * height;
        const grad = ctx.createLinearGradient(0, top, 0, top + BAND * height);
        grad.addColorStop(0, L.color);
        grad.addColorStop(1, "transparent");
        ctx.globalAlpha = 0.16;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += STEP) {
          const fx = x / width;
          const wave =
            (L.baseY +
              L.amp * Math.sin(fx * TAU * L.freq + t * L.speed + L.phase) +
              L.amp * 0.5 * Math.sin(fx * TAU * L.freq * 2.3 - t * L.speed * 0.7)) *
            height;
          const bump = act * BUMP_FRAC * height * Math.exp(-((x - mx) ** 2) / (2 * sigma * sigma));
          ctx.lineTo(x, wave - bump);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
      }
      if (act > 0.01) {
        // 커서 지점의 빛무리 — 솟아오른 곳 강조
        const peakY = 0.42 * height - act * BUMP_FRAC * height;
        const r = sigma * 2;
        const glow = ctx.createRadialGradient(mx, peakY, 0, mx, peakY, r);
        glow.addColorStop(0, "#aef3ff");
        glow.addColorStop(1, "transparent");
        ctx.globalAlpha = 0.4 * act;
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(mx, peakY, r, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    return {
      resize(w, h) {
        width = w;
        height = h;
      },
      frame(_dt, time) {
        mx += (pointer.x - mx) * 0.2;
        act += ((pointer.inside ? 1 : 0) - act) * 0.16;
        draw(time / 1000);
      },
      drawStatic: () => draw(0),
    };
  });

  return <canvas ref={ref} aria-hidden className="absolute inset-0" />;
}
