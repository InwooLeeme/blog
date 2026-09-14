import type { PostMeta } from "@/lib/posts";
import { getCardCoverSrc } from "@/lib/post-display";
import { Link } from "next-view-transitions";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { contentCardClass, contentCardInteractionClass } from "@/lib/ui-styles";
import PostPreview from "./PostPreview";

export default function PostCard({
  slug,
  meta,
  featured = false,
  priority = featured,
}: {
  slug: string;
  meta: PostMeta;
  featured?: boolean;
  priority?: boolean;
}) {
  const coverSrc = getCardCoverSrc(meta);

  return (
    <Link
      href={`/blog/${slug}`}
      className={cn(contentCardClass, contentCardInteractionClass, "group flex h-full items-start gap-4 p-5 sm:p-6")}
    >
      <PostPreview meta={meta} />
      {coverSrc ? (
        <div
          className="relative hidden h-16 w-24 shrink-0 overflow-hidden rounded-lg border bg-muted sm:block"
          style={{ viewTransitionName: `post-cover-${slug}` }}
        >
          <Image
            src={coverSrc}
            alt=""
            fill
            className="object-cover"
            sizes="96px"
            priority={priority}
          />
        </div>
      ) : null}
    </Link>
  );
}
