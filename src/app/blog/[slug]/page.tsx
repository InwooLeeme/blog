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

interface PageProps {
  params: Promise<{
    slug: string;
  }>
}

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
    <div className="mx-auto w-full max-w-3xl sm:px-6">
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
      <article className="prose prose-main prose-zinc dark:prose-invert w-full mx-auto px-16 max-sm:px-0 lg:text-2xl">
      <h1 className="mb-2 text-center">{meta.title}</h1>
      <p className="mt-0 text-sm text-muted-foreground text-center">{new Date(meta.date).toLocaleDateString()}{meta.readingTime ? <> · {meta.readingTime} min read</> : null}</p>

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