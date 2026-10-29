"use client";
import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from 'react';
import { useT } from '../LocaleProvider';

export default function ScrollableTable(props: ComponentPropsWithoutRef<'table'>) {
  const t = useT();
  const region = useRef<HTMLDivElement>(null);
  const table = useRef<HTMLTableElement>(null);
  const [overflow, setOverflow] = useState(false);
  useEffect(() => {
    const element = region.current;
    const content = table.current;
    if (!element || !content) return;
    const observer = new ResizeObserver(() => setOverflow(element.scrollWidth > element.clientWidth + 1));
    observer.observe(element);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);
  return <div className="my-6">
    {overflow && <p className="table-scroll-hint text-xs text-muted-foreground">{t('detail.tableHint')}</p>}
    <div ref={region} role={overflow ? 'region' : undefined} aria-label={overflow ? t('detail.tableScroll') : undefined} tabIndex={overflow ? 0 : undefined} className="max-w-full overflow-x-auto focus-visible:outline-2 focus-visible:outline-ring"><table {...props} ref={table} /></div>
  </div>;
}
