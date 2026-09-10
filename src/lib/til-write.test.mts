import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { TilRecord } from "./til.ts";
import {
  isAllowedTilOrigin,
  isTilWriteEnabled,
  readTilRecordForWrite,
  tilRecordPath,
  writeTilRecord,
} from "./til-write.ts";

const record: TilRecord = {
  version: 1,
  date: "2026-09-10",
  summary: "Spring 핵심 개념을 실습했다.",
  lessons: [
    {
      id: "spring",
      course: "Spring",
      topics: [{ id: "bean", title: "Bean", description: "Bean 생명주기를 확인했다." }],
      assignments: [],
    },
  ],
  projectUpdates: [],
  reflection: "",
};

test("isTilWriteEnabled: 명시한 비-production 쓰기 모드에서만 허용한다", () => {
  assert.equal(isTilWriteEnabled({ NODE_ENV: "development", TIL_WRITE_MODE: "1" }), true);
  assert.equal(isTilWriteEnabled({ NODE_ENV: "production", TIL_WRITE_MODE: "1" }), false);
  assert.equal(isTilWriteEnabled({ NODE_ENV: "development", TIL_WRITE_MODE: "true" }), false);
  assert.equal(isTilWriteEnabled({ NODE_ENV: "test" }), false);
});

test("isAllowedTilOrigin: 같은 loopback Host의 요청만 허용한다", () => {
  assert.equal(
    isAllowedTilOrigin("http://127.0.0.1:3002", "127.0.0.1:3002"),
    true,
  );
  assert.equal(
    isAllowedTilOrigin("http://localhost:3002", "localhost:3002"),
    true,
  );
  assert.equal(
    isAllowedTilOrigin("https://evil.example", "127.0.0.1:3002"),
    false,
  );
  assert.equal(
    isAllowedTilOrigin("http://evil.example:3002", "evil.example:3002"),
    false,
  );
  assert.equal(isAllowedTilOrigin(null, "127.0.0.1:3002"), false);
});

test("tilRecordPath: 검증된 날짜를 daily 폴더 아래 파일로만 변환한다", () => {
  assert.equal(
    tilRecordPath("/tmp/blog", "2026-09-10"),
    path.join("/tmp/blog", "content", "til", "daily", "2026-09-10.json"),
  );
  assert.throws(() => tilRecordPath("/tmp/blog", "../../secret"), /날짜/);
});

test("writeTilRecord: 기존 날짜를 원자적으로 교체하고 다시 읽는다", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "til-write-"));
  try {
    const firstPath = writeTilRecord(root, record);
    assert.equal(firstPath, tilRecordPath(root, record.date));
    assert.equal(readTilRecordForWrite(root, record.date)?.summary, record.summary);

    writeTilRecord(root, { ...record, summary: "수정한 학습 요약" });
    assert.equal(readTilRecordForWrite(root, record.date)?.summary, "수정한 학습 요약");
    assert.deepEqual(
      fs.readdirSync(path.dirname(firstPath)).filter((name) => name.includes(".tmp")),
      [],
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("writeTilRecord: 검증에 실패한 데이터는 파일로 남기지 않는다", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "til-write-invalid-"));
  try {
    assert.throws(
      () => writeTilRecord(root, { ...record, lessons: [] }),
      /하나 이상의 수업/,
    );
    assert.equal(fs.existsSync(path.join(root, "content", "til", "daily")), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
