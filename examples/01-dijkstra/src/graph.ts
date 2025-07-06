export type Node = {
  id: string;
};

export type Edge = {
  from: string;
  to: string;
  weight: number;
};

export class Graph {
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