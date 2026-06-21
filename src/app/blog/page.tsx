import { getAllPosts, getTagCounts } from "@/lib/posts"
import PostGridLoadMore from "../components/PostGridLoadMore";
import TagSidebar from "../components/TagSidebar";
import LatestHero from "../components/LatestHero";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const tagCounts = getTagCounts(posts);
  return (
    <div className="w-full max-w-6xl mx-auto mt-6 px-4 md:px-6 lg:px-8">
      <div className="lg:flex lg:gap-10">
        {/* sidebar */}
         <TagSidebar
          tagCounts={tagCounts}
          totalCount={posts.length}
          activeTag={null}
          basePath="/blog"
          tagBasePath="/blog/tags"
        />
        {/* main */}
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-6xl space-y-8">
            <LatestHero posts={posts} />

            <div className="space-y-8">
              <h1 className="text-2xl md:text-[30px] font-bold mt-2 mb-2">
                All Posts ({posts.length})
              </h1>

              <PostGridLoadMore posts={posts} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}