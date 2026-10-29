import Link from "next/link";
import PostPreview, { PostMetadata } from "../PostPreview";
import type { PostItem } from "@/lib/posts";
import Tr from "../Tr";
import { getEditorialPosts } from "./editorial-posts";
import { sectionHeadingClass } from "@/lib/ui-styles";

export default function EditorialRecentPosts({ posts }: { posts: PostItem[] }) {
  const recent = getEditorialPosts(posts);

  const [featured, ...remaining] = recent;
  if (!featured) return null;

  return (
    <section
      id="recent-posts"
      aria-labelledby="recent-posts-title"
      className="scroll-mt-20 bg-background"
    >
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <header className="border-b pb-4">
          <div>
            <h2
              id="recent-posts-title"
              className={sectionHeadingClass}
            >
              <Tr id="landing.recent" />
            </h2>
          </div>
        </header>

        <div className="grid lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <article className="border-b lg:border-b-0">
            <Link
              href={`/blog/${featured.slug}`}
              className="group block py-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:py-10"
            >
              <div className="mb-5 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-accent-brand">
                {featured.meta.tags?.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
              </div>
              <h3 className="text-2xl font-semibold leading-snug tracking-tight [word-break:keep-all] transition-colors group-hover:text-accent-brand group-focus-visible:text-accent-brand sm:text-3xl lg:text-4xl">
                {featured.meta.title}
              </h3>
              {featured.meta.summary ? (
                <p className="mt-5 text-base leading-8 text-muted-foreground">{featured.meta.summary}</p>
              ) : null}
              <div className="mt-6"><PostMetadata meta={featured.meta} /></div>
            </Link>
          </article>
          {remaining.length > 0 ? (
            <ol className="divide-y border-b lg:border-b-0">
              {remaining.map(({ slug, meta }) => (
                <li key={slug}>
                  <Link href={`/blog/${slug}`} className="group flex py-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background">
                    <PostPreview meta={meta} />
                  </Link>
                </li>
              ))}
            </ol>
          ) : null}
        </div>

        <div className="mt-10 flex justify-end">
          <Link
            href="/blog"
            className="group/more inline-flex min-h-10 items-center gap-3 border-b border-foreground/30 text-sm font-semibold transition-colors hover:border-accent-brand hover:text-accent-brand focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          >
            <Tr id="landing.morePosts" />
          </Link>
        </div>
      </div>
    </section>
  );
}
