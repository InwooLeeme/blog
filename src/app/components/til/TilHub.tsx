"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  FolderKanban,
  GraduationCap,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { summarizeTilRecord, type TilAssignmentStatus, type TilOverview } from "@/lib/til";
import { useLocale, useT } from "@/app/components/LocaleProvider";
import { assignmentStatusMessageId, filterTilOverview } from "./til-view-model";
import { formatTilDate } from "./TilRecordView";

const assignmentStatusStyle: Record<
  TilAssignmentStatus,
  { icon: typeof CheckCircle2; className: string }
> = {
  completed: {
    icon: CheckCircle2,
    className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  "in-progress": {
    icon: CircleDot,
    className: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  "needs-review": {
    icon: AlertCircle,
    className: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
};

export default function TilHub({ overview }: { overview: TilOverview }) {
  const [course, setCourse] = useState<string | null>(null);
  const t = useT();
  const { locale } = useLocale();
  const filtered = useMemo(() => filterTilOverview(overview, course), [overview, course]);

  if (overview.days === 0) {
    return (
      <div className="rounded-3xl border border-dashed bg-card/50 px-6 py-16 text-center">
        <BookOpen className="mx-auto size-9 text-accent-brand" />
        <h2 className="mt-5 text-xl font-bold">{t("til.emptyTitle")}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {t("til.emptyDesc")}
        </p>
      </div>
    );
  }

  const stats = [
    { label: t("til.statDays"), value: overview.days, suffix: t("til.daySuffix"), icon: CalendarDays },
    { label: t("til.statCourses"), value: overview.courses.length, suffix: t("til.countSuffix"), icon: GraduationCap },
    { label: t("til.statAssignments"), value: overview.completedAssignments, suffix: t("til.countSuffix"), icon: CheckCircle2 },
    { label: t("til.statProjects"), value: overview.projects.length, suffix: t("til.countSuffix"), icon: Users },
  ];

  return (
    <div className="space-y-14">
      <section aria-label={t("til.statsAria")} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border bg-card/70 p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between gap-3 text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wider">{stat.label}</span>
                <Icon className="size-4 text-accent-brand" />
              </div>
              <p className="mt-3 font-display text-2xl font-bold tabular-nums sm:text-3xl">
                {stat.value}<span className="ml-1 text-sm font-medium text-muted-foreground">{stat.suffix}</span>
              </p>
            </div>
          );
        })}
      </section>

      <div className="flex flex-wrap gap-2" aria-label={t("til.filterAria")}>
        <button
          type="button"
          onClick={() => setCourse(null)}
          aria-pressed={filtered.selectedCourse === null}
          className={cn(
            "min-h-10 rounded-full border px-4 text-sm font-medium transition-colors",
            filtered.selectedCourse === null
              ? "border-accent-brand bg-accent-brand text-white"
              : "bg-background hover:border-accent-brand/50 hover:text-accent-brand",
          )}
        >
          {t("til.all")}
        </button>
        {overview.courses.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCourse(item)}
            aria-pressed={filtered.selectedCourse === item}
            className={cn(
              "min-h-10 rounded-full border px-4 text-sm font-medium transition-colors",
              filtered.selectedCourse === item
                ? "border-accent-brand bg-accent-brand text-white"
                : "bg-background hover:border-accent-brand/50 hover:text-accent-brand",
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <section aria-labelledby="assignments-title">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-brand">{t("til.assignmentsEyebrow")}</p>
            <h2 id="assignments-title" className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {t("til.assignmentsTitle")}
            </h2>
          </div>
          <p className="text-sm tabular-nums text-muted-foreground">
            {t("til.completion", { done: overview.completedAssignments, total: overview.totalAssignments })}
          </p>
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {filtered.assignmentsByCourse.map((group) => (
            <article key={group.course} className="overflow-hidden rounded-2xl border bg-card/70 shadow-sm">
              <header className="flex items-center justify-between border-b px-5 py-4">
                <div className="flex items-center gap-2">
                  <FolderKanban className="size-4 text-accent-brand" />
                  <h3 className="font-bold">{group.course}</h3>
                </div>
                <Badge variant="secondary">{group.assignments.length}{t("til.countSuffix")}</Badge>
              </header>
              {group.assignments.length > 0 ? (
                <ul className="divide-y">
                  {group.assignments.map((assignment) => (
                    <li key={`${assignment.date}-${assignment.id}`} className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-semibold">{assignment.title}</p>
                          {assignment.description ? (
                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                              {assignment.description}
                            </p>
                          ) : null}
                        </div>
                        {(() => {
                          const status = assignmentStatusStyle[assignment.status];
                          const StatusIcon = status.icon;
                          return (
                            <Badge variant="outline" className={status.className}>
                              <StatusIcon /> {t(assignmentStatusMessageId(assignment.status))}
                            </Badge>
                          );
                        })()}
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <time className="text-xs tabular-nums text-muted-foreground" dateTime={assignment.date}>
                          {assignment.date}
                        </time>
                        <div className="flex flex-wrap justify-end gap-3">
                          {assignment.links.map((link) => (
                            <a
                              key={`${link.label}-${link.url}`}
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-accent-brand hover:underline"
                            >
                              {link.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-5 py-8 text-center text-sm text-muted-foreground">{t("til.emptyAssignments")}</p>
              )}
            </article>
          ))}
        </div>
      </section>

      {overview.projects.length > 0 ? (
        <section aria-labelledby="projects-title">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-brand">{t("til.projectsEyebrow")}</p>
          <h2 id="projects-title" className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {t("til.projectsTitle")}
          </h2>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {overview.projects.map((project) => (
              <details key={project.id} className="group rounded-2xl border bg-card/70 shadow-sm" open={overview.projects.length === 1}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">
                  <div>
                    <h3 className="font-bold">{project.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{t("til.updateDays", { n: project.updates.length })}</p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-open:rotate-90" />
                </summary>
                <ol className="mx-5 mb-5 border-l border-accent-brand/25 pl-5">
                  {project.updates.map((update) => (
                    <li key={`${update.date}-${update.id}`} className="relative pb-6 last:pb-0">
                      <span className="absolute -left-[1.57rem] top-1 size-2 rounded-full bg-accent-brand ring-4 ring-background" />
                      <time className="text-xs font-semibold tabular-nums text-accent-brand" dateTime={update.date}>
                        {update.date}
                      </time>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{update.progress}</p>
                      {update.nextSteps?.trim() ? (
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">{t("til.nextPrefix", { value: update.nextSteps })}</p>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="daily-title">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-brand">{t("til.dailyEyebrow")}</p>
        <h2 id="daily-title" className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {t("til.dailyTitle")}
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {filtered.records.map((record) => (
            <Link
              key={record.date}
              href={`/til/${record.date}`}
              className="group rounded-2xl border bg-card/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-accent-brand/40 hover:shadow-md sm:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <time className="text-xs font-semibold tabular-nums text-accent-brand" dateTime={record.date}>
                  {formatTilDate(record.date, locale)}
                </time>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-accent-brand" />
              </div>
              <h3 className="mt-4 text-lg font-bold leading-snug">{summarizeTilRecord(record)}</h3>
              <div className="mt-5 flex flex-wrap gap-2">
                {record.lessons.map((lesson) => (
                  <Badge key={lesson.id} variant="secondary">{lesson.course}</Badge>
                ))}
                {record.projectUpdates.length > 0 ? (
                  <Badge variant="outline"><Users /> {t("til.teamProjectBadge")}</Badge>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
