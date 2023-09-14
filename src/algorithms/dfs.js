export function dfs(grid, startNode, finishNode) {
    const visitedNodesInOrder = [];
    dfsHelper(grid, startNode, finishNode, visitedNodesInOrder);
    return visitedNodesInOrder;
  }
  
  function dfsHelper(grid, currentNode, finishNode, visitedNodesInOrder) {
    if (!currentNode) return false;
  
    currentNode.isVisited = true;
    visitedNodesInOrder.push(currentNode);
    
    if (currentNode === finishNode) return true; 
    
    const neighbors = getUnvisitedNeighbors(currentNode, grid);
    
    for (let neighbor of neighbors) {
      if (!neighbor.isVisited && !neighbor.isWall) {
        const pathExists = dfsHelper(grid, neighbor, finishNode, visitedNodesInOrder);
        if (pathExists) return true;
      }
    }
    return false; 
  }
  
  function getUnvisitedNeighbors(node, grid) {
    const neighbors = [];
    const { col, row } = node;
  
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  
    return neighbors.filter(neighbor => !neighbor.isVisited && !neighbor.isWall);
  }