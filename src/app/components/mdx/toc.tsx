"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import tocbot from "tocbot";
import { DESKTOP_TOC_QUERY, subscribeTocViewport } from "./toc-viewport";

export default function TocbotSidebar() {
  const pathname = usePathname();
  const tocRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const tocElement = tocRef.current;
    if (!tocElement) return;
    return subscribeTocViewport(window.matchMedia(DESKTOP_TOC_QUERY), true, () => {
      const previousHashChange = window.onhashchange;
      const previousScrollEnd = window.onscrollend;
      tocbot.init({
        // Keep the element available to destroy() even after React removes it.
        tocElement,
        contentSelector: "#post-article",
        headingSelector: "h2, h3, h4",
        ignoreSelector: ".toc-ignore",
        linkClass: "toc-link",
        activeLinkClass: "is-active-link",
        listClass: "toc-list",
        hasInnerContainers: true,
        // Native CSS scrolling also honors prefers-reduced-motion. Tocbot's
        // smooth-scroll plugin leaves a body click listener behind on destroy.
        scrollSmooth: false,
        headingsOffset: 80,
      });
      const hashChange = window.onhashchange;
      const scrollEnd = window.onscrollend;
      return () => {
        tocbot.destroy();
        // Tocbot assigns these properties, but its destroy() does not restore them.
        if (window.onhashchange === hashChange) window.onhashchange = previousHashChange;
        if (window.onscrollend === scrollEnd) window.onscrollend = previousScrollEnd;
      };
    });
  }, [pathname]);

  return (
    <aside className="hidden xl:block w-60 shrink-0">
      <div className="sticky top-32">
        <div className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          On this page
        </div>
        <nav ref={tocRef} className="js-toc pr-2" />
      </div>
    </aside>
  );
}
