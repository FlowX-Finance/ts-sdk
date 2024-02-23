import { MAX_ROUTE_HOPS } from "../../constants";

class Graph {
  private graph: Record<string, string[]> = {};

  public addEdge(node1: string, node2: string): void {
    if (!this.graph[node1]) {
      this.graph[node1] = [];
    }
    if (!this.graph[node2]) {
      this.graph[node2] = [];
    }

    this.graph[node1].push(node2);
    this.graph[node2].push(node1);
  }

  public findAllPaths(start: string, end: string): string[][] {
    const visited = new Set<string>();
    const allPaths: string[][] = [];

    this.dfs(start, end, visited, [], allPaths);

    return allPaths;
  }

  private dfs(node: string, end: string, visited: Set<string>, currentPath: string[], allPaths: string[][]): void {
    visited.add(node);
    currentPath.push(node);

    if (currentPath.length <= MAX_ROUTE_HOPS) {
      if (node === end) {
        allPaths.push([...currentPath]);
      } else {
        for (const neighbor of this.graph[node] ?? []) {
          if (!visited.has(neighbor)) {
            this.dfs(neighbor, end, visited, currentPath, allPaths);
          }
        }
      }
    }

    visited.delete(node);
    currentPath.pop();
  }
}

export default Graph;
// // Example usage
// const graph = new Graph();
// graph.addEdge('A', 'B');
// graph.addEdge('A', 'C');
// graph.addEdge('B', 'D');
// graph.addEdge('C', 'E');
// graph.addEdge('D', 'E');
// graph.addEdge('E', 'F');

// const startNode = 'A';
// const endNode = 'F';

// const paths = graph.findAllPaths(startNode, endNode);

// if (paths.length > 0) {
//   console.log(`All paths from ${startNode} to ${endNode}:`);
//   paths.forEach((path, index) => {
//     console.log(`Path ${index + 1}: ${path.join(' -> ')}`);
//   });
// } else {
//   console.log(`No paths found from ${startNode} to ${endNode}`);
// }
