import type {
  TilAssignment,
  TilLesson,
  TilProjectUpdate,
  TilRecord,
  TilTopic,
} from "@/lib/til";

export type IdFactory = () => string;
export type TilDraftStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const defaultIdFactory: IdFactory = () => globalThis.crypto.randomUUID();

export function suggestProjectId(name: string, currentId: string): string {
  if (currentId.trim()) return currentId;
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isDraftLinks(value: unknown): boolean {
  return Array.isArray(value) && value.every(
    (link) => isObject(link) && isString(link.label) && isString(link.url),
  );
}

function isDraftTopic(value: unknown): boolean {
  if (!isObject(value) || !isString(value.id) || !isString(value.title) || !isString(value.description)) {
    return false;
  }
  if (value.question !== undefined && !isString(value.question)) return false;
  return value.code === undefined || (
    isObject(value.code) && isString(value.code.language) && isString(value.code.content)
  );
}

function isDraftAssignment(value: unknown): boolean {
  return isObject(value) &&
    isString(value.id) &&
    isString(value.title) &&
    isString(value.description) &&
    ["completed", "in-progress", "needs-review"].includes(String(value.status)) &&
    isDraftLinks(value.links);
}

function isDraftLesson(value: unknown): boolean {
  return isObject(value) &&
    isString(value.id) &&
    isString(value.course) &&
    Array.isArray(value.topics) &&
    value.topics.every(isDraftTopic) &&
    Array.isArray(value.assignments) &&
    value.assignments.every(isDraftAssignment);
}

function isOptionalString(value: unknown): boolean {
  return value === undefined || isString(value);
}

function isDraftProjectUpdate(value: unknown): boolean {
  return isObject(value) &&
    isString(value.id) &&
    isString(value.projectId) &&
    isString(value.projectName) &&
    isString(value.progress) &&
    isOptionalString(value.role) &&
    isOptionalString(value.decisions) &&
    isOptionalString(value.blockers) &&
    isOptionalString(value.nextSteps) &&
    isDraftLinks(value.links);
}

export function decodeTilDraft(serialized: string, expectedDate: string): TilRecord | null {
  try {
    const value: unknown = JSON.parse(serialized);
    if (!isObject(value) || value.version !== 1 || value.date !== expectedDate) return null;
    if (!isString(value.summary) || !isString(value.reflection)) return null;
    if (!Array.isArray(value.lessons) || !value.lessons.every(isDraftLesson)) return null;
    if (!Array.isArray(value.projectUpdates) || !value.projectUpdates.every(isDraftProjectUpdate)) {
      return null;
    }
    return value as TilRecord;
  } catch {
    return null;
  }
}

export function tilDraftKey(date: string): string {
  return `til-draft:${date}`;
}

export function readTilDraft(storage: TilDraftStorage, date: string): TilRecord | null {
  try {
    const serialized = storage.getItem(tilDraftKey(date));
    if (!serialized) return null;
    const draft = decodeTilDraft(serialized, date);
    if (!draft) storage.removeItem(tilDraftKey(date));
    return draft;
  } catch {
    return null;
  }
}

export function persistTilDraft(storage: TilDraftStorage, record: TilRecord): boolean {
  try {
    storage.setItem(tilDraftKey(record.date), JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

export function clearSavedDraftIfUnchanged(
  storage: TilDraftStorage,
  submitted: TilRecord,
): boolean {
  try {
    const key = tilDraftKey(submitted.date);
    if (storage.getItem(key) !== JSON.stringify(submitted)) return false;
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function emptyTopic(idFactory: IdFactory): TilTopic {
  return { id: idFactory(), title: "", description: "" };
}

function emptyLesson(idFactory: IdFactory): TilLesson {
  return {
    id: idFactory(),
    course: "",
    topics: [emptyTopic(idFactory)],
    assignments: [],
  };
}

function emptyAssignment(idFactory: IdFactory): TilAssignment {
  return {
    id: idFactory(),
    title: "",
    description: "",
    status: "completed",
    links: [],
  };
}

function emptyProjectUpdate(idFactory: IdFactory): TilProjectUpdate {
  return {
    id: idFactory(),
    projectId: "",
    projectName: "",
    role: "",
    progress: "",
    decisions: "",
    blockers: "",
    nextSteps: "",
    links: [],
  };
}

export function createEmptyTilRecord(
  date: string,
  idFactory: IdFactory = defaultIdFactory,
): TilRecord {
  return {
    version: 1,
    date,
    summary: "",
    lessons: [emptyLesson(idFactory)],
    projectUpdates: [],
    reflection: "",
  };
}

export function addLesson(
  record: TilRecord,
  idFactory: IdFactory = defaultIdFactory,
): TilRecord {
  return { ...record, lessons: [...record.lessons, emptyLesson(idFactory)] };
}

export function removeLesson(record: TilRecord, lessonId: string): TilRecord {
  return {
    ...record,
    lessons: record.lessons.filter(({ id }) => id !== lessonId),
  };
}

export function addTopic(
  record: TilRecord,
  lessonId: string,
  idFactory: IdFactory = defaultIdFactory,
): TilRecord {
  return {
    ...record,
    lessons: record.lessons.map((lesson) =>
      lesson.id === lessonId
        ? { ...lesson, topics: [...lesson.topics, emptyTopic(idFactory)] }
        : lesson,
    ),
  };
}

export function removeTopic(
  record: TilRecord,
  lessonId: string,
  topicId: string,
): TilRecord {
  return {
    ...record,
    lessons: record.lessons.map((lesson) =>
      lesson.id === lessonId
        ? { ...lesson, topics: lesson.topics.filter(({ id }) => id !== topicId) }
        : lesson,
    ),
  };
}

export function addAssignment(
  record: TilRecord,
  lessonId: string,
  idFactory: IdFactory = defaultIdFactory,
): TilRecord {
  return {
    ...record,
    lessons: record.lessons.map((lesson) =>
      lesson.id === lessonId
        ? { ...lesson, assignments: [...lesson.assignments, emptyAssignment(idFactory)] }
        : lesson,
    ),
  };
}

export function removeAssignment(
  record: TilRecord,
  lessonId: string,
  assignmentId: string,
): TilRecord {
  return {
    ...record,
    lessons: record.lessons.map((lesson) =>
      lesson.id === lessonId
        ? {
            ...lesson,
            assignments: lesson.assignments.filter(({ id }) => id !== assignmentId),
          }
        : lesson,
    ),
  };
}

export function addProjectUpdate(
  record: TilRecord,
  idFactory: IdFactory = defaultIdFactory,
): TilRecord {
  return {
    ...record,
    projectUpdates: [...record.projectUpdates, emptyProjectUpdate(idFactory)],
  };
}

export function removeProjectUpdate(
  record: TilRecord,
  updateId: string,
): TilRecord {
  return {
    ...record,
    projectUpdates: record.projectUpdates.filter(({ id }) => id !== updateId),
  };
}
