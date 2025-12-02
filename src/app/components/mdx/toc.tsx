"use client";

import { useEffect } from "react";
import tocbot from "tocbot";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

export default function TocbotSidebar() {
  useEffect(() => {
    tocbot.init({
      tocSelector: ".js-toc",
      contentSelector: "#post-article",
      headingSelector: "h2, h3, h4",
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
    <aside className="fixed top-60 right-6 hidden lg:block bg-background w-60 shrink-0">
      <Card className="w-full">
        <CardContent>
          <div className="text-sm font-medium text-muted-foreground mb-3">
            On this page
          </div>
          <ScrollArea className="max-h-[calc(100vh-8rem)] pr-3">
            <nav className="js-toc" />
          </ScrollArea>
        </CardContent>
      </Card>
    </aside>
  );
}
