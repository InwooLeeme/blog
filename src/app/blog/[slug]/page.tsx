import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import PreWithCopy from "../../components/mdx/pre-with-copy";
import { Callout } from "@/app/components/mdx/Callout/index";
import MdxImage from "@/app/components/mdx/MdxImage";
import PostHeader from "@/app/components/mdx/PostHeader";
import TocbotSidebar from "@/app/components/mdx/toc";
import * as React from "react";
import Comments from "../../components/Comments";
import { Rank } from "@/app/components/mdx/Rank";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";


interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// 정적 경로 생성
export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

// 정적 메타데이터
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const post = getPostBySlug((await params).slug);
  if (!post) return {};
  const { meta } = post;
  return {
    title: meta.title,
    description: meta.summary,
  };
}

const components = {
  pre: (
    props: React.HTMLAttributes<HTMLPreElement> & { children?: React.ReactNode }
  ) => <PreWithCopy {...props} />,
  Callout: (props: {
    type?: "info" | "warn" | "danger" | "normal";
    children: React.ReactNode;
  }) => <Callout {...props} />,
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <MdxImage {...props} />
  ),
  Image: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <MdxImage {...props} />
  ),
  Rank: Rank
};

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return notFound();

  const { meta, content } = post;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 md:px-6 lg:px-8">
      {meta.cover ? (
        <div className="relative aspect-[1200/630] mb-8">
          <MdxImage
            src={meta.cover}
            alt={meta.title}
            className="rounded-xl object-cover border"
            sizes="(min-width:1024px) 768px, 100vw"
            priority={false}
          />
        </div>
      ) : null}
      <article id="post-article" className="w-full">
        <PostHeader
          title={meta.title}
          date={meta.date}
          tags={meta.tags}
          readingTime={meta.readingTime}
        />
        {/* MDX 본문 */}
        <div className="prose prose-zinc dark:prose-invert prose-main lg:text-xl">
          <MDXRemote
            source={content}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm, remarkMath],
                rehypePlugins: [
                  rehypeSlug,
                  [
                    rehypeAutolinkHeadings,
                    {
                      behavior: "append",
                      properties: { className: ["anchor"], ariaLabel: "Link to section" },
                    },
                  ],
                  [rehypePrettyCode,
                    {
                      // 라이트/다크 테마 동시 지정 가능
                      theme: {
                        dark: "github-dark-dimmed",
                        light: "github-light",
                      },
                      defaultLang: "plaintext",
                      keepBackground: false,
                    },
                  ],
                  rehypeKatex,
                ],
              },
            }}
            components={components}
          />
        </div>
      </article>
      <Comments />
      <div className="hidden xl:block">
        <TocbotSidebar />
      </div>
    </div>
  );
}
