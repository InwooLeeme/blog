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

/** Only omit summaries that repeat the complete title (optionally followed by 풀이). */
export function getListSummary(title: string, summary?: string): string | null {
  if (!summary?.trim()) return null;
  const normalize = (text: string) => text.normalize('NFKC').toLocaleLowerCase().replace(/[\p{P}\p{Z}\s]/gu, '');
  const heading = normalize(title);
  const description = normalize(summary);
  return description === heading || description === `${heading}풀이` ? null : summary;
}

export function getKindTags(posts: PostItem[], kind: PostKind | 'all') {
  const counts = new Map<string, number>();
  for (const { meta } of posts) {
    if (kind !== 'all' && (meta.kind ?? 'article') !== kind) continue;
    for (const tag of new Set(meta.tags ?? [])) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts].map(([tag, count]) => ({tag, count})).sort((a,b) => b.count-a.count || a.tag.localeCompare(b.tag));
}
