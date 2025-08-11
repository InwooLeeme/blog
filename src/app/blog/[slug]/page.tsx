import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { getAllPosts, getPostBySlug } from "@/lib/posts"
import PreWithCopy from "../../components/mdx/pre-with-copy"
import { Callout } from "@/app/components/mdx/Callout/index"
import MdxImage from "@/app/components/mdx/MdxImage"
import PostHeader from "@/app/components/mdx/PostHeader"

interface PageProps {
  params: Promise<{
    slug: string;
  }>
}

// 정적 경로 생성
export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }))
}

// 정적 메타데이터
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPostBySlug((await params).slug)
  if (!post) return {}
  const { meta } = post
  return {
    title: meta.title,
    description: meta.summary,
  }
}

const components = {
  pre: (props : any) => <PreWithCopy {...props} />,
  Callout: (props : any) => <Callout {...props} />,
  img: (props : any) => <MdxImage {...props} />,
  Image: (props : any) => <MdxImage {...props} />,
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug)
  if (!post) return notFound()

  const { meta, content } = post

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
      {meta.cover ? (
        <div className="relative aspect-[1200/630] mb-8">
          <MdxImage
            src={meta.cover}
            alt={meta.title}
            fill
            className="rounded-xl object-cover border"
            sizes="(min-width:1024px) 768px, 100vw"
            priority={false}
          />
        </div>
      ) : null}
      <article className="prose prose-zinc dark:prose-invert w-full mx-auto lg:text-xl prose-main">
        <PostHeader title={meta.title} date={meta.date} tags={meta.tags} readingTime={meta.readingTime} />

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
        components={components}
      />
    </article>
    </div>
  )
}