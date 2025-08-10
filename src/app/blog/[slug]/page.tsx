import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import rehypePrettyCode from "rehype-pretty-code"
import rehypeHighlight from "rehype-highlight"
import { getAllPosts, getPostBySlug } from "@/lib/posts"

// 정적 경로 생성
export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }))
}

// (선택) 정적 메타데이터
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPostBySlug(params.slug)
  if (!post) return {}
  const { meta } = post
  return {
    title: meta.title,
    description: meta.summary,
  }
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  if (!post) return notFound()

  const { meta, content } = post

  return (
    <article className="prose prose-zinc dark:prose-invert w-full mx-auto px-16 lg:text-2xl">
      <h1 className="mb-2">{meta.title}</h1>
      <p className="mt-0 text-sm text-muted-foreground">{new Date(meta.date).toLocaleDateString()}{meta.readingTime ? <> · {meta.readingTime} min read</> : null}</p>

      {/* MDX 본문 */}
      <MDXRemote
        source={content}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeSlug,
              [rehypeAutolinkHeadings, { behavior: "wrap" }],
              [rehypeHighlight, { ignoreMissing: true }],
            ],
          },
        }}
        components={{
          // 필요 시 커스텀 요소 매핑
          // h2: (props) => <h2 className="scroll-mt-24" {...props} />,
        }}
      />
    </article>
  )
}