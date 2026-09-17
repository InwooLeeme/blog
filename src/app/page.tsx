import { getAllPosts } from "@/lib/posts";
import JsonLd from "./components/JsonLd";
import { buildWebSiteJsonLd, buildPersonJsonLd } from "@/lib/jsonLd";
import type { Metadata } from "next";
import ParticleEditorialHero from "./components/home/ParticleEditorialHero";
import EditorialRecentPosts from "./components/home/EditorialRecentPosts";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  const posts = getAllPosts();

  return (
    <>
      <JsonLd data={[buildWebSiteJsonLd(), buildPersonJsonLd()]} />
      <ParticleEditorialHero />
      <EditorialRecentPosts posts={posts} />
    </>
  );
}
