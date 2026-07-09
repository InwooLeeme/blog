import assert from "node:assert/strict";
import test from "node:test";
import {
  getNextLocale,
  shouldAnimateLanguageTransition,
} from "./language-transition.ts";

test("getNextLocale toggles between Korean and English", () => {
  assert.equal(getNextLocale("ko"), "en");
  assert.equal(getNextLocale("en"), "ko");
});

test("animation requires View Transition support", () => {
  assert.equal(
    shouldAnimateLanguageTransition({
      supportsViewTransition: true,
      prefersReducedMotion: false,
    }),
    true,
  );
  assert.equal(
    shouldAnimateLanguageTransition({
      supportsViewTransition: false,
      prefersReducedMotion: false,
    }),
    false,
  );
});

test("reduced motion disables animation", () => {
  assert.equal(
    shouldAnimateLanguageTransition({
      supportsViewTransition: true,
      prefersReducedMotion: true,
    }),
    false,
  );
});
