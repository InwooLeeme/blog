"use client";

import { useEffect, useRef, type RefObject } from "react";
import { createCanvasAnimationController } from "./canvas-animation-controller";

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
  maxDpr = 1.5,
) {
  const createRef = useRef(create);
  useEffect(() => {
    createRef.current = create;
  });

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    const parent = canvas?.parentElement;
    if (!canvas || !ctx || !parent) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = motionQuery.matches;
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

    const animation = createCanvasAnimationController({
      getVisibilityState: () => document.visibilityState,
      reducedMotion: reduced,
      onFrame: scene.frame,
      requestFrame: requestAnimationFrame,
      cancelFrame: cancelAnimationFrame,
    });

    resize();

    const updatePointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onPointerMove = (e: PointerEvent) => {
      updatePointer(e);
      pointer.inside = true;
    };
    const onPointerEnter = (e: PointerEvent) => {
      updatePointer(e);
      pointer.inside = true;
    };
    const onPointerLeave = () => {
      pointer.inside = false;
    };
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerenter", onPointerEnter);
    canvas.addEventListener("pointerleave", onPointerLeave);

    const io = new IntersectionObserver(
      ([entry]) => {
        animation.setIntersecting(entry.isIntersecting);
      },
      { threshold: 0 },
    );
    io.observe(canvas);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(parent);
    const onVisibilityChange = () => animation.sync();
    const onMotionChange = (event: MediaQueryListEvent) => {
      reduced = event.matches;
      if (reduced) scene.drawStatic?.();
      animation.setReducedMotion(reduced);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    motionQuery.addEventListener("change", onMotionChange);

    return () => {
      animation.dispose();
      io.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motionQuery.removeEventListener("change", onMotionChange);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerenter", onPointerEnter);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [ref, maxDpr]);
}
