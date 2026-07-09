"use client";

import { useState } from "react";
import type { PostItem } from "@/lib/posts";
import PostGrid from "./PostGrid";
import { useT } from "./LocaleProvider";

const PER_PAGE = 10;

/** 블로그 메인 목록 */
export default function PostGridLoadMore({ posts }: { posts: PostItem[] }) {
  const t = useT();
  const [visible, setVisible] = useState(PER_PAGE);
  const shown = posts.slice(0, visible);
  const remaining = posts.length - visible;

  return (
    <>
      <PostGrid posts={shown} />

      {remaining > 0 ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PER_PAGE)}
            className="inline-flex items-center gap-2 rounded-full border bg-card/80 px-5 py-2.5 text-sm font-medium text-foreground/80 shadow-sm backdrop-blur transition hover:border-accent-brand hover:text-accent-brand"
          >
            {t("post.loadMore")}
            <span className="text-muted-foreground">({remaining})</span>
          </button>
        </div>
      ) : null}
    </>
  );
}
