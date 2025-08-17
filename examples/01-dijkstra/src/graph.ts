export type Node = {
  id: string;
};

export type Edge = {
  from: string;
  to: string;
  weight: number;
};

export class Graph {
  private nodes: Map<string, Node> = new Map();
  private edges: Map<string, Edge[]> = new Map();

  addNode(id: string): void {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, { id });
      this.edges.set(id, []);
    }
  }

  addEdge(from: string, to: string, weight: number): void {
    if (!this.nodes.has(from)) {
      this.addNode(from);
    }
    if (!this.nodes.has(to)) {
      this.addNode(to);
    }

    const fromEdges = this.edges.get(from);
    if (fromEdges) {
      fromEdges.push({ from, to, weight });
    }
  }

  getNeighbors(nodeId: string): Array<{ node: string; weight: number }> {
    const nodeEdges = this.edges.get(nodeId);
    if (!nodeEdges) {
      return [];
    }
    return nodeEdges.map(edge => ({ node: edge.to, weight: edge.weight }));
  }
}
