import {
  BrainCircuit,
  Code2,
  FolderKanban,
  Hash,
  Network,
  Table2,
  Trophy,
  type LucideProps,
} from "lucide-react";
import type { JSX } from "react";

/**
 * 실제 커버 이미지가 없거나(빈 문자열) 여러 글이 공유하는 플레이스홀더 커버일 때
 * PostCard·LatestHero가 함께 쓰는 대체 배경. 이미지 요청 없이 브랜드 톤 그라데이션 위에
 * 태그/시리즈 라벨 + 아이콘을 얹어, 카드 하단(혹은 오버레이)의 실제 제목과 텍스트가 겹치지
 * 않게 한다.
 * seed가 있으면(카드 그리드 렌더 인덱스) 5색 차트 팔레트를 순환시켜, 그리드에서 이웃한
 * 카드끼리는 항상 다른 색이 되도록 한다.
 * seed가 없으면(히어로) 브랜드색 고정.
 */
const PALETTE_VARS = [
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
] as const;

function pickPaletteVar(index: number): string {
  return PALETTE_VARS[index % PALETTE_VARS.length];
}

/** 라벨(태그/시리즈명)에 포함된 키워드로 대략적인 주제를 짐작해 아이콘을 고른다.
 *  매칭되는 키워드가 없으면 기본 Hash 아이콘으로 fallback.
 *  컴포넌트 참조 대신 엘리먼트를 직접 만들어 반환한다 — JSX 태그에 변수를 그대로 쓰면
 *  eslint(react-hooks/static-components)가 "렌더 중 컴포넌트 생성"으로 오인해 에러를 낸다. */
function renderCoverIcon(label: string | undefined, props: LucideProps): JSX.Element {
  const entries: [RegExp, (p: LucideProps) => JSX.Element][] = [
    [/graph|그래프/i, (p) => <Network {...p} />],
    [/dp\b|dynamic|다이나믹/i, (p) => <Table2 {...p} />],
    [/algorithm|알고리즘/i, (p) => <BrainCircuit {...p} />],
    [/boj|atcoder|leetcode|ps\b|solved\.ac/i, (p) => <Trophy {...p} />],
    [/개발|프로젝트|project|next\.?js/i, (p) => <Code2 {...p} />],
    [/시리즈|series/i, (p) => <FolderKanban {...p} />],
  ];
  const match = label && entries.find(([pattern]) => pattern.test(label));
  return match ? match[1](props) : <Hash {...props} />;
}

export default function CoverPlaceholder({ label, seed }: { label?: string; seed?: number }) {
  const colorVar = seed !== undefined ? pickPaletteVar(seed) : "--accent-brand";
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted"
      style={{
        backgroundImage: `linear-gradient(135deg, color-mix(in oklab, var(${colorVar}) 38%, transparent), var(--muted))`,
      }}
    >
      {renderCoverIcon(label, {
        className: "h-7 w-7",
        style: { color: `color-mix(in oklab, var(${colorVar}) 80%, var(--foreground))` },
        "aria-hidden": true,
      })}
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
