import { Graph } from './graph';

// A simple priority queue implementation for the Dijkstra algorithm.
class PriorityQueue {
  private elements: { priority: number; element: string }[] = [];

  enqueue(element: string, priority: number) {
    this.elements.push({ element, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }

  dequeue(): string | undefined {
    return this.elements.shift()?.element;
  }

  isEmpty(): boolean {
    return this.elements.length === 0;
  }
}


export function dijkstra(graph: Graph, startNode: string, endNode: string) {
  const distances: { [node: string]: number } = {};
  const previousNodes: { [node: string]: string | null } = {};
  const pq = new PriorityQueue();

  const nodes = graph.getNodes();
  for (const node of nodes) {
    distances[node] = Infinity;
    previousNodes[node] = null;
  }

  if (distances[startNode] === undefined) {
    return { distances, path: [] };
  }

  distances[startNode] = 0;
  pq.enqueue(startNode, 0);

  while (!pq.isEmpty()) {
    const currentNode = pq.dequeue();

    if (!currentNode) {
      continue;
    }
    
    if (currentNode === endNode) break;

    const neighbors = graph.getNeighbors(currentNode);
    for (const neighbor of neighbors) {
      const newDist = distances[currentNode] + neighbor.weight;
      if (newDist < distances[neighbor.node]) {
        distances[neighbor.node] = newDist;
        previousNodes[neighbor.node] = currentNode;
        pq.enqueue(neighbor.node, newDist);
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let current: string | null = endNode;
  while (current && previousNodes[current] !== undefined) {
      if (distances[current] === Infinity) {
          return { distances, path: [] };
      }
      path.unshift(current);
      if (current === startNode) break;
      current = previousNodes[current];
  }

  if (path[0] !== startNode || distances[endNode] === Infinity) {
      return { distances, path: [] };
  }

  // Special case for startNode === endNode
  if (startNode === endNode) {
      return { distances, path: [startNode] };
  }

  return { distances, path };
}
