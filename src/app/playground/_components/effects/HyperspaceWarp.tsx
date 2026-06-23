"use client";

import { useRef } from "react";
import { readAccent, useCanvasScene } from "./canvas";

/** 하이퍼스페이스 워프 — 별이 중심에서 카메라로 쏟아지며 늘어나는 비행. 커서로 방향을 튼다. */
const CONFIG = {
  areaPerStar: 1600,
  maxStars: 800,
  speed: 0.55, // z 감소 속도(초당)
  steer: 0.32, // 커서 스티어링 세기
} as const;

type Star = { x: number; y: number; z: number; pz: number };

function resetStar(s: Star, far: boolean) {
  s.x = Math.random() * 2 - 1;
  s.y = Math.random() * 2 - 1;
  s.z = far ? 1 : Math.random();
  s.pz = s.z;
}

export default function HyperspaceWarp() {
  const ref = useRef<HTMLCanvasElement>(null);

  useCanvasScene(ref, ({ ctx, pointer }) => {
    const accent = readAccent();
    let width = 0;
    let height = 0;
    let focal = 0;
    let stars: Star[] = [];
    let mx = 0; // 현재 스티어링 오프셋(스무딩)
    let my = 0;

    return {
      resize(w, h) {
        width = w;
        height = h;
        focal = Math.max(w, h) * 0.5;
        const n = Math.min(CONFIG.maxStars, Math.floor((w * h) / CONFIG.areaPerStar));
        stars = Array.from({ length: n }, () => {
          const s = { x: 0, y: 0, z: 0, pz: 0 };
          resetStar(s, false);
          return s;
        });
      },
      frame(dt) {
        const tx = pointer.inside ? (pointer.x - width / 2) * CONFIG.steer : 0;
        const ty = pointer.inside ? (pointer.y - height / 2) * CONFIG.steer : 0;
        const ease = Math.min(1, dt * 4);
        mx += (tx - mx) * ease;
        my += (ty - my) * ease;

        ctx.clearRect(0, 0, width, height);
        const cx = width / 2 + mx;
        const cy = height / 2 + my;
        ctx.globalCompositeOperation = "lighter";
        ctx.lineCap = "round";
        for (const s of stars) {
          s.pz = s.z;
          s.z -= CONFIG.speed * dt;
          if (s.z <= 0.02) resetStar(s, true);
          const k = focal / s.z;
          const sx = cx + s.x * k;
          const sy = cy + s.y * k;
          if (sx < -60 || sx > width + 60 || sy < -60 || sy > height + 60) continue;
          const t = 1 - s.z; // 0(멀다)~1(가깝다)
          const pk = focal / s.pz;
          ctx.globalAlpha = Math.min(1, 0.2 + t);
          ctx.strokeStyle = t > 0.85 ? accent : "#cfe6ff";
          ctx.lineWidth = Math.max(0.5, t * 2.4);
          ctx.beginPath();
          ctx.moveTo(cx + s.x * pk, cy + s.y * pk);
          ctx.lineTo(sx, sy);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      },
      drawStatic() {
        ctx.clearRect(0, 0, width, height);
        const cx = width / 2;
        const cy = height / 2;
        ctx.globalCompositeOperation = "lighter";
        for (const s of stars) {
          const k = focal / s.z;
          const sx = cx + s.x * k;
          const sy = cy + s.y * k;
          if (sx < 0 || sx > width || sy < 0 || sy > height) continue;
          const t = 1 - s.z;
          ctx.globalAlpha = Math.min(1, 0.2 + t);
          ctx.fillStyle = t > 0.85 ? accent : "#cfe6ff";
          ctx.beginPath();
          ctx.arc(sx, sy, Math.max(0.6, t * 2), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      },
    };
  });

  return <canvas ref={ref} aria-hidden className="absolute inset-0" />;
}
