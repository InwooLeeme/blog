import { getAllPosts, getTagCounts } from "@/lib/posts"
import PostCard from "../components/PostCard"
import TagSidebar from "../components/TagSidebar";
import LatestHero from "../components/LatestHero";


export default function BlogIndexPage() {
  const posts = getAllPosts();
  const metas = posts.map((p) => p.meta);
  const tagCounts = getTagCounts(metas);
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {posts.map(({ slug, meta }) => (
                  <PostCard key={slug} slug={slug} meta={meta} />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}