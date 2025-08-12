import { getAllPosts } from "@/lib/posts"
import PostCard from "../components/PostCard"

export default function BlogIndexPage() {
  const posts = getAllPosts()
  return (
    <div className="space-y-8 mt-6 max-w-3xl mx-auto lg:max-w-6xl">
      <h1 className="text-2xl md:text-[30px] font-bold mt-2 mb-2">All Posts ({posts.length})</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 items-stretch">
        {posts.map(({ slug, meta }) => (
          <PostCard key={slug} slug={slug} meta={meta} />
        ))}
      </div>
    </div>
  )
}