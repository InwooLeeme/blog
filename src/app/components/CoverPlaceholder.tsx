/**
 * 실제 커버 이미지가 없거나(빈 문자열) 여러 글이 공유하는 플레이스홀더 커버일 때
 * PostCard·LatestHero가 함께 쓰는 대체 배경. 이미지 요청 없이 브랜드 톤 그라데이션 위에
 * 태그/시리즈 라벨만 얹어, 카드 하단(혹은 오버레이)의 실제 제목과 텍스트가 겹치지 않게 한다.
 */
export default function CoverPlaceholder({ label }: { label?: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent-brand/15 via-muted to-muted">
      {label ? (
        <span className="px-3 text-center text-sm font-semibold uppercase tracking-widest text-accent-brand/70">
          {label}
        </span>
      ) : null}
    </div>
  );
}
