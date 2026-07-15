import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import "katex/dist/katex.min.css";
import { mdxOptions } from "@/lib/mdx";
import { formatCategoryLabel, getNoteBySlug, getNoteSlugs } from "@/lib/notes";
import PreWithCopy from "@/app/components/mdx/pre-with-copy";
import { Callout } from "@/app/components/mdx/Callout/index";
import MdxImage from "@/app/components/mdx/MdxImage";
import { Rank } from "@/app/components/mdx/Rank";
import JsonLd from "@/app/components/JsonLd";
import { buildNoteArticleJsonLd, buildNoteBreadcrumbJsonLd } from "@/lib/jsonLd";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export function generateStaticParams() {
  return getNoteSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const note = getNoteBySlug(slug);
  if (!note) return {};
  const title = note.meta.title ?? slug[slug.length - 1];
  const description = note.meta.description;
  const canonical = `/notes/${slug.join("/")}`;
  return {
    title: `Notes | ${title}`,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const components = {
  pre: PreWithCopy,
  Callout,
  img: MdxImage,
  Image: MdxImage,
  Rank,
};

export default async function NotePage({ params }: PageProps) {
  const { slug } = await params;
  const note = getNoteBySlug(slug);
  if (!note) return notFound();

  const title = note.meta.title ?? slug[slug.length - 1];
  const breadcrumb = slug.slice(0, -1);

  return (
    <article id="note-article" className="w-full">
      <JsonLd
        data={[
          buildNoteArticleJsonLd(slug, note.meta),
          buildNoteBreadcrumbJsonLd(slug, title),
        ]}
      />
      <header className="mb-6 mt-2">
        {breadcrumb.length > 0 ? (
          <nav className="mb-1 text-xs text-muted-foreground">
            {breadcrumb.map(formatCategoryLabel).join(" / ")}
          </nav>
        ) : null}
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{title}</h1>
        {note.meta.description ? (
          <p className="mt-2 text-sm text-muted-foreground">{note.meta.description}</p>
        ) : null}
      </header>
      <div className="prose prose-zinc dark:prose-invert prose-main">
        <MDXRemote
          source={note.content}
          options={{ mdxOptions }}
          components={components}
        />
      </div>
    </article>
  );
}
