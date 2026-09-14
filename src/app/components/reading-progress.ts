export function isPostDetailPath(pathname: string): boolean {
  const segments = pathname.replace(/\/$/, "").split("/");
  return segments.length === 3 && segments[1] === "blog" &&
    Boolean(segments[2]) && !["series", "tags"].includes(segments[2]);
}

export function getReadingProgress(
  body: { top: number; bottom: number },
  viewportHeight: number,
  headerBottom: number,
): number {
  const height = body.bottom - body.top;
  const visibleHeight = viewportHeight - headerBottom;
  if (height <= 0 || visibleHeight <= 0) return 0;

  // 한 화면에 들어오는 본문은 마지막 줄이 보이면 읽기 완료로 처리한다.
  if (height <= visibleHeight) return body.bottom <= viewportHeight ? 1 : 0;

  const distance = height - visibleHeight;
  return Math.min(1, Math.max(0, (headerBottom - body.top) / distance));
}
