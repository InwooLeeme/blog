"use client";

import { useEffect } from "react";
import tocbot from "tocbot";

export default function TocbotSidebar() {
  useEffect(() => {
    tocbot.init({
      tocSelector: ".js-toc",
      contentSelector: "#post-article",
      headingSelector: "h2, h3, h4",
      ignoreSelector: ".toc-ignore",
      linkClass: "toc-link",
      activeLinkClass: "is-active-link",
      listClass: "toc-list",
      hasInnerContainers: true,
      scrollSmooth: true,
      headingsOffset: 80,
    });
    return () => {
      try {
        tocbot.destroy();
      } catch {}
    };
  }, []);

  return (
    <aside className="hidden xl:block w-60 shrink-0">
      <div className="sticky top-32">
        <div className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          On this page
        </div>
        <nav className="js-toc pr-2" />
      </div>
    </aside>
  );
}
