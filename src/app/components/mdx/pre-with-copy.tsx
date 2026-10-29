"use client";

import { useEffect, useId, useRef, useState, type HTMLAttributes } from 'react';
import { useT } from '../LocaleProvider';

type PreProps = HTMLAttributes<HTMLPreElement> & { 'data-language'?: string; collapsible?: boolean };

export function ArticlePre(props: PreProps) {
  return <PreWithCopy {...props} collapsible />;
}

export default function PreWithCopy({ className = '', children, collapsible = false, ...props }: PreProps) {
  const t = useT();
  const codeId = useId();
  const [expanded, setExpanded] = useState(false);
  const [lineCount, setLineCount] = useState(0);
  const foldable = lineCount > 20;
  const preRef = useRef<HTMLPreElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  useEffect(() => {
    // Count the highlighted lines after MDX has rendered; copying still uses the full code DOM.
    if (!collapsible) return;
    const count = preRef.current?.querySelectorAll('code > [data-line]').length ?? 0;
    setLineCount(count);
  }, [children, collapsible]);

  async function onCopy() {
    if (timer.current) clearTimeout(timer.current);
    try {
      const text = preRef.current?.querySelector('code')?.textContent ?? preRef.current?.textContent ?? '';
      await navigator.clipboard.writeText(text);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
    timer.current = setTimeout(() => setStatus('idle'), 3000);
  }

  return <div className="code-block my-6 min-w-0" data-folded={foldable && !expanded ? "true" : undefined}>
    <div className="flex min-h-12 flex-wrap items-center justify-between gap-x-3 border border-b-0 px-3 text-sm">
      <span className="font-mono text-muted-foreground">{props['data-language'] === 'plaintext' ? t('detail.code') : props['data-language'] ?? t('detail.code')}</span>
      {foldable && <button type="button" aria-expanded={expanded} aria-controls={codeId} onClick={() => setExpanded(!expanded)} className="min-h-11 px-2 text-sm font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring">{t(expanded ? 'detail.collapseCode' : 'detail.expandCode', { n: lineCount })}</button>}
      <button type="button" onClick={onCopy} className="min-h-11 px-2 text-sm font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">{status === 'copied' ? t('post.copied') : t('detail.copyCode')}</button>
      <span role="status" aria-live="polite" className={status === 'failed' ? 'w-full pb-2 text-sm text-foreground' : 'sr-only'}>{status === 'copied' ? t('post.copied') : status === 'failed' ? t('detail.copyFailed') : ''}</span>
    </div>
    {foldable && !expanded && <p className="code-preview-label border-x px-3 text-xs text-muted-foreground">{t('detail.codePreview', { n: lineCount })}</p>}
    <pre {...props} id={codeId} ref={preRef} tabIndex={0} aria-label={t('detail.codeScroll')} className={`overflow-x-auto focus-visible:outline-2 focus-visible:outline-ring ${className}`}>{children}</pre>
  </div>;
}
