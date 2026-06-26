#!/usr/bin/env node
// draft 글을 골라 draft:false 로 바꾸고 커밋 → main 에 push 한다(= Vercel 자동 배포).
// 글 작성은 직접, 발행(마지막 git 과정)만 자동화한다.
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

const rl = createInterface({ input: stdin, output: stdout });
const ask = async (q) => (await rl.question(q)).trim();
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();

// frontmatter 의 한 줄짜리 `key: ...` 값을 읽는다(따옴표 제거).
function readField(text, key) {
  const m = text.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
}

function listDrafts() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => ({ file: f, full: path.join(POSTS_DIR, f), text: fs.readFileSync(path.join(POSTS_DIR, f), "utf8") }))
    .filter((p) => readField(p.text, "draft") === "true");
}

async function main() {
  // 글 발행은 main 에서만 — 피처 브랜치에 글 커밋을 섞지 않도록 막는다.
  const branch = git("rev-parse", "--abbrev-ref", "HEAD");
  if (branch !== "main") {
    console.log(`현재 브랜치는 '${branch}' 입니다. 발행은 main 에서 하세요: git checkout main`);
    rl.close();
    return;
  }

  const drafts = listDrafts();
  if (drafts.length === 0) {
    console.log("발행할 draft 글이 없습니다. (frontmatter 의 draft: true 인 글)");
    rl.close();
    return;
  }

  console.log("\n발행할 draft 글:");
  drafts.forEach((p, i) => console.log(`  ${i + 1}. ${readField(p.text, "title") || p.file}  (${p.file})`));
  const pick = Number(await ask("\n번호 선택: "));
  const target = drafts[pick - 1];
  if (!target) {
    console.log("잘못된 선택입니다. 종료합니다.");
    rl.close();
    return;
  }

  const title = readField(target.text, "title") || path.basename(target.file, ".mdx");
  const ok = (await ask(`\n"${title}" 발행할까요? draft 해제 → 커밋 → main push (y/n): `)).toLowerCase();
  if (ok !== "y") {
    console.log("취소했습니다.");
    rl.close();
    return;
  }
  rl.close();

  // draft: true → false (frontmatter 한 줄만 교체)
  fs.writeFileSync(target.full, target.text.replace(/^draft:\s*true\s*$/m, "draft: false"), "utf8");

  const rel = path.relative(process.cwd(), target.full).replace(/\\/g, "/");
  git("add", rel);
  git("commit", "-m", `post : ${title}`);
  git("push", "origin", "main");

  console.log(`\n발행 완료: ${title}\nVercel 이 자동 배포합니다.`);
}

main();
