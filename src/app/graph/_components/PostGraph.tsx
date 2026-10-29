"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { frontmostHit, createHoverLatch } from "./graph-interaction";
import { createSphereClusters } from "./sphere-clusters";
import Link from "next/link";
import { createFrameLoop } from "./frame-loop";
import type { GraphData } from "@/lib/graph";
import { createKnowledgeMap, filterMapPosts, matchesMapQuery, type MapNode } from "./knowledge-map";

type Node = MapNode & { degree: number; x?: number; y?: number; depth?: number };
type Edge = { source: Node; target: Node; kind: "tag" | "series" };
type Controls = { zoom: (factor: number) => void; fit: () => void; focus: (id: string) => void };
const ALL_NODES = { tags: true, series: true, orphans: true };
const BG = "#1c1c1c";
const radius = (n: Node) => n.kind === "tag" ? 3.5 + Math.min(5, Math.sqrt(n.degree)) : 2.3 + Math.min(2.5, n.degree * .25);
const color = (n: MapNode) => n.kind === "post" ? "#b8b9b6" : n.tags[0]?.match(/알고리즘|PS|AtCoder|Jungol|BOJ|LeetCode|algorithm|백준/) ? "#d5dc76" : "#55ce83";

export default function PostGraph({ data, compact = false }: { data: GraphData; compact?: boolean }) {
  const searchId = useId();
  const map = useMemo(() => createKnowledgeMap(data), [data]);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const syncMotion = useRef<() => void>(() => {});
  const [query, setQuery] = useState("");
  const [clusterTag, setClusterTag] = useState<string | null>(null);
  const clusterPosts = useMemo(() => clusterTag === null ? [] : data.nodes.filter(n => clusterTag === "태그 없음" ? !n.tags.length : n.tags.includes(clusterTag)), [data, clusterTag]);
  const [selected, setSelected] = useState<MapNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controls = useRef<Controls | null>(null);
  const settings = useRef({ query, paused });
  const repaint = useRef<() => void>(() => {});
  useEffect(() => { settings.current = { query, paused }; repaint.current(); syncMotion.current(); }, [query, paused]);
  const matchingPosts = useMemo(() => filterMapPosts(map, ALL_NODES, query, clusterTag), [map, query, clusterTag]);

  useEffect(() => {
    const canvas = canvasRef.current, parent = canvas?.parentElement, ctx = canvas?.getContext("2d");
    if (!canvas || !parent || !ctx) return;
    const nodes: Node[] = map.nodes.map(n => ({ ...n, degree: 0 }));
    const byId = new Map(nodes.map(n => [n.id, n]));
    const edges: Edge[] = map.edges.filter(e => byId.has(e.source) && byId.has(e.target)).map(e => {
      const source = byId.get(e.source)!, target = byId.get(e.target)!;
      source.degree++; target.degree++;
      return { source, target, kind: e.kind };
    });
    const neighbors = new Map(nodes.map(n => [n.id, new Set<string>()]));
    edges.forEach(e => { neighbors.get(e.source.id)!.add(e.target.id); neighbors.get(e.target.id)!.add(e.source.id); });
    let width = 1, height = 1, hovered: Node | null = null, focused: Node | null = null;
    const spheres = createSphereClusters(nodes);
    let hoveredCluster: string | null = null, selectedCluster: string | null = null;
    const hoverLatch=createHoverLatch();
    let hoverTimer: ReturnType<typeof setTimeout> | undefined;
    const updatePositions = () => { for(const n of nodes) { const p=spheres.positions.get(n.id)!;n.x=p.x;n.y=p.y;n.depth=p.depth; } };
    let frame = 0, visible = false, disposed = false;
    const view = { x: 0, y: 0, scale: 1 };
    const pointers = new Map<number, { x: number; y: number }>();
    let gesture: { x: number; y: number; moved: boolean; node: Node | null; cluster: string | null } | null = null;
    const world = (x: number, y: number) => ({ x: (x-view.x)/view.scale, y: (y-view.y)/view.scale });
    let labelHits: {node: Node; x: number; y: number; w: number; h: number}[] = [];
    const draw = () => {
      frame = 0;
      if (disposed || !visible || document.hidden) return;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, width, height);
      ctx.save(); ctx.translate(view.x, view.y); ctx.scale(view.scale, view.scale);
      const focus = hovered ?? focused;
      const activeCluster=selectedCluster ?? hoveredCluster;
      const belongs=(n:Node)=>activeCluster !== null && (spheres.positions.get(n.id)!.cluster===activeCluster || n.tags.includes(activeCluster));
      const near = focus ? neighbors.get(focus.id) : null;
      const q = settings.current.query.trim().toLocaleLowerCase();
      const matches = (n: Node) => matchesMapQuery(n, q);
      for (const e of edges) {
        const active = activeCluster ? belongs(e.source) || belongs(e.target) : !!focus && (e.source === focus || e.target === focus);
        ctx.strokeStyle = active ? "#90b39c" : "#737773";
        ctx.globalAlpha = activeCluster || focus ? active ? .65 : .025 : q ? matches(e.source) || matches(e.target) ? .45 : .045 : spheres.positions.get(e.source.id)!.cluster === spheres.positions.get(e.target.id)!.cluster ? .28 : .035;
        ctx.lineWidth = (active ? 1.1 : .65) / Math.sqrt(view.scale);
        ctx.beginPath(); ctx.moveTo(e.source.x!, e.source.y!); ctx.lineTo(e.target.x!, e.target.y!); ctx.stroke();
      }
      for (const n of [...nodes].sort((a,b)=>(a.depth??0)-(b.depth??0))) {
        const active = activeCluster ? belongs(n) : n === focus || !!near?.has(n.id);
        ctx.globalAlpha = ((activeCluster || focus) && !active) || !matches(n) ? .14 : n.kind === "tag" ? 1 : .67 + (n.depth ?? 0)*.33;
        ctx.fillStyle = color(n);
        const r = Math.max(radius(n) * (1+(n.depth??0)*.35), (n.kind === "tag" ? 3 : 1.8) / view.scale);
        ctx.beginPath(); ctx.arc(n.x!, n.y!, r, 0, Math.PI * 2);
        if (n.kind === "tag") {
          ctx.fillStyle = BG; ctx.fill();
          ctx.strokeStyle = color(n); ctx.lineWidth = 1.6 / view.scale; ctx.stroke();
        } else { ctx.fill(); }

        if (n === focus || n === focused) {
          ctx.strokeStyle = "#e6eee8"; ctx.lineWidth = 1 / view.scale;
          ctx.beginPath(); ctx.arc(n.x!, n.y!, r + 4 / view.scale, 0, Math.PI*2); ctx.stroke();
        }
      }
      // Labels stay screen-sized; zoom reveals detail without covering the overview.
      labelHits = [];
      const labels = nodes.filter(n => n.kind === "tag" || n === focus || (q && matches(n)) || (!q && !focus && view.scale > 2));
      const boxes: { x: number; y: number; w: number; h: number }[] = [];
      for (const n of labels.sort((a,b) => Number(b === focus)-Number(a === focus) || b.degree-a.degree)) {
        const title = n.title.length > 34 ? `${n.title.slice(0,34)}…` : n.title;
        ctx.font = `${11 / view.scale}px system-ui, sans-serif`;
        const w = ctx.measureText(title).width + 8 / view.scale, h = 19 / view.scale;
        const idealX = n.x! + radius(n) + 6 / view.scale;
        const x = Math.min(idealX, (width-view.x-8)/view.scale-w), y = n.y!;
        if (boxes.some(b => x < b.x+b.w && x+w > b.x && y-h/2 < b.y+b.h && y+h/2 > b.y)) continue;
        boxes.push({ x, y: y-h/2, w, h });
        if(n.kind === "tag") labelHits.push({node:n,x,y:y-h/2,w,h});
        ctx.globalAlpha = activeCluster && !belongs(n) ? .25 : .92; ctx.fillStyle = BG; ctx.fillRect(x, y-h/2, w, h);
        ctx.fillStyle = n === focus ? "#fff" : "#b3bdb4"; ctx.textBaseline = "middle"; ctx.fillText(title, x+4/view.scale, y);
        if(n.kind === "tag") { ctx.strokeStyle=color(n);ctx.lineWidth=.7/view.scale;ctx.beginPath();ctx.moveTo(x+4/view.scale,y+7/view.scale);ctx.lineTo(x+w-4/view.scale,y+7/view.scale);ctx.stroke(); }
      }
      ctx.restore(); ctx.globalAlpha = 1;
    };
    const invalidate = () => { if (!frame && visible && !document.hidden && !disposed) frame = requestAnimationFrame(draw); };
    repaint.current = invalidate;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 767px)");
    let lastMotionTime: number | null = null;
    const motion = createFrameLoop({
      requestFrame: requestAnimationFrame, cancelFrame: cancelAnimationFrame,
      intervalMs: () => mobile.matches ? 1000/30 : 1000/60,
      onFrame: time => {
        const interval = mobile.matches ? 1000/30 : 1000/60;
        const dt = lastMotionTime === null ? interval : Math.min(50, time-lastMotionTime);
        lastMotionTime = time;
        hoveredCluster=hoverLatch.value(time);
        const stopped = new Set<string>();
        if(hoveredCluster) stopped.add(hoveredCluster);
        if(selectedCluster) stopped.add(selectedCluster);
        if(gesture?.cluster) stopped.add(gesture.cluster);
        const changed = spheres.advance(dt,stopped);
        if (!changed) return;
        updatePositions();
        invalidate();
      },
    });
    const sync = () => {
      if (visible && !document.hidden && !settings.current.paused && !settings.current.query.trim() && !reduced.matches) motion.start();
      else { motion.stop(); lastMotionTime=null; }
    };
    syncMotion.current=sync;
    const preferenceChanged = () => { setReducedMotion(reduced.matches); sync(); };
    preferenceChanged();
    reduced.addEventListener("change", preferenceChanged);
    const fit = () => {
      if (!nodes.length) { invalidate(); return; }
      const xs = spheres.clusters.flatMap(c=>[c.x-c.radius*1.2,c.x+c.radius*1.2]), ys = spheres.clusters.flatMap(c=>[c.y-c.radius*1.2,c.y+c.radius*1.2]);
      const minX = Math.min(...xs)-30, maxX = Math.max(...xs)+30, minY = Math.min(...ys)-30, maxY = Math.max(...ys)+30;
      view.scale = Math.min(2, (width-48)/(maxX-minX), (height-120)/(maxY-minY));
      view.x = width/2-(minX+maxX)/2*view.scale; view.y = height/2+10-(minY+maxY)/2*view.scale;
      invalidate();
    };
    const zoom = (factor: number, x = width/2, y = height/2) => {
      const before = world(x,y);
      view.scale = Math.min(5, Math.max(.15, view.scale*factor));
      view.x = x-before.x*view.scale; view.y = y-before.y*view.scale; invalidate();
    };
    controls.current = { fit, zoom, focus: id => {
      focused = byId.get(id) ?? null;
      setSelected(focused);
      selectedCluster=focused?(focused.kind === "tag" ? focused.title : spheres.positions.get(focused.id)!.cluster):null;
      setClusterTag(selectedCluster);
      if(!focused){setSelected(null);hoverLatch.clear();hoveredCluster=null;}
      if (focused) { view.x = width/2-focused.x!*view.scale; view.y = height/2-focused.y!*view.scale; }
      invalidate();
    } };
    const resize = () => {
      width = parent.clientWidth; height = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      spheres.layout(width/Math.max(200,height-120));updatePositions();fit();
    };
    const observer = new ResizeObserver(resize); observer.observe(parent); resize();
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); invalidate(); }); intersection.observe(canvas);
    const visibility = () => { sync(); if (document.hidden && frame) { cancelAnimationFrame(frame); frame=0; } else invalidate(); };
    document.addEventListener("visibilitychange", visibility);
    const pos = (e: {clientX:number;clientY:number}) => { const r = canvas.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top}; };
    const hit = (p: {x:number;y:number}, touch = false) => {
      const w = world(p.x,p.y);
      const label = labelHits.find(b=>w.x>=b.x && w.x<=b.x+b.w && w.y>=b.y && w.y<=b.y+b.h);
      if(label) return label.node;
      return frontmostHit(nodes,w.x,w.y,n=>Math.max(radius(n)*(1+(n.depth??0)*.35), (touch ? 18 : 8)/view.scale));
    };
    const setHover = (id: string | null) => {
      hoverLatch.enter(id,performance.now());hoveredCluster=hoverLatch.value(performance.now());
      clearTimeout(hoverTimer);
      if(!id) hoverTimer=setTimeout(()=>{hoveredCluster=hoverLatch.value(performance.now());invalidate();},230);
    };

    const down = (e: PointerEvent) => {
      const p = pos(e); pointers.set(e.pointerId,p); if(e.pointerType !== "touch") canvas.setPointerCapture(e.pointerId);
      if (pointers.size === 1) gesture = {...p,moved:false,node:hit(p,e.pointerType === "touch"),cluster:spheres.hit(world(p.x,p.y).x,world(p.x,p.y).y)};
      else if (gesture) gesture.moved = true;
    };
    const move = (e: PointerEvent) => {
      const p = pos(e), previous = pointers.get(e.pointerId);
      if (!previous) { hovered=hit(p); const w=world(p.x,p.y);if(e.pointerType !== "touch")setHover(hovered?.kind === "tag" ? hovered.title : spheres.hit(w.x,w.y,hoveredCluster,12/view.scale)); canvas.style.cursor=hoveredCluster?"pointer":"grab"; invalidate(); return; }
      if(e.pointerType === "touch") { if(gesture && Math.hypot(p.x-gesture.x,p.y-gesture.y)>4) gesture.moved=true; pointers.set(e.pointerId,p); return; }
      if (pointers.size === 2) {
        const other = [...pointers.entries()].find(([id])=>id!==e.pointerId)![1];
        const oldDistance = Math.hypot(previous.x-other.x,previous.y-other.y);
        const oldMid = {x:(previous.x+other.x)/2,y:(previous.y+other.y)/2};
        const mid = {x:(p.x+other.x)/2,y:(p.y+other.y)/2};
        if (oldDistance > 0) zoom(Math.hypot(p.x-other.x,p.y-other.y)/oldDistance,oldMid.x,oldMid.y);
        view.x += mid.x-oldMid.x; view.y += mid.y-oldMid.y;
      } else if (gesture) {
        if (Math.hypot(p.x-gesture.x,p.y-gesture.y)>4) gesture.moved=true;
        if (gesture.moved && gesture.cluster) { spheres.translate(gesture.cluster,(p.x-previous.x)/view.scale,(p.y-previous.y)/view.scale);updatePositions(); }
        else if (gesture.moved) { view.x+=p.x-previous.x;view.y+=p.y-previous.y; }
      }
      pointers.set(e.pointerId,p); invalidate();
    };
    const up = (e: PointerEvent) => {
      if (pointers.size===1 && gesture && !gesture.moved && e.type !== "pointercancel") {
        focused=hit(pos(e),e.pointerType === "touch"); setSelected(focused); hovered=null;
        const p=pos(e), w=world(p.x,p.y);
        selectedCluster=focused?(focused.kind === "tag" ? focused.title : spheres.positions.get(focused.id)!.cluster):spheres.hit(w.x,w.y);
        setClusterTag(selectedCluster);
        if(e.pointerType === "touch" || !selectedCluster){hoverLatch.clear();hoveredCluster=null;}
      }
      pointers.delete(e.pointerId); if (!pointers.size) gesture=null;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
      invalidate();
    };
    let touchPair: {x:number;y:number;distance:number} | null = null;
    const pair = (e: TouchEvent) => {
      const a=pos(e.touches[0]), b=pos(e.touches[1]);
      return {x:(a.x+b.x)/2,y:(a.y+b.y)/2,distance:Math.hypot(a.x-b.x,a.y-b.y)};
    };
    const touchStart = (e: TouchEvent) => {
      if(e.touches.length===2) { e.preventDefault();touchPair=pair(e);if(gesture)gesture.moved=true; }
    };
    const touchMove = (e: TouchEvent) => {
      if(e.touches.length!==2 || !touchPair) return;
      e.preventDefault();const next=pair(e);
      if(touchPair.distance>0) zoom(next.distance/touchPair.distance,touchPair.x,touchPair.y);
      view.x+=next.x-touchPair.x;view.y+=next.y-touchPair.y;touchPair=next;invalidate();
    };
    const touchEnd = () => { touchPair=null; };
    canvas.addEventListener("touchstart",touchStart,{passive:false});
    canvas.addEventListener("touchmove",touchMove,{passive:false});
    canvas.addEventListener("touchend",touchEnd);canvas.addEventListener("touchcancel",touchEnd);
    const leave = () => { hovered=null;setHover(null);invalidate(); };
    const wheel = (e: WheelEvent) => {e.preventDefault();const p=pos(e);zoom(Math.exp(-e.deltaY*.001),p.x,p.y);};
    const key = (e: KeyboardEvent) => {
      if (["+","=","-","0","ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)) e.preventDefault();
      if (e.key==="+" || e.key==="=") zoom(1.2); else if(e.key==="-") zoom(1/1.2); else if(e.key==="0") fit();
      else { if(e.key==="ArrowLeft")view.x+=30;if(e.key==="ArrowRight")view.x-=30;if(e.key==="ArrowUp")view.y+=30;if(e.key==="ArrowDown")view.y-=30;invalidate(); }
    };
    canvas.addEventListener("pointerdown",down);canvas.addEventListener("pointermove",move);canvas.addEventListener("pointerup",up);canvas.addEventListener("pointercancel",up);canvas.addEventListener("pointerleave",leave);canvas.addEventListener("wheel",wheel,{passive:false});canvas.addEventListener("keydown",key);
    return () => {
      canvas.removeEventListener("touchstart",touchStart);canvas.removeEventListener("touchmove",touchMove);canvas.removeEventListener("touchend",touchEnd);canvas.removeEventListener("touchcancel",touchEnd);
      disposed=true;clearTimeout(hoverTimer);motion.destroy();syncMotion.current=()=>{};reduced.removeEventListener("change",preferenceChanged);cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();controls.current=null;repaint.current=()=>{};
      document.removeEventListener("visibilitychange",visibility);
      canvas.removeEventListener("pointerdown",down);canvas.removeEventListener("pointermove",move);canvas.removeEventListener("pointerup",up);canvas.removeEventListener("pointercancel",up);canvas.removeEventListener("pointerleave",leave);canvas.removeEventListener("wheel",wheel);canvas.removeEventListener("keydown",key);
    };
  }, [map]);

  const button = "min-h-11 min-w-11 rounded-md border border-white/15 bg-[#262626] px-3 py-2 text-xs text-zinc-200 hover:bg-[#343434] focus-visible:outline-2 focus-visible:outline-green-400";
  return <section aria-label="지식 지도" className="relative overflow-hidden border border-white/10 bg-[#1c1c1c] text-zinc-200">
    {!compact && <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
      <p className="text-xs text-zinc-300">태그 이름을 눌러 연결된 글을 찾아보세요</p>
    </div>}
    <div className={`relative ${compact ? "h-[360px]" : "h-[55svh] min-h-[360px] md:h-[76vh] md:min-h-[480px]"}`}>
      <canvas ref={canvasRef} tabIndex={0} aria-label="글과 태그의 연결 지도. 방향키로 이동, 더하기와 빼기로 확대 및 축소, 0으로 전체 보기. 글 검색으로도 탐색할 수 있습니다." className="h-full w-full touch-pan-y outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-400" />
      <div className="pointer-events-none absolute left-5 top-5 text-xs"><p className="mt-2 text-zinc-400">{data.nodes.length}개의 글 · {map.nodes.length-data.nodes.length}개의 태그</p><p className="mt-2 text-[10px] text-zinc-500">한 손가락으로 스크롤 · 두 손가락으로 지도 이동</p></div>
      <div className="absolute bottom-4 right-4 flex gap-1"><button className={button} aria-label="애니메이션 일시정지" aria-pressed={paused} disabled={reducedMotion || !!query.trim()} title={query.trim() ? "검색 중에는 움직임이 자동으로 멈춥니다" : undefined} onClick={()=>setPaused(!paused)}>{reducedMotion ? "동작 줄이기 적용" : query.trim() ? "검색 중 정지" : paused ? "움직임 재생" : "일시정지"}</button><button className={button} aria-label="축소" onClick={()=>controls.current?.zoom(1/1.25)}>−</button><button className={button} aria-label="확대" onClick={()=>controls.current?.zoom(1.25)}>+</button><button className={button} onClick={()=>controls.current?.fit()}>전체 보기</button></div>
      <p className="pointer-events-none absolute bottom-5 left-5 hidden text-[11px] text-zinc-500 lg:block">군집 위에서 회전 정지 · 드래그하여 이동 · 빈 공간을 누르면 재개</p>
      {!data.nodes.length && <p className="absolute inset-0 grid place-items-center text-sm text-zinc-400">발행된 글이 아직 없습니다</p>}
    </div>
    {compact && clusterTag !== null && <section aria-label="선택한 군집의 글" className="border-t border-white/10 px-5 py-4">
      <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-medium text-green-300">{clusterTag} <span className="ml-2 text-xs text-zinc-400">{clusterPosts.length}개의 글</span></h3><button className={button} onClick={()=>controls.current?.focus("")}>선택 해제</button></div>
      <ul className="mt-3 grid max-h-52 gap-2 overflow-auto md:grid-cols-2">{clusterPosts.map(n=><li key={n.id}><Link href={`/blog/${n.id}`} className="block rounded-md px-2 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-green-400">{n.title}</Link></li>)}</ul>
      {!clusterPosts.length && <p className="mt-3 text-xs text-zinc-400">이 군집에 표시할 글이 없습니다.</p>}
    </section>}
    {compact && selected && <div aria-live="polite" className="flex items-center justify-between gap-4 border-t border-white/10 px-5 py-4"><div className="min-w-0"><p className="text-[10px] text-green-400">{selected.kind==='tag'?'TAG':'ARTICLE'}</p><p className="mt-1 truncate text-sm">{selected.title}</p></div>{selected.slug ? <Link className="shrink-0 text-xs text-green-300 hover:underline" href={`/blog/${selected.slug}`}>글 읽기 ↗</Link> : <Link className="shrink-0 text-xs text-green-300 hover:underline" href={`/blog/tags/${encodeURIComponent(selected.title)}`}>태그 글 보기 ↗</Link>}</div>}
    {!compact && <section aria-label="지도 탐색" className="border-t border-white/10 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {clusterTag && <button className={button} aria-label={`${clusterTag} 태그 선택 해제`} onClick={()=>controls.current?.focus("")}>{clusterTag} · 글 {clusterPosts.length}개 <span aria-hidden="true">×</span></button>}
      </div>
      <div aria-label="태그 선택" className="mt-3 flex flex-wrap gap-x-4 gap-y-1">{map.nodes.filter(n=>n.kind==="tag").map(n=><button key={n.id} aria-pressed={clusterTag===n.title} className="min-h-11 rounded text-xs text-zinc-300 underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-green-400" onClick={()=>controls.current?.focus(n.id)}>{n.title}</button>)}</div>
      <label className="mt-4 block text-sm" htmlFor={`${searchId}-search`}>제목 또는 태그 검색</label>
      <input id={`${searchId}-search`} value={query} onChange={e=>setQuery(e.target.value)} type="search" placeholder="예: 네트워크, CS" className="mt-2 min-h-11 w-full rounded-md border border-white/20 bg-white/5 px-3 text-sm focus-visible:outline-2 focus-visible:outline-green-400" />
      <p role="status" className="my-3 text-xs text-zinc-300">{matchingPosts.length}개의 글{query.trim() ? " · 검색 중에는 회전이 멈춥니다" : ""}</p>

    </section>}

  </section>;
}
