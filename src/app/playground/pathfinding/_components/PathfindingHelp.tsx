import { ALGORITHMS } from "../_lib/algorithms";

export default function PathfindingHelp() {
  return (
    <details id="pathfinding-help" className="scroll-mt-24 border-t border-border px-4 py-4 sm:px-6">
      <summary className="w-fit cursor-pointer rounded-lg py-2 text-sm font-medium text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand">알고리즘과 조작 방법</summary>
      <div className="mt-4 grid gap-6 text-sm leading-7 text-muted-foreground md:grid-cols-2">
        <dl className="space-y-4">{ALGORITHMS.map(({ id, label, description }) => <div key={id}><dt className="font-semibold text-foreground">{label}</dt><dd>{description}</dd></div>)}</dl>
        <div className="space-y-3">
          <p>벽과 지우개는 드래그하고, 시작·도착점은 눌러서 배치하세요. 시작·도착점 위에는 벽을 그릴 수 없습니다.</p>
          <p>방향키로 칸을 이동하고 Enter 또는 Space로 편집합니다. 좁은 화면에서는 ‘이동’을 선택해 지도를 좌우로 밀어보세요. ‘편집’으로 돌아오면 다시 그릴 수 있습니다.</p>
          <p>다른 탭으로 이동하면 일시정지합니다. 모션 감소 설정에서는 애니메이션 없이 결과를 표시합니다.</p>
          <p>같은 지도에서 알고리즘을 바꿔 실행하면 결과가 비교표에 쌓입니다. 모든 이동 비용은 1이며, 탐색한 칸 수는 실행 시간 측정값이 아닙니다.</p>
        </div>
      </div>
    </details>
  );
}
