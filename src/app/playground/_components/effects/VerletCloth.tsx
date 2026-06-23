"use client";

import { useRef } from "react";
import { readAccent, useCanvasScene } from "./canvas";

/** 버를레 천 — 점·제약 그물을 윗줄 고정 + 중력으로 늘어뜨리고, 커서가 가까운 점을 밀어낸다. */
const SPACING = 30; // 점 간격(px)
const GRAVITY = 0.45;
const FRICTION = 0.99;
const ITER = 3; // 제약 반복(클수록 뻣뻣)
const REPEL_R = 90; // 커서 반발 반경(px)
const REPEL = 16; // 커서 반발 세기
const MAX_POINTS = 700;

type Pt = { x: number; y: number; ox: number; oy: number; pinned: boolean };

export default function VerletCloth() {
  const ref = useRef<HTMLCanvasElement>(null);

  useCanvasScene(ref, ({ ctx, pointer }) => {
    const accent = readAccent();
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let restX = SPACING;
    let restY = SPACING;
    let pts: Pt[] = [];

    const at = (c: number, r: number) => pts[r * cols + c];

    const satisfy = (a: Pt, b: Pt, rest: number) => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 1;
      const diff = ((d - rest) / d) * 0.5;
      const ox = dx * diff;
      const oy = dy * diff;
      if (!a.pinned) {
        a.x += ox;
        a.y += oy;
      }
      if (!b.pinned) {
        b.x -= ox;
        b.y -= oy;
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const p = at(c, r);
          if (c + 1 < cols) {
            const q = at(c + 1, r);
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
          }
          if (r + 1 < rows) {
            const q = at(c, r + 1);
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
          }
        }
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    return {
      resize(w, h) {
        width = w;
        height = h;
        let spacing = SPACING;
        cols = Math.floor(w / spacing) + 1;
        rows = Math.floor(h / spacing) + 1;
        while (cols * rows > MAX_POINTS) {
          spacing *= 1.2;
          cols = Math.floor(w / spacing) + 1;
          rows = Math.floor(h / spacing) + 1;
        }
        cols = Math.max(2, cols);
        rows = Math.max(2, rows);
        restX = w / (cols - 1);
        restY = h / (rows - 1);
        pts = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = c * restX;
            const y = r * restY;
            pts.push({ x, y, ox: x, oy: y, pinned: r === 0 }); // 윗줄 고정
          }
        }
      },
      frame() {
        for (const p of pts) {
          if (p.pinned) continue;
          const vx = (p.x - p.ox) * FRICTION;
          const vy = (p.y - p.oy) * FRICTION;
          p.ox = p.x;
          p.oy = p.y;
          p.x += vx;
          p.y += vy + GRAVITY;
          if (pointer.inside) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const d = Math.hypot(dx, dy);
            if (d < REPEL_R && d > 0.01) {
              const push = ((REPEL_R - d) / REPEL_R) * REPEL;
              p.x += (dx / d) * push;
              p.y += (dy / d) * push;
            }
          }
        }
        for (let k = 0; k < ITER; k++) {
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              if (c + 1 < cols) satisfy(at(c, r), at(c + 1, r), restX);
              if (r + 1 < rows) satisfy(at(c, r), at(c, r + 1), restY);
            }
          }
        }
        draw();
      },
      drawStatic: draw,
    };
  });

  return <canvas ref={ref} aria-hidden className="absolute inset-0" />;
}
