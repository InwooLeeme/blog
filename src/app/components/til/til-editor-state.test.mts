import assert from "node:assert/strict";
import test from "node:test";
import {
  addAssignment,
  addLesson,
  addProjectUpdate,
  addTopic,
  clearSavedDraftIfUnchanged,
  createEmptyTilRecord,
  decodeTilDraft,
  persistTilDraft,
  readTilDraft,
  removeAssignment,
  removeLesson,
  removeProjectUpdate,
  removeTopic,
  suggestProjectId,
} from "./til-editor-state.ts";

function sequentialIds(...ids: string[]) {
  return () => {
    const id = ids.shift();
    if (!id) throw new Error("테스트 ID가 부족합니다.");
    return id;
  };
}

test("createEmptyTilRecord: 바로 작성할 수 있는 수업과 주제 하나를 만든다", () => {
  const record = createEmptyTilRecord(
    "2026-09-10",
    sequentialIds("lesson-1", "topic-1"),
  );

  assert.equal(record.date, "2026-09-10");
  assert.equal(record.lessons.length, 1);
  assert.equal(record.lessons[0].id, "lesson-1");
  assert.equal(record.lessons[0].topics[0].id, "topic-1");
});

test("수업과 주제 추가·삭제는 원본 기록을 변경하지 않는다", () => {
  const original = createEmptyTilRecord(
    "2026-09-10",
    sequentialIds("lesson-1", "topic-1"),
  );
  const withLesson = addLesson(original, sequentialIds("lesson-2", "topic-2"));
  const withTopic = addTopic(withLesson, "lesson-1", () => "topic-3");
  const withoutTopic = removeTopic(withTopic, "lesson-1", "topic-1");
  const withoutLesson = removeLesson(withoutTopic, "lesson-2");

  assert.equal(original.lessons.length, 1);
  assert.equal(original.lessons[0].topics.length, 1);
  assert.deepEqual(withoutLesson.lessons.map((lesson) => lesson.id), ["lesson-1"]);
  assert.deepEqual(withoutLesson.lessons[0].topics.map((topic) => topic.id), ["topic-3"]);
});

test("과제와 프로젝트 진행 추가·삭제는 대상 ID만 변경한다", () => {
  const original = createEmptyTilRecord(
    "2026-09-10",
    sequentialIds("lesson-1", "topic-1"),
  );
  const withAssignment = addAssignment(original, "lesson-1", () => "assignment-1");
  const withProject = addProjectUpdate(withAssignment, () => "project-update-1");

  assert.equal(withAssignment.lessons[0].assignments[0].status, "completed");
  assert.equal(withProject.projectUpdates[0].id, "project-update-1");
  assert.equal(original.projectUpdates.length, 0);

  const cleaned = removeProjectUpdate(
    removeAssignment(withProject, "lesson-1", "assignment-1"),
    "project-update-1",
  );
  assert.equal(cleaned.lessons[0].assignments.length, 0);
  assert.equal(cleaned.projectUpdates.length, 0);
});

test("suggestProjectId: 비어 있는 ID에만 완성된 프로젝트 이름을 slug로 제안한다", () => {
  assert.equal(suggestProjectId("SKALA Market API", ""), "skala-market-api");
  assert.equal(suggestProjectId("스칼라 마켓", ""), "스칼라-마켓");
  assert.equal(suggestProjectId("바뀐 이름", "custom-project"), "custom-project");
});

test("decodeTilDraft: 작성 중인 빈 필드는 보존하고 손상된 중첩 구조는 거부한다", () => {
  const draft = createEmptyTilRecord(
    "2026-09-10",
    sequentialIds("lesson-1", "topic-1"),
  );
  assert.deepEqual(decodeTilDraft(JSON.stringify(draft), draft.date), draft);
  assert.equal(
    decodeTilDraft(
      JSON.stringify({ ...draft, lessons: [{ ...draft.lessons[0], topics: null }] }),
      draft.date,
    ),
    null,
  );
  assert.equal(decodeTilDraft(JSON.stringify(draft), "2026-09-11"), null);
  assert.equal(decodeTilDraft("not-json", draft.date), null);
});

test("persistTilDraft: 날짜를 바꾸기 전 최신 화면 상태를 즉시 저장한다", () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
  const draft = createEmptyTilRecord(
    "2026-09-10",
    sequentialIds("lesson-1", "topic-1"),
  );
  draft.summary = "날짜 전환 직전 작성한 내용";

  persistTilDraft(storage, draft);

  assert.equal(JSON.parse(values.get("til-draft:2026-09-10") ?? "{}").summary, draft.summary);
});

test("clearSavedDraftIfUnchanged: 저장 요청 뒤 더 수정된 초안은 삭제하지 않는다", () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
  const submitted = createEmptyTilRecord(
    "2026-09-10",
    sequentialIds("lesson-1", "topic-1"),
  );
  persistTilDraft(storage, { ...submitted, summary: "저장 요청 후 수정" });

  assert.equal(clearSavedDraftIfUnchanged(storage, submitted), false);
  assert.equal(values.has("til-draft:2026-09-10"), true);

  persistTilDraft(storage, submitted);
  assert.equal(clearSavedDraftIfUnchanged(storage, submitted), true);
  assert.equal(values.has("til-draft:2026-09-10"), false);
});

test("초안 저장소 오류는 읽기·쓰기·정리 흐름 밖으로 전파하지 않는다", () => {
  const blockedStorage = {
    getItem: (): string | null => { throw new Error("blocked"); },
    setItem: (): void => { throw new Error("quota"); },
    removeItem: (): void => { throw new Error("blocked"); },
  };
  const draft = createEmptyTilRecord(
    "2026-09-10",
    sequentialIds("lesson-1", "topic-1"),
  );

  assert.equal(readTilDraft(blockedStorage, draft.date), null);
  assert.equal(persistTilDraft(blockedStorage, draft), false);
  assert.equal(clearSavedDraftIfUnchanged(blockedStorage, draft), false);
});
