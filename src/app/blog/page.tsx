import { getAllPosts } from "@/lib/posts"
import PostCard from "../components/PostCard"

export default function BlogIndexPage() {
  const posts = getAllPosts()
  return (
    <div className="space-y-8">
      <ul className="space-y-6">
        {posts.map(({ slug, meta }) => (
          <li key={slug} className="group">
            <PostCard slug={slug} meta={meta} />
          </li>
        ))}
      </ul>
    </div>
  )
}