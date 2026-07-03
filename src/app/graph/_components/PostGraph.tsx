"use client";

import { useEffect, useRef, useState } from "react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type SimulationNodeDatum,
} from "d3-force";
import { useTransitionRouter } from "next-view-transitions";
import type { GraphData, GraphNode, GraphEdge } from "@/lib/graph";

type SimNode = GraphNode & SimulationNodeDatum & { degree: number; phase: number };
type SimLink = { source: SimNode; target: SimNode; kind: GraphEdge["kind"]; weight: number };

const BASE_RADIUS = 5;
const HIT_PADDING = 4;
const CLICK_MOVE_THRESHOLD = 4;
const MIN_SCALE = 0.3;
const MAX_SCALE = 3;

// Obsidian식 항상-다크 패널 — 사이트 라이트/다크 테마와 무관 (playground 이펙트들과 동일한 관례)
const COLORS = {
  bg: "#05060a",
  nodeSeries: "#31CED2",
  nodeDefault: "#7b8196",
  edgeSeries: "#31CED2",
  edgeTag: "#aab2d5",
  text: "#e6e8ef",
};

// 태그 해시 → 색상 — 시리즈에 속하지 않은 노드를 대표 태그별로 구분
const TAG_PALETTE = ["#a78bfa", "#f472b6", "#fb923c", "#facc15", "#4ade80", "#60a5fa", "#f87171", "#2dd4bf"];

function nodeRadius(n: SimNode) {
  return BASE_RADIUS + Math.min(n.degree, 8) * 1.4;
}

function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function colorForNode(n: SimNode): string {
  if (n.series) return COLORS.nodeSeries;
  const tag = n.tags[0];
  return tag ? TAG_PALETTE[hashStr(tag) % TAG_PALETTE.length] : COLORS.nodeDefault;
}

function hexToRgb(hex: string) {
  const num = parseInt(hex.replace("#", ""), 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function PostGraph({ data }: { data: GraphData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useTransitionRouter();
  const [hoveredTitle, setHoveredTitle] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const parent = canvas?.parentElement;
    if (!canvas || !ctx || !parent) return;

    const degree = new Map<string, number>();
    for (const e of data.edges) {
      degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
      degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
    }

    const nodes: SimNode[] = data.nodes.map((n) => ({
      ...n,
      degree: degree.get(n.id) ?? 0,
      phase: (hashStr(n.id) % 1000) / 1000 * Math.PI * 2,
    }));
    const nodeById = new Map(nodes.map((n) => [n.id, n]));
    const links: SimLink[] = data.edges
      .map((e) => ({
        source: nodeById.get(e.source),
        target: nodeById.get(e.target),
        kind: e.kind,
        weight: e.weight,
      }))
      .filter((l): l is SimLink => !!l.source && !!l.target);

    const glow = new Map<string, number>(nodes.map((n) => [n.id, 0.45]));

    let width = 0;
    let height = 0;
    let hovered: SimNode | null = null;
    let dragging: SimNode | null = null;
    let panStart: { x: number; y: number } | null = null;
    let downPos: { x: number; y: number } | null = null;
    let moved = false;
    const view = { x: 0, y: 0, scale: 1 };
    let stars: { x: number; y: number; r: number; a: number }[] = [];

    const toWorld = (screenX: number, screenY: number) => ({
      x: (screenX - view.x) / view.scale,
      y: (screenY - view.y) / view.scale,
    });

    const updateGlow = (dt: number) => {
      const ease = Math.min(1, dt * 6);
      for (const n of nodes) {
        const isHovered = hovered?.id === n.id;
        const isNeighbor = !isHovered && hovered && links.some(
          (l) =>
            (l.source.id === hovered!.id && l.target.id === n.id) ||
            (l.target.id === hovered!.id && l.source.id === n.id),
        );
        const target = isHovered ? 1 : hovered ? (isNeighbor ? 0.7 : 0.12) : 0.45;
        glow.set(n.id, lerp(glow.get(n.id) ?? target, target, ease));
      }
    };

    const draw = (time = 0) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#ffffff";
      for (const s of stars) {
        ctx.globalAlpha = s.a;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      ctx.save();
      ctx.translate(view.x, view.y);
      ctx.scale(view.scale, view.scale);

      const neighbors = new Set<string>();
      if (hovered) {
        for (const l of links) {
          if (l.source.id === hovered.id) neighbors.add(l.target.id);
          if (l.target.id === hovered.id) neighbors.add(l.source.id);
        }
      }

      for (const l of links) {
        const dim = hovered && hovered.id !== l.source.id && hovered.id !== l.target.id;
        const color = l.kind === "series" ? COLORS.edgeSeries : COLORS.edgeTag;
        ctx.strokeStyle = color;
        ctx.globalAlpha = dim ? 0.05 : l.kind === "series" ? 0.85 : 0.6;
        ctx.lineWidth = l.kind === "series" ? 1.8 : 1.2;
        ctx.shadowColor = color;
        ctx.shadowBlur = dim ? 0 : l.kind === "series" ? 6 : 3;
        ctx.beginPath();
        ctx.moveTo(l.source.x ?? 0, l.source.y ?? 0);
        ctx.lineTo(l.target.x ?? 0, l.target.y ?? 0);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      for (const n of nodes) {
        const isHovered = hovered?.id === n.id;
        const isNeighbor = neighbors.has(n.id);
        const g = glow.get(n.id) ?? 0.45;
        const pulse = 1 + Math.sin(time * 0.0018 + n.phase) * 0.06;
        const r = nodeRadius(n) * pulse;
        const x = n.x ?? 0;
        const y = n.y ?? 0;
        const color = colorForNode(n);
        const { r: cr, g: cg, b: cb } = hexToRgb(color);

        ctx.globalAlpha = 1;
        ctx.shadowColor = color;
        ctx.shadowBlur = 4 + g * 20;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 1.9);
        grad.addColorStop(0, `rgba(${cr},${cg},${cb},${0.35 + g * 0.65})`);
        grad.addColorStop(0.55, `rgba(${cr},${cg},${cb},${(0.2 + g * 0.4) * 0.6})`);
        grad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r * 1.9, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${0.5 + g * 0.5})`;
        ctx.beginPath();
        ctx.arc(x, y, r * 0.55, 0, Math.PI * 2);
        ctx.fill();

        if (isHovered) {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.5 / view.scale;
          ctx.beginPath();
          ctx.arc(x, y, r + 3, 0, Math.PI * 2);
          ctx.stroke();
        }

        if (isHovered || isNeighbor) {
          const label = n.title;
          ctx.font = `${12 / view.scale}px sans-serif`;
          const padX = 6 / view.scale;
          const boxH = 20 / view.scale;
          const boxW = ctx.measureText(label).width + padX * 2;
          const boxX = x + r * 1.9 + 6 / view.scale;
          const boxY = y - boxH / 2;

          ctx.fillStyle = "rgba(5,6,10,0.78)";
          ctx.beginPath();
          ctx.roundRect(boxX, boxY, boxW, boxH, 6 / view.scale);
          ctx.fill();

          ctx.fillStyle = COLORS.text;
          ctx.textBaseline = "middle";
          ctx.fillText(label, boxX + padX, y);
        }
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    };

    const simulation = forceSimulation(nodes)
      .force(
        "link",
        forceLink<SimNode, SimLink>(links)
          .id((d) => d.id)
          .distance((l) => (l.kind === "series" ? 55 : 110))
          .strength((l) => (l.kind === "series" ? 0.8 : 0.12)),
      )
      .force("charge", forceManyBody().strength(-180))
      .force("collide", forceCollide<SimNode>().radius((d) => nodeRadius(d) + 8));

    const genStars = () => {
      const count = Math.min(140, Math.round((width * height) / 9000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.1 + 0.3,
        a: Math.random() * 0.5 + 0.15,
      }));
    };

    const resize = () => {
      width = parent.clientWidth;
      height = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      simulation.force("center", forceCenter(width / 2, height / 2));
      simulation.alpha(0.3).restart();
      genStars();
      draw();
    };
    resize();
    window.addEventListener("resize", resize);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let rafId = 0;
    let lastTime = 0;
    const loop = (time: number) => {
      const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
      lastTime = time;
      updateGlow(dt);
      draw(time);
      rafId = requestAnimationFrame(loop);
    };
    if (reduced) draw();
    else rafId = requestAnimationFrame(loop);

    const nodeAt = (x: number, y: number) =>
      nodes.find((n) => Math.hypot((n.x ?? 0) - x, (n.y ?? 0) - y) <= nodeRadius(n) + HIT_PADDING) ?? null;

    const pointerPos = (e: { clientX: number; clientY: number }) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { x: sx, y: sy } = pointerPos(e);
      const before = toWorld(sx, sy);
      const factor = Math.exp(-e.deltaY * 0.001);
      view.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, view.scale * factor));
      view.x = sx - before.x * view.scale;
      view.y = sy - before.y * view.scale;
    };

    const onPointerMove = (e: PointerEvent) => {
      const { x: sx, y: sy } = pointerPos(e);

      if (downPos && Math.hypot(sx - downPos.x, sy - downPos.y) > CLICK_MOVE_THRESHOLD) {
        moved = true;
      }

      if (dragging) {
        const { x, y } = toWorld(sx, sy);
        dragging.fx = x;
        dragging.fy = y;
        simulation.alpha(0.3).restart();
        return;
      }
      if (panStart) {
        view.x = sx - panStart.x;
        view.y = sy - panStart.y;
        return;
      }

      const { x, y } = toWorld(sx, sy);
      const next = nodeAt(x, y);
      if (next?.id !== hovered?.id) {
        hovered = next;
        setHoveredTitle(next?.title ?? null);
        canvas.style.cursor = next ? "pointer" : "grab";
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      const { x: sx, y: sy } = pointerPos(e);
      downPos = { x: sx, y: sy };
      moved = false;
      const { x, y } = toWorld(sx, sy);
      const target = nodeAt(x, y);
      if (target) {
        dragging = target;
        target.fx = target.x;
        target.fy = target.y;
      } else {
        panStart = { x: sx - view.x, y: sy - view.y };
        canvas.style.cursor = "grabbing";
      }
    };

    const onPointerUp = () => {
      if (dragging) {
        dragging.fx = null;
        dragging.fy = null;
        dragging = null;
      }
      panStart = null;
      downPos = null;
      canvas.style.cursor = hovered ? "pointer" : "grab";
    };

    const onClick = (e: PointerEvent) => {
      if (moved) return;
      const { x: sx, y: sy } = pointerPos(e);
      const { x, y } = toWorld(sx, sy);
      const target = nodeAt(x, y);
      if (target) router.push(`/blog/${target.id}`);
    };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.style.cursor = "grab";

    return () => {
      simulation.stop();
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [data, router]);

  return (
    <div className="relative h-[70vh] w-full overflow-hidden rounded-lg border">
      <canvas ref={canvasRef} role="img" aria-label="블로그 글 관계 그래프" />
      <div className="pointer-events-none absolute bottom-3 left-3 text-xs text-zinc-400">
        {hoveredTitle ?? "휠로 확대/축소 · 드래그로 이동 · 노드를 클릭해 글로 이동"}
      </div>
    </div>
  );
}
