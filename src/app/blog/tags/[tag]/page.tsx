import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPosts, getAllTags, getTagCounts, getPostItemsByTag } from "@/lib/posts";
import TagSidebar from "../../../components/TagSidebar";
import PostCard from "../../../components/PostCard";
import Reveal from "../../../components/Reveal";

export function generateStaticParams() {
  const metas = getAllPosts().map((p) => p.meta);
  const tags = getAllTags(metas);

  return tags.map((tag) => ({ tag: encodeURIComponent(tag) }));
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }>; }): Promise<Metadata> {
    const {tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);
  return {
    title: `InwooLeeme의 개발 블로그 | #${tag}`,
    description: `태그 "${tag}"로 분류된 게시글 목록입니다.`,
  };
}

export default async  function BlogTagPage({ params }: { params: Promise<{ tag: string }>; }) {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);

  const posts = getAllPosts();
  const metas = posts.map((p) => p.meta);
  const tagCounts = getTagCounts(metas);

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
        />
        <main className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-[30px] font-bold mt-2 mb-6">
            #{tag} ({filtered.length})
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {filtered.map(({ slug, meta }, i) => (
              <Reveal key={slug} delay={(i % 2) * 100}>
                <PostCard slug={slug} meta={meta} />
              </Reveal>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
