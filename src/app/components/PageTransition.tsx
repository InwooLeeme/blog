"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

/**
 * 라우트 이동 시 새 페이지 콘텐츠를 fade + slide-up으로 등장시킨다.
 * pathname을 key로 주어 경로가 바뀔 때마다 리마운트 → 애니메이션 재생.
 * View Transitions API를 쓰지 않으므로 테마 리플과 충돌하지 않는다.
 */
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div
      key={pathname}
      className="animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out motion-reduce:animate-none"
    >
      {children}
    </div>
  );
}
