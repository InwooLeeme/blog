"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** 등장 지연(ms) — 목록에서 스태거 효과 줄 때 사용 */
  delay?: number;
  /** 렌더할 태그 (기본 div) */
  as?: React.ElementType;
  /**
   * true(기본): 한 번 등장하면 계속 표시 — 콘텐츠에 적합
   * false: 뷰포트를 벗어나면 다시 사라지고, 들어오면 재생 — 장식 요소용
   */
  once?: boolean;
}

/**
 * 스크롤로 뷰포트에 들어오면 fade + slide-up으로 등장하는 래퍼.
 * - IntersectionObserver 기반 (브라우저 호환성 ↑)
 * - prefers-reduced-motion이면 애니메이션 없이 즉시 표시
 * - once=true면 1회 재생, once=false면 진입/이탈마다 재생
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  once = true,
}: RevealProps) {
  const ref = React.useRef<HTMLElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 모션 최소화 설정이면 즉시 표시 — 클라이언트 전용 API라 effect 안에서만 판별 가능
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      return;
    }

    // 마운트 시 이미 뷰포트 안이면 즉시 표시
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true);
      if (once) return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);

    // 옵저버가 끝내 발화하지 않아도 콘텐츠가 사라지지 않도록 안전장치
    const fallback = window.setTimeout(() => setVisible(true), 700);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, [once]);

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      className={cn(
        "transition-all duration-700 ease-out motion-reduce:transition-none",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
