import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/posts";
import { getNoteSlugs, getNoteBySlug } from "@/lib/notes";

export const dynamic = "force-static";

export function GET() {
  const postItems = getAllPosts().map(({ slug, meta }) => ({
    type: "post" as const,
    slug,
    title: meta.title,
    summary: meta.summary ?? "",
    tags: meta.tags ?? [],
  }));

  const noteItems = getNoteSlugs().map((slug) => {
    const note = getNoteBySlug(slug);
    return {
      type: "note" as const,
      slug: slug.map(encodeURIComponent).join("/"),
      title: note?.meta.title ?? slug[slug.length - 1],
      summary: note?.meta.description ?? "",
      tags: [] as string[],
    };
  });

  return NextResponse.json([...postItems, ...noteItems]);
}
