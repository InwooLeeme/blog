import type { ReactNode } from "react";

export function SectionHeading({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <h2 className="mb-5 flex items-center gap-2 text-xl font-bold tracking-tight">
      <span className="text-accent-brand">{icon}</span>
      {children}
    </h2>
  );
}
