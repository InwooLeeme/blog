import type { CSSProperties } from "react";
import { techIcon } from "@/lib/tech";

/** currentColor로 그려지는 브랜드 로고 */
export default function BrandIcon({
  tech,
  className,
  style,
}: {
  tech: string;
  className?: string;
  style?: CSSProperties;
}) {
  const icon = techIcon(tech);
  if (!icon) return null;
  return (
    <svg
      role="img"
      aria-hidden
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="currentColor"
      className={className}
      style={style}
    >
      <path d={icon.path} />
    </svg>
  );
}
