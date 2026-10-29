import { getAllPosts, getTagCounts } from '@/lib/posts';
import BlogExplorer from './_components/BlogExplorer';
import type { Metadata } from 'next';

export const metadata: Metadata = { alternates: { canonical: '/blog' } };

export default function BlogIndexPage() {
  const posts = getAllPosts().map(({ slug, meta }) => ({ slug, meta }));
  return <BlogExplorer posts={posts} tags={getTagCounts(posts)} />;
}
