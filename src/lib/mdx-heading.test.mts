import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeMdxHeadingLevel,
  stripRedundantLeadHeading,
} from "./mdx-heading.ts";

test("normalizeMdxHeadingLevel demotes body h1 to h2", () => {
  assert.equal(normalizeMdxHeadingLevel(1), 2);
  assert.equal(normalizeMdxHeadingLevel(2), 2);
  assert.equal(normalizeMdxHeadingLevel(3), 3);
});

test("stripRedundantLeadHeading removes a first heading equal to the summary", () => {
  const content = "\n## AtCoder Weekday Contest 001 풀이\n\n본문입니다.";
  assert.equal(
    stripRedundantLeadHeading(content, {
      title: "AtCoder Weekday Contest 001",
      summary: "AtCoder Weekday Contest 001 풀이",
    }),
    "\n본문입니다.",
  );
});

test("stripRedundantLeadHeading preserves a meaningful first section", () => {
  const content = "\n## 문제\n\n본문입니다.";
  assert.equal(
    stripRedundantLeadHeading(content, {
      title: "너비 우선 탐색",
      summary: "BFS를 알아봅니다.",
    }),
    content,
  );
});
