import type { PostItem } from "@/lib/posts";
import PostCard from "./PostCard";
import Reveal from "./Reveal";
import { getFirstCardCoverIndex } from "@/lib/post-display";

/** 블로그 목록·태그 페이지 공용 컴포넌트 */
export default function PostGrid({ posts, featureFirst = true }: { posts: PostItem[]; featureFirst?: boolean }) {
  const priorityCoverIndex = getFirstCardCoverIndex(posts.map((post) => post.meta));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {posts.map(({ slug, meta }, i) => (
        <Reveal
          key={slug}
          delay={(i % 2) * 100}
          className={featureFirst && i === 0 ? "md:col-span-2" : undefined}
        >
          <PostCard
            slug={slug}
            meta={meta}
            featured={featureFirst && i === 0}
            priority={i === priorityCoverIndex}
            index={i}
          />
        </Reveal>
      ))}
    </div>
  );
}
