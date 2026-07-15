#!/usr/bin/env node
// AtCoder 풀이 글의 보일러플레이트(frontmatter + ProblemMeta + 코드블록 + Complexity)를 생성한다.
// 설명/총평은 직접 채워야 한다(draft: true로 생성되어 발행 목록에는 노출되지 않음).
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import fs from "node:fs";
import path from "node:path";

const rl = createInterface({ input: stdin, output: stdout });
const ask = async (question, fallback = "") => {
  const answer = (await rl.question(fallback ? `${question} (${fallback}): ` : `${question}: `)).trim();
  return answer || fallback;
};

const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣]+/g, "_")
    .replace(/^_+|_+$/g, "");

async function readProblems() {
  const problems = [];
  console.log("\n문제를 추가합니다. URL을 빈 값으로 입력하면 종료합니다.");
  while (true) {
    const link = await ask(`\n[문제 ${problems.length + 1}] AtCoder 문제 URL`);
    if (!link) break;

    const title = await ask("문제 제목 (예: A - Problem Name)");
    const tags = await ask("태그 (콤마 구분)");
    const codePath = await ask("풀이 코드 파일 경로 (없으면 Enter)");

    let code = "";
    let lang = "";
    if (codePath) {
      lang = await ask("코드 언어", path.extname(codePath).slice(1) || "cpp");
      try {
        code = fs.readFileSync(codePath, "utf8").trimEnd();
      } catch {
        console.log(`  ! ${codePath} 를 읽을 수 없어 코드 없이 진행합니다.`);
      }
    }

    const time = await ask("시간복잡도 (예: O(N), 없으면 Enter)");
    problems.push({ link, title, tags, lang, code, time });
  }
  return problems;
}

function buildProblemBlock({ link, title, tags, lang, code, time }) {
  const lines = [`<ProblemMeta platform="AtCoder" link="${link}" title="${title}" tags="${tags}" />`, "", "TODO: 풀이 설명"];
  if (code) lines.push("", "```" + (lang || "cpp") + " showLineNumbers", code, "```");
  if (time) lines.push("", `<Complexity time="${time}" />`);
  return lines.join("\n");
}

async function main() {
  const title = await ask("글 제목 (예: AtCoder Weekday Contest 077)");
  if (!title) {
    console.log("제목이 필요합니다. 종료합니다.");
    rl.close();
    return;
  }
  const series = await ask("시리즈명", "AtCoder Weekday Contest");
  const date = await ask("날짜 (YYYY-MM-DD)", new Date().toISOString().slice(0, 10));
  const slug = await ask("파일명(slug)", slugify(title));

  const problems = await readProblems();
  rl.close();

  if (problems.length === 0) {
    console.log("\n추가된 문제가 없어 종료합니다.");
    return;
  }

  const frontmatter = ["---", `title: "${title}"`, `date: "${date}"`, `summary: "${title} 풀이"`, "tags: [AtCoder]", `series: "${series}"`, "draft: true", 'cover: ""', "---"].join(
    "\n",
  );

  const body = problems.map(buildProblemBlock).join("\n\n");
  const content = `${frontmatter}\n\n${body}\n\n### 총평\n\nTODO\n`;

  const outPath = path.join(process.cwd(), "content", "posts", `${slug}.mdx`);
  if (fs.existsSync(outPath)) {
    console.log(`\n이미 존재합니다: ${path.relative(process.cwd(), outPath)}`);
    return;
  }
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, content, "utf8");
  console.log(`\n생성됨: ${path.relative(process.cwd(), outPath)} (draft: true — 작성 끝나면 false로 바꾸세요)`);
}

main();
