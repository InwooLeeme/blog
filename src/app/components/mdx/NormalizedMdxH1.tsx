import type { ComponentPropsWithoutRef } from "react";
import { normalizeMdxHeadingLevel } from "@/lib/mdx-heading";

/** PostHeader의 페이지 h1과 중복되지 않게 MDX의 h1을 h2로 렌더링한다. */
export default function NormalizedMdxH1(
  props: ComponentPropsWithoutRef<"h2">,
) {
  const Heading = `h${normalizeMdxHeadingLevel(1)}` as "h2";
  return <Heading {...props} />;
}
