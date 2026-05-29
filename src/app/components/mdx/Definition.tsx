import React from "react";

type DefinitionType = "definition" | "theorem" | "lemma" | "corollary";

const LABELS: Record<DefinitionType, string> = {
  definition: "정의",
  theorem: "정리",
  lemma: "보조정리",
  corollary: "따름정리",
};

interface DefinitionProps {
  term: string;
  type?: DefinitionType;
  children?: React.ReactNode;
}

export function Definition({ term, type = "definition", children }: DefinitionProps) {
  const label = LABELS[type];
  return (
    <div className="not-prose my-6 rounded-lg border border-l-4 border-l-accent-brand bg-muted/30 p-4">
      <div className="mb-2 flex flex-wrap items-baseline gap-2">
        <span className="rounded bg-accent-brand/15 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-accent-brand">
          {label}
        </span>
        <span className="text-base font-semibold tracking-tight">{term}</span>
      </div>
      <div className="text-sm leading-relaxed text-foreground/90 [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2">
        {children}
      </div>
    </div>
  );
}
