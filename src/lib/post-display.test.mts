import assert from "node:assert/strict";
import test from "node:test";
import {
  getCardCoverSrc,
  getCoverLabel,
  getEpisodeLabel,
  getFirstCardCoverIndex,
  getPostCoverFit,
} from "./post-display.ts";
import type { PostMeta } from "./posts.ts";

function makeMeta(overrides: Partial<PostMeta> = {}): PostMeta {
  return {
    title: "테스트 글",
    date: "2026-09-07",
    ...overrides,
  };
}

test("getPostCoverFit: honors an explicit coverFit", () => {
  assert.equal(getPostCoverFit(makeMeta({ coverFit: "contain" })), "contain");
  assert.equal(
    getPostCoverFit(
      makeMeta({ cover: "/Atcoder_Thumbnail.png", coverFit: "cover" }),
    ),
    "cover",
  );
});

test("getPostCoverFit: treats the shared AtCoder logo as contain", () => {
  assert.equal(
    getPostCoverFit(makeMeta({ cover: "/Atcoder_Thumbnail.png" })),
    "contain",
  );
});

test("getPostCoverFit: defaults ordinary covers to cover", () => {
  assert.equal(getPostCoverFit(makeMeta({ cover: "/photo.png" })), "cover");
  assert.equal(getPostCoverFit(makeMeta()), "cover");
});

test("existing card display helpers keep their current fallbacks", () => {
  const shared = makeMeta({
    cover: "/Atcoder_Thumbnail.png",
    tags: ["PS"],
    series: "AtCoder Weekday Contest",
  });
  assert.equal(getCardCoverSrc(shared), null);
  assert.equal(getCoverLabel(shared), "PS");
  assert.equal(getEpisodeLabel({ ...shared, title: "AtCoder Weekday Contest 001" }), "001");
});

test("getFirstCardCoverIndex skips placeholder-only cards", () => {
  const metas = [
    makeMeta({ cover: "/Atcoder_Thumbnail.png" }),
    makeMeta({}),
    makeMeta({ cover: "/photo.png" }),
  ];
  assert.equal(getFirstCardCoverIndex(metas), 2);
  assert.equal(getFirstCardCoverIndex(metas.slice(0, 2)), -1);
});
