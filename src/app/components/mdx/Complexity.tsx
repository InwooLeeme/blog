import { Clock, HardDrive } from "lucide-react";

interface ComplexityProps {
  time?: string;
  space?: string;
}

export function Complexity({ time, space }: ComplexityProps) {
  if (!time && !space) return null;

  return (
    <div className="not-prose my-4 flex flex-wrap gap-2">
      {time ? (
        <span className="inline-flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1 text-sm">
          <Clock className="h-3.5 w-3.5 text-accent-brand" />
          <span className="text-muted-foreground">Time</span>
          <code className="font-mono font-semibold text-foreground">{time}</code>
        </span>
      ) : null}
      {space ? (
        <span className="inline-flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1 text-sm">
          <HardDrive className="h-3.5 w-3.5 text-accent-brand" />
          <span className="text-muted-foreground">Space</span>
          <code className="font-mono font-semibold text-foreground">{space}</code>
        </span>
      ) : null}
    </div>
  );
}
