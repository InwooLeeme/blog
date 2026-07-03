"use client";

import { useEffect } from "react";

/**
 * 겹쳐 호출된 View Transition이 중단되면 브라우저가 finished/ready 프라미스를
 * reject하는데(크롬 버전에 따라 InvalidStateError 또는 AbortError), next-view-transitions와
 * ThemeToggle 어디도 이를 처리하지 않아 콘솔에 unhandledRejection으로 뜬다. 정상 동작이므로 무시한다.
 */
export default function ViewTransitionRejectionGuard() {
  useEffect(() => {
    const onRejection = (e: PromiseRejectionEvent) => {
      if (
        e.reason instanceof DOMException &&
        (e.reason.name === "InvalidStateError" || e.reason.name === "AbortError") &&
        /transition/i.test(e.reason.message)
      ) {
        e.preventDefault();
      }
    };
    window.addEventListener("unhandledrejection", onRejection);
    return () => window.removeEventListener("unhandledrejection", onRejection);
  }, []);

  return null;
}
