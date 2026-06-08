import type { PostItem } from "@/lib/posts";
import PostCard from "./PostCard";
import Reveal from "./Reveal";

/** 블로그 목록·태그 페이지 공용 컴포넌트 */
export default function PostGrid({ posts }: { posts: PostItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {posts.map(({ slug, meta }, i) => (
        <Reveal key={slug} delay={(i % 2) * 100}>
          <PostCard slug={slug} meta={meta} />
        </Reveal>
      ))}
    </div>
  );
}
