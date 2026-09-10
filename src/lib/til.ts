export type TilLink = {
  label: string;
  url: string;
};

export type TilCode = {
  language: string;
  content: string;
};

export type TilTopic = {
  id: string;
  title: string;
  description: string;
  code?: TilCode;
  question?: string;
};

export type TilAssignmentStatus = "completed" | "in-progress" | "needs-review";

export type TilAssignment = {
  id: string;
  title: string;
  description: string;
  status: TilAssignmentStatus;
  links: TilLink[];
};

export type TilLesson = {
  id: string;
  course: string;
  topics: TilTopic[];
  assignments: TilAssignment[];
};

export type TilProjectUpdate = {
  id: string;
  projectId: string;
  projectName: string;
  role?: string;
  progress: string;
  decisions?: string;
  blockers?: string;
  nextSteps?: string;
  links: TilLink[];
};

export type TilRecord = {
  version: 1;
  date: string;
  summary: string;
  lessons: TilLesson[];
  projectUpdates: TilProjectUpdate[];
  reflection: string;
};

export type ValidationResult =
  | { ok: true; value: TilRecord }
  | { ok: false; errors: string[] };

export type DatedAssignment = TilAssignment & { date: string };
export type DatedProjectUpdate = TilProjectUpdate & { date: string };

export type TilOverview = {
  days: number;
  courses: string[];
  totalAssignments: number;
  completedAssignments: number;
  assignmentsByCourse: Array<{
    course: string;
    assignments: DatedAssignment[];
  }>;
  projects: Array<{
    id: string;
    name: string;
    updates: DatedProjectUpdate[];
  }>;
  records: TilRecord[];
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ASSIGNMENT_STATUSES = new Set<TilAssignmentStatus>([
  "completed",
  "in-progress",
  "needs-review",
]);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isTilDate(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function validateLinks(value: unknown, field: string, errors: string[]): void {
  if (!Array.isArray(value)) {
    errors.push(`${field} 링크 목록이 필요합니다.`);
    return;
  }

  value.forEach((link, index) => {
    if (!isObject(link) || !hasText(link.label) || !hasText(link.url)) {
      errors.push(`${field} 링크 ${index + 1}의 이름과 URL이 필요합니다.`);
      return;
    }
    try {
      const url = new URL(link.url);
      if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
    } catch {
      errors.push(`${field} 링크 ${index + 1}의 URL은 http 또는 https 주소여야 합니다.`);
    }
  });
}

function validateTopic(value: unknown, field: string, errors: string[]): void {
  if (!isObject(value)) {
    errors.push(`${field} 형식이 올바르지 않습니다.`);
    return;
  }
  if (!hasText(value.id)) errors.push(`${field} ID가 필요합니다.`);
  if (!hasText(value.title)) errors.push(`${field} 제목이 필요합니다.`);
  if (!hasText(value.description)) errors.push(`${field} 설명이 필요합니다.`);

  if (value.code !== undefined) {
    if (!isObject(value.code) || !hasText(value.code.language) || !hasText(value.code.content)) {
      errors.push(`${field} 코드는 언어와 내용을 함께 입력해야 합니다.`);
    }
  }
  if (value.question !== undefined && typeof value.question !== "string") {
    errors.push(`${field} 궁금한 점 형식이 올바르지 않습니다.`);
  }
}

function validateAssignment(value: unknown, field: string, errors: string[]): void {
  if (!isObject(value)) {
    errors.push(`${field} 형식이 올바르지 않습니다.`);
    return;
  }
  if (!hasText(value.id)) errors.push(`${field} ID가 필요합니다.`);
  if (!hasText(value.title)) errors.push(`${field} 제목이 필요합니다.`);
  if (typeof value.description !== "string") errors.push(`${field} 설명 형식이 올바르지 않습니다.`);
  if (!ASSIGNMENT_STATUSES.has(value.status as TilAssignmentStatus)) {
    errors.push(`${field} 상태가 올바르지 않습니다.`);
  }
  validateLinks(value.links, field, errors);
}

function validateProjectUpdate(value: unknown, field: string, errors: string[]): void {
  if (!isObject(value)) {
    errors.push(`${field} 형식이 올바르지 않습니다.`);
    return;
  }
  if (!hasText(value.id)) errors.push(`${field} ID가 필요합니다.`);
  if (!hasText(value.projectId)) errors.push(`${field} 프로젝트 ID가 필요합니다.`);
  if (!hasText(value.projectName)) errors.push(`${field} 프로젝트 이름이 필요합니다.`);
  if (!hasText(value.progress)) errors.push(`${field} 오늘 진행한 내용이 필요합니다.`);
  for (const key of ["role", "decisions", "blockers", "nextSteps"] as const) {
    if (value[key] !== undefined && typeof value[key] !== "string") {
      errors.push(`${field} ${key} 형식이 올바르지 않습니다.`);
    }
  }
  validateLinks(value.links, field, errors);
}

export function validateTilRecord(value: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isObject(value)) return { ok: false, errors: ["기록 형식이 올바르지 않습니다."] };

  if (value.version !== 1) errors.push("지원하지 않는 기록 버전입니다.");
  if (!isTilDate(value.date)) errors.push("날짜는 실제 YYYY-MM-DD 날짜여야 합니다.");
  if (!hasText(value.summary)) errors.push("한 줄 요약이 필요합니다.");
  if (typeof value.reflection !== "string") errors.push("회고 형식이 올바르지 않습니다.");

  if (!Array.isArray(value.lessons) || value.lessons.length === 0) {
    errors.push("하나 이상의 수업이 필요합니다.");
  } else {
    value.lessons.forEach((lesson, lessonIndex) => {
      const field = `수업 ${lessonIndex + 1}`;
      if (!isObject(lesson)) {
        errors.push(`${field} 형식이 올바르지 않습니다.`);
        return;
      }
      if (!hasText(lesson.id)) errors.push(`${field} ID가 필요합니다.`);
      if (!hasText(lesson.course)) errors.push(`${field} 이름이 필요합니다.`);
      if (!Array.isArray(lesson.topics) || lesson.topics.length === 0) {
        errors.push(`${field}에 하나 이상의 학습 주제가 필요합니다.`);
      } else {
        lesson.topics.forEach((topic, index) =>
          validateTopic(topic, `${field}의 주제 ${index + 1}`, errors),
        );
      }
      if (!Array.isArray(lesson.assignments)) {
        errors.push(`${field} 과제 목록이 필요합니다.`);
      } else {
        lesson.assignments.forEach((assignment, index) =>
          validateAssignment(assignment, `${field}의 과제 ${index + 1}`, errors),
        );
      }
    });
  }

  if (!Array.isArray(value.projectUpdates)) {
    errors.push("팀 프로젝트 진행 목록이 필요합니다.");
  } else {
    value.projectUpdates.forEach((update, index) =>
      validateProjectUpdate(update, `프로젝트 진행 ${index + 1}`, errors),
    );
  }

  return errors.length === 0
    ? { ok: true, value: value as TilRecord }
    : { ok: false, errors };
}

export function summarizeTilRecord(record: TilRecord, maxLength = 78): string {
  const summary = record.summary.trim();
  return summary.length <= maxLength ? summary : `${summary.slice(0, maxLength - 1)}…`;
}

export function buildTilOverview(records: TilRecord[]): TilOverview {
  const sortedRecords = [...records].sort((a, b) => b.date.localeCompare(a.date));
  const assignments = new Map<string, DatedAssignment[]>();
  const projects = new Map<string, { id: string; name: string; updates: DatedProjectUpdate[] }>();
  let totalAssignments = 0;
  let completedAssignments = 0;

  for (const record of sortedRecords) {
    for (const lesson of record.lessons) {
      const courseAssignments = assignments.get(lesson.course) ?? [];
      for (const assignment of lesson.assignments) {
        courseAssignments.push({ ...assignment, date: record.date });
        totalAssignments += 1;
        if (assignment.status === "completed") completedAssignments += 1;
      }
      assignments.set(lesson.course, courseAssignments);
    }

    for (const update of record.projectUpdates) {
      const project = projects.get(update.projectId) ?? {
        id: update.projectId,
        name: update.projectName,
        updates: [],
      };
      project.updates.push({ ...update, date: record.date });
      projects.set(update.projectId, project);
    }
  }

  const assignmentsByCourse = [...assignments.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "ko"))
    .map(([course, courseAssignments]) => ({
      course,
      assignments: courseAssignments.sort((a, b) => b.date.localeCompare(a.date)),
    }));

  const projectList = [...projects.values()]
    .map((project) => ({
      ...project,
      updates: project.updates.sort((a, b) => a.date.localeCompare(b.date)),
    }))
    .sort((a, b) => {
      const aLatest = a.updates.at(-1)?.date ?? "";
      const bLatest = b.updates.at(-1)?.date ?? "";
      return bLatest.localeCompare(aLatest) || a.name.localeCompare(b.name, "ko");
    });

  return {
    days: sortedRecords.length,
    courses: assignmentsByCourse.map(({ course }) => course),
    totalAssignments,
    completedAssignments,
    assignmentsByCourse,
    projects: projectList,
    records: sortedRecords,
  };
}
