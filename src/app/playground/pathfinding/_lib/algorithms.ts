import type { Algorithm } from "./pathfinding";

export const ALGORITHMS: { id: Algorithm; label: string; description: string }[] = [
  { id: "bfs", label: "BFS", description: "가까운 칸부터 한 겹씩 넓혀 갑니다. 모든 이동 비용이 같을 때 최단 경로를 찾습니다." },
  { id: "dijkstra", label: "Dijkstra", description: "누적 비용이 가장 작은 칸부터 탐색합니다. 이 지도는 모든 비용이 1이라 BFS와 탐색 양상이 같습니다." },
  { id: "astar", label: "A*", description: "누적 비용에 목표까지의 예상 거리를 더합니다. 상하좌우 거리인 맨해튼 거리로 목표 방향을 먼저 살펴봅니다." },
];
