import type { ReactNode } from "react";

export function SectionHeading({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <h2 className="mb-5 flex items-center gap-2 text-xl font-bold tracking-tight">
      <span className="text-accent-brand">{icon}</span>
      {children}
    </h2>
  );
}

export type TimelineItem = { date: string; title: string; detail?: string };

/** 세로 연결선 + 점이 있는 타임라인 (수상·대회·출제·자격증 공용) */
export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="relative ml-2 border-s border-border">
      {items.map((it, i) => (
        <li key={i} className="ms-6 pb-6 last:pb-0">
          {/* 선 위의 점 */}
          <span
            aria-hidden
            className="absolute -start-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-accent-brand ring-4 ring-background"
          />
          <p className="text-xs font-medium tabular-nums text-muted-foreground">
            {it.date}
          </p>
          <p className="mt-1 font-medium leading-snug">{it.title}</p>
          {it.detail ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{it.detail}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
