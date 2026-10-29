import type { ComponentPropsWithoutRef } from 'react';
import ScrollableMath from './ScrollableMath';

export default function ArticleSpan(props: ComponentPropsWithoutRef<'span'>) {
  return props.className?.split(/\s+/).includes('katex-display')
    ? <ScrollableMath {...props} />
    : <span {...props} />;
}
