import { PostMeta } from "@/lib/posts";
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AspectRatio } from "@/components/ui/aspect-ratio"

export default function PostCard({ slug, meta }: { slug: string, meta: PostMeta }) {
    const date = new Date(meta.date)
    const tags = meta.tags ?? []
    const display = tags.slice(0, 2)
    const rest = Math.max(0, tags.length - display.length)

    return (
        <Link href={`/blog/${slug}`} className="group block" aria-label={meta.title}>
            <Card className="overflow-hidden rounded-2xl transition hover:shadow-lg hover:-translate-y-0.5">
                <div className="relative">
                    <AspectRatio ratio={16 / 9}>
                        {meta.cover ? (
                            <Image
                                src={meta.cover}
                                alt={meta.title}
                                fill
                                className="object-cover"
                                sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                                priority={false}
                            />
                        ) : (
                            <div className="h-full w-full bg-gradient-to-br from-muted to-muted/50" />
                        )}
                    </AspectRatio>
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/10 opacity-0 group-hover:opacity-100 transition" />
                </div>

                <CardContent className="p-5">
                    <h3 className="text-base font-bold leading-snug line-clamp-2 hover:underline hover:decoration-blue-500 hover:text-blue-500">{meta.title}</h3>
                    {meta.summary && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{meta.summary}</p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <time dateTime={meta.date}>{date.toLocaleDateString()}</time>
                        {meta.readingTime ? <span aria-hidden>•</span> : null}
                        {meta.readingTime ? <span>{meta.readingTime} min read</span> : null}
                        <div className="ml-auto flex gap-1">
                            {display.map(t => (
                                <Badge key={t} variant="secondary" className="rounded-full">{t}</Badge>
                            ))}
                            {rest > 0 ? (
                                <Badge variant="outline" className="rounded-full">+{rest}</Badge>
                            ) : null}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}