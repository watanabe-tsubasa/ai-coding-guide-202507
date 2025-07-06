import { Graph } from './graph';

export function dijkstra(
  graph: Graph,
  startNode: string
): Map<string, { distance: number; path: string[] }> {
  const distances = new Map<string, number>();
  const paths = new Map<string, string[]>();
  const visited = new Set<string>();
  const unvisited = new Set<string>();

  // Initialize all nodes
  for (const node of graph.getNodes()) {
    distances.set(node, node === startNode ? 0 : Infinity);
    paths.set(node, node === startNode ? [startNode] : []);
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
          const currentPath = paths.get(currentNode)!;
          paths.set(neighbor, [...currentPath, neighbor]);
        }
      }
    }
  }

  // Build result map
  const result = new Map<string, { distance: number; path: string[] }>();
  for (const node of graph.getNodes()) {
    result.set(node, {
      distance: distances.get(node)!,
      path: paths.get(node)!
    });
  }

  return result;
}