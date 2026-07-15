/**
 * 실제 커버 이미지가 없거나(빈 문자열) 여러 글이 공유하는 플레이스홀더 커버일 때
 * PostCard·LatestHero가 함께 쓰는 대체 배경. 이미지 요청 없이 브랜드 톤 그라데이션 위에
 * 태그/시리즈 라벨만 얹어, 카드 하단(혹은 오버레이)의 실제 제목과 텍스트가 겹치지 않게 한다.
 * seed가 있으면(카드 그리드, 보통 slug) 이를 해시해 5색 차트 팔레트 중 하나를 골라, 커버 없는
 * 카드들이 그리드에서 전부 같은 색으로 반복되는 걸 막는다 — 같은 태그를 공유하는 글이 나란히
 * 있어도 글마다 다른 색이 나오도록 라벨이 아닌 seed(slug) 기준으로 고른다.
 * seed가 없으면(히어로) 브랜드색 고정.
 */
const PALETTE_VARS = [
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
] as const;

function pickPaletteVar(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE_VARS[hash % PALETTE_VARS.length];
}

export default function CoverPlaceholder({ label, seed }: { label?: string; seed?: string }) {
  const colorVar = seed ? pickPaletteVar(seed) : "--accent-brand";
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-muted"
      style={{
        backgroundImage: `linear-gradient(135deg, color-mix(in oklab, var(${colorVar}) 22%, transparent), var(--muted))`,
      }}
    >
      {label ? (
        <span
          className="px-3 text-center text-sm font-semibold uppercase tracking-widest"
          style={{ color: `color-mix(in oklab, var(${colorVar}) 75%, var(--foreground))` }}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}
