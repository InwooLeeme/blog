import type { MetadataRoute } from "next";
import { getAllPosts, getAllSeries, getAllTags } from "@/lib/posts";
import { getNoteSlugs } from "@/lib/notes";
import { siteConfig } from "@/lib/site";

const base = siteConfig.url.replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/blog",
    "/blog/series",
    "/about",
    "/notes",
    "/playground",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.meta.date),
  }));

  const seriesRoutes: MetadataRoute.Sitemap = getAllSeries().map(({ series }) => ({
    url: `${base}/blog/series/${encodeURIComponent(series)}`,
  }));

  const tagRoutes: MetadataRoute.Sitemap = getAllTags(posts).map((tag) => ({
    url: `${base}/blog/tags/${encodeURIComponent(tag)}`,
  }));

  const noteRoutes: MetadataRoute.Sitemap = getNoteSlugs().map((slug) => ({
    url: `${base}/notes/${slug.map(encodeURIComponent).join("/")}`,
  }));

  return [
    ...staticRoutes,
    ...postRoutes,
    ...seriesRoutes,
    ...tagRoutes,
    ...noteRoutes,
  ];
}
