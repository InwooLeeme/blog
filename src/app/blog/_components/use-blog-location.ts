'use client';

import { useEffect, useSyncExternalStore } from 'react';
import type { PostKind } from '@/lib/posts';

const eventName = 'blog-location-change';
function subscribe(notify: () => void) {
  window.addEventListener('popstate', notify);
  window.addEventListener(eventName, notify);
  return () => {
    window.removeEventListener('popstate', notify);
    window.removeEventListener(eventName, notify);
  };
}
const snapshot = () => window.location.search;
const serverSnapshot = () => '';

export function useBlogLocation() {
  const search = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const params = new URLSearchParams(search);
  const query = params.get('q') ?? '';
  const tag = params.get('tag') || null;
  const rawKind = params.get('kind');
  const kind: PostKind | 'all' = rawKind === 'article' || rawKind === 'solve-log' ? rawKind : 'all';

  function update(values: { q?: string; tag?: string | null; kind?: PostKind | 'all' }) {
    const url = new URL(window.location.href);
    for (const [key, value] of Object.entries(values)) {
      if (!value || (key === 'kind' && value === 'all')) url.searchParams.delete(key);
      else url.searchParams.set(key, value);
    }
    // Replace while typing/filtering so Back returns to the previous page, not every keystroke.
    window.history.replaceState(window.history.state, '', url);
    window.dispatchEvent(new Event(eventName));
  }

  useEffect(() => {
    const key = `blog-scroll:${window.location.search}`;
    let frame = 0;
    try {
      const saved = sessionStorage.getItem(key);
      if (saved !== null) {
        const y = Number(saved);
        if (Number.isFinite(y) && y >= 0) frame = requestAnimationFrame(() => window.scrollTo({top: y, behavior: 'instant'}));
      }
    } catch { /* Browsing still works when storage is unavailable. */ }
    const save = () => {
      if (window.location.pathname !== '/blog') return;
      try { sessionStorage.setItem(`blog-scroll:${window.location.search}`, String(window.scrollY)); } catch {}
    };
    // Capture before navigation; avoid writing on every scroll frame.
    document.addEventListener('click', save, true);
    window.addEventListener('pagehide', save);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('click', save, true);
      window.removeEventListener('pagehide', save);
    };
  }, []);
  return { query, tag, kind, update };
}
