export function astar(grid, startNode, finishNode) {
    const openSet = [];
    const closedSet = [];
    startNode.gScore = 0;
    startNode.fScore = heuristic(startNode, finishNode);
    openSet.push(startNode);
  
    while (openSet.length > 0) {
      // Find the node with the lowest fScore in the openSet
      let currentNode = openSet[0];
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].fScore < currentNode.fScore) {
          currentNode = openSet[i];
        }
      }
  
      // If we reached the finish node, reconstruct and return the path
      if (currentNode === finishNode) {
        const shortestPath = reconstructPath(finishNode);
        return { visitedNodes: closedSet, shortestPath };
      }
  
      // Move the current node from openSet to closedSet
      openSet.splice(openSet.indexOf(currentNode), 1);
      closedSet.push(currentNode);
  
      // Explore neighbors
      const neighbors = getNeighbors(currentNode, grid);
      for (const neighbor of neighbors) {
        if (closedSet.includes(neighbor) || neighbor.isWall) {
          continue;
        }
  
        const tentativeGScore = currentNode.gScore + 1;
  
        if (!openSet.includes(neighbor) || tentativeGScore < neighbor.gScore) {
          neighbor.previousNode = currentNode;
          neighbor.gScore = tentativeGScore;
          neighbor.fScore = neighbor.gScore + heuristic(neighbor, finishNode);
  
          if (!openSet.includes(neighbor)) {
            openSet.push(neighbor);
          }
        }
      }
    }
  
    // No path found
    return { visitedNodes: closedSet, shortestPath: [] };
  }
  
  
  function heuristic(nodeA, nodeB) {
    // Heuristic function
    return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
  }
  
  function getNeighbors(node, grid) {
    const neighbors = [];
    const { col, row } = node;
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
    return neighbors;
  }
  
  function reconstructPath(node) {
    const path = [];
    let currentNode = node;
    while (currentNode !== null) {
      path.unshift(currentNode);
      currentNode = currentNode.previousNode;
    }
    return path;
  }
  