"use client";

import Giscus from "@giscus/react";
import { useTheme } from "next-themes";
import { siteConfig } from "@/lib/site";

export default function Comments() {
  const { resolvedTheme } = useTheme();
  const { repo, repoId, category, categoryId } = siteConfig.giscus;
  const giscusTheme =
    resolvedTheme === "dark" ? "noborder_dark" : "noborder_light";

  return (
    <div className="mt-12">
      <Giscus
        id="giscus-comments"
        repo={repo}
        repoId={repoId}
        category={category}
        categoryId={categoryId}
        mapping="pathname"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme={giscusTheme}
        lang="ko"
        loading="lazy"
      />
    </div>
  );
}
