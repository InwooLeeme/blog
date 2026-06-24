"use client";

import { useRef } from "react";
import { rand, readAccent, useCanvasScene } from "./canvas";

/** 전기 아크 — 중점 변위로 만든 프랙탈 번개가 커서를 향해 내리치고, 가지를 친다. */
const CONFIG = {
  depth: 6, // 분할 깊이(점 개수 = 2^depth)
  displaceFrac: 0.5, // 초기 변위(화면 짧은 변 비율)
  branchChance: 0.12,
  branchLifeFrac: 0.45,
  boltLife: 0.16, // 메인 볼트 표시 시간(초)
  idleEvery: [0.5, 1.2] as const, // 대기 중 자동 발생 간격(초)
  activeEvery: [0.12, 0.3] as const, // 커서 안에 있을 때 간격
  moveSpawnDist: 26, // 이 거리 이상 움직이면 추가 발생
  flashDecay: 4.5,
} as const;

type Point = { x: number; y: number };
type Bolt = { pts: Point[]; life: number; maxLife: number; lw: number };

/** 중점 변위 알고리즘으로 (x1,y1)→(x2,y2) 사이를 들쭉날쭉한 경로로 분할 */
function fractalPath(x1: number, y1: number, x2: number, y2: number, displace: number, depth: number, out: Point[]) {
  if (depth <= 0) {
    out.push({ x: x2, y: y2 });
    return;
  }
  const mx = (x1 + x2) / 2 + rand(-displace, displace);
  const my = (y1 + y2) / 2 + rand(-displace, displace);
  fractalPath(x1, y1, mx, my, displace / 2, depth - 1, out);
  fractalPath(mx, my, x2, y2, displace / 2, depth - 1, out);
}

function randomEdgePoint(w: number, h: number): Point {
  const side = Math.floor(rand(0, 4));
  if (side === 0) return { x: rand(0, w), y: 0 };
  if (side === 1) return { x: w, y: rand(0, h) };
  if (side === 2) return { x: rand(0, w), y: h };
  return { x: 0, y: rand(0, h) };
}

export default function LightningArc() {
  const ref = useRef<HTMLCanvasElement>(null);

  useCanvasScene(ref, ({ ctx, pointer }) => {
    const accent = readAccent();
    let width = 0;
    let height = 0;
    let bolts: Bolt[] = [];
    let spawnTimer = 0;
    let flash = 0;
    let lastX = 0;
    let lastY = 0;

    const drawBolt = (b: Bolt, alpha: number) => {
      ctx.beginPath();
      ctx.moveTo(b.pts[0].x, b.pts[0].y);
      for (let i = 1; i < b.pts.length; i++) ctx.lineTo(b.pts[i].x, b.pts[i].y);
      ctx.strokeStyle = accent; // 바깥 글로우
      ctx.lineWidth = b.lw * 2.4;
      ctx.globalAlpha = alpha * 0.35;
      ctx.stroke();
      ctx.strokeStyle = "#ffffff"; // 안쪽 코어
      ctx.lineWidth = b.lw * 0.6;
      ctx.globalAlpha = alpha;
      ctx.stroke();
    };

    const spawnMain = (tx: number, ty: number) => {
      const from = randomEdgePoint(width, height);
      const pts: Point[] = [from];
      fractalPath(from.x, from.y, tx, ty, Math.min(width, height) * CONFIG.displaceFrac, CONFIG.depth, pts);
      bolts.push({ pts, life: CONFIG.boltLife, maxLife: CONFIG.boltLife, lw: 2.6 });

      for (let i = 1; i < pts.length - 1; i++) {
        if (Math.random() >= CONFIG.branchChance) continue;
        const p = pts[i];
        const bpts: Point[] = [p];
        fractalPath(p.x, p.y, p.x + rand(-90, 90), p.y + rand(-90, 90), 40, 3, bpts);
        const life = CONFIG.boltLife * CONFIG.branchLifeFrac;
        bolts.push({ pts: bpts, life, maxLife: life, lw: 1.2 });
      }
      flash = Math.min(1, flash + 0.5);
    };

    return {
      resize(w, h) {
        width = w;
        height = h;
        bolts = [];
        flash = 0;
        lastX = w / 2;
        lastY = h / 2;
        spawnTimer = rand(...CONFIG.idleEvery);
      },
      frame(dt) {
        if (pointer.inside && Math.hypot(pointer.x - lastX, pointer.y - lastY) >= CONFIG.moveSpawnDist) {
          lastX = pointer.x;
          lastY = pointer.y;
          spawnMain(pointer.x, pointer.y);
        }
        spawnTimer -= dt;
        if (spawnTimer <= 0) {
          spawnTimer = pointer.inside ? rand(...CONFIG.activeEvery) : rand(...CONFIG.idleEvery);
          spawnMain(
            pointer.inside ? pointer.x : rand(width * 0.3, width * 0.7),
            pointer.inside ? pointer.y : rand(height * 0.3, height * 0.7),
          );
        }

        ctx.clearRect(0, 0, width, height);
        if (flash > 0.001) {
          ctx.fillStyle = `rgba(180, 225, 255, ${flash * 0.18})`;
          ctx.fillRect(0, 0, width, height);
          flash *= Math.exp(-CONFIG.flashDecay * dt);
        }

        ctx.globalCompositeOperation = "lighter";
        bolts = bolts.filter((b) => (b.life -= dt) > 0);
        for (const b of bolts) drawBolt(b, b.life / b.maxLife);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      },
      drawStatic() {
        ctx.clearRect(0, 0, width, height);
        spawnMain(width / 2, height / 2);
        ctx.globalCompositeOperation = "lighter";
        for (const b of bolts) drawBolt(b, 1);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      },
    };
  });

  return <canvas ref={ref} aria-hidden className="absolute inset-0" />;
}
