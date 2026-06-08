import Link from "next/link";
import { Calendar } from "lucide-react";
import type { PostItem } from "@/lib/posts";
import { formatPostDate } from "@/lib/post-display";

interface IRelatedPostsProps {
    posts: PostItem[];
}

export default function RelatedPosts({ posts }: IRelatedPostsProps) {
    if (!posts || posts.length === 0) return null;

    return (
        <section className="mt-12" aria-label="관련 글">
            <h2 className="mb-4 text-lg font-bold tracking-tight">관련 글</h2>
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {posts.map((p) => (
                    <li key={p.slug}>
                        <Link
                            href={`/blog/${p.slug}`}
                            className="group flex h-full flex-col gap-2 rounded-xl border bg-card p-4 transition hover:-translate-y-0.5 hover:border-accent-brand hover:shadow-md"
                        >
                            <h3 className="font-bold leading-snug line-clamp-2 group-hover:text-accent-brand">
                                {p.meta.title}
                            </h3>
                            <div className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" aria-hidden />
                                <time dateTime={p.meta.date}>
                                    {formatPostDate(p.meta.date)}
                                </time>
                                {p.meta.readingTime ? (
                                    <>
                                        <span aria-hidden>·</span>
                                        <span>{p.meta.readingTime} min</span>
                                    </>
                                ) : null}
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
