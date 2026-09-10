import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  buildTilOverview,
  summarizeTilRecord,
  validateTilRecord,
  type TilRecord,
} from "./til.ts";
import { getAllTilRecords, getTilRecord } from "./til-files.ts";

const validRecord: TilRecord = {
  version: 1,
  date: "2026-09-10",
  summary: "Spring의 의존성 주입과 Bean 생명주기를 학습했다.",
  lessons: [
    {
      id: "lesson-spring",
      course: "Spring",
      topics: [
        {
          id: "topic-di",
          title: "의존성 주입",
          description: "객체가 사용할 의존성을 외부에서 전달받는 방식을 실습했다.",
          code: { language: "java", content: "class MemberService {}" },
          question: "생성자 주입을 권장하는 이유는 무엇일까?",
        },
      ],
      assignments: [
        {
          id: "assignment-member-api",
          title: "회원 관리 API",
          description: "회원 생성과 조회 API를 구현했다.",
          status: "completed",
          links: [{ label: "GitHub", url: "https://github.com/example/member-api" }],
        },
      ],
    },
  ],
  projectUpdates: [
    {
      id: "update-market-api",
      projectId: "skala-market",
      projectName: "SKALA Market",
      progress: "상품 API의 요청과 응답 구조를 설계했다.",
      decisions: "상품 상태는 enum으로 관리하기로 했다.",
      blockers: "검색 조건의 범위를 팀과 추가로 합의해야 한다.",
      nextSteps: "상품 목록 API를 구현한다.",
      links: [{ label: "Repository", url: "https://github.com/example/market" }],
    },
  ],
  reflection: "직접 생명주기 로그를 확인하니 호출 순서가 명확해졌다.",
};

test("validateTilRecord: 올바른 일일 기록을 허용한다", () => {
  const result = validateTilRecord(validRecord);
  assert.equal(result.ok, true);
});

test("validateTilRecord: 경로로 악용할 수 있거나 존재하지 않는 날짜를 거부한다", () => {
  assert.equal(validateTilRecord({ ...validRecord, date: "../../secret" }).ok, false);
  assert.equal(validateTilRecord({ ...validRecord, date: "2026-02-30" }).ok, false);
});

test("validateTilRecord: 빈 수업과 학습 주제를 거부한다", () => {
  assert.equal(validateTilRecord({ ...validRecord, lessons: [] }).ok, false);
  assert.equal(
    validateTilRecord({
      ...validRecord,
      lessons: [{ ...validRecord.lessons[0], topics: [] }],
    }).ok,
    false,
  );
});

test("validateTilRecord: http 또는 https가 아닌 링크를 거부한다", () => {
  const record = structuredClone(validRecord);
  record.lessons[0].assignments[0].links = [
    { label: "로컬 파일", url: "file:///etc/passwd" },
  ];

  const result = validateTilRecord(record);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.errors.join("\n"), /URL/);
});

test("getAllTilRecords: 유효한 JSON만 읽어 최신 날짜순으로 정렬한다", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "til-loader-"));
  const directory = path.join(root, "content", "til", "daily");
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(
    path.join(directory, "2026-09-09.json"),
    JSON.stringify({ ...validRecord, date: "2026-09-09" }),
  );
  fs.writeFileSync(path.join(directory, "2026-09-10.json"), JSON.stringify(validRecord));
  fs.writeFileSync(path.join(directory, "broken.json"), "not json");

  try {
    assert.deepEqual(
      getAllTilRecords(root).map((record) => record.date),
      ["2026-09-10", "2026-09-09"],
    );
    assert.equal(getTilRecord("2026-09-10", root)?.summary, validRecord.summary);
    assert.equal(getTilRecord("../../secret", root), null);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("buildTilOverview: 수업 과제와 프로젝트의 날짜별 진행 내용을 집계한다", () => {
  const older: TilRecord = {
    ...structuredClone(validRecord),
    date: "2026-09-09",
    lessons: [
      {
        ...structuredClone(validRecord.lessons[0]),
        assignments: [
          {
            id: "assignment-bean-log",
            title: "Bean 로그 확인",
            description: "초기화와 소멸 로그를 확인했다.",
            status: "completed",
            links: [],
          },
        ],
      },
    ],
    projectUpdates: [
      {
        ...structuredClone(validRecord.projectUpdates[0]),
        id: "update-market-erd",
        progress: "ERD 초안을 만들었다.",
      },
    ],
  };

  const overview = buildTilOverview([validRecord, older]);

  assert.deepEqual(overview.courses, ["Spring"]);
  assert.equal(overview.days, 2);
  assert.equal(overview.totalAssignments, 2);
  assert.equal(overview.completedAssignments, 2);
  assert.equal(overview.assignmentsByCourse[0].assignments[0].date, "2026-09-10");
  assert.deepEqual(
    overview.projects[0].updates.map((update) => update.date),
    ["2026-09-09", "2026-09-10"],
  );
});

test("buildTilOverview: 과제가 없는 수업도 필터 목록에 포함한다", () => {
  const record = structuredClone(validRecord);
  record.lessons[0].assignments = [];

  const overview = buildTilOverview([record]);

  assert.deepEqual(overview.courses, ["Spring"]);
  assert.deepEqual(overview.assignmentsByCourse, [
    { course: "Spring", assignments: [] },
  ]);
});

test("buildTilOverview: 프로젝트가 이름을 바꾼 경우 가장 최신 이름을 표시한다", () => {
  const newest = structuredClone(validRecord);
  newest.projectUpdates[0].projectName = "최신 프로젝트 이름";
  const older = structuredClone(validRecord);
  older.date = "2026-09-09";
  older.projectUpdates[0].projectName = "이전 프로젝트 이름";

  const overview = buildTilOverview([older, newest]);

  assert.equal(overview.projects[0].name, "최신 프로젝트 이름");
});

test("summarizeTilRecord: 긴 요약을 카드 길이로 자른다", () => {
  const summary = summarizeTilRecord({
    ...validRecord,
    summary: "가".repeat(100),
  });

  assert.equal(summary, `${"가".repeat(77)}…`);
});
