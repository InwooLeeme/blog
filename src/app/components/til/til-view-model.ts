import type { TilAssignmentStatus, TilOverview } from "@/lib/til";
import type { MessageId } from "@/lib/i18n";

export type FilteredTilOverview = TilOverview & {
  selectedCourse: string | null;
};

export function assignmentStatusMessageId(status: TilAssignmentStatus): MessageId {
  if (status === "completed") return "til.statusCompleted";
  if (status === "needs-review") return "til.statusNeedsReview";
  return "til.statusInProgress";
}

export function filterTilOverview(
  overview: TilOverview,
  requestedCourse: string | null,
): FilteredTilOverview {
  const selectedCourse =
    requestedCourse && overview.courses.includes(requestedCourse)
      ? requestedCourse
      : null;

  if (!selectedCourse) return { ...overview, selectedCourse: null };

  return {
    ...overview,
    selectedCourse,
    assignmentsByCourse: overview.assignmentsByCourse.filter(
      ({ course }) => course === selectedCourse,
    ),
    records: overview.records.filter((record) =>
      record.lessons.some(({ course }) => course === selectedCourse),
    ),
  };
}
