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

/** 여러 글이 공유해 카드에서 반복되는 플레이스홀더 커버 (예: 시리즈 공용 로고) */
const SHARED_PLACEHOLDER_COVERS = new Set(["/Atcoder_Thumbnail.png"]);

/**
 * 카드 그리드용 커버 소스. 실제 커버 이미지가 있으면 그대로 쓰고,
 * 없거나(빈 문자열) 공유 플레이스홀더면 null을 반환한다 — 호출부는 이때
 * OG 이미지(제목이 박혀 있어 카드 제목과 중복됨) 대신 CoverPlaceholder를 그린다.
 */
export function getCardCoverSrc(meta: PostMeta): string | null {
  if (meta.cover && !SHARED_PLACEHOLDER_COVERS.has(meta.cover)) return meta.cover;
  return null;
}

/** 플레이스홀더 커버에 표시할 라벨 — 첫 태그 우선, 없으면 시리즈명 */
export function getCoverLabel(meta: PostMeta): string | undefined {
  return meta.tags?.[0] ?? meta.series;
}
