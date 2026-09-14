import type { PostMeta } from "@/lib/posts";
import { formatPostDate } from "@/lib/post-display";
import Tr from "./Tr";

/** 홈·최근 글·아티클 카드에서 공유하는 정보 순서와 타이포그래피. */
export default function PostPreview({ meta }: { meta: PostMeta }) {
  const tags = meta.tags?.slice(0, 3) ?? [];

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      {tags.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-accent-brand">
          {tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
      ) : null}
      <h3 className="line-clamp-2 text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-accent-brand group-focus-visible:text-accent-brand sm:text-xl">
        {meta.title}
      </h3>
      {meta.summary ? (
        <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted-foreground">
          {meta.summary}
        </p>
      ) : null}
      <div className="mt-auto pt-3">
        <PostMetadata meta={meta} />
      </div>
    </div>
  );
}

export function PostMetadata({ meta }: { meta: PostMeta }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs tabular-nums text-muted-foreground">
      <time dateTime={meta.date}>{formatPostDate(meta.date)}</time>
      {meta.readingTime ? (
        <>
          <span aria-hidden>·</span>
          <span><Tr id="post.readingTime" params={{ n: meta.readingTime }} /></span>
        </>
      ) : null}
    </div>
  );
}
