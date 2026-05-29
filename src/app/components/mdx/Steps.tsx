import React from "react";

interface StepProps {
  title: string;
  children?: React.ReactNode;
  number?: number;
}

export function Step({ title, children, number }: StepProps) {
  return (
    <div className="not-prose relative pl-14">
      <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-accent-brand font-bold text-accent-brand-fg shadow-sm">
        {number ?? "•"}
      </div>
      <h4 className="mb-2 text-base font-semibold leading-10">{title}</h4>
      <div className="text-sm leading-relaxed text-foreground/90 [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2">
        {children}
      </div>
    </div>
  );
}

export function Steps({ children }: { children?: React.ReactNode }) {
  let stepIndex = 0;
  const items = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    stepIndex += 1;
    return React.cloneElement(
      child as React.ReactElement<{ number?: number }>,
      { number: stepIndex },
    );
  });
  return <div className="my-6 space-y-6">{items}</div>;
}
