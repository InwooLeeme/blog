import assert from "node:assert/strict";
import test from "node:test";
import * as ko from "./about.ts";
import * as en from "./about.en.ts";

const BUNDLES = [
  ["ko", ko],
  ["en", en],
] as const;

test("currentStatus: 두 언어 모두 비어 있지 않은 문자열이다", () => {
  for (const [locale, bundle] of BUNDLES) {
    assert.equal(
      typeof bundle.currentStatus,
      "string",
      `${locale}: currentStatus가 문자열이 아님`,
    );
    assert.ok(
      bundle.currentStatus.trim().length > 0,
      `${locale}: currentStatus가 비어 있음`,
    );
  }
});

test("projects: 임팩트순으로 정렬된다", () => {
  assert.deepEqual(
    ko.projects.map((p) => p.name),
    [
      "MCP Assistant",
      "NASDAQ 주가 데이터 시각화",
      "개발자 소득 분석 파이프라인",
      "AI 포트폴리오 챗봇",
      "개인 알고리즘·기술 블로그",
      "Daum 뉴스 크롤러",
    ],
  );
  assert.deepEqual(
    en.projects.map((p) => p.name),
    [
      "MCP Assistant",
      "NASDAQ Stock Data Visualization",
      "Developer Income Analysis Pipeline",
      "AI Portfolio Chatbot",
      "Personal Algorithm & Dev Blog",
      "Daum News Crawler",
    ],
  );
});

test("projects: ko/en 구조가 1:1로 대응한다", () => {
  assert.equal(ko.projects.length, en.projects.length, "프로젝트 개수 불일치");
  ko.projects.forEach((k, i) => {
    const e = en.projects[i];
    assert.equal(
      k.highlights.length,
      e.highlights.length,
      `${k.name}: highlights 개수 불일치`,
    );
    assert.equal(k.tech?.length ?? 0, e.tech?.length ?? 0, `${k.name}: tech 개수 불일치`);
    assert.deepEqual(
      k.links?.map((l) => l.href),
      e.links?.map((l) => l.href),
      `${k.name}: link href 불일치`,
    );
    assert.equal(k.accent, e.accent, `${k.name}: accent 불일치`);
    assert.equal(k.image, e.image, `${k.name}: image 불일치`);
  });
});
