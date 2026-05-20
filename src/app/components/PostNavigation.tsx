import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { PostItem } from "@/lib/posts";

interface IPostNavigationProps {
    prev: PostItem | null;
    next: PostItem | null;
}

export default function PostNavigation({ prev, next }: IPostNavigationProps) {
    if (!prev && !next) return null;

    return (
        <nav
            aria-label="이전/다음 글"
            className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
            {prev ? (
                <Link
                    href={`/blog/${prev.slug}`}
                    className="group flex flex-col gap-1 rounded-xl border bg-card p-4 transition hover:-translate-y-0.5 hover:border-accent-brand hover:shadow-md"
                >
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                        이전 글
                    </span>
                    <span className="font-bold leading-snug line-clamp-2 group-hover:text-accent-brand">
                        {prev.meta.title}
                    </span>
                </Link>
            ) : (
                <div aria-hidden className="hidden sm:block" />
            )}
            {next ? (
                <Link
                    href={`/blog/${next.slug}`}
                    className="group flex flex-col gap-1 rounded-xl border bg-card p-4 transition hover:-translate-y-0.5 hover:border-accent-brand hover:shadow-md sm:items-end sm:text-right"
                >
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        다음 글
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                    <span className="font-bold leading-snug line-clamp-2 group-hover:text-accent-brand">
                        {next.meta.title}
                    </span>
                </Link>
            ) : (
                <div aria-hidden className="hidden sm:block" />
            )}
        </nav>
    );
}
