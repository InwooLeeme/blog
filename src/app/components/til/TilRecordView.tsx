"use client";

import { contentCardClass, sectionHeadingClass } from "@/lib/ui-styles";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  CircleDot,
  Code2,
  Lightbulb,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TilAssignmentStatus, TilRecord } from "@/lib/til";
import type { Locale, MessageId } from "@/lib/i18n";
import { useLocale, useT } from "@/app/components/LocaleProvider";

const statusCopy: Record<
  TilAssignmentStatus,
  { label: MessageId; icon: typeof CheckCircle2; className: string }
> = {
  completed: {
    label: "til.statusCompleted",
    icon: CheckCircle2,
    className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  "in-progress": {
    label: "til.statusInProgress",
    icon: CircleDot,
    className: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  "needs-review": {
    label: "til.statusNeedsReview",
    icon: AlertCircle,
    className: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
};

export function formatTilDate(date: string, locale: Locale = "ko"): string {
  return new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function TilDate({ date }: { date: string }) {
  const { locale } = useLocale();
  return <>{formatTilDate(date, locale)}</>;
}

function TextSection({ title, value }: { title: string; value?: string }) {
  if (!value?.trim()) return null;
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h4>
      <p className="mt-2 whitespace-pre-wrap leading-7 text-foreground/85">{value}</p>
    </div>
  );
}

export default function TilRecordView({ record }: { record: TilRecord }) {
  const t = useT();
  return (
    <div className="space-y-12">
      {record.lessons.map((lesson) => (
        <section key={lesson.id} className="space-y-6" aria-labelledby={`${lesson.id}-title`}>
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-accent-brand" aria-hidden />
            <h2 id={`${lesson.id}-title`} className={sectionHeadingClass}>
              {lesson.course}
            </h2>
          </div>

          <div className="space-y-5">
            {lesson.topics.map((topic, index) => (
              <article
                key={topic.id}
                className={cn(contentCardClass, "p-5 sm:p-7")}
              >
                <p className="text-xs font-semibold tabular-nums text-accent-brand">
                  {t("til.topicLabel", { n: String(index + 1).padStart(2, "0") })}
                </p>
                <h3 className="mt-2 text-xl font-bold tracking-tight">{topic.title}</h3>
                <p className="mt-4 whitespace-pre-wrap leading-7 text-foreground/85">
                  {topic.description}
                </p>
                {topic.code ? (
                  <div className="mt-5 overflow-hidden rounded-xl border bg-zinc-950 text-zinc-100">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs text-zinc-400">
                      <span className="flex items-center gap-2">
                        <Code2 className="size-3.5" /> {t("til.codeExample")}
                      </span>
                      <span className="font-mono">{topic.code.language}</span>
                    </div>
                    <pre className="overflow-x-auto p-4 text-sm leading-6">
                      <code>{topic.code.content}</code>
                    </pre>
                  </div>
                ) : null}
                {topic.question?.trim() ? (
                  <div className="mt-5 flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/8 p-4 text-sm leading-6">
                    <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-300" />
                    <div>
                      <strong className="font-semibold">{t("til.learnMore")}</strong>
                      <p className="mt-1 whitespace-pre-wrap text-foreground/75">{topic.question}</p>
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>

          {lesson.assignments.length > 0 ? (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">{t("til.todayAssignments")}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {lesson.assignments.map((assignment) => {
                  const status = statusCopy[assignment.status];
                  const StatusIcon = status.icon;
                  return (
                    <article key={assignment.id} className="rounded-xl border bg-background/70 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-semibold">{assignment.title}</h4>
                        <Badge variant="outline" className={status.className}>
                          <StatusIcon /> {t(status.label)}
                        </Badge>
                      </div>
                      {assignment.description ? (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                          {assignment.description}
                        </p>
                      ) : null}
                      {assignment.links.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {assignment.links.map((link) => (
                            <a
                              key={`${link.label}-${link.url}`}
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-sm font-medium text-accent-brand hover:underline"
                            >
                              {link.label} <ArrowUpRight className="size-3.5" />
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}
        </section>
      ))}

      {record.projectUpdates.length > 0 ? (
        <section className="space-y-4" aria-labelledby="project-updates-title">
          <div className="flex items-center gap-3">
            <Users className="size-5 text-accent-brand" />
            <h2 id="project-updates-title" className={sectionHeadingClass}>
              {t("til.projectSection")}
            </h2>
          </div>
          {record.projectUpdates.map((update) => (
            <article key={update.id} className={cn(contentCardClass, "p-5 sm:p-7")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="text-xl font-bold">{update.projectName}</h3>
                {update.role?.trim() ? <Badge variant="secondary">{update.role}</Badge> : null}
              </div>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <TextSection title={t("til.progress")} value={update.progress} />
                <TextSection title={t("til.decisions")} value={update.decisions} />
                <TextSection title={t("til.blockers")} value={update.blockers} />
                <TextSection title={t("til.nextSteps")} value={update.nextSteps} />
              </div>
              {update.links.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-3 border-t pt-4">
                  {update.links.map((link) => (
                    <a
                      key={`${link.label}-${link.url}`}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-accent-brand hover:underline"
                    >
                      {link.label} <ArrowUpRight className="size-3.5" />
                    </a>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}

      {record.reflection.trim() ? (
        <section className="rounded-xl bg-accent-brand/8 p-5 sm:p-7">
          <h2 className="text-sm font-semibold text-accent-brand">{t("til.reflection")}</h2>
          <p className="mt-3 whitespace-pre-wrap text-lg leading-8">{record.reflection}</p>
        </section>
      ) : null}
    </div>
  );
}
