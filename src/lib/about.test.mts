import assert from "node:assert/strict";
import test from "node:test";
import * as ko from "./about.ts";
import * as en from "./about.en.ts";
import { getPostSlugs } from "./posts.ts";

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

test("projects: 내부 링크는 type이 post이고 실제 글 파일을 가리킨다", () => {
  const slugs = new Set(getPostSlugs().map((f) => f.replace(/\.mdx$/, "")));

  const internal = ko.projects.flatMap((p) =>
    (p.links ?? []).filter((l) => !/^https?:\/\//.test(l.href)),
  );
  assert.ok(internal.length > 0, "내부 블로그 링크가 하나도 없음");

  for (const l of internal) {
    assert.equal(l.type, "post", `${l.href}: 내부 링크는 type이 "post"여야 함`);
    assert.ok(l.href.startsWith("/blog/"), `${l.href}: /blog/ 로 시작해야 함`);
    const slug = l.href.slice("/blog/".length);
    assert.ok(slugs.has(slug), `${l.href}: content/posts/${slug}.mdx 가 없음`);
  }
});

test("projects: 예상한 블로그 글 링크가 모두 연결돼 있다", () => {
  const postHrefs = ko.projects
    .flatMap((p) => p.links ?? [])
    .filter((l) => l.type === "post")
    .map((l) => l.href)
    .sort();

  assert.deepEqual(postHrefs, [
    "/blog/lighthouse_mobile_performance",
    "/blog/mcp_assistant",
    "/blog/nasdaq_pattern_chart",
    "/blog/nextjs_dynamic_params_decoding",
  ]);
});
