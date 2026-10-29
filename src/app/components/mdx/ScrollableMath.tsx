"use client";

import { useEffect, useId, useRef, useState, type ComponentPropsWithoutRef } from 'react';
import { useT } from '../LocaleProvider';

export default function ScrollableMath(props: ComponentPropsWithoutRef<'span'>) {
  const t = useT();
  const hintId = useId();
  const region = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    const element = region.current;
    if (!element) return;
    const measure = () => setOverflow(element.scrollWidth > element.clientWidth + 1);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    if (element.firstElementChild) observer.observe(element.firstElementChild);
    measure();
    return () => observer.disconnect();
  }, []);

  return <span className="math-block">
    {overflow && <span id={hintId} className="math-scroll-hint text-xs text-muted-foreground">{t('detail.mathHint')}</span>}
    <span {...props} ref={region}
      role={overflow ? 'region' : undefined}
      aria-label={overflow ? t('detail.mathScroll') : undefined}
      aria-describedby={overflow ? hintId : undefined}
      tabIndex={overflow ? 0 : undefined} />
  </span>;
}
