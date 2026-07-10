import katex from "katex";
import { Clock, HardDrive } from "lucide-react";

interface ComplexityProps {
  time?: string;
  space?: string;
}

/** 복잡도 수식을 KaTeX로 렌더링. 잘못된 LaTeX이면 깨지지 않고 원문을 그대로 표시한다. */
function Formula({ value }: { value: string }) {
  const html = katex.renderToString(value, {
    throwOnError: false,
    output: "html",
  });
  return (
    <span
      className="font-semibold text-foreground"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function Complexity({ time, space }: ComplexityProps) {
  if (!time && !space) return null;

  return (
    <div className="not-prose my-4 flex flex-wrap gap-2">
      {time ? (
        <span className="inline-flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1 text-sm">
          <Clock className="h-3.5 w-3.5 text-accent-brand" />
          <span className="text-muted-foreground">Time</span>
          <Formula value={time} />
        </span>
      ) : null}
      {space ? (
        <span className="inline-flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1 text-sm">
          <HardDrive className="h-3.5 w-3.5 text-accent-brand" />
          <span className="text-muted-foreground">Space</span>
          <Formula value={space} />
        </span>
      ) : null}
    </div>
  );
}
