import { PostMeta } from "@/lib/posts";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Calendar } from "lucide-react";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
});

export default function PostCard({ slug, meta }: { slug: string; meta: PostMeta }) {
    const date = new Date(meta.date);
    const formatted = DATE_FORMATTER.format(date);
    const coverSrc = meta.cover || `/blog/${slug}/opengraph-image`;

    return (
        <Link href={`/blog/${slug}`} className="group block" aria-label={meta.title}>
            <Card className="overflow-hidden h-full rounded-xl py-0 gap-0 transition hover:shadow-md hover:-translate-y-0.5 hover:border-accent-brand">
                <div className="relative overflow-hidden">
                    <AspectRatio ratio={16 / 9}>
                        <Image
                            src={coverSrc}
                            alt={meta.title}
                            fill
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                            sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                            priority={false}
                        />
                    </AspectRatio>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/10 opacity-0 group-hover:opacity-100 transition" />
                </div>

                <CardContent className="p-4">
                    <h3 className="text-base font-bold leading-snug line-clamp-2">{meta.title}</h3>

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

                    {meta.summary ? (
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                            {meta.summary}
                        </p>
                    ) : null}
                </CardContent>
            </Card>
        </Link>
    );
}
