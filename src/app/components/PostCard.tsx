import { PostMeta } from "@/lib/posts";
import { formatPostDate, getCoverSrc } from "@/lib/post-display";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Calendar } from "lucide-react";

export default function PostCard({
    slug,
    meta,
    featured = false,
}: {
    slug: string;
    meta: PostMeta;
    featured?: boolean;
}) {
    const formatted = formatPostDate(meta.date);
    const coverSrc = getCoverSrc(slug, meta);
    const tags = meta.tags?.slice(0, 3) ?? [];

    return (
        <Link href={`/blog/${slug}`} className="group block" aria-label={meta.title}>
            <Card className="overflow-hidden h-full rounded-md py-0 gap-0 transition duration-300 hover:-translate-y-1 hover:border-accent-brand hover:shadow-xl hover:shadow-accent-brand/15">
                <div className="relative overflow-hidden">
                    <AspectRatio ratio={16 / 9}>
                        <Image
                            src={coverSrc}
                            alt={meta.title}
                            fill
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                            sizes={
                                featured
                                    ? "(min-width:768px) 66vw, 100vw"
                                    : "(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                            }
                            priority={false}
                            // cover 없는 글은 이미 완성된 OG PNG로 폴백 → 재최적화 생략(400 방지)
                            unoptimized={!meta.cover}
                        />
                    </AspectRatio>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/10 opacity-0 group-hover:opacity-100 transition" />
                </div>

                <CardContent className="p-4">
                    {tags.length > 0 ? (
                        <div className="mb-2 flex flex-wrap gap-1.5">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-full bg-accent-brand/10 px-2 py-0.5 text-xs font-medium text-accent-brand"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    ) : null}

                    <h3
                        className={`font-bold leading-snug line-clamp-2 transition-colors group-hover:text-accent-brand ${
                            featured ? "text-xl md:text-2xl" : "text-base"
                        }`}
                    >
                        {meta.title}
                    </h3>

                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" aria-hidden />
                        <time dateTime={meta.date}>{formatted}</time>
                        {meta.readingTime ? (
                            <>
                                <span aria-hidden>·</span>
                                <span>{meta.readingTime} min read</span>
                            </>
                        ) : null}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
