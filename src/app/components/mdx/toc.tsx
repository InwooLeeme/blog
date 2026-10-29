"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useT } from "../LocaleProvider";
import tocbot from "tocbot";
import { DESKTOP_TOC_QUERY, subscribeTocViewport } from "./toc-viewport";

export default function TocbotSidebar() {
  const t = useT();
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
        contentSelector: "#post-body",
        headingSelector: "h2, h3, h4",
        ignoreSelector: ".toc-ignore",
        linkClass: "toc-link",
        activeLinkClass: "is-active-link",
        listClass: "toc-list",
        hasInnerContainers: true,
        // Native CSS scrolling also honors prefers-reduced-motion. Tocbot's
        // smooth-scroll plugin leaves a body click listener behind on destroy.
        scrollSmooth: false,
        headingsOffset: 112,
        collapseDepth: 0,
        onClick: (event) => {
          const link = (event.target as Element).closest('a');
          const id = link?.hash.slice(1);
          if (!id) return;
          const heading = document.getElementById(decodeURIComponent(id));
          heading?.setAttribute('tabindex', '-1');
          heading?.focus({ preventScroll: true });
        },
      });
      const syncCurrent = () => {
        tocElement.querySelectorAll('a').forEach(link => {
          if (link.classList.contains('is-active-link')) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      };
      syncCurrent();
      const observer = new MutationObserver(syncCurrent);
      observer.observe(tocElement, { subtree: true, attributes: true, attributeFilter: ['class'] });
      const hashChange = window.onhashchange;
      const scrollEnd = window.onscrollend;
      return () => {
        observer.disconnect();
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
          {t("toc.title")}
        </div>
        <nav aria-label={t("toc.title")} ref={tocRef} className="js-toc max-h-[calc(100dvh-10rem)] overflow-y-auto pr-2" />
      </div>
    </aside>
  );
}
