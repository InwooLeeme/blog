import { getAllPosts } from "@/lib/posts"
import PostCard from "../components/PostCard"

export default function BlogIndexPage() {
  const posts = getAllPosts()
  return (
    <div className="space-y-8 mt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(({ slug, meta }) => (
          <PostCard key={slug} slug={slug} meta={meta} />
        ))}
      </div>
    </div>
  )
}