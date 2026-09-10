"use client";

import { useEffect, useRef } from "react";

export default function ParticleVortex() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    let disposed = false;
    let unmountRenderer: (() => void) | undefined;

    void import("./three-vortex-renderer")
      .then(({ mountThreeVortex }) => {
        if (disposed) return;
        unmountRenderer = mountThreeVortex(wrapper, canvas);
      })
      .catch(() => {
        if (!disposed) wrapper.dataset.canvasReady = "false";
      });

    return () => {
      disposed = true;
      unmountRenderer?.();
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      data-canvas-ready="pending"
      className="particle-vortex relative h-full w-full"
      aria-hidden="true"
    >
      <span className="particle-vortex-fallback absolute inset-0" />
      <canvas
        ref={canvasRef}
        className="particle-vortex-canvas absolute inset-0 h-full w-full"
      />
    </div>
  );
}
