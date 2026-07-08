import { ListChecks } from "lucide-react";
import { workingStyles } from "@/lib/about";
import { SectionHeading } from "./Timeline";

export default function WorkingStyleSection() {
  return (
    <section id="working-style" className="scroll-mt-24">
      <SectionHeading icon={<ListChecks className="h-5 w-5" />}>작업 방식</SectionHeading>
      <div className="grid gap-3">
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
