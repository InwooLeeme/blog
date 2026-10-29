"use client";
import { useT } from "./LocaleProvider";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { PostItem } from "@/lib/posts";
import Tr from "./Tr";

interface IPostNavigationProps {
    prev: PostItem | null;
    next: PostItem | null;
}

export default function PostNavigation({ prev, next }: IPostNavigationProps) {
    const t = useT();
    if (!prev && !next) return null;

    return (
        <nav
            aria-label={t("detail.dateNavigation")}
            className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
            {prev ? (
                <Link
                    href={`/blog/${prev.slug}`}
                    className={cn("group flex min-h-11 flex-col gap-2 border-t py-4 focus-visible:outline-2 focus-visible:outline-ring")}
                >
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <Tr id="detail.older" />
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
                    className={cn("group flex min-h-11 flex-col gap-2 border-t py-4 focus-visible:outline-2 focus-visible:outline-ring sm:items-end sm:text-right")}
                >
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <Tr id="detail.newer" />
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
