import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { PostItem } from "@/lib/posts";
import { getCardCoverSrc, getFirstCardCoverIndex } from "@/lib/post-display";
import { cn } from "@/lib/utils";
import PostPreview from "./PostPreview";

export default function PostList({
  posts,
  showCovers = true,
  className,
}: {
  posts: PostItem[];
  showCovers?: boolean;
  className?: string;
}) {
  const priorityCoverIndex = showCovers
    ? getFirstCardCoverIndex(posts.map(({ meta }) => meta))
    : -1;

  return (
    <ol className={cn("divide-y border-b", className)}>
      {posts.map(({ slug, meta }, index) => {
        const coverSrc = showCovers ? getCardCoverSrc(meta) : null;
        return (
          <li key={slug}>
            <Link
              href={`/blog/${slug}`}
              className="group flex items-start gap-4 py-5 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:gap-5 sm:py-6"
            >
              <span aria-hidden className="hidden w-6 shrink-0 pt-1 font-mono text-xs text-muted-foreground sm:block">
                {String(index + 1).padStart(2, "0")}
              </span>
              <PostPreview meta={meta} />
              {coverSrc ? (
                <div className="relative mt-1 hidden h-20 w-28 shrink-0 overflow-hidden rounded-lg border bg-muted sm:block">
                  <Image
                    src={coverSrc}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="112px"
                    priority={index === priorityCoverIndex}
                  />
                </div>
              ) : (
                <ArrowUpRight aria-hidden className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-accent-brand" />
              )}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
