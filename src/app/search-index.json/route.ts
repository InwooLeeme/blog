import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/posts";

export const dynamic = "force-static";

export function GET() {
  const posts = getAllPosts();
  const items = posts.map(({ slug, meta }) => ({
    slug,
    meta: {
      title: meta.title,
      summary: meta.summary ?? "",
      tags: meta.tags ?? [],
      date: meta.date,
    },
  }));
  return NextResponse.json(items);
}
