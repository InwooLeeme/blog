'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { PostItem, PostKind } from '@/lib/posts';
import { useT } from '../../components/LocaleProvider';
import { formatPostDate } from '@/lib/post-display';
import { filterPosts, getKindTags, getListSummary, getVisiblePostCount, POST_PAGE_SIZE } from './filter-posts';
import { useBlogLocation } from './use-blog-location';

const focus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background';

export default function BlogExplorer({ posts }: { posts: PostItem[] }) {
  const t = useT();
  const { query, tag, kind, shown, update } = useBlogLocation();
  const [expanded, setExpanded] = useState(false);
  const sortedTags = useMemo(() => getKindTags(posts, kind), [posts, kind]);
  const visibleTags = expanded ? sortedTags : sortedTags.filter((item,index) => index < 5 || item.tag === tag);
  const results = useMemo(() => filterPosts(posts, query, tag, kind), [posts,query,tag,kind]);
  const visibleCount = getVisiblePostCount(shown, results.length);
  const list = useRef<HTMLOListElement>(null);
  const resultStatus = useRef<HTMLParagraphElement>(null);
  const pendingFocus = useRef<number | 'results' | null>(null);
  useLayoutEffect(() => {
    const target = pendingFocus.current;
    pendingFocus.current = null;
    if (target === null) return;
    const element = target === 'results' ? resultStatus.current : list.current?.children[target]?.querySelector<HTMLAnchorElement>('h2 a');
    element?.focus({preventScroll: true});
    element?.scrollIntoView({block: 'start', behavior: 'instant'});
  });
  const showMore = () => {
    pendingFocus.current = visibleCount;
    update({shown: visibleCount + POST_PAGE_SIZE});
  };
  const selectPostTag = (value: string) => {
    pendingFocus.current = 'results';
    update({tag: value});
    // Selecting the already-active tag still brings the result summary into view.
    if (tag === value && !shown) {
      pendingFocus.current = null;
      resultStatus.current?.focus({preventScroll: true});
      resultStatus.current?.scrollIntoView({block: 'start', behavior: 'instant'});
    }
  };
  const active = Boolean(query || tag || kind !== 'all');
  const reset = () => update({q: '', tag: null, kind: 'all'});
  const changeKind = (next: PostKind | 'all') => {
    const available = getKindTags(posts, next);
    update({kind: next, tag: available.some(item => item.tag === tag) ? tag : null});
  };
  const buttonClass = (selected: boolean) => `min-h-11 rounded-sm px-3 text-sm ${focus} ${selected ? 'bg-muted font-semibold text-foreground underline decoration-accent-brand decoration-2 underline-offset-8' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`;

  return (
    <div className="mx-auto w-full max-w-4xl px-5 pb-16 pt-8 sm:px-8 sm:pt-12">
      <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 border-b pb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('blog.pageTitle')} <span className="ml-2 text-lg font-normal tabular-nums text-muted-foreground">{posts.length}</span></h1>
        <nav aria-label={t('blog.explore')} className="flex gap-6 text-sm">
          <Link href="/blog/series" className={`inline-flex min-h-11 items-center underline-offset-4 hover:underline ${focus}`}>{t('series.title')}</Link>
          <Link href="/graph" className={`inline-flex min-h-11 items-center underline-offset-4 hover:underline ${focus}`}>{t('nav.graph')}</Link>
        </nav>
      </header>
      <section aria-label={t('blog.filters')} className="space-y-5 py-6">
        <div>
          <label htmlFor="blog-search" className="mb-2 block text-sm font-medium">{t('blog.searchLabel')}</label>
          <input id="blog-search" type="search" value={query} onChange={e => update({q: e.target.value})} placeholder={t('blog.searchPlaceholder')} aria-controls="blog-results" className={`min-h-12 w-full rounded-sm border border-border bg-background px-4 text-base placeholder:text-muted-foreground ${focus}`} />
        </div>
        <fieldset>
          <legend className="sr-only">{t('blog.kind')}</legend>
          <div className="flex flex-wrap gap-1">
            {(['all','article','solve-log'] as const).map(value => <button key={value} type="button" aria-pressed={kind === value} onClick={() => changeKind(value)} className={buttonClass(kind === value)}>{t(value === 'all' ? 'sidebar.all' : value === 'article' ? 'blog.articles' : 'blog.solveLogs')}</button>)}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-1 text-sm font-medium">{t('blog.tags')}</legend>
          <div className="flex flex-wrap gap-1">
            <button type="button" aria-pressed={!tag} onClick={() => update({tag: null})} className={buttonClass(!tag)}>{t('sidebar.all')}</button>
            {visibleTags.map(item => <button type="button" key={item.tag} aria-pressed={tag === item.tag} onClick={() => update({tag: tag === item.tag ? null : item.tag})} className={buttonClass(tag === item.tag)}>{item.tag} <span className="ml-1 tabular-nums text-muted-foreground">{item.count}</span></button>)}
            {sortedTags.length > 5 && <button type="button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)} className={`min-h-11 px-3 text-sm underline underline-offset-4 ${focus}`}>{t(expanded ? 'blog.tagsLess' : 'blog.tagsAll')}</button>}
          </div>
        </fieldset>
      </section>
      <section aria-label={t('blog.pageTitle')}>
        <div className="flex min-h-12 flex-wrap items-center justify-between gap-x-4 border-b pb-2 text-sm text-muted-foreground">
          <p ref={resultStatus} tabIndex={-1} className="scroll-mt-28 focus-visible:outline-2 focus-visible:outline-ring" role="status" aria-live="polite" aria-atomic="true">{t('blog.resultCount',{n:results.length})}{tag ? ` · ${tag}` : ''} · {t('blog.latestFirst')}</p>
          {active && <button type="button" onClick={reset} className={`min-h-11 text-foreground underline underline-offset-4 ${focus}`}>{t('blog.reset')}</button>}
        </div>
        <ol ref={list} id="blog-results" className="divide-y border-b">
          {results.slice(0, visibleCount).map(({slug,meta}) => <li key={slug}>
            <article className="py-6 sm:py-7">
              <h2 className="text-xl font-semibold leading-snug tracking-tight sm:text-2xl"><Link href={`/blog/${slug}`} className={`scroll-mt-28 rounded-sm underline-offset-4 hover:underline ${focus}`}>{meta.title}</Link></h2>
              {getListSummary(meta.title, meta.summary) && <p className="mt-3 line-clamp-2 text-sm leading-7 text-foreground/75 sm:text-base">{meta.summary}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
                <time dateTime={meta.date}>{formatPostDate(meta.date)}</time>
                {meta.readingTime && <span>{t('post.readingTime',{n:meta.readingTime})}</span>}
                {meta.tags?.slice(0,3).map(item => <button type="button" key={item} onClick={() => selectPostTag(item)} aria-label={t('blog.filterTag', {tag: item})} aria-controls="blog-results" className={`min-h-11 rounded-sm px-1 underline-offset-4 hover:text-foreground hover:underline focus-visible:underline ${focus}`}>{item}</button>)}
              </div>
            </article>
          </li>)}
        </ol>
        {results.length > 0 && <div className="flex flex-col items-center gap-2 py-6">
          <p role="status" aria-live="polite" aria-atomic="true" className="text-sm text-muted-foreground">{t('blog.visibleCount', {shown: visibleCount, total: results.length})}</p>
          {visibleCount < results.length && <button type="button" onClick={showMore} aria-controls="blog-results" className={`min-h-11 rounded-sm px-5 text-sm underline underline-offset-4 ${focus}`}>{t('blog.showMore')}</button>}
        </div>}
        {results.length === 0 && <div className="py-16 text-center"><p className="font-medium">{t('blog.noResults')}</p><p className="mt-2 text-sm text-muted-foreground">{t('blog.tryAgain')}</p></div>}
      </section>
    </div>
  );
}
