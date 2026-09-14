"use client";

import { useEffect, useRef } from "react";
import { getReadingProgress } from "./reading-progress";
import { subscribeToScroll } from "./scroll-subscriber";

/** 블로그 본문만 측정한다. 댓글·관련 글·푸터 높이는 진행률에 영향을 주지 않는다. */
export default function ReadingProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    const header = bar?.closest("header");
    const main = document.getElementById("main-content");
    if (!bar || !header || !main) return;

    let observedBody: HTMLElement | null = null;
    const update = () => {
      const body = document.getElementById("post-body");
      if (body !== observedBody) {
        if (observedBody) resizeObserver.unobserve(observedBody);
        if (body) resizeObserver.observe(body);
        observedBody = body;
      }
      const progress = body
        ? getReadingProgress(
            body.getBoundingClientRect(),
            document.documentElement.clientHeight,
            header.getBoundingClientRect().bottom,
          )
        : 0;
      bar.style.transform = `scaleX(${progress})`;
    };

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(main);
    resizeObserver.observe(header);
    // 스트리밍 중 뒤늦게 도착하는 본문도 감지한다.
    const mutationObserver = new MutationObserver(update);
    mutationObserver.observe(main, { childList: true, subtree: true });
    const unsubscribe = subscribeToScroll(update);
    window.addEventListener("resize", update);
    main.addEventListener("animationend", update);
    update();

    return () => {
      unsubscribe();
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", update);
      main.removeEventListener("animationend", update);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden">
      <div
        ref={barRef}
        className="h-full w-full origin-left bg-accent-brand"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
