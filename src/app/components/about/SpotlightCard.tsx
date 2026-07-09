"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { tintColor } from "@/lib/tech";

type SpotlightCardProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

const GLOW_TINT = 18;

/** 카드 등장 트랜지션 — 액센트 밑줄 등 딸린 애니메이션의 딜레이는 이 값에서 파생시킨다 */
export const CARD_ENTER_TRANSITION = { duration: 0.5, ease: "easeOut" } as const;

export default function SpotlightCard({ children, className, style }: SpotlightCardProps) {
  const reducedMotion = useReducedMotion();

  const handlePointerMove = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    el.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }, []);

  return (
    <motion.div
      className={cn(
        "group relative transition duration-200 ease-out hover:-translate-y-[3px] motion-reduce:transition-none",
        className,
      )}
      style={style}
      onPointerMove={reducedMotion ? undefined : handlePointerMove}
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={CARD_ENTER_TRANSITION}
    >
      {!reducedMotion ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), ${tintColor("var(--proj-accent)", GLOW_TINT)}, transparent 65%)`,
          }}
        />
      ) : null}
      {children}
    </motion.div>
  );
}
