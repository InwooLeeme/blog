import assert from "node:assert/strict";
import test from "node:test";
import { getReadingProgress, isPostDetailPath } from "./reading-progress.ts";

test("progress is limited to blog post detail routes", () => {
  for (const path of ["/blog/example", "/blog/example/"]) {
    assert.equal(isPostDetailPath(path), true);
  }
  for (const path of ["/", "/blog", "/blog/", "/blog/series", "/blog/series/", "/blog/series/name", "/blog/tags", "/blog/tags/react", "/notes/example", "/about"]) {
    assert.equal(isPostDetailPath(path), false, path);
  }
});

test("progress starts when the body reaches the header, not the page top", () => {
  assert.equal(getReadingProgress({ top: 400, bottom: 2144 }, 800, 56), 0);
  assert.equal(getReadingProgress({ top: 56, bottom: 1800 }, 800, 56), 0);
});

test("progress follows the body until its bottom reaches the viewport bottom", () => {
  assert.equal(getReadingProgress({ top: -444, bottom: 1300 }, 800, 56), 0.5);
  assert.equal(getReadingProgress({ top: -944, bottom: 800 }, 800, 56), 1);
  assert.equal(getReadingProgress({ top: -1944, bottom: -200 }, 800, 56), 1);
});

test("short bodies finish when fully visible without division by zero", () => {
  assert.equal(getReadingProgress({ top: 500, bottom: 900 }, 800, 56), 0);
  assert.equal(getReadingProgress({ top: 400, bottom: 800 }, 800, 56), 1);
  assert.equal(getReadingProgress({ top: 56, bottom: 800 }, 800, 56), 1);
});

test("empty bodies and unusable viewports do not report progress", () => {
  assert.equal(getReadingProgress({ top: 400, bottom: 400 }, 800, 56), 0);
  assert.equal(getReadingProgress({ top: 0, bottom: 1000 }, 56, 56), 0);
});

test("viewport and content resizing recalculate the same reading position", () => {
  assert.equal(getReadingProgress({ top: -444, bottom: 1300 }, 1300, 56), 1);
  assert.equal(getReadingProgress({ top: -444, bottom: 2300 }, 800, 56), 0.25);
});
