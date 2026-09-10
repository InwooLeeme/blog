import type { MetadataRoute } from "next";
import { getAllPosts, getAllSeries, getAllTags } from "@/lib/posts";
import { getNoteSlugs } from "@/lib/notes";
import { siteConfig } from "@/lib/site";
import { getAllTilRecords } from "@/lib/til-files";

const base = siteConfig.url.replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/blog",
    "/blog/series",
    "/about",
    "/notes",
    "/til",
    "/playground",
    "/graph",
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

  const tilRoutes: MetadataRoute.Sitemap = getAllTilRecords().map((record) => ({
    url: `${base}/til/${record.date}`,
    lastModified: new Date(`${record.date}T00:00:00Z`),
  }));

  return [
    ...staticRoutes,
    ...postRoutes,
    ...seriesRoutes,
    ...tagRoutes,
    ...noteRoutes,
    ...tilRoutes,
  ];
}
