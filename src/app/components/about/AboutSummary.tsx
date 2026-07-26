"use client";

import { CheckCircle2 } from "lucide-react";
import { useT } from "../LocaleProvider";
import { useAboutData } from "./useAboutData";

export default function AboutSummary() {
  const t = useT();
  const { aboutSummary } = useAboutData();

  return (
    <section
      aria-label={t("about.summaryAria")}
      className="mx-auto mb-12 max-w-2xl rounded-lg border bg-card/70 p-5"
    >
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
