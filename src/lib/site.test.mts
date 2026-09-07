import assert from "node:assert/strict";
import test from "node:test";
import { messages } from "./i18n.ts";
import { navLinks, resolveNavLabel } from "./site.ts";

test("resolveNavLabel localizes the Profile navigation item", () => {
  const profile = navLinks.find((link) => link.href === "/about");
  assert.ok(profile);
  assert.equal(
    resolveNavLabel(profile, (id) => messages.ko[id]),
    "프로필",
  );
});

test("resolveNavLabel falls back to the static label", () => {
  assert.equal(
    resolveNavLabel({ href: "/custom", label: "Custom" }, () => "번역"),
    "Custom",
  );
});
