import type { PostItem } from "@/lib/posts";

export function getEditorialPosts(posts: PostItem[]): PostItem[] {
  return posts.slice(0, 4);
}
