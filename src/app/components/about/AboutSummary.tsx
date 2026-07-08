import { CheckCircle2 } from "lucide-react";
import { aboutSummary } from "@/lib/about";

export default function AboutSummary() {
  return (
    <section aria-label="핵심 요약" className="mb-12 rounded-lg border bg-card/70 p-5">
      <ul className="space-y-3">
        {aboutSummary.map((line) => (
          <li key={line} className="flex gap-3 text-sm leading-relaxed">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-brand" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
