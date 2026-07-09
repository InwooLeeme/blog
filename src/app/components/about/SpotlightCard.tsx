"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type SpotlightCardProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

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
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {!reducedMotion ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), color-mix(in oklab, var(--proj-accent) 18%, transparent), transparent 65%)",
          }}
        />
      ) : null}
      {children}
    </motion.div>
  );
}
