import { siteConfig } from "./site";
import type { PostMeta } from "./posts";

const SITE = siteConfig.url; // 끝에 슬래시 없음

/** 글 상세 — schema.org BlogPosting */
export function buildBlogPostingJsonLd(slug: string, meta: PostMeta) {
  const url = `${SITE}/blog/${slug}`;
  // 이미지: cover 우선, 없으면 동적 OG 라우트 (둘 다 절대 URL)
  const image = meta.cover
    ? `${SITE}${meta.cover}`
    : `${SITE}/blog/${slug}/opengraph-image`;
  const author = { "@type": "Person", name: siteConfig.author, url: SITE };

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: meta.title,
    ...(meta.summary ? { description: meta.summary } : {}),
    datePublished: meta.date,
    dateModified: meta.date,
    image,
    author,
    publisher: author,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    ...(meta.tags?.length ? { keywords: meta.tags.join(", ") } : {}),
  };
}

/** 글 상세 — 빵부스러기 경로 (Blog → 글 제목) */
export function buildBreadcrumbJsonLd(slug: string, title: string) {
  const items = [
    { name: "Blog", url: `${SITE}/blog` },
    { name: title, url: `${SITE}/blog/${slug}` },
  ];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

/** 노트 상세 — schema.org TechArticle */
export function buildNoteArticleJsonLd(
  slug: string[],
  meta: { title?: string; description?: string },
) {
  const path = slug.map(encodeURIComponent).join("/");
  const url = `${SITE}/notes/${path}`;
  const author = { "@type": "Person", name: siteConfig.author, url: SITE };

  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: meta.title ?? slug[slug.length - 1],
    ...(meta.description ? { description: meta.description } : {}),
    author,
    publisher: author,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
  };
}

/** 노트 상세 — 빵부스러기 경로 (Notes → 카테고리... → 제목) */
export function buildNoteBreadcrumbJsonLd(slug: string[], title: string) {
  const items = [{ name: "Notes", url: `${SITE}/notes` }];
  const acc: string[] = [];
  for (const segment of slug.slice(0, -1)) {
    acc.push(segment);
    items.push({
      name: segment,
      url: `${SITE}/notes/${acc.map(encodeURIComponent).join("/")}`,
    });
  }
  items.push({
    name: title,
    url: `${SITE}/notes/${slug.map(encodeURIComponent).join("/")}`,
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

/** 홈 — 사이트 식별 */
export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: SITE,
    description: siteConfig.description,
  };
}

/** 홈 — 저자 정보 */
export function buildPersonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.author,
    url: SITE,
    sameAs: [siteConfig.githubUrl, siteConfig.solvedacUrl],
  };
}
