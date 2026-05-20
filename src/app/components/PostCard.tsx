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

    return (
        <Link href={`/blog/${slug}`} className="group block" aria-label={meta.title}>
            <Card className="overflow-hidden h-full rounded-2xl transition hover:shadow-lg hover:-translate-y-0.5 hover:border-violet-600">
                {meta.cover ? (
                    <div className="relative">
                        <AspectRatio ratio={16 / 9}>
                            <Image
                                src={meta.cover}
                                alt={meta.title}
                                fill
                                className="object-cover"
                                sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                                priority={false}
                            />
                        </AspectRatio>
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/10 opacity-0 group-hover:opacity-100 transition" />
                    </div>
                ) : null}

                <CardContent className="p-5">
                    <h3 className="text-lg font-bold leading-snug line-clamp-2">{meta.title}</h3>

                    <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" aria-hidden />
                        <time dateTime={meta.date}>{formatted}</time>
                        {meta.readingTime ? (
                            <>
                                <span aria-hidden>·</span>
                                <span>{meta.readingTime} min read</span>
                            </>
                        ) : null}
                    </div>

                    {meta.summary ? (
                        <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                            {meta.summary}
                        </p>
                    ) : null}
                </CardContent>
            </Card>
        </Link>
    );
}
