import fs from "fs";
import path from "path";
import matter from "gray-matter";
import rt from "reading-time"
import { cache } from "react"

export type PostMeta = {
  title: string
  date: string
  summary?: string
  tags?: string[]
  draft?: boolean
  cover?: string
  readingTime?: number
  series?: string
}

export type PostItem = {
  slug: string;
  meta: PostMeta;
  content?: string; // getAllPosts()가 content까지 주면 optional로 맞춰도 OK
};

const POSTS_DIR = path.join(process.cwd(), "content", "posts")

/**
* posts 디렉터리(POSTS_DIR)에서 모든 MDX 파일명을 읽어와 slug 후보 배열로 반환합니다.
* - 반환 값은 "파일명.mdx" 형태의 문자열 배열입니다.
* - 하위 폴더는 탐색하지 않습니다(현재 폴더 1-depth만).
* - POST_DIR에 .md 파일도 섞여 있다면 여기서 필터 조건을 추가해야 합니다.
*/
export function getPostSlugs() {
  return fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"))
}

/**
* slug(또는 파일명)로부터 특정 게시글의 메타데이터(frontmatter)와 본문(content)을 읽어 반환합니다.
* 주의/예외:
* - 해당 MDX 파일이 없으면 null을 반환합니다.
* - frontmatter의 타입은 PostMeta로 단언(cast)하고 있으므로, 필수 필드 누락 시 런타임에만 문제될 수 있습니다.
* - cache()로 감싸 동일 요청 내 같은 slug는 한 번만 읽습니다.
* - 프로덕션에서는 slug별 파싱 결과를 프로세스 전역(postCache)에도 메모이즈해 요청/페이지가 달라져도 재사용합니다.
*/
type LoadedPost = PostItem & { content: string };

// 프로덕션(빌드/배포)에서는 콘텐츠가 불변이므로 slug별 파싱 결과를 프로세스 전역에 메모이즈한다.
// dev에서는 MDX 파일을 고치고 새로고침하면 바로 반영돼야 하므로 캐시하지 않는다(cache()는 요청 단위라 매번 새로 읽힘).
const postCache = new Map<string, LoadedPost>();

export const getPostBySlug = cache((slug: string) => {
  const realSlug = slug.replace(/\.mdx$/, "")
  const isProd = process.env.NODE_ENV === "production"
  if (isProd && postCache.has(realSlug)) return postCache.get(realSlug)!

  const fullPath = path.join(POSTS_DIR, `${realSlug}.mdx`)
  if (!fs.existsSync(fullPath)) return null
  const file = fs.readFileSync(fullPath, "utf8")
  const { content, data } = matter(file)
  const stats = rt(content)
  const minutes = Math.max(1, Math.round(stats.minutes))
  const post: LoadedPost = {
    slug: realSlug,
    meta: { ...(data as PostMeta), readingTime: minutes },
    content,
  }
  if (isProd) postCache.set(realSlug, post)
  return post
})

/**
* 모든 게시글을 읽어와 "발행 가능한 목록"으로 정리해 반환합니다.
* - draft 제외, date 내림차순(최신 먼저) 정렬.
* - cache()로 감싸 동일 요청 내 파일 스캔을 한 번으로 공유합니다.
* - 프로덕션에서는 결과 배열 자체도 프로세스 전역에 메모이즈해, 정적 페이지마다
*   반복되는 디렉터리 스캔·정렬을 한 번으로 줄인다.
*/
let cachedAllPosts: PostItem[] | null = null;

export const getAllPosts = cache(() => {
  const isProd = process.env.NODE_ENV === "production"
  if (isProd && cachedAllPosts) return cachedAllPosts

  const posts = getPostSlugs()
    .map((s) => getPostBySlug(s))
    .filter((p): p is NonNullable<typeof p> => p !== null)
  const result = posts
    .filter((p) => !p.meta.draft)
    .sort((a, b) => (a.meta.date < b.meta.date ? 1 : -1))

  if (isProd) cachedAllPosts = result
  return result
})

/**
* 발행된(draft가 아닌) 게시글의 slug 목록만 반환합니다.
* - getAllPosts를 재사용하므로 별도 파일 스캔 없이 draft 필터링을 공유합니다.
* - generateStaticParams 등에서 사용하세요.
*/
export function getPublishedSlugs() {
  return getAllPosts().map((p) => p.slug)
}

/* 
모든 포스트에서 고유한 태그 목록을 추출합니다.
*/
export function getAllTags(posts: PostItem[]): string[] {
  const allTags = posts.flatMap((post) => post.meta.tags ?? []);
  // Set을 사용하여 중복을 제거합니다.
  return Array.from(new Set(allTags)).sort((a, b) => a.localeCompare(b));
}

export type TagCount = { tag: string; count: number };

export function getTagCounts(posts: PostItem[]): TagCount[] {
  const map = new Map<string, number>();

  for (const p of posts) {
    for (const t of p.meta.tags ?? []) {
      map.set(t, (map.get(t) ?? 0) + 1);
    }
  }

  // 많이 쓰는 태그가 위로 오게 정렬 (동률이면 가나다)
  return Array.from(map.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/**
* 특정 태그를 가진 "포스트 아이템(슬러그 포함)" 목록을 필터링합니다.
* - BlogIndexPage에서 slug/meta를 유지한 채로 필터링하기 위한 유틸
*/
export function getPostItemsByTag(posts: PostItem[], tag: string): PostItem[] {
  return posts.filter((p) => p.meta.tags?.includes(tag) ?? false);
}

export type AdjacentPosts = {
  prev: PostItem | null;
  next: PostItem | null;
};

export type SeriesNav = {
  series: string;
  prev: PostItem | null;
  next: PostItem | null;
  position: number;
  total: number;
  currentSlug: string;
  episodes: { slug: string; title: string }[];
};

/** 특정 시리즈의 글을 회차(slug) 오름차순으로 반환 */
export function getPostsBySeries(series: string): PostItem[] {
  return getAllPosts()
    .filter((p) => p.meta.series === series)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export type SeriesSummary = { series: string; count: number; latestDate: string };

/** 모든 시리즈를 글 수 + 최신 날짜와 함께, 최신 날짜순으로 반환 */
export function getAllSeries(): SeriesSummary[] {
  const map = new Map<string, { count: number; latestDate: string }>();

  // getAllPosts()는 이미 날짜 내림차순 → 시리즈가 처음 등장할 때의 date가 최신 날짜
  for (const p of getAllPosts()) {
    if (!p.meta.series) continue;
    const prev = map.get(p.meta.series);
    if (!prev) {
      map.set(p.meta.series, { count: 1, latestDate: p.meta.date });
    } else {
      prev.count += 1;
    }
  }

  return Array.from(map.entries()).map(([series, v]) => ({ series, ...v }));
}

/**
 * 같은 series 글을 모아 이전/다음 회차 + 전체 회차 목록을 반환.
 * - 정렬은 slug 오름차순 (회차 번호가 zero-padding 돼 있어 번호순과 일치)
 * - series 필드가 없으면 null
 */
export function getSeriesNavigation(slug: string): SeriesNav | null {
  const series = getAllPosts().find((p) => p.slug === slug)?.meta.series;
  if (!series) return null;

  const list = getPostsBySeries(series);
  const idx = list.findIndex((p) => p.slug === slug);

  return {
    series,
    prev: idx > 0 ? list[idx - 1] : null,
    next: idx < list.length - 1 ? list[idx + 1] : null,
    position: idx + 1,
    total: list.length,
    currentSlug: slug,
    episodes: list.map((p) => ({ slug: p.slug, title: p.meta.title })),
  };
}

/**
* 현재 글의 이전/다음 글을 반환합니다.
* - 정렬 기준은 date 내림차순(최신이 먼저).
* - prev = 더 오래된 글(=배열에서 뒤쪽), next = 더 최신 글(=배열에서 앞쪽).
*/
export function getAdjacentPosts(slug: string): AdjacentPosts {
  const posts = getAllPosts();
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  const next = idx > 0 ? posts[idx - 1] : null;
  const prev = idx < posts.length - 1 ? posts[idx + 1] : null;
  return { prev, next };
}

/**
* 태그 겹침 기반으로 관련 글을 추천합니다.
* - 점수: 공통 태그 수. 동률이면 최신순.
* - 공통 태그가 0인 경우는 후보에서 제외(태그가 전혀 없는 글은 자기 자신 외에는 추천하지 않음).
* - 한 개도 없으면 최신 글로 fallback.
*/
export function getRelatedPosts(slug: string, limit = 3): PostItem[] {
  const posts = getAllPosts();
  const current = posts.find((p) => p.slug === slug);
  if (!current) return [];

  const currentTags = new Set(current.meta.tags ?? []);

  const scored = posts
    .filter((p) => p.slug !== slug)
    .map((p) => {
      const overlap = (p.meta.tags ?? []).reduce(
        (acc, t) => acc + (currentTags.has(t) ? 1 : 0),
        0,
      );
      return { post: p, score: overlap };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.post.meta.date < b.post.meta.date ? 1 : -1;
    })
    .slice(0, limit)
    .map((x) => x.post);

  if (scored.length > 0) return scored;

  // fallback: 태그 매칭이 없으면 최신 글 N개
  return posts.filter((p) => p.slug !== slug).slice(0, limit);
}

export type SeriesGroup = { series: string; posts: PostItem[]; total: number };

/** 주어진 목록을 시리즈별로 묶는다. 그룹 내부는 회차(slug) 오름차순 — getPostsBySeries와 동일 규칙이라
 *  회차 번호가 순서대로 읽힌다. 그룹 자체는 각 그룹 최신 글 date desc순.
 *  total은 해당 시리즈 전체 편수(getPostsBySeries 기준) — 목록에 일부만 있어도 정확한 편수를 준다. */
export function groupPostsBySeries(posts: PostItem[]): SeriesGroup[] {
  const map = new Map<string, PostItem[]>();
  for (const p of posts) {
    const s = p.meta.series;
    if (!s) continue;
    const arr = map.get(s);
    if (arr) arr.push(p);
    else map.set(s, [p]);
  }
  const latestDateOf = (groupPosts: PostItem[]) =>
    groupPosts.reduce((max, p) => (p.meta.date > max ? p.meta.date : max), groupPosts[0].meta.date);

  return Array.from(map.entries())
    .map(([series, groupPosts]): SeriesGroup => ({
      series,
      posts: [...groupPosts].sort((a, b) => a.slug.localeCompare(b.slug)),
      total: getPostsBySeries(series).length,
    }))
    .sort((a, b) => (latestDateOf(a.posts) < latestDateOf(b.posts) ? 1 : -1));
}
