"use client";

import {
  LazyMotion,
  domAnimation,
  m,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import ShootingStars from "./ShootingStars";

/**
 * 홈 히어로 배경 — 스크롤에 따라 글로우/별빛이 다른 속도로 움직이는 패럴랙스.
 * 모션 값으로 구동해 React 리렌더 없이 부드럽게 처리한다.
 */
export default function HeroParallax() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  // 스크롤 내릴수록 배경이 아래로(느리게) → 깊이감. reduced면 이동 0.
  const glowY = useTransform(scrollY, [0, 400], [0, reduced ? 0 : 220]);
  const starsY = useTransform(scrollY, [0, 400], [0, reduced ? 0 : 110]);

  return (
    <LazyMotion features={domAnimation}>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[34rem] w-[48rem] -translate-x-1/2 -translate-y-1/2">
          <m.div
            className="h-full w-full rounded-full opacity-25 blur-[100px]"
            style={{ y: glowY, background: "var(--accent-gradient)" }}
          />
        </div>
        <m.div className="absolute inset-0" style={{ y: starsY }}>
          <ShootingStars />
        </m.div>
      </div>
    </LazyMotion>
  );
}
