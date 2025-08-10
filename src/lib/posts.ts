import fs from "fs";
import path from "path";
import matter from "gray-matter";
import rt from "reading-time"

export type PostMeta = {
  title: string
  date: string
  summary?: string
  tags?: string[]
  draft?: boolean
  cover?: string       
  readingTime?: number 
}
const POSTS_DIR = path.join(process.cwd(), "content", "posts")

export function getPostSlugs() {
  return fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"))
}

export function getPostBySlug(slug: string) {
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
  }
  
  export function getAllPosts() {
    const slugs = getPostSlugs()
    const posts = slugs.map((s) => getPostBySlug(s))
    return posts
      .filter((p) => !p.meta.draft)
      .sort((a, b) => (a.meta.date < b.meta.date ? 1 : -1))
  }