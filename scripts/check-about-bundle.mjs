import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

const ABOUT_HTML = path.join(process.cwd(), ".next", "server", "app", "about.html");
const INITIAL_JS_GZIP_BUDGET = 235_000;

assert.ok(
  fs.existsSync(ABOUT_HTML),
  "About build output is missing. Run `npm run build` before this check.",
);

const html = fs.readFileSync(ABOUT_HTML, "utf8");
const scripts = [
  ...html.matchAll(/<script src="\/_next\/(static\/chunks\/[^\"]+\.js)" async/g),
].map((match) => match[1]);

assert.ok(scripts.length > 0, "No initial About scripts were found in the build output.");

const gzipBytes = scripts.reduce((total, script) => {
  const source = fs.readFileSync(path.join(process.cwd(), ".next", script));
  return total + gzipSync(source).length;
}, 0);

console.log(`About initial JavaScript: ${gzipBytes} gzip bytes`);
assert.ok(
  gzipBytes < INITIAL_JS_GZIP_BUDGET,
  `About initial JavaScript exceeds ${INITIAL_JS_GZIP_BUDGET} gzip bytes`,
);
