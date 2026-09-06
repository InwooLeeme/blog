import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const PAGE_HTML = path.join(process.cwd(), ".next", "server", "app", "about.html");
const SEARCH_DIALOG_MARKER = "search-results-listbox";
const SEARCH_LOADING_MARKER = "search-dialog-loading";
const SEARCH_FALLBACK_CLOSE_MARKER = "search-dialog-fallback-close";

assert.ok(
  fs.existsSync(PAGE_HTML),
  "Build output is missing. Run `npm run build` before this check.",
);

const html = fs.readFileSync(PAGE_HTML, "utf8");
const initialScripts = [
  ...html.matchAll(/<script src="\/_next\/(static\/chunks\/[^\"]+\.js)" async/g),
].map((match) => match[1]);

assert.ok(initialScripts.length > 0, "No initial scripts were found in the build output.");

const initialSource = initialScripts
  .map((script) => fs.readFileSync(path.join(process.cwd(), ".next", script), "utf8"))
  .join("\n");

assert.ok(
  !initialSource.includes(SEARCH_DIALOG_MARKER),
  "The search dialog UI is still included in the initial page scripts.",
);
assert.ok(
  initialSource.includes(SEARCH_LOADING_MARKER),
  "The initial scripts do not include an accessible search loading fallback.",
);
assert.ok(
  initialSource.includes(SEARCH_FALLBACK_CLOSE_MARKER),
  "The search loading fallback does not include a close control.",
);

const chunkDir = path.join(process.cwd(), ".next", "static", "chunks");
const allChunks = fs
  .readdirSync(chunkDir)
  .filter((name) => name.endsWith(".js"))
  .map((name) => fs.readFileSync(path.join(chunkDir, name), "utf8"));

assert.ok(
  allChunks.some((source) => source.includes(SEARCH_DIALOG_MARKER)),
  "The search dialog UI is missing from the client build.",
);
