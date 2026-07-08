"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type TiltCardProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

const MAX_ROTATION = 7;

export default function TiltCard({ children, className, style }: TiltCardProps) {
  const reducedMotion = useReducedMotion();

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (reducedMotion) return;

      const el = event.currentTarget;
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const rotateX = y * -MAX_ROTATION;
      const rotateY = x * MAX_ROTATION;

      el.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
    },
    [reducedMotion],
  );

  const resetTilt = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.transform =
      "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)";
  }, []);

  return (
    <div
      className={cn(
        "will-change-transform transition-transform duration-200 ease-out motion-reduce:transition-none",
        className,
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      style={{
        transform: "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)",
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
