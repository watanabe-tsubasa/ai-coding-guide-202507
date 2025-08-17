import { describe, it, expect } from 'vitest';
import { dijkstra } from './dijkstra';
import { Graph } from './graph';

describe('dijkstra', () => {
  it('should find the shortest path in a simple straight-line graph', () => {
    const graph = new Graph();
    graph.addEdge('A', 'B', 1);
    graph.addEdge('B', 'C', 1);
    const { distances, path } = dijkstra(graph, 'A', 'C');
    expect(distances.C).toBe(2);
    expect(path).toEqual(['A', 'B', 'C']);
  });

  it('should find the shortest path in a graph with multiple routes', () => {
    const graph = new Graph();
    graph.addEdge('A', 'B', 1);
    graph.addEdge('A', 'C', 4);
    graph.addEdge('B', 'C', 2);
    graph.addEdge('B', 'D', 5);
    graph.addEdge('C', 'D', 1);
    const { distances, path } = dijkstra(graph, 'A', 'D');
    expect(distances.D).toBe(4);
    expect(path).toEqual(['A', 'B', 'C', 'D']);
  });

  it('should handle unreachable nodes', () => {
    const graph = new Graph();
    graph.addNode('A');
    graph.addNode('B');
    graph.addNode('C');
    graph.addEdge('A', 'B', 1);
    const { distances, path } = dijkstra(graph, 'A', 'C');
    expect(distances.C).toBe(Infinity);
    expect(path).toEqual([]);
  });

  it('should handle a single-node graph', () => {
    const graph = new Graph();
    graph.addNode('A');
    const { distances, path } = dijkstra(graph, 'A', 'A');
    expect(distances.A).toBe(0);
    expect(path).toEqual(['A']);
  });

  it('should find the shortest path in the sample graph', () => {
    const graph = new Graph();
    graph.addEdge('A', 'B', 4);
    graph.addEdge('A', 'C', 2);
    graph.addEdge('B', 'D', 1);
    graph.addEdge('C', 'D', 5);
    graph.addEdge('C', 'E', 1);

    const { distances, path } = dijkstra(graph, 'A', 'D');
    expect(distances.D).toBe(5);
    expect(path).toEqual(['A', 'B', 'D']);

    const { distances: distances2, path: path2 } = dijkstra(graph, 'A', 'E');
    expect(distances2.E).toBe(3);
    expect(path2).toEqual(['A', 'C', 'E']);
  });
});
