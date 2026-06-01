import { getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

// 빌드 시 정적 생성
export const dynamic = "force-static";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const posts = getAllPosts();
  const site = siteConfig.url.replace(/\/$/, "");

  const items = posts
    .map((post) => {
      const url = `${site}/blog/${post.slug}`;
      const pubDate = new Date(post.meta.date).toUTCString();
      const description = post.meta.summary ?? "";
      const categories = (post.meta.tags ?? [])
        .map((t) => `      <category>${escapeXml(t)}</category>`)
        .join("\n");
      return `    <item>
      <title>${escapeXml(post.meta.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>
${categories}
    </item>`;
    })
    .join("\n");

  const lastBuildDate = posts.length
    ? new Date(posts[0].meta.date).toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${site}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>ko</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${site}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
