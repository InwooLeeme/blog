import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
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

/** CDATA 안에 원문 그대로 담을 때 종료 시퀀스만 이스케이프한다. */
function escapeCdata(value: string): string {
  return value.replace(/]]>/g, "]]]]><![CDATA[>");
}

// MDX 본문을 RSS용 HTML로 변환 — JSX 커스텀 컴포넌트(Callout 등)는 원본 태그 그대로 통과되고,
// 코드 하이라이팅(rehype-pretty-code)·수식(katex)은 피드에서 별도 스타일시트를 못 불러오므로 적용하지 않는다.
const rssProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeStringify);

function mdxToFeedHtml(content: string, site: string): string {
  const html = String(rssProcessor.processSync(content));
  // 사이트 내부 상대 경로(이미지·링크)는 피드 리더에서도 열리도록 절대 URL로 바꾼다.
  return html.replace(/(href|src)="\/(?!\/)/g, `$1="${site}/`);
}

export function GET() {
  const posts = getAllPosts();
  const site = siteConfig.url.replace(/\/$/, "");

  const items = posts
    .map((post) => {
      const url = `${site}/blog/${post.slug}`;
      const pubDate = new Date(post.meta.date).toUTCString();
      const description = post.meta.summary ?? "";
      const contentHtml = mdxToFeedHtml(post.content ?? "", site);
      const categories = (post.meta.tags ?? [])
        .map((t) => `      <category>${escapeXml(t)}</category>`)
        .join("\n");
      return `    <item>
      <title>${escapeXml(post.meta.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>
      <content:encoded><![CDATA[${escapeCdata(contentHtml)}]]></content:encoded>
${categories}
    </item>`;
    })
    .join("\n");

  const lastBuildDate = posts.length
    ? new Date(posts[0].meta.date).toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
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
