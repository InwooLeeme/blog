import assert from "node:assert/strict";
import test from "node:test";
import { isScrollTopVisible, nextHeaderScrolled } from "./scroll-visibility.ts";

test("nextHeaderScrolled: preserves the 40px on and 16px off hysteresis", () => {
  assert.equal(nextHeaderScrolled(false, 40), false);
  assert.equal(nextHeaderScrolled(false, 41), true);
  assert.equal(nextHeaderScrolled(true, 16), true);
  assert.equal(nextHeaderScrolled(true, 15), false);
});

test("isScrollTopVisible: becomes visible only above the 400px threshold", () => {
  assert.equal(isScrollTopVisible(400), false);
  assert.equal(isScrollTopVisible(401), true);
});
