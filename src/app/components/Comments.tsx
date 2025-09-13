"use client";

import Giscus from "@giscus/react";
import { useTheme } from "next-themes";

export default function Comments() {
  const { resolvedTheme } = useTheme();
  const giscusTheme =
    resolvedTheme === "dark" ? "noborder_dark" : "noborder_light";

  return (
    <div className="mt-12">
      <Giscus
        id="giscus-comments"
        repo="InwooLeeme/blog_comment" // 예: you/blog-comments
        repoId="R_kgDOPvLsdQ" // giscus.app에서 복사
        category="General" // 선택한 Discussion 카테고리명
        categoryId="DIC_kwDOPvLsdc4CvZeK" // giscus.app에서 복사
        mapping="pathname" // 페이지 경로별로 스레드 분리
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme={giscusTheme} // 라이트/다크 자동 매칭
        lang="ko"
        loading="lazy"
      />
    </div>
  );
}
