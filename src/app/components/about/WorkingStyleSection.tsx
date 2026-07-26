"use client";

import { ListChecks } from "lucide-react";
import { SectionHeading } from "./Timeline";
import { useT } from "../LocaleProvider";
import { useAboutData } from "./useAboutData";

export default function WorkingStyleSection() {
  const t = useT();
  const { workingStyles } = useAboutData();
  return (
    <section id="working-style" className="scroll-mt-24">
      <SectionHeading icon={<ListChecks className="h-5 w-5" />}>{t("about.workingStyle")}</SectionHeading>
      <div className="grid gap-3 md:grid-cols-3">
        {workingStyles.map((item) => (
          <article key={item.title} className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
