"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

export function StaggerItem({
  children,
  className,
  style,
  index = 0,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  index?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className} style={style}>{children}</div>;
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, x: index % 2 === 0 ? -48 : 48 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
