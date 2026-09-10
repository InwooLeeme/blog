import { PostMeta } from "@/lib/posts";
import { formatPostDate, getCardCoverSrc } from "@/lib/post-display";
import { Link } from "next-view-transitions";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
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
        <Link href={`/blog/${slug}`} className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:ring-offset-4 focus-visible:ring-offset-background" aria-label={meta.title}>
            <Card className="overflow-hidden h-full py-0 gap-0 shadow-none transition-colors duration-200 hover:border-accent-brand/60">
                {coverSrc ? (
                    <div
                        className="relative overflow-hidden"
                        style={{ viewTransitionName: `post-cover-${slug}` }}
                    >
                        <AspectRatio ratio={16 / 9}>
                            <Image
                                src={coverSrc}
                                alt={meta.title}
                                fill
                                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                                sizes={
                                    featured
                                        ? "(min-width:768px) 66vw, 100vw"
                                        : "(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                                }
                                priority={priority}
                            />
                        </AspectRatio>
                    </div>
                ) : null}

                <CardContent className="flex flex-1 flex-col p-5 sm:p-6">
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
                </CardContent>
            </Card>
        </Link>
    );
}
