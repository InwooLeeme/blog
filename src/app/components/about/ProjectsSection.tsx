import { FolderGit2, ExternalLink } from "lucide-react";
import { projects } from "@/lib/about";
import { techChipStyle } from "@/lib/tech";
import IconGithub from "../icon/IconGithub";
import { StaggerItem } from "../Stagger";
import { SectionHeading } from "./Timeline";

export default function ProjectsSection() {
  return (
    <section id="projects" className="scroll-mt-24">
      <SectionHeading icon={<FolderGit2 className="h-5 w-5" />}>프로젝트</SectionHeading>
      <div className="space-y-4">
        {projects.map((p, i) => (
          <StaggerItem
            key={p.name}
            index={i}
            className="rounded-lg border bg-card p-5 transition hover:border-accent-brand"
          >
            <h3 className="text-lg font-bold tracking-tight">{p.name}</h3>
            {p.subtitle ? (
              <p className="mt-0.5 text-sm font-medium text-accent-brand">
                {p.subtitle}
              </p>
            ) : null}

            {p.highlights.length > 0 ? (
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {p.highlights.map((h, j) => (
                  <li key={j} className="flex gap-2">
                    <span
                      aria-hidden
                      className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-accent-brand"
                    />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {p.tech && p.tech.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.tech.map((t) => (
                  <span
                    key={t}
                    style={techChipStyle(t)}
                    className="rounded-full border px-2.5 py-0.5 text-xs font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}

            {p.links && p.links.length > 0 ? (
              <div className="mt-4 flex flex-wrap items-center gap-4 border-t pt-3 text-sm">
                {p.links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-muted-foreground transition hover:text-accent-brand"
                  >
                    {l.type === "github" ? (
                      <IconGithub width={16} height={16} />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                    {l.label}
                  </a>
                ))}
              </div>
            ) : null}
          </StaggerItem>
        ))}
      </div>
    </section>
  );
}
