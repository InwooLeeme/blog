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
