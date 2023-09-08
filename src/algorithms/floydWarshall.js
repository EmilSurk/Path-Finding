// Performs the Floyd-Warshall algorithm to find the shortest paths between all pairs of nodes.
export function floydWarshall(grid) {
    const nodes = getAllNodes(grid);
    const numNodes = nodes.length;
    const distances = Array.from({ length: numNodes }, () => Array(numNodes).fill(Infinity));
    const nextNode = Array.from({ length: numNodes }, () => Array(numNodes).fill(null));
  
    // Initialize distances and nextNode arrays based on the grid
    for (let i = 0; i < numNodes; i++) {
      for (let j = 0; j < numNodes; j++) {
        const nodeA = nodes[i];
        const nodeB = nodes[j];
  
        if (i === j) {
          distances[i][j] = 0;
        } else if (nodeB.isWall) {
          distances[i][j] = Infinity; // Wall nodes are not reachable
        } else if (areNeighbors(nodeA, nodeB)) {
          distances[i][j] = 1; // Neighboring nodes have distance 1
          nextNode[i][j] = j;
        }
      }
    }
  
    // Floyd-Warshall algorithm
    for (let k = 0; k < numNodes; k++) {
      for (let i = 0; i < numNodes; i++) {
        for (let j = 0; j < numNodes; j++) {
          if (distances[i][k] + distances[k][j] < distances[i][j]) {
            distances[i][j] = distances[i][k] + distances[k][j];
            nextNode[i][j] = nextNode[i][k];
          }
        }
      }
    }
  
    return { distances, nextNode };
  }
  
  // Helper function to check if two nodes are neighboring
  function areNeighbors(nodeA, nodeB) {
    return (
      Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col) === 1
    );
  }
  
  function getAllNodes(grid) {
    const nodes = [];
    for (const row of grid) {
      for (const node of row) {
        nodes.push(node);
      }
    }
    return nodes;
  }

  // Helper function to retrieve the shortest path between two nodes using the nextNode array
  export function reconstructShortestPath(nextNode, startIdx, endIdx) {
    const shortestPath = [];
    let currentNodeIdx = startIdx;
    while (currentNodeIdx !== endIdx) {
      shortestPath.push(currentNodeIdx);
      currentNodeIdx = nextNode[currentNodeIdx][endIdx];
    }
    shortestPath.push(endIdx);
    return shortestPath;
  }
  