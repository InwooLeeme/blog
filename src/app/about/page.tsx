import type { Metadata } from "next";

const GITHUB_USERNAME = "InwooLeeme";
const README_API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_USERNAME}/readme`;
const RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_USERNAME}/HEAD`;

export const metadata: Metadata = {
  title: "About",
  description: "InwooLeeme 소개",
};

export const revalidate = 3600;

function toAbsoluteUrl(url: string): string {
  if (/^[a-z]+:\/\//i.test(url) || url.startsWith("//") || url.startsWith("#") || url.startsWith("mailto:")) {
    return url;
  }
  const cleaned = url.replace(/^\.\//, "").replace(/^\//, "");
  return `${RAW_BASE}/${cleaned}`;
}

function rewriteRelativeUrls(html: string): string {
  return html.replace(
    /(?<![a-zA-Z0-9_-])(src|href)="([^"]+)"/g,
    (_match, attr: string, url: string) => `${attr}="${toAbsoluteUrl(url)}"`,
  );
}

async function fetchReadmeHtml(): Promise<string | null> {
  try {
    const res = await fetch(README_API_URL, {
      headers: { Accept: "application/vnd.github.html" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const raw = await res.text();
    return rewriteRelativeUrls(raw);
  } catch {
    return null;
  }
}

export default async function AboutPage() {
  const html = await fetchReadmeHtml();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 md:px-6 lg:px-8 mt-6">
      <article
        id="about-article"
        className="prose prose-zinc dark:prose-invert prose-main"
      >
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <p>
            소개 페이지를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.{" "}
            <a
              href={`https://github.com/${GITHUB_USERNAME}`}
              target="_blank"
              rel="noreferrer"
            >
              GitHub에서 직접 보기
            </a>
            .
          </p>
        )}
      </article>
    </div>
  );
}
