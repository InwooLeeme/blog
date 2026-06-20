import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import { transformerNotationDiff } from "@shikijs/transformers";
import {
  getAdjacentPosts,
  getPostBySlug,
  getPublishedSlugs,
  getRelatedPosts,
  getSeriesNavigation,
} from "@/lib/posts";
import PreWithCopy from "../../components/mdx/pre-with-copy";
import { Callout } from "@/app/components/mdx/Callout/index";
import MdxImage from "@/app/components/mdx/MdxImage";
import PostHeader from "@/app/components/mdx/PostHeader";
import PostTags from "@/app/components/mdx/PostTags";
import TocbotSidebar from "@/app/components/mdx/toc";
import MobileToc from "@/app/components/mdx/MobileToc";
import Comments from "../../components/Comments";
import PostNavigation from "@/app/components/PostNavigation";
import SeriesNavigation from "@/app/components/SeriesNavigation";
import RelatedPosts from "@/app/components/RelatedPosts";
import { Rank } from "@/app/components/mdx/Rank";
import { ProblemMeta } from "@/app/components/mdx/ProblemMeta";
import { Complexity } from "@/app/components/mdx/Complexity";
import { Steps, Step } from "@/app/components/mdx/Steps";
import { Definition } from "@/app/components/mdx/Definition";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import JsonLd from "@/app/components/JsonLd";
import { buildBlogPostingJsonLd, buildBreadcrumbJsonLd } from "@/lib/jsonLd";


interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// 정적 경로 생성
export function generateStaticParams() {
  return getPublishedSlugs().map((slug) => ({ slug }));
}

// generateStaticParams에 없는 슬러그는 404 처리
export const dynamicParams = false;

// 정적 메타데이터
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const { meta } = post;
  return {
    title: meta.title,
    description: meta.summary,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title: meta.title,
      description: meta.summary,
      url: `/blog/${slug}`,
      publishedTime: meta.date,
      tags: meta.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.summary,
    },
  };
}

const components = {
  pre: PreWithCopy,
  Callout,
  img: MdxImage,
  Image: MdxImage,
  Rank,
  ProblemMeta,
  Complexity,
  Steps,
  Step,
  Definition,
};

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return notFound();

  const { meta, content } = post;
  const { prev, next } = getAdjacentPosts(slug);
  const related = getRelatedPosts(slug, 3);
  const seriesNav = getSeriesNavigation(slug);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 md:px-6 lg:px-8">
      <JsonLd
        data={[
          buildBlogPostingJsonLd(slug, meta),
          buildBreadcrumbJsonLd(slug, meta.title),
        ]}
      />
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
      <div className="xl:flex xl:gap-8 xl:items-stretch">
        <article id="post-article" className="w-full min-w-0 xl:flex-1">
          <PostHeader
            title={meta.title}
            date={meta.date}
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
                        theme: {
                          dark: "one-dark-pro",
                          light: "one-light",
                        },
                        defaultLang: "plaintext",
                        keepBackground: true,
                        transformers: [transformerNotationDiff()],
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
        <TocbotSidebar />
      </div>
      <PostTags tags={meta.tags} />
      {seriesNav ? <SeriesNavigation nav={seriesNav} /> : null}
      <PostNavigation prev={prev} next={next} />
      <RelatedPosts posts={related} />
      <Comments />
      <MobileToc />
    </div>
  );
}
