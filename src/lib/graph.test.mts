import assert from "node:assert/strict";
import test from "node:test";
import { buildGraphData } from "./graph.ts";
import { getAllPosts, getAllSeries, getPostsBySeries } from "./posts.ts";

const MAX_TAG_GROUP_SIZE = 5;

const graph = buildGraphData();
const posts = getAllPosts();

test("buildGraphData: one node per post, ids match slugs", () => {
  assert.equal(graph.nodes.length, posts.length);
  const ids = new Set(graph.nodes.map((n) => n.id));
  for (const p of posts) assert.ok(ids.has(p.slug));
});

test("buildGraphData: series edges connect only adjacent episodes", () => {
  const seriesEdges = graph.edges.filter((e) => e.kind === "series");

  let expectedCount = 0;
  for (const { series } of getAllSeries()) {
    const episodes = getPostsBySeries(series);
    expectedCount += Math.max(0, episodes.length - 1);
    for (let i = 0; i < episodes.length - 1; i++) {
      const hasEdge = seriesEdges.some(
        (e) => e.source === episodes[i].slug && e.target === episodes[i + 1].slug,
      );
      assert.ok(hasEdge, `missing series edge ${episodes[i].slug} -> ${episodes[i + 1].slug}`);
    }
  }
  assert.equal(seriesEdges.length, expectedCount);
  assert.ok(seriesEdges.every((e) => e.weight === 2));
});

test("buildGraphData: tag edges fully connect groups sized 2..MAX_TAG_GROUP_SIZE, skip outside that range", () => {
  const tagGroups = new Map<string, string[]>();
  for (const p of posts) {
    for (const t of p.meta.tags ?? []) {
      const group = tagGroups.get(t) ?? [];
      group.push(p.slug);
      tagGroups.set(t, group);
    }
  }

  const tagEdges = graph.edges.filter((e) => e.kind === "tag");
  const hasEdge = (a: string, b: string) =>
    tagEdges.some(
      (e) => (e.source === a && e.target === b) || (e.source === b && e.target === a),
    );

  let expectedCount = 0;
  for (const slugs of tagGroups.values()) {
    if (slugs.length < 2 || slugs.length > MAX_TAG_GROUP_SIZE) {
      for (let i = 0; i < slugs.length; i++) {
        for (let j = i + 1; j < slugs.length; j++) {
          assert.ok(!hasEdge(slugs[i], slugs[j]), `unexpected edge for oversized/singleton tag group`);
        }
      }
      continue;
    }
    for (let i = 0; i < slugs.length; i++) {
      for (let j = i + 1; j < slugs.length; j++) {
        assert.ok(hasEdge(slugs[i], slugs[j]));
        expectedCount++;
      }
    }
  }

  assert.equal(tagEdges.length, expectedCount);
  assert.ok(tagEdges.every((e) => e.weight === 1));
});
