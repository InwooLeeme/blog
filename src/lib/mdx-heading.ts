/** 페이지 제목 아래의 MDX 본문은 h1을 다시 만들지 않도록 한 단계 내린다. */
export function normalizeMdxHeadingLevel(level: number): number {
  return level === 1 ? 2 : level;
}

function normalizeHeadingText(value: string): string {
  return value.replace(/\s+#+\s*$/, "").replace(/\s+/g, " ").trim();
}

/** 글 메타와 같은 첫 번째 일반 Markdown 제목만 제거해 연속 제목 노출을 막는다. */
export function stripRedundantLeadHeading(
  content: string,
  meta: { title: string; summary?: string },
): string {
  const lines = content.split("\n");
  const firstContentIndex = lines.findIndex((line) => line.trim().length > 0);
  if (firstContentIndex < 0) return content;

  const match = lines[firstContentIndex].match(/^\s{0,3}#{1,6}\s+(.+?)\s*$/);
  if (!match) return content;

  const heading = normalizeHeadingText(match[1]);
  const candidates = [meta.title, meta.summary]
    .filter((value): value is string => Boolean(value))
    .map(normalizeHeadingText);
  if (!candidates.includes(heading)) return content;

  lines.splice(firstContentIndex, 1);
  if (lines[firstContentIndex]?.trim() === "") lines.splice(firstContentIndex, 1);
  return lines.join("\n");
}
