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
* 발행된(draft가 아닌) 게시글의 slug 목록만 반환합니다.
* - 본문은 파싱하지 않고 frontmatter만 읽어 draft 필터링에 사용합니다.
* - generateStaticParams 등 본문이 필요 없는 경로에서 사용하세요.
*/
export function getPublishedSlugs() {
  return getPostSlugs()
    .filter((f) => {
      const file = fs.readFileSync(path.join(POSTS_DIR, f), "utf8")
      const { data } = matter(file)
      return !(data as PostMeta).draft
    })
    .map((f) => f.replace(/\.mdx$/, ""))
}

/**
* slug(또는 파일명)로부터 특정 게시글의 메타데이터(frontmatter)와 본문(content)을 읽어 반환합니다.
* 주의/예외:
* - 해당 MDX 파일이 없으면 fs.readFileSync에서 예외가 발생합니다.
* - frontmatter의 타입은 PostMeta로 단언(cast)하고 있으므로, 필수 필드 누락 시 런타임에만 문제될 수 있습니다.
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
* 반환 값:
* - { slug, meta, content } 형태의 게시글 객체 배열
*/
export function getAllPosts() {
  const slugs = getPostSlugs()
  const posts = slugs.map((s) => getPostBySlug(s))
  return posts
    .filter((p) => !p.meta.draft)
    .sort((a, b) => (a.meta.date < b.meta.date ? 1 : -1))
}

/* 
모든 포스트에서 고유한 태그 목록을 추출합니다.
*/
export function getAllTags(posts: PostMeta[]): string[] {
  const allTags = posts.flatMap(post => post.tags ?? []);
  // Set을 사용하여 중복을 제거합니다.
  return Array.from(new Set(allTags)).sort((a, b) => a.localeCompare(b));
}

/**
* 특정 태그를 가진 포스트 목록을 필터링합니다.
*/
export function getPostsByTag(posts: PostMeta[], tag: string): PostMeta[] {
  return posts.filter((post) => post.tags?.includes(tag) ?? false);
}

export type TagCount = { tag: string; count: number };

export function getTagCounts(metas: PostMeta[]): TagCount[] {
  const map = new Map<string, number>();

  for (const m of metas) {
    for (const t of m.tags ?? []) {
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