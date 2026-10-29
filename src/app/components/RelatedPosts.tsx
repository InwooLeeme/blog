import { cn } from "@/lib/utils";
import Link from "next/link";
import type { PostItem } from "@/lib/posts";
import { formatPostDate } from "@/lib/post-display";
import Tr from "./Tr";

interface IRelatedPostsProps {
    posts: PostItem[];
}

export default function RelatedPosts({ posts }: IRelatedPostsProps) {
    if (!posts || posts.length === 0) return null;

    return (
        <section className="mt-12" aria-labelledby="related-posts-title">
            <h2 id="related-posts-title" className="mb-4 text-lg font-bold tracking-tight"><Tr id="post.related" /></h2>
            <ul className="divide-y border-y">
                {posts.map((p) => (
                    <li key={p.slug}>
                        <Link
                            href={`/blog/${p.slug}`}
                            className={cn("group flex h-full flex-col gap-2 py-4 focus-visible:outline-2 focus-visible:outline-ring")}
                        >
                            <h3 className="font-bold leading-snug line-clamp-2 group-hover:text-accent-brand">
                                {p.meta.title}
                            </h3>
                            <div className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">

                                <time dateTime={p.meta.date}>
                                    {formatPostDate(p.meta.date)}
                                </time>
                                {p.meta.readingTime ? (
                                    <>
                                        <span aria-hidden>·</span>
                                        <span><Tr id="post.readingTime" params={{ n: p.meta.readingTime }} /></span>
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
