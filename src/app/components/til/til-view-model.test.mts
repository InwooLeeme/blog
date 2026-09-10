import assert from "node:assert/strict";
import test from "node:test";
import { buildTilOverview, type TilRecord } from "../../../lib/til.ts";
import { assignmentStatusMessageId, filterTilOverview } from "./til-view-model.ts";

const records: TilRecord[] = [
  {
    version: 1,
    date: "2026-09-10",
    summary: "Spring 수업",
    lessons: [
      {
        id: "spring",
        course: "Spring",
        topics: [{ id: "di", title: "DI", description: "DI를 학습했다." }],
        assignments: [
          {
            id: "spring-task",
            title: "Spring 과제",
            description: "API 구현",
            status: "completed",
            links: [],
          },
        ],
      },
    ],
    projectUpdates: [],
    reflection: "",
  },
  {
    version: 1,
    date: "2026-09-09",
    summary: "Java 수업",
    lessons: [
      {
        id: "java",
        course: "Java",
        topics: [{ id: "stream", title: "Stream", description: "Stream을 학습했다." }],
        assignments: [
          {
            id: "java-task",
            title: "Java 과제",
            description: "컬렉션 변환",
            status: "in-progress",
            links: [],
          },
        ],
      },
    ],
    projectUpdates: [],
    reflection: "",
  },
];

test("filterTilOverview: 선택한 수업의 과제와 일일 기록만 반환한다", () => {
  const filtered = filterTilOverview(buildTilOverview(records), "Spring");

  assert.equal(filtered.selectedCourse, "Spring");
  assert.deepEqual(filtered.assignmentsByCourse.map((group) => group.course), ["Spring"]);
  assert.deepEqual(filtered.records.map((record) => record.date), ["2026-09-10"]);
});

test("filterTilOverview: 존재하지 않는 수업은 전체 보기로 복구한다", () => {
  const overview = buildTilOverview(records);
  const filtered = filterTilOverview(overview, "Unknown");

  assert.equal(filtered.selectedCourse, null);
  assert.equal(filtered.records.length, 2);
  assert.equal(filtered.assignmentsByCourse.length, 2);
});

test("assignmentStatusMessageId: 세 과제 상태를 서로 다른 번역 키로 매핑한다", () => {
  assert.equal(assignmentStatusMessageId("completed"), "til.statusCompleted");
  assert.equal(assignmentStatusMessageId("in-progress"), "til.statusInProgress");
  assert.equal(assignmentStatusMessageId("needs-review"), "til.statusNeedsReview");
});
