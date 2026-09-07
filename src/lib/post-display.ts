/**
 * 포스트 메타를 화면 표시용으로 가공하는 헬퍼.
 * - 카드/리스트 컴포넌트들이 공유 (PostCard, LatestHero, RelatedPosts 등)
 * - fs를 import하지 않아 클라이언트/서버 어디서든 사용 가능
 */
import type { CoverFit, PostMeta } from "./posts";

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

/** 카드 묶음에서 실제 네트워크 이미지를 쓰는 첫 항목을 찾아 LCP 우선순위를 정한다. */
export function getFirstCardCoverIndex(metas: PostMeta[]): number {
  return metas.findIndex((meta) => getCardCoverSrc(meta) !== null);
}

/** 글 상세 커버의 맞춤 방식. 공용 로고 이미지는 기본적으로 잘리지 않게 표시한다. */
export function getPostCoverFit(meta: PostMeta): CoverFit {
  if (meta.coverFit) return meta.coverFit;
  return meta.cover && SHARED_PLACEHOLDER_COVERS.has(meta.cover)
    ? "contain"
    : "cover";
}

/** 플레이스홀더 커버에 표시할 라벨 — 첫 태그 우선, 없으면 시리즈명 */
export function getCoverLabel(meta: PostMeta): string | undefined {
  return meta.tags?.[0] ?? meta.series;
}

/** 회차성 글의 컴팩트 라벨 — 제목에서 시리즈명 접두와 "[BOJ] " 접두를 제거한다.
 *  "Atcoder Weekday Contest 076" (series "AtCoder Weekday Contest") → "076"
 *  "[BOJ] 27958번 사격 연습"                                        → "27958번 사격 연습"
 *  결과가 비면 원제목으로 fallback. */
export function getEpisodeLabel(meta: PostMeta): string {
  let label = meta.title.trim();
  if (meta.series) {
    const lowered = label.toLowerCase();
    const seriesLower = meta.series.toLowerCase();
    if (lowered.startsWith(seriesLower)) {
      label = label.slice(meta.series.length).replace(/^[\s:·\-–—]+/, "").trim();
    }
  }
  label = label.replace(/^\[BOJ\]\s*/i, "").trim();
  return label || meta.title;
}
