import type { PostItem, PostKind } from '@/lib/posts';

export function filterPosts(posts: PostItem[], query: string, tag: string | null, kind: PostKind | 'all') {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return posts.filter(({ meta }) => {
    const text = [meta.title, ...(meta.tags ?? [])].join(' ').toLocaleLowerCase();
    return (!tag || meta.tags?.includes(tag)) &&
      (kind === 'all' || (meta.kind ?? 'article') === kind) &&
      terms.every(term => text.includes(term));
  }).sort((a, b) => b.meta.date.localeCompare(a.meta.date) || a.slug.localeCompare(b.slug));
}
