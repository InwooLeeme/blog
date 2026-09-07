import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import "katex/dist/katex.min.css";
import { mdxOptions } from "@/lib/mdx";
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
import CopyLinkButton from "@/app/components/CopyLinkButton";
import Comments from "../../components/Comments";
import PostNavigation from "@/app/components/PostNavigation";
import SeriesNavigation from "@/app/components/SeriesNavigation";
import RelatedPosts from "@/app/components/RelatedPosts";
import { Rank } from "@/app/components/mdx/Rank";
import { ProblemMeta } from "@/app/components/mdx/ProblemMeta";
import { Complexity } from "@/app/components/mdx/Complexity";
import { Steps, Step } from "@/app/components/mdx/Steps";
import { Definition } from "@/app/components/mdx/Definition";
import JsonLd from "@/app/components/JsonLd";
import { buildBlogPostingJsonLd, buildBreadcrumbJsonLd } from "@/lib/jsonLd";
import { getPostCoverFit } from "@/lib/post-display";
import NormalizedMdxH1 from "@/app/components/mdx/NormalizedMdxH1";
import { stripRedundantLeadHeading } from "@/lib/mdx-heading";


interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// 정적 경로 생성 (발행 글만 미리 생성 — draft는 dynamicParams로 요청 시 렌더링)
export function generateStaticParams() {
  return getPublishedSlugs().map((slug) => ({ slug }));
}

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
  h1: NormalizedMdxH1,
};

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return notFound();

  const { meta, content } = post;
  const { prev, next } = getAdjacentPosts(slug);
  const related = getRelatedPosts(slug, 3);
  const seriesNav = getSeriesNavigation(slug);
  const coverFit = getPostCoverFit(meta);
  const displayContent = stripRedundantLeadHeading(content, meta);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 md:px-6 lg:px-8">
      <JsonLd
        data={[
          buildBlogPostingJsonLd(slug, meta),
          buildBreadcrumbJsonLd(slug, meta.title),
        ]}
      />
      {meta.cover ? (
        <div
          className={`relative mb-8 h-[clamp(14rem,42vw,26rem)] overflow-hidden rounded-2xl border ${
            coverFit === "contain" ? "bg-white" : "bg-card"
          }`}
          style={{ viewTransitionName: `post-cover-${slug}` }}
        >
          <MdxImage
            src={meta.cover}
            alt={meta.title}
            className={`h-full w-full border-0 ${
              coverFit === "contain"
                ? "object-contain p-8 sm:p-12"
                : "object-cover"
            }`}
            wrapperClassName="h-full"
            sizes="(min-width:1024px) 768px, 100vw"
            priority
          />
        </div>
      ) : null}
      <div className="xl:flex xl:gap-8 xl:items-stretch">
        <article id="post-article" className="w-full min-w-0 xl:flex-1">
          <PostHeader
            title={meta.title}
            date={meta.date}
            readingTime={meta.readingTime}
            summary={meta.summary}
            series={meta.series}
          />
          {/* MDX 본문 */}
          <div className="prose prose-zinc dark:prose-invert prose-main lg:prose-xl">
            <MDXRemote
              source={displayContent}
              options={{ mdxOptions }}
              components={components}
            />
          </div>
        </article>
        <TocbotSidebar />
      </div>
      <PostTags tags={meta.tags} />
      <div className="mb-6 flex justify-end">
        <CopyLinkButton />
      </div>
      {seriesNav ? <SeriesNavigation nav={seriesNav} /> : null}
      <PostNavigation prev={prev} next={next} />
      <RelatedPosts posts={related} />
      <Comments />
      <MobileToc />
    </div>
  );
}
