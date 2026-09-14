import { ArrowRight } from "lucide-react";
import Link from "next/link";
import PostList from "../PostList";
import type { PostItem } from "@/lib/posts";
import Tr from "../Tr";
import { getEditorialPosts } from "./editorial-posts";
import { sectionHeadingClass } from "@/lib/ui-styles";
import { cn } from "@/lib/utils";

export default function EditorialRecentPosts({ posts }: { posts: PostItem[] }) {
  const recent = getEditorialPosts(posts);

  if (recent.length === 0) return null;

  return (
    <section
      id="recent-posts"
      aria-labelledby="recent-posts-title"
      className="scroll-mt-20 bg-background"
    >
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <header className="grid gap-3 border-b pb-4 md:grid-cols-[1fr_1.35fr] md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-accent-brand">
              01 / <Tr id="landing.recentEyebrow" />
            </p>
            <h2
              id="recent-posts-title"
              className={cn(sectionHeadingClass, "mt-3")}
            >
              <Tr id="landing.recent" />
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted-foreground md:justify-self-end md:text-base">
            <Tr id="landing.recentIntro" />
          </p>
        </header>

        <PostList posts={recent} showCovers={false} />

        <div className="mt-10 flex justify-end">
          <Link
            href="/blog"
            className="group/more inline-flex min-h-10 items-center gap-3 border-b border-foreground/30 text-sm font-semibold transition-colors hover:border-accent-brand hover:text-accent-brand focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          >
            <Tr id="landing.morePosts" />
            <ArrowRight className="h-4 w-4 transition-transform group-hover/more:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
