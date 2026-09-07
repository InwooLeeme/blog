import assert from "node:assert/strict";
import test from "node:test";
import { formatMessage, messages } from "./i18n.ts";

const requiredKeys = [
  "nav.profile",
  "nav.notes",
  "nav.playground",
  "nav.graph",
  "landing.blogCta",
  "landing.notesCta",
  "series.label",
] as const;

test("navigation, CTA, and series labels exist in both locales", () => {
  for (const locale of ["ko", "en"] as const) {
    const localeMessages = messages[locale] as Record<string, string>;
    for (const key of requiredKeys) {
      assert.ok(localeMessages[key], `${locale}.${key} is required`);
    }
  }
});

test("reading time uses locale-specific templates", () => {
  assert.equal(formatMessage(messages.ko["post.readingTime"], { n: 3 }), "3분");
  assert.equal(formatMessage(messages.en["post.readingTime"], { n: 3 }), "3 min");
});
