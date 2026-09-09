import assert from "node:assert/strict";
import test from "node:test";
import type { PostItem } from "../../../lib/posts.ts";
import { getEditorialPosts } from "./editorial-posts.ts";

function makePost(index: number): PostItem {
  return {
    slug: `post-${index}`,
    meta: {
      title: `글 ${index}`,
      date: `2026-09-0${index}`,
    },
  };
}

test("getEditorialPosts: 전달된 최신 순서를 보존하며 4개로 제한한다", () => {
  const posts = [1, 2, 3, 4, 5].map(makePost);
  assert.deepEqual(
    getEditorialPosts(posts).map((post) => post.slug),
    ["post-1", "post-2", "post-3", "post-4"],
  );
});

test("getEditorialPosts: 원본 배열을 변경하지 않는다", () => {
  const posts = [1, 2, 3, 4, 5].map(makePost);
  const original = posts.slice();
  getEditorialPosts(posts);
  assert.deepEqual(posts, original);
});
