import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Verify rendered artifacts, not source text. Run after `npm run build`.
const page = readFileSync(new URL("../.next/server/app/playground/pathfinding.html", import.meta.url), "utf8");
const entry = readFileSync(new URL("../.next/server/app/playground.html", import.meta.url), "utf8");
const sitemap = readFileSync(new URL("../.next/server/app/sitemap.xml.body", import.meta.url), "utf8");
const cells = page.match(/<button\b[^>]*role="gridcell"[^>]*>/g) ?? [];
assert.equal(cells.length, 315, "21×15 격자를 서버에서 렌더링해야 합니다");
assert.equal(cells.filter((cell) => cell.includes('tabindex="0"')).length, 1, "격자는 하나의 탭 진입점만 가져야 합니다");
assert.match(page, /aria-label="8행 4열, 시작점"/);
assert.match(page, /aria-label="8행 18열, 도착점"/);
assert.match(page, /rel="canonical" href="[^"]*\/playground\/pathfinding"/);
assert.match(entry, /href="\/playground\/pathfinding"/);
assert.ok(/<loc>[^<]*\/playground\/pathfinding<\/loc>/.test(sitemap), "새 공개 실험 경로가 사이트맵에 있어야 합니다");
console.log("Pathfinding build: grid, keyboard entry, endpoints, canonical, entry link and sitemap verified");
