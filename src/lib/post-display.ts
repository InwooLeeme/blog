/**
 * 포스트 메타를 화면 표시용으로 가공하는 헬퍼.
 * - 카드/리스트 컴포넌트들이 공유 (PostCard, LatestHero, RelatedPosts 등)
 * - fs를 import하지 않아 클라이언트/서버 어디서든 사용 가능
 */
import type { PostMeta } from "./posts";

const DATE_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

/** ISO 날짜 문자열을 표기용으로 포맷 — 예: "2026년 6월 4일" */
export function formatPostDate(date: string): string {
  return DATE_FORMATTER.format(new Date(date));
}

/** 카드 썸네일 소스 — cover가 없으면 글별 OG 이미지로 폴백 */
export function getCoverSrc(slug: string, meta: PostMeta): string {
  return meta.cover || `/blog/${slug}/opengraph-image`;
}
