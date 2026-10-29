'use client';
import type { ComponentPropsWithoutRef } from 'react';
import { useT } from '../LocaleProvider';

export default function ArticleLink(props: ComponentPropsWithoutRef<'a'>) {
  const t = useT();
  if (!props.className?.split(' ').includes('anchor')) return <a {...props} />;
  let title = props.href?.slice(1) ?? '';
  try { title = decodeURIComponent(title).replaceAll('-', ' '); } catch { /* Keep malformed fragments readable. */ }
  return <a {...props} aria-label={t('detail.sectionLink', { title })} />;
}
