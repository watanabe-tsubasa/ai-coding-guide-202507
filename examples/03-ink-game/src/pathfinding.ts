// ダイクストラ法を使った経路探索

export interface Graph {
  addNode(id: string): void;
  addEdge(from: string, to: string, weight: number): void;
  getNeighbors(nodeId: string): Array<{ node: string; weight: number }>;
  getNodes(): string[];
}

export class PathfindingGraph implements Graph {
  private nodes: Set<string> = new Set();
  private adjacencyList: Map<string, Array<{ node: string; weight: number }>> = new Map();

  addNode(id: string): void {
    this.nodes.add(id);
    if (!this.adjacencyList.has(id)) {
      this.adjacencyList.set(id, []);
    }
  }

  addEdge(from: string, to: string, weight: number): void {
    if (!this.nodes.has(from)) {
      this.addNode(from);
    }
    if (!this.nodes.has(to)) {
      this.addNode(to);
    }

    const neighbors = this.adjacencyList.get(from) || [];
    neighbors.push({ node: to, weight });
    this.adjacencyList.set(from, neighbors);
  }

  getNeighbors(nodeId: string): Array<{ node: string; weight: number }> {
    return this.adjacencyList.get(nodeId) || [];
  }

  getNodes(): string[] {
    return Array.from(this.nodes);
  }
}

export function dijkstra(
  graph: Graph,
  startNode: string,
  endNode: string
): string[] | null {
  const distances = new Map<string, number>();
  const previousNodes = new Map<string, string | null>();
  const visited = new Set<string>();
  const unvisited = new Set<string>();

  // Initialize all nodes
  for (const node of graph.getNodes()) {
    distances.set(node, node === startNode ? 0 : Infinity);
    previousNodes.set(node, null);
    unvisited.add(node);
  }

  while (unvisited.size > 0) {
    // Find unvisited node with minimum distance
    let currentNode: string | null = null;
    let minDistance = Infinity;

    for (const node of unvisited) {
      const distance = distances.get(node)!;
      if (distance < minDistance) {
        currentNode = node;
        minDistance = distance;
      }
    }

    if (currentNode === null || minDistance === Infinity) {
      break;
    }

    // Found the target
    if (currentNode === endNode) {
      break;
    }

    // Visit current node
    unvisited.delete(currentNode);
    visited.add(currentNode);

    // Update distances to neighbors
    const neighbors = graph.getNeighbors(currentNode);
    for (const { node: neighbor, weight } of neighbors) {
      if (!visited.has(neighbor)) {
        const currentDistance = distances.get(currentNode)!;
        const newDistance = currentDistance + weight;
        const neighborDistance = distances.get(neighbor)!;

        if (newDistance < neighborDistance) {
          distances.set(neighbor, newDistance);
          previousNodes.set(neighbor, currentNode);
        }
      }
    }
  }

  // Reconstruct path
  if (previousNodes.get(endNode) === null && endNode !== startNode) {
    return null; // No path found
  }

  const path: string[] = [];
  let current: string | null = endNode;
  
  while (current !== null) {
    path.unshift(current);
    current = previousNodes.get(current) || null;
  }

  return path;
}

// グリッドマップをグラフに変換
export function gridToGraph(
  grid: string[][],
  walkableCells: Set<string>
): { graph: Graph; positionToNode: Map<string, string> } {
  const graph = new PathfindingGraph();
  const positionToNode = new Map<string, string>();
  const height = grid.length;
  const width = grid[0]?.length || 0;

  // ノードを追加
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (walkableCells.has(grid[y][x])) {
        const nodeId = `${x},${y}`;
        graph.addNode(nodeId);
        positionToNode.set(`${x},${y}`, nodeId);
      }
    }
  }

  // エッジを追加（4方向）
  const directions = [
    { dx: 0, dy: -1 }, // 上
    { dx: 1, dy: 0 },  // 右
    { dx: 0, dy: 1 },  // 下
    { dx: -1, dy: 0 }  // 左
  ];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!walkableCells.has(grid[y][x])) continue;

      const fromNode = `${x},${y}`;
      
      for (const { dx, dy } of directions) {
        const newX = x + dx;
        const newY = y + dy;
        
        if (
          newX >= 0 && newX < width &&
          newY >= 0 && newY < height &&
          walkableCells.has(grid[newY][newX])
        ) {
          const toNode = `${newX},${newY}`;
          graph.addEdge(fromNode, toNode, 1);
        }
      }
    }
  }

  return { graph, positionToNode };
}