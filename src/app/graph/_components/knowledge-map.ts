import type { GraphData } from "../../../lib/graph.ts";

export type MapNode = { id: string; title: string; kind: "post" | "tag"; tags: string[]; slug?: string };
export type MapEdge = { source: string; target: string; kind: "tag" | "series"; weight: number };
export function createKnowledgeMap(data: GraphData): { nodes: MapNode[]; edges: MapEdge[] } {
  const nodes: MapNode[] = data.nodes.map(n => ({ ...n, id: `post:${n.id}`, slug: n.id, kind: "post" }));
  const tags = new Set<string>();
  const edges: MapEdge[] = [];
  for (const post of data.nodes) {
    for (const tag of new Set(post.tags)) {
      tags.add(tag);
      edges.push({ source: `post:${post.id}`, target: `tag:${tag}`, kind: "tag", weight: 1 });
    }
  }
  for (const tag of tags) nodes.push({ id: `tag:${tag}`, title: tag, kind: "tag", tags: [tag] });
  const ids = new Set(nodes.map(n => n.id));
  for (const e of data.edges) {
    if (e.kind !== "series") continue;
    const source = `post:${e.source}`, target = `post:${e.target}`;
    if (ids.has(source) && ids.has(target)) edges.push({ ...e, source, target });
  }
  return { nodes, edges };
}

export const matchesMapQuery = (node: MapNode, query: string) => {
  const q = query.trim().toLocaleLowerCase();
  return !q || [node.title, ...node.tags].some(value => value.toLocaleLowerCase().includes(q));
};

export function visibleMapNodes(map: ReturnType<typeof createKnowledgeMap>, filters: {tags: boolean; series: boolean; orphans: boolean}) {
  const connected = new Set(map.edges.filter(e => e.kind === "tag" ? filters.tags : filters.series).flatMap(e => [e.source, e.target]));
  return map.nodes.filter(n => (filters.tags || n.kind !== "tag") && (filters.orphans || connected.has(n.id)));
}

export function filterMapPosts(map: ReturnType<typeof createKnowledgeMap>, filters: {tags: boolean; series: boolean; orphans: boolean}, query: string, tag: string | null) {
  return visibleMapNodes(map, filters).filter(n => n.kind === "post" && matchesMapQuery(n, query) && (tag === null || (tag === "태그 없음" ? !n.tags.length : n.tags.includes(tag))));
}
