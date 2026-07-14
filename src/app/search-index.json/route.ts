import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/posts";
import { getNoteSlugs, getNoteBySlug } from "@/lib/notes";

export const dynamic = "force-static";

const BODY_EXCERPT_LENGTH = 3000;

/** MDX 본문에서 코드블록/태그/마크다운 기호를 걷어내 검색용 평문 발췌를 만든다. */
function toBodyExcerpt(mdx: string): string {
  const plain = mdx
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain.slice(0, BODY_EXCERPT_LENGTH);
}

export function GET() {
  const postItems = getAllPosts().map(({ slug, meta, content }) => ({
    type: "post" as const,
    slug,
    title: meta.title,
    summary: meta.summary ?? "",
    tags: meta.tags ?? [],
    body: content ? toBodyExcerpt(content) : "",
  }));

  const noteItems = getNoteSlugs().map((slug) => {
    const note = getNoteBySlug(slug);
    return {
      type: "note" as const,
      slug: slug.map(encodeURIComponent).join("/"),
      title: note?.meta.title ?? slug[slug.length - 1],
      summary: note?.meta.description ?? "",
      tags: [] as string[],
      body: note?.content ? toBodyExcerpt(note.content) : "",
    };
  });

  return NextResponse.json([...postItems, ...noteItems]);
}
