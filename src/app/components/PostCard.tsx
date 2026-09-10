import { PostMeta } from "@/lib/posts";
import { formatPostDate, getCardCoverSrc } from "@/lib/post-display";
import { Link } from "next-view-transitions";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { contentCardClass, contentCardInteractionClass } from "@/lib/ui-styles";
import { Calendar } from "lucide-react";
import Tr from "./Tr";

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
    const formatted = formatPostDate(meta.date);
    const coverSrc = getCardCoverSrc(meta);
    const tags = meta.tags?.slice(0, 3) ?? [];

    return (
        <Link
            href={`/blog/${slug}`}
            className={cn(contentCardClass, contentCardInteractionClass, "group flex h-full flex-col p-5 sm:p-6")}
            aria-label={meta.title}
        >
            <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                    {tags.length > 0 ? (
                        <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="text-xs font-medium text-accent-brand"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    ) : null}

                    <h3
                        className={`font-bold leading-snug line-clamp-2 transition-colors group-hover:text-accent-brand ${
                            featured ? "text-xl md:text-2xl" : "text-lg"
                        }`}
                    >
                        {meta.title}
                    </h3>
                </div>
                {coverSrc ? (
                    <div
                        className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border bg-muted sm:h-16 sm:w-24"
                        style={{ viewTransitionName: `post-cover-${slug}` }}
                    >
                        <Image
                            src={coverSrc}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="(min-width:640px) 96px, 80px"
                            priority={priority}
                        />
                    </div>
                ) : null}
            </div>

            {meta.summary ? (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {meta.summary}
                </p>
            ) : null}

            <div className="mt-auto pt-4 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" aria-hidden />
                <time dateTime={meta.date}>{formatted}</time>
                {meta.readingTime ? (
                    <>
                        <span aria-hidden>·</span>
                        <Tr id="post.readingTime" params={{ n: meta.readingTime }} />
                    </>
                ) : null}
            </div>
        </Link>
    );
}
