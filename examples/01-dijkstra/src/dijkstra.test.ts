import { describe, it, expect } from 'vitest';
import { Graph } from './graph';
import { dijkstra } from './dijkstra';

describe('dijkstra', () => {
  it('should find shortest path in a simple linear graph (A→B→C)', () => {
    const graph = new Graph();
    graph.addNode('A');
    graph.addNode('B');
    graph.addNode('C');
    graph.addEdge('A', 'B', 1);
    graph.addEdge('B', 'C', 2);

    const result = dijkstra(graph, 'A');

    expect(result.get('A')).toEqual({ distance: 0, path: ['A'] });
    expect(result.get('B')).toEqual({ distance: 1, path: ['A', 'B'] });
    expect(result.get('C')).toEqual({ distance: 3, path: ['A', 'B', 'C'] });
  });

  it('should choose the shortest path when multiple paths exist', () => {
    const graph = new Graph();
    graph.addNode('A');
    graph.addNode('B');
    graph.addNode('C');
    graph.addEdge('A', 'B', 5);
    graph.addEdge('A', 'C', 2);
    graph.addEdge('C', 'B', 1);

    const result = dijkstra(graph, 'A');

    expect(result.get('B')).toEqual({ distance: 3, path: ['A', 'C', 'B'] });
  });

  it('should handle unreachable nodes', () => {
    const graph = new Graph();
    graph.addNode('A');
    graph.addNode('B');
    graph.addNode('C');
    graph.addEdge('A', 'B', 1);

    const result = dijkstra(graph, 'A');

    expect(result.get('C')).toEqual({ distance: Infinity, path: [] });
  });

  it('should handle single node graph', () => {
    const graph = new Graph();
    graph.addNode('A');

    const result = dijkstra(graph, 'A');

    expect(result.get('A')).toEqual({ distance: 0, path: ['A'] });
  });

  it('should find shortest paths in the sample graph', () => {
    const graph = new Graph();
    
    // Add nodes
    ['A', 'B', 'C', 'D', 'E'].forEach(node => graph.addNode(node));
    
    // Add edges
    graph.addEdge('A', 'B', 4);
    graph.addEdge('A', 'C', 2);
    graph.addEdge('B', 'D', 1);
    graph.addEdge('C', 'D', 5);
    graph.addEdge('C', 'E', 1);

    const result = dijkstra(graph, 'A');

    expect(result.get('A')).toEqual({ distance: 0, path: ['A'] });
    expect(result.get('B')).toEqual({ distance: 4, path: ['A', 'B'] });
    expect(result.get('C')).toEqual({ distance: 2, path: ['A', 'C'] });
    expect(result.get('D')).toEqual({ distance: 5, path: ['A', 'B', 'D'] });
    expect(result.get('E')).toEqual({ distance: 3, path: ['A', 'C', 'E'] });
  });
});