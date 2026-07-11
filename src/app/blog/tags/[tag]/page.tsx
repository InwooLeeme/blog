import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPosts, getAllTags, getTagCounts, getPostItemsByTag, getAllSeries } from "@/lib/posts";
import TagSidebar from "../../../components/TagSidebar";
import PostGrid from "../../../components/PostGrid";

export function generateStaticParams() {
  const tags = getAllTags(getAllPosts());

  return tags.map((tag) => ({ tag }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ tag: string }>; }): Promise<Metadata> {
    const {tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);
  return {
    title: `InwooLeeme의 개발 블로그 | #${tag}`,
    description: `태그 "${tag}"로 분류된 게시글 목록입니다.`,
    alternates: { canonical: `/blog/tags/${rawTag}` },
  };
}

export default async  function BlogTagPage({ params }: { params: Promise<{ tag: string }>; }) {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);

  const posts = getAllPosts();
  const tagCounts = getTagCounts(posts);

  const filtered = getPostItemsByTag(posts, tag);
  if (filtered.length === 0) return notFound();

  return (
    <div className="w-full max-w-6xl mx-auto mt-6 px-4 md:px-6 lg:px-8">
      <div className="lg:flex lg:gap-10">
        <TagSidebar
          tagCounts={tagCounts}
          totalCount={posts.length}
          activeTag={tag}
          basePath="/blog"
          tagBasePath="/blog/tags"
          series={getAllSeries()}
        />
        <main className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-bold mt-2 mb-6">
            #{tag} ({filtered.length})
          </h1>

          <PostGrid posts={filtered} />
        </main>
      </div>
    </div>
  );
}
