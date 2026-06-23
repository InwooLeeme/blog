"use client";

import { useEffect, useRef, type RefObject } from "react";

/** 캔버스 기준 커서 위치(없으면 inside=false) */
export type Pointer = { x: number; y: number; inside: boolean };

export type Scene = {
  /** 초기 + 리사이즈마다 호출(CSS px) — 크기 의존 상태를 여기서 구성 */
  resize: (width: number, height: number) => void;
  /** 매 프레임(reduced-motion이면 호출 안 함). dt는 초, time은 raf 타임스탬프(ms) */
  frame: (dt: number, time: number) => void;
  /** reduced-motion / 리사이즈 시 정적 한 장 */
  drawStatic?: () => void;
};

export type SceneApi = { ctx: CanvasRenderingContext2D; reduced: boolean; pointer: Pointer };

export const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** CSS 변수 --accent-brand 값(없으면 fallback) */
export const readAccent = (fallback = "#31CED2") =>
  getComputedStyle(document.documentElement).getPropertyValue("--accent-brand").trim() || fallback;

/**
 * 캔버스 이펙트 공통 수명주기 — DPR 리사이즈, rAF 루프(dt), 화면 밖 정지(IO),
 * reduced-motion 정적, 커서 추적, 정리까지 담당. 각 이펙트는 Scene만 제공한다.
 */
export function useCanvasScene(
  ref: RefObject<HTMLCanvasElement | null>,
  create: (api: SceneApi) => Scene,
  maxDpr = 2,
) {
  const createRef = useRef(create);
  createRef.current = create;

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    const parent = canvas?.parentElement;
    if (!canvas || !ctx || !parent) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer: Pointer = { x: 0, y: 0, inside: false };
    const scene = createRef.current({ ctx, reduced, pointer });

    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scene.resize(width, height);
      if (reduced) scene.drawStatic?.();
    };

    let rafId = 0;
    let lastTime = 0;
    let running = false;
    const tick = (time: number) => {
      const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
      lastTime = time;
      scene.frame(dt, time);
      rafId = requestAnimationFrame(tick);
    };
    const start = () => {
      if (running || reduced) return;
      running = true;
      lastTime = 0;
      rafId = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(rafId);
    };

    resize();
    if (reduced) scene.drawStatic?.();
    else start();

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.inside = pointer.x >= 0 && pointer.x <= width && pointer.y >= 0 && pointer.y <= height;
    };
    if (!reduced) window.addEventListener("mousemove", onMove);

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 },
    );
    io.observe(canvas);
    window.addEventListener("resize", resize);

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, [ref, maxDpr]);
}
