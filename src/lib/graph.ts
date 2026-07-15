/**
 * 블로그 글 그래프 뷰용 노드·엣지 데이터를 만드는 헬퍼.
 * - 서버에서만 실행 (getAllPosts 의존)
 */
import { getAllPosts, getPostsBySeries, getAllSeries } from "./posts.ts";

export type GraphNode = {
  id: string;
  title: string;
  tags: string[];
  series?: string;
};

export type GraphEdge = {
  source: string;
  target: string;
  kind: "series" | "tag";
  weight: number;
};

export type GraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

/** 이보다 많은 글이 공유하는 태그는 너무 흔해서(예: PS, AtCoder) 엣지에서 제외 — 털뭉치 방지 */
const MAX_TAG_GROUP_SIZE = 5;

export function buildGraphData(): GraphData {
  const posts = getAllPosts();

  const nodes: GraphNode[] = posts.map((p) => ({
    id: p.slug,
    title: p.meta.title,
    tags: p.meta.tags ?? [],
    series: p.meta.series,
  }));

  const edges: GraphEdge[] = [];

  // 시리즈: 같은 시리즈의 인접 회차끼리만 연결(강)
  for (const { series } of getAllSeries()) {
    const episodes = getPostsBySeries(series);
    for (let i = 0; i < episodes.length - 1; i++) {
      edges.push({
        source: episodes[i].slug,
        target: episodes[i + 1].slug,
        kind: "series",
        weight: 2,
      });
    }
  }

  // 공통 태그: 너무 흔한 태그는 제외하고, 해당 태그를 가진 글끼리 전부 연결(약)
  const tagGroups = new Map<string, string[]>();
  for (const p of posts) {
    for (const t of p.meta.tags ?? []) {
      const group = tagGroups.get(t) ?? [];
      group.push(p.slug);
      tagGroups.set(t, group);
    }
  }

  for (const slugs of tagGroups.values()) {
    if (slugs.length < 2 || slugs.length > MAX_TAG_GROUP_SIZE) continue;
    for (let i = 0; i < slugs.length; i++) {
      for (let j = i + 1; j < slugs.length; j++) {
        edges.push({ source: slugs[i], target: slugs[j], kind: "tag", weight: 1 });
      }
    }
  }

  return { nodes, edges };
}
