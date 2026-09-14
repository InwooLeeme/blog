import { sectionHeadingClass } from "@/lib/ui-styles";
import { cn } from "@/lib/utils";
import type { PostItem } from "@/lib/posts";
import Tr from "./Tr";
import PostList from "./PostList";

export default function LatestHero({ posts }: { posts: PostItem[] }) {
  const latest = posts.slice(0, 4);
  if (latest.length === 0) return null;

  return (
    <section className="mb-10" aria-labelledby="latest-posts-title">
      <h2 id="latest-posts-title" className={cn(sectionHeadingClass, "mb-4")}>
        <Tr id="blog.latest" />
      </h2>
      <PostList posts={latest} className="border-t" />
    </section>
  );
}
