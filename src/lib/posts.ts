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
* - 해당 MDX 파일이 없으면 fs.readFileSync에서 예외가 발생합니다.
* - frontmatter의 타입은 PostMeta로 단언(cast)하고 있으므로, 필수 필드 누락 시 런타임에만 문제될 수 있습니다.
* - cache()로 감싸 동일 요청 내 같은 slug는 한 번만 읽습니다.
*/
export const getPostBySlug = cache((slug: string) => {
  const realSlug = slug.replace(/\.mdx$/, "")
  const fullPath = path.join(POSTS_DIR, `${realSlug}.mdx`)
  const file = fs.readFileSync(fullPath, "utf8")
  const { content, data } = matter(file)
  const stats = rt(content)
  const minutes = Math.max(1, Math.round(stats.minutes))
  return {
    slug: realSlug,
    meta: { ...(data as PostMeta), readingTime: minutes },
    content,
  }
})

/**
* 모든 게시글을 읽어와 "발행 가능한 목록"으로 정리해 반환합니다.
* - draft 제외, date 내림차순(최신 먼저) 정렬.
* - cache()로 감싸 동일 요청 내 파일 스캔을 한 번으로 공유합니다.
*/
export const getAllPosts = cache(() => {
  const posts = getPostSlugs().map((s) => getPostBySlug(s))
  return posts
    .filter((p) => !p.meta.draft)
    .sort((a, b) => (a.meta.date < b.meta.date ? 1 : -1))
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