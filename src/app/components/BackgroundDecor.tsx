/**
 * 사이트 전역 배경 텍스처 — 은은한 dot grid.
 * 상단에서 점이 보이다 아래로 사라지도록 마스크 처리해 콘텐츠 가독성을 해치지 않는다.
 * fixed + -z-10 + pointer-events-none 이라 어느 페이지에서도 콘텐츠 뒤에 깔린다.
 */
export default function BackgroundDecor() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-[0.18] dark:opacity-[0.10]"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, var(--border) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          WebkitMaskImage:
            "radial-gradient(ellipse 100% 60% at 50% 0%, #000 30%, transparent 95%)",
          maskImage:
            "radial-gradient(ellipse 100% 60% at 50% 0%, #000 30%, transparent 95%)",
        }}
      />
    </div>
  );
}
