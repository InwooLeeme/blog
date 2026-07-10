"use client";

import { useRef, type MouseEvent } from "react";
import { useCanvasScene, rand } from "./canvas";

const MAX_D_MIN = 10;
const MAX_D_MAX = 12;
const SPLIT = 0.40;
const L_RATIO = 0.75;
const GROW_S = 4.5;
const GROUND = 1;
const CAP = 12;
const BASE_W = 20;
const TAPER = 0.72;
const TAPER_POW = Array.from({ length: MAX_D_MAX + 2 }, (_, d) => BASE_W * Math.pow(TAPER, d));
const STEP_COMPRESS = 0.98;
const F1_BASE = 0.95;
const F1_VAR = 0.05;
const F1_MAX = 0.98;
const F2_BASE = 0.6;
const F2_VAR = 0.18;

type Tree = {
  x: number;
  groundY: number;
  trunk: number;
  lean: number;
  maxD: number;
  hue: number;
  vars: number[];
  growth: number;
  cachedSegments?: number[][];
  growingSegs?: number[][];
};

type Blade = { x: number; h: number; tilt: number };

function makeTree(x: number, height: number): Tree {
  return {
    x,
    groundY: height * GROUND + rand(-4, 4),
    trunk: rand(0.1, 0.32) * height,
    lean: rand(-0.07, 0.07),
    maxD: Math.floor(rand(MAX_D_MIN, MAX_D_MAX + 1)),
    hue: Math.random() * 360,
    vars: Array.from({ length: 2048 }, () => (Math.random() - 0.5) * 1.1),
    growth: 0,
  };
}

function paintTree(ctx: CanvasRenderingContext2D, tree: Tree, night: boolean) {
  let depthSegments: number[][];

  if (tree.growth >= 1 && tree.cachedSegments) {
    depthSegments = tree.cachedSegments;
  } else {
    if (!tree.growingSegs) {
      tree.growingSegs = Array.from({ length: tree.maxD + 1 }, () => []);
    }
    for (const seg of tree.growingSegs) seg.length = 0;
    depthSegments = tree.growingSegs;

    const STEP = 1 / (tree.maxD * STEP_COMPRESS + 1);

    function collect(x: number, y: number, ang: number, len: number, d: number, path: number, start: number) {
      const lp = Math.min(1, Math.max(0, (tree.growth - start) / STEP));
      if (lp <= 0) return;

      const L = tree.vars.length;
      const base = (d * 131 + path * 71) % L;
      const a1 = tree.vars[base];
      const a2 = tree.vars[(base + 1) % L];

      const cos = Math.cos(ang), sin = Math.sin(ang);
      const ex = x + cos * len * lp;
      const ey = y - sin * len * lp;

      const wBase = TAPER_POW[d];
      const wEnd = d >= tree.maxD ? 0 : wBase * TAPER;
      const wTip = wBase + (wEnd - wBase) * lp;
      depthSegments[d].push(x, y, ex, ey, wBase, wTip);  // stride 6

      if (d >= tree.maxD) return;

      const ang1 = Math.max(0.05, Math.min(Math.PI - 0.05, ang + SPLIT + a1 * 0.5));
      const ang2 = Math.max(0.05, Math.min(Math.PI - 0.05, ang - SPLIT + a2 * 0.5));
      const len1 = len * (L_RATIO + a2 * 0.18);
      const len2 = len * (L_RATIO + a1 * 0.18);

      // 자식은 부모 가지의 서로 다른 높이(f)에서 갈라져 나오고,
      // 부모가 그 지점까지 자란 뒤(start + STEP*f)에 비로소 솟는다
      const j1 = tree.vars[(base + 2) % L];
      const j2 = tree.vars[(base + 3) % L];
      const f1 = Math.min(F1_MAX, F1_BASE + j1 * F1_VAR);
      const f2 = F2_BASE + j2 * F2_VAR;

      const bx1 = x + cos * len * f1;
      const by1 = y - sin * len * f1;
      const bx2 = x + cos * len * f2;
      const by2 = y - sin * len * f2;

      collect(bx1, by1, ang1, len1, d + 1, path * 2, start + STEP * f1);
      collect(bx2, by2, ang2, len2, d + 1, path * 2 + 1, start + STEP * f2);
    }

    collect(tree.x, tree.groundY, Math.PI / 2 + tree.lean, tree.trunk, 0, 1, 0);

    if (tree.growth >= 1) {
      tree.cachedSegments = depthSegments;
      tree.growingSegs = undefined;
    }
  }

  ctx.globalCompositeOperation = night ? "lighter" : "source-over";

  for (let d = 0; d <= tree.maxD; d++) {
    const segments = depthSegments[d];
    if (segments.length === 0) continue;

    if (night) {
      const t = d / tree.maxD;
      const s = Math.round(t * 95);
      const l = Math.round(95 - t * 35);
      ctx.fillStyle = `hsl(${tree.hue}, ${s}%, ${l}%)`;
    } else {
      const shade = Math.round(6 + (d / tree.maxD) * 22);
      ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
    }

    ctx.beginPath();
    for (let i = 0; i < segments.length; i += 6) {
      const x0 = segments[i], y0 = segments[i + 1];
      const x1 = segments[i + 2], y1 = segments[i + 3];
      const w0 = segments[i + 4], w1 = segments[i + 5];
      const dx = x1 - x0, dy = y1 - y0;
      const Llen = Math.hypot(dx, dy);
      if (Llen < 1e-3) continue;
      const px = -dy / Llen, py = dx / Llen;
      const h0 = w0 / 2, h1 = w1 / 2;
      ctx.moveTo(x0 + px * h0, y0 + py * h0);
      ctx.lineTo(x1 + px * h1, y1 + py * h1);
      ctx.lineTo(x1 - px * h1, y1 - py * h1);
      ctx.lineTo(x0 - px * h0, y0 - py * h0);
      ctx.closePath();
    }
    ctx.fill();
  }

  ctx.globalCompositeOperation = "source-over";
}

function drawBg(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  night: boolean,
  sx: number, sy: number, sr: number,
) {
  if (night) {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#02060a");
    sky.addColorStop(1, "#07110a");
    ctx.fillStyle = sky;
  } else {
    ctx.fillStyle = "#e4e4e4";
  }
  ctx.fillRect(0, 0, w, h);

  if (night) {
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = "#fdf5c0";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(sx - sr * 0.40, sy - sr * 0.05, sr * 0.88, 0, Math.PI * 2);
    ctx.fillStyle = "#02060a";
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = "#f5c518";
    ctx.fill();
  }
}

function drawGrass(
  ctx: CanvasRenderingContext2D,
  blades: Blade[],
  groundY: number,
  night: boolean,
) {
  ctx.lineWidth = 1;
  ctx.lineCap = "round";
  ctx.strokeStyle = night ? "#ffffff" : "#1a1a1a";

  ctx.beginPath();
  for (const b of blades) {
    ctx.moveTo(b.x, groundY);
    ctx.quadraticCurveTo(
      b.x + b.tilt * 0.5,
      groundY - b.h * 0.55,
      b.x + b.tilt,
      groundY - b.h,
    );
  }
  ctx.stroke();
}

export default function GrowingForest() {
  const ref = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef({ night: false });
  const spawnQueue = useRef<number[]>([]);
  const symbolRef = useRef({ x: 0, y: 0, r: 0 });
  const dirtyRef = useRef(true);

  useCanvasScene(ref, ({ ctx }) => {
    let width = 0, height = 0;
    const trees: Tree[] = [];
    let blades: Blade[] = [];
    let sx = 0, sy = 0, sr = 0;

    function initScene(w: number, h: number) {
      sx = w * 0.92;
      sy = h * 0.09;
      sr = Math.min(w, h) * 0.045;
      symbolRef.current = { x: sx, y: sy, r: sr };
      blades = Array.from({ length: Math.floor(w / 3) }, () => ({
        x: Math.random() * w,
        h: 7 + Math.random() * 14,
        tilt: (Math.random() - 0.5) * 10,
      }));
    }

    return {
      resize(w: number, h: number) {
        width = w;
        height = h;
        ctx.clearRect(0, 0, w, h);
        initScene(w, h);
        dirtyRef.current = true;
      },

      frame(dt: number) {
        const anyGrowing = trees.some(t => t.growth < 1) || spawnQueue.current.length > 0;
        if (!dirtyRef.current && !anyGrowing) return;

        const night = modeRef.current.night;
        drawBg(ctx, width, height, night, sx, sy, sr);

        while (spawnQueue.current.length > 0) {
          const x = spawnQueue.current.shift()!;
          if (trees.length >= CAP) trees.shift();
          trees.push(makeTree(x, height));
        }

        let stillGrowing = false;
        for (const tree of trees) {
          if (tree.growth < 1) {
            tree.growth = Math.min(1, tree.growth + dt / GROW_S);
          }
          if (tree.growth < 1) stillGrowing = true;
          paintTree(ctx, tree, night);
        }

        drawGrass(ctx, blades, height * GROUND, night);
        if (!stillGrowing) dirtyRef.current = false;
      },

      drawStatic() {
        drawBg(ctx, width, height, modeRef.current.night, sx, sy, sr);
        drawGrass(ctx, blades, height * GROUND, modeRef.current.night);
      },
    };
  });

  const handleClick = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = ref.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const { x, y, r } = symbolRef.current;
    if (Math.hypot(cx - x, cy - y) <= r * 1.8) {
      modeRef.current.night = !modeRef.current.night;
      dirtyRef.current = true;
    } else {
      spawnQueue.current.push(cx);
      dirtyRef.current = true;
    }
  };

  return (
    <canvas
      ref={ref}
      aria-hidden
      onClick={handleClick}
      className="absolute inset-0 cursor-crosshair"
    />
  );
}