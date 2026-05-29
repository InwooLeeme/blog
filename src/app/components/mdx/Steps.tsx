import React from "react";

interface StepProps {
  title: string;
  children?: React.ReactNode;
  number?: number;
  isLast?: boolean;
}

export function Step({ title, children, number, isLast }: StepProps) {
  return (
    <div className="not-prose relative pl-12">
      {!isLast ? (
        <div
          aria-hidden
          className="absolute left-4 top-8 -bottom-6 w-px -translate-x-1/2 bg-border"
        />
      ) : null}
      <div className="absolute left-0 top-0 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-accent-brand text-sm font-bold text-accent-brand-fg shadow-sm">
        {number ?? "•"}
      </div>
      <h4 className="toc-ignore mb-2 text-base font-semibold leading-8">{title}</h4>
      <div className="text-sm leading-relaxed text-foreground/90 [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2">
        {children}
      </div>
    </div>
  );
}

export function Steps({ children }: { children?: React.ReactNode }) {
  const valid = React.Children.toArray(children).filter(React.isValidElement);
  const total = valid.length;

  const items = valid.map((child, idx) =>
    React.cloneElement(
      child as React.ReactElement<{ number?: number; isLast?: boolean }>,
      { number: idx + 1, isLast: idx === total - 1 },
    ),
  );

  return <div className="my-6 space-y-6">{items}</div>;
}
