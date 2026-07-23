import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import {
  getAllPosts,
  getAllTags,
  getTagCounts,
  getPostItemsByTag,
  getPostBySlug,
  getPostSlugs,
  getPostsBySeries,
  getSeriesNavigation,
  getAdjacentPosts,
  getRelatedPosts,
  groupPostsBySeries,
  type PostItem,
  type PostMeta,
} from "./posts.ts";

function makePost(slug: string, overrides: Partial<PostMeta> = {}): PostItem {
  return {
    slug,
    meta: { title: slug, date: "2024-01-01", ...overrides },
  };
}

test("getAllTags: dedupes and sorts tags", () => {
  const fixture = [
    makePost("a", { tags: ["b", "a"] }),
    makePost("b", { tags: ["a", "c"] }),
  ];
  assert.deepEqual(getAllTags(fixture), ["a", "b", "c"]);
});

test("getTagCounts: counts occurrences, ties broken alphabetically", () => {
  const fixture = [
    makePost("a", { tags: ["x", "y"] }),
    makePost("b", { tags: ["x"] }),
  ];
  assert.deepEqual(getTagCounts(fixture), [
    { tag: "x", count: 2 },
    { tag: "y", count: 1 },
  ]);
});

test("getPostItemsByTag: filters posts containing the tag", () => {
  const fixture = [
    makePost("a", { tags: ["x"] }),
    makePost("b", { tags: ["y"] }),
  ];
  assert.deepEqual(
    getPostItemsByTag(fixture, "x").map((p) => p.slug),
    ["a"],
  );
});

test("getPostBySlug: unknown slug returns null", () => {
  assert.equal(getPostBySlug("__does-not-exist__"), null);
});

test("getPostBySlug: memoizes file reads across calls in production", (t) => {
  const [slug] = getPostSlugs();
  assert.ok(slug, "fixture assumption: at least one post file exists");

  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  const readSpy = t.mock.method(fs, "readFileSync");

  try {
    getPostBySlug(slug);
    const afterFirstCall = readSpy.mock.callCount();
    getPostBySlug(slug);
    assert.equal(
      readSpy.mock.callCount(),
      afterFirstCall,
      "second call should hit the cache instead of reading the file again",
    );
  } finally {
    process.env.NODE_ENV = originalEnv;
  }
});

const posts = getAllPosts();

test("getAllPosts: sorted by date descending", () => {
  for (let i = 1; i < posts.length; i++) {
    assert.ok(posts[i - 1].meta.date >= posts[i].meta.date);
  }
});

test("getAdjacentPosts: first post has no next, last post has no prev", () => {
  const first = posts[0];
  const last = posts[posts.length - 1];

  const firstAdj = getAdjacentPosts(first.slug);
  assert.equal(firstAdj.next, null);
  assert.equal(firstAdj.prev?.slug, posts[1].slug);

  const lastAdj = getAdjacentPosts(last.slug);
  assert.equal(lastAdj.prev, null);
  assert.equal(lastAdj.next?.slug, posts[posts.length - 2].slug);
});

test("getAdjacentPosts: middle post neighbors match array order", () => {
  const midIdx = Math.floor(posts.length / 2);
  const mid = posts[midIdx];
  const adj = getAdjacentPosts(mid.slug);
  assert.equal(adj.next?.slug, posts[midIdx - 1].slug);
  assert.equal(adj.prev?.slug, posts[midIdx + 1].slug);
});

test("getAdjacentPosts: unknown slug returns nulls", () => {
  assert.deepEqual(getAdjacentPosts("__does-not-exist__"), {
    prev: null,
    next: null,
  });
});

test("getRelatedPosts: excludes itself and respects limit", () => {
  const target = posts.find((p) => (p.meta.tags?.length ?? 0) > 0);
  assert.ok(target, "fixture assumption: at least one tagged post exists");
  const related = getRelatedPosts(target!.slug, 2);
  assert.ok(related.length <= 2);
  assert.ok(related.every((p) => p.slug !== target!.slug));
});

test("getRelatedPosts: unknown slug returns empty array", () => {
  assert.deepEqual(getRelatedPosts("__does-not-exist__"), []);
});

test("getRelatedPosts: tag-overlap posts rank before non-overlap posts", () => {
  const target = posts.find((p) => (p.meta.tags?.length ?? 0) > 0);
  assert.ok(target);
  const targetTags = new Set(target!.meta.tags);
  const related = getRelatedPosts(target!.slug, posts.length);

  const firstNonOverlapIdx = related.findIndex(
    (p) => !p.meta.tags?.some((t) => targetTags.has(t)),
  );
  if (firstNonOverlapIdx !== -1) {
    const overlapCount = related.filter((p) =>
      p.meta.tags?.some((t) => targetTags.has(t)),
    ).length;
    assert.ok(firstNonOverlapIdx >= overlapCount);
  }
});

test("groupPostsBySeries: groups by series, episodes sorted slug asc within, latest-episode date desc across groups", () => {
  const seriesPosts = posts.filter((p) => !!p.meta.series);
  assert.ok(seriesPosts.length > 0, "fixture assumption: series posts exist");

  const groups = groupPostsBySeries(seriesPosts);
  assert.ok(groups.length > 0);

  for (const group of groups) {
    // 회차는 slug(zero-padded) 오름차순 — getPostsBySeries와 동일 규칙이라 번호 순서대로 읽힌다
    for (let i = 1; i < group.posts.length; i++) {
      assert.ok(group.posts[i - 1].slug.localeCompare(group.posts[i].slug) <= 0);
    }
    assert.equal(group.total, getPostsBySeries(group.series).length);
  }

  const latestDateOf = (groupPosts: (typeof groups)[number]["posts"]) =>
    groupPosts.reduce((max, p) => (p.meta.date > max ? p.meta.date : max), groupPosts[0].meta.date);
  for (let i = 1; i < groups.length; i++) {
    assert.ok(latestDateOf(groups[i - 1].posts) >= latestDateOf(groups[i].posts));
  }
});

test("groupPostsBySeries: posts without series produce no groups", () => {
  const groups = groupPostsBySeries(posts.filter((p) => !p.meta.series));
  assert.deepEqual(groups, []);
});

test("getSeriesNavigation: returns null when post has no series", () => {
  const nonSeries = posts.find((p) => !p.meta.series);
  assert.ok(nonSeries);
  assert.equal(getSeriesNavigation(nonSeries!.slug), null);
});

test("getSeriesNavigation: first/last episode boundaries", () => {
  const seriesName = posts.find((p) => p.meta.series)?.meta.series;
  assert.ok(seriesName);
  const episodes = getPostsBySeries(seriesName!);
  assert.ok(episodes.length > 0);

  const firstNav = getSeriesNavigation(episodes[0].slug);
  assert.equal(firstNav?.prev, null);
  assert.equal(firstNav?.position, 1);
  assert.equal(firstNav?.total, episodes.length);

  const lastNav = getSeriesNavigation(episodes[episodes.length - 1].slug);
  assert.equal(lastNav?.next, null);
  assert.equal(lastNav?.position, episodes.length);
});
