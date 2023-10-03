import React, {Component} from 'react';
import Node from './Node/Node';
import { dijkstra, getNodesInShortestPathOrder } from '../algorithms/dijkstra';
import { floydWarshall } from '../algorithms/floydWarshall';
import { astar } from '../algorithms/astar';
import { bfs } from '../algorithms/bfs';
import { dfs } from '../algorithms/dfs';
import './PathfindingVisualizer.css';

const START_NODE_ROW = 10;
const START_NODE_COL = 15;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 35;


export default class PathfindingVisualizer extends Component {

  constructor() {
    super();
    this.state = {
      grid: [],
      mouseIsPressed: false,
      startNodeRow: START_NODE_ROW,
      startNodeCol: START_NODE_COL,
      finishNodeRow: FINISH_NODE_ROW,
      finishNodeCol: FINISH_NODE_COL,
      prevMouseDownTime: null,
      startNodeDragged: false,
      finishNodeDragged: false,
      draggedNodeRow: START_NODE_ROW,
      draggedNodeCol: START_NODE_COL,
      draggedNodeRowF: START_NODE_ROW,
      draggedNodeColF: START_NODE_COL,
      middleNodeRow: null,
      middleNodeCol: null,
      addingMiddleNode: false,
      targetNodes: [],
      middleNodeCount: 0,
      middleNodeCounts: {},
    };
  }

  componentDidMount() {
    const grid = getInitialGrid();
    this.setState({grid});
  }

  handleMouseDown(row, col) {
    const { grid, addingMiddleNode } = this.state;
    const node = grid[row][col];


    if (!node.isStart && !node.isFinish ) {
      if (!addingMiddleNode && !node.isMiddle) {
        const newGrid = getNewGridWithWallToggled(grid, row, col);
        this.setState({ grid: newGrid, mouseIsPressed: true });

      } else if (addingMiddleNode) {

        if (!node.isWall && !node.isMiddle) {
          const newGrid = grid.slice();
          const targetNode = newGrid[row][col];
          targetNode.isMiddle = !targetNode.isMiddle;
          const targetNodes = this.state.targetNodes.slice();
          const targetIndex = targetNodes.findIndex(
            (targetNode) => targetNode.row === row && targetNode.col === col
          );

          if (targetIndex !== -1) {
            targetNodes.splice(targetIndex, 1); 
          } else {
            targetNodes.push({ row, col }); 
          }

          const middleNodeCount = this.state.middleNodeCount + 1;
          const middleNodeKey = `${row}-${col}`;
          const newMiddleNode = {
            row: row,
            col: col,
            isMiddle: true,
            id: middleNodeCount, 
          };

          const newMiddleNodeCounts = {
            ...this.state.middleNodeCounts,
            [middleNodeKey]: middleNodeCount,
          };
          newGrid[row][col] = newMiddleNode; 


          this.setState({
            grid: newGrid,
            targetNodes: targetNodes,
            middleNodeRow: row,
            middleNodeCol: col,
            middleNodeCount: middleNodeCount,
            addingMiddleNode: false,
            middleNodeCounts: newMiddleNodeCounts, 
          });
        }
      }
    } 
    else if (node.isStart || node.isFinish) {
      const currentTime = new Date().getTime();
      const { prevMouseDownTime } = this.state;

      if (node.isStart && prevMouseDownTime && currentTime - prevMouseDownTime < 300) {
        this.setState({
          mouseIsPressed: true,
          startNodeDragged: true,
          draggedNodeRow: row,
          draggedNodeCol: col,
        });
        
      } else if (node.isFinish && prevMouseDownTime && currentTime - prevMouseDownTime < 300) {
        this.setState({
          mouseIsPressed: true,
          finishNodeDragged: true,
          draggedNodeRowF: row,
          draggedNodeColF: col,
        });
      }

      this.setState({ prevMouseDownTime: currentTime });
  } else {
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    this.setState({ grid: newGrid, mouseIsPressed: true });
  }
}

  handleMouseEnter(row, col) {
    const {
      grid,
      mouseIsPressed,
      startNodeDragged,
      draggedNodeRow,
      draggedNodeCol,
      finishNodeDragged,
      draggedNodeRowF,
      draggedNodeColF,
    } = this.state;
  
    if (mouseIsPressed) {
      if (startNodeDragged) {
        const newGrid = grid.slice();
        const startNode = newGrid[draggedNodeRow][draggedNodeCol];
        const draggedNode = newGrid[row][col];
  
        if (draggedNode.isWall || draggedNode.isFinish) return;
  
        startNode.isStart = false;
        draggedNode.isStart = true;
  
        this.setState({
          grid: newGrid,
          draggedNodeRow: row,
          draggedNodeCol: col,
        });
      } else if (finishNodeDragged) {
        const newGrid = grid.slice();
        const finishNode = newGrid[draggedNodeRowF][draggedNodeColF];
        const draggedNode = newGrid[row][col];
  
        if (draggedNode.isWall || draggedNode.isStart) return;
  
        finishNode.isFinish = false;
        draggedNode.isFinish = true;
  
        this.setState({
          grid: newGrid,
          draggedNodeRowF: row,
          draggedNodeColF: col,
        });
      } else {
        const newGrid = getNewGridWithWallToggled(grid, row, col);
        this.setState({ grid: newGrid });
      }
    }
  }
  
  handleMouseUp() {
    const { startNodeDragged, draggedNodeRow, draggedNodeCol, finishNodeDragged, draggedNodeRowF, draggedNodeColF } = this.state;
  
    if (startNodeDragged) {
      this.setState({
        mouseIsPressed: false,
        startNodeDragged: false,
        startNodeRow: draggedNodeRow,
        startNodeCol: draggedNodeCol,
        draggedNodeRow: draggedNodeRow,
        draggedNodeCol: draggedNodeCol,
      });

    } else if (finishNodeDragged) {
      this.setState({
        mouseIsPressed: false,
        finishNodeDragged: false,
        finishNodeRow: draggedNodeRowF,
        finishNodeCol: draggedNodeColF,
        draggedNodeRowF: draggedNodeRowF,
        draggedNodeColF: draggedNodeColF,
      });

    } else {
      this.setState({ mouseIsPressed: false });
    }
  }




  // DIJKSTRA ALGORITHM

  async animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
    for (let i = 0; i < visitedNodesInOrder.length; i++) {
      const node = visitedNodesInOrder[i];
  
      if (!node.isStart && !node.isFinish && !node.isMiddle) {
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-visited';
      }
  
      await new Promise((resolve) => setTimeout(resolve, 10)); 
    }
  }

  animateShortestPath(nodesInShortestPathOrder) {

    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        if (!node.isStart && !node.isFinish && !node.isMiddle) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node node-shortest-path';
        }
      }, 50 * i);
    }
  }

  async visualizeDijkstra() {
    const { grid, startNodeRow, startNodeCol, finishNodeRow, finishNodeCol, targetNodes } = this.state;
    const startNode = grid[startNodeRow][startNodeCol];
    const finishNode = grid[finishNodeRow][finishNodeCol];
    let allNodesInShortestPathOrder = [];
    let prevNode = startNode;
  
    for (const targetNodeObj of targetNodes) {
      const targetNode = grid[targetNodeObj.row][targetNodeObj.col];
      resetNodes(grid); 
      const visitedNodesToTarget = dijkstra(grid, prevNode, targetNode);
      const nodesInShortestPathToTarget = getNodesInShortestPathOrder(targetNode);
      resetNodes(grid);
      allNodesInShortestPathOrder = allNodesInShortestPathOrder.concat(nodesInShortestPathToTarget.slice(1));
      prevNode = targetNode;
      await this.animateDijkstra(visitedNodesToTarget, []); 
    }

    resetNodes(grid); 
    const visitedNodesToFinish = dijkstra(grid, prevNode, finishNode);
    const nodesInShortestPathToFinish = getNodesInShortestPathOrder(finishNode);
  
    allNodesInShortestPathOrder = allNodesInShortestPathOrder.concat(nodesInShortestPathToFinish.slice(1));
  
    await this.animateDijkstra(visitedNodesToFinish, allNodesInShortestPathOrder);
  
    this.animateShortestPath(allNodesInShortestPathOrder);
  }




  // FLOYD WARSHALL ALGORITHM

animateFloydWarshall(allNodesInShortestPathOrder) {
  const delayFactor = 10; 

  for (let i = 0; i < allNodesInShortestPathOrder.length; i++) {
    const node = allNodesInShortestPathOrder[i];
    const delay = i * delayFactor;

    setTimeout(() => {
      if (!node.isStart && !node.isFinish && !node.isWall) {
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-shortest-path';
      }
    }, delay);
  }
}


visualizeFloydWarshall() {
  const { grid, targetNodes } = this.state; 
  const tempGrid = JSON.parse(JSON.stringify(grid));
  const fwGrid = tempGrid.map(row =>
    row.map(node => (node.isWall ? createNode(node.col, node.row) : node))
  );
  const { distances, nextNode } = floydWarshall(fwGrid);
  const startNode = fwGrid[this.state.startNodeRow][this.state.startNodeCol];
  const finishNode = fwGrid[this.state.finishNodeRow][this.state.finishNodeCol];
  const shortestPathNodes = [];
  let currentNode = startNode;

  for (let i = 0; i < targetNodes.length; i++) {
    const middleNodeObj = targetNodes[i];
    const middleNode = fwGrid[middleNodeObj.row][middleNodeObj.col];
    
    while (currentNode !== middleNode) {
      const nextIndex =
        nextNode[currentNode.row * fwGrid[0].length + currentNode.col][
          middleNode.row * fwGrid[0].length + middleNode.col
        ];
      const nextRow = Math.floor(nextIndex / fwGrid[0].length);
      const nextCol = nextIndex % fwGrid[0].length;
      const nextPathNode = fwGrid[nextRow][nextCol];
      shortestPathNodes.push(nextPathNode);
      currentNode = nextPathNode;
    }

    if (i < targetNodes.length - 1) {
      const nextMiddleNodeObj = targetNodes[i + 1];
      const nextMiddleNode = fwGrid[nextMiddleNodeObj.row][nextMiddleNodeObj.col];
      currentNode = middleNode;
      while (currentNode !== nextMiddleNode) {
        const nextIndex =
          nextNode[currentNode.row * fwGrid[0].length + currentNode.col][
            nextMiddleNode.row * fwGrid[0].length + nextMiddleNode.col
          ];
        const nextRow = Math.floor(nextIndex / fwGrid[0].length);
        const nextCol = nextIndex % fwGrid[0].length;
        const nextPathNode = fwGrid[nextRow][nextCol];
        shortestPathNodes.push(nextPathNode);
        currentNode = nextPathNode;
      }
    }
  }

  while (currentNode !== finishNode) {
    const nextIndex =
      nextNode[currentNode.row * fwGrid[0].length + currentNode.col][
        finishNode.row * fwGrid[0].length + finishNode.col
      ];
    const nextRow = Math.floor(nextIndex / fwGrid[0].length);
    const nextCol = nextIndex % fwGrid[0].length;
    const nextPathNode = fwGrid[nextRow][nextCol];
    shortestPathNodes.push(nextPathNode);
    currentNode = nextPathNode;
  }
  this.animateFloydWarshall(shortestPathNodes);
}



  // ASTAR ALGORITHM

  async visualizeAstar() {
    const { grid, startNodeRow, startNodeCol, finishNodeRow, finishNodeCol, targetNodes } = this.state;
    const startNode = grid[startNodeRow][startNodeCol];
    const finishNode = grid[finishNodeRow][finishNodeCol];
    let allNodesInShortestPathOrder = [];
    let prevNode = startNode;
  
    for (const targetNodeObj of targetNodes) {
      const targetNode = grid[targetNodeObj.row][targetNodeObj.col];
      resetNodes(grid); 
      const { visitedNodes, shortestPath } = astar(grid, prevNode, targetNode);
      allNodesInShortestPathOrder = allNodesInShortestPathOrder.concat(shortestPath.slice(1));
      resetNodes(grid);
      await this.animateDijkstra(visitedNodes, shortestPath);
      prevNode = targetNode;
    }
  
    const { visitedNodes, shortestPath } = astar(grid, prevNode, finishNode);
    allNodesInShortestPathOrder = allNodesInShortestPathOrder.concat(shortestPath.slice(1));
    resetNodes(grid);
    await this.animateDijkstra(visitedNodes, allNodesInShortestPathOrder);
    this.animateShortestPath(allNodesInShortestPathOrder);
  }




  // BFS ALGORITHM
  
  async visualizeBFS() {
    const { grid, startNodeRow, startNodeCol, finishNodeRow, finishNodeCol, targetNodes } = this.state;
    const startNode = grid[startNodeRow][startNodeCol];
    const finishNode = grid[finishNodeRow][finishNodeCol];
  
    let allNodesInShortestPathOrder = [];
  
    let prevNode = startNode;
    
    for (const targetNodeObj of targetNodes) {
      const targetNode = grid[targetNodeObj.row][targetNodeObj.col];
      resetNodes(grid);
      const visitedNodesToTarget = bfs(grid, prevNode, targetNode);
      const nodesInShortestPathToTarget = getNodesInShortestPathOrder(targetNode);
      allNodesInShortestPathOrder = allNodesInShortestPathOrder.concat(nodesInShortestPathToTarget.slice(1));
      prevNode = targetNode;
      await this.animateDijkstra(visitedNodesToTarget); 
    }

    resetNodes(grid);
    const visitedNodesToFinish = bfs(grid, prevNode, finishNode);
    const nodesInShortestPathToFinish = getNodesInShortestPathOrder(finishNode);
    allNodesInShortestPathOrder = allNodesInShortestPathOrder.concat(nodesInShortestPathToFinish.slice(1));
    await this.animateDijkstra(visitedNodesToFinish); 
    this.animateShortestPath(allNodesInShortestPathOrder); 
  }



  // DFS ALGORITHM

  async visualizeDFS() {
    const { grid, startNodeRow, startNodeCol, finishNodeRow, finishNodeCol, targetNodes } = this.state;
    const startNode = grid[startNodeRow][startNodeCol];
    const finishNode = grid[finishNodeRow][finishNodeCol];
    let allNodesInOrder = [];
    let prevNode = startNode;
  
    for (const targetNodeObj of targetNodes) {
      const targetNode = grid[targetNodeObj.row][targetNodeObj.col];
      resetNodes(grid); 
      const visitedNodesToTarget = dfs(grid, prevNode, targetNode);
      allNodesInOrder = allNodesInOrder.concat(visitedNodesToTarget.slice(1));
      prevNode = targetNode;
      await this.animateDijkstra(visitedNodesToTarget);
    }
  
    resetNodes(grid);  
    const visitedNodesToFinish = dfs(grid, prevNode, finishNode);
    allNodesInOrder = allNodesInOrder.concat(visitedNodesToFinish.slice(1));
    await this.animateDijkstra(visitedNodesToFinish); 
    this.animateShortestPath(allNodesInOrder);
  }
  




  // MAZE KRUSKAL ALGORITHM

  generateKruskalMaze() {
    const { grid } = this.state;
    const startNode = { x: this.state.startNodeRow, y: this.state.startNodeCol };
    const endNode = { x: this.state.finishNodeRow, y: this.state.finishNodeCol };

  
    // Initialize all cells as walls
    for (let row of grid) {
      for (let cell of row) {
        cell.isWall = true;
      }
    }
  
    // Ensure start and end nodes aren't walls
    
    startNode.isWall = false;
    endNode.isWall = false;
  
    const generateMaze = (grid) => {
      let walls = [];
      const rows = grid.length;
      const cols = grid[0].length;
  
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (col < cols - 1 && !(grid[row][col] === startNode || grid[row][col] === endNode)) {
            walls.push({ x: row, y: col, direction: 'E' });
          }
          if (row < rows - 1 && !(grid[row][col] === startNode || grid[row][col] === endNode)) {
            walls.push({ x: row, y: col, direction: 'S' });
          }
        }
      }
  
      walls = shuffleArray(walls);
  
      const unionFind = new UnionFind(rows * cols);
  
      for (let wall of walls) {
        let index1, index2;
  
        if (wall.direction === 'E') {
          index1 = wall.x * cols + wall.y;
          index2 = wall.x * cols + wall.y + 1;
        } else {
          index1 = wall.x * cols + wall.y;
          index2 = (wall.x + 1) * cols + wall.y;
        }
  
        if (unionFind.union(index1, index2)) {
          if (wall.direction === 'E') {
            grid[wall.x][wall.y + 1].isWall = false;
          } else {
            grid[wall.x + 1][wall.y].isWall = false;
          }
        }
      }
    }
    const addRandomWalls = (grid, numWallsToAdd) => {
      for (let i = 0; i < numWallsToAdd; i++) {
        let randomRow, randomCol;
        do {
          randomRow = Math.floor(Math.random() * grid.length);
          randomCol = Math.floor(Math.random() * grid[0].length);
        } while (
          grid[randomRow][randomCol].isMiddle || 
          grid[randomRow][randomCol].isStart ||  
          grid[randomRow][randomCol].isFinish ||
          grid[randomRow][randomCol].isWall  // Prevent overwriting existing walls
        );
        grid[randomRow][randomCol].isWall = true;
      }
    }

    const bfsHasPath = (grid, startNode, endNode) => {
      const rows = grid.length;
      const cols = grid[0].length;
    
      const isValid = (x, y) => x >= 0 && x < rows && y >= 0 && y < cols && !grid[x][y].isWall;
    
      const queue = [{ x: startNode.x, y: startNode.y }];
      const visited = Array(rows).fill(null).map(() => Array(cols).fill(false));
      visited[startNode.x][startNode.y] = true;
    
      const directions = [
        [-1, 0],  // Up
        [1, 0],   // Down
        [0, -1],  // Left
        [0, 1]    // Right
      ];
    
      while (queue.length) {
        const node = queue.shift();
        if (node.x === endNode.x && node.y === endNode.y) return true;
    
        for (let dir of directions) {
          const newX = node.x + dir[0];
          const newY = node.y + dir[1];
    
          if (isValid(newX, newY) && !visited[newX][newY]) {
            visited[newX][newY] = true;
            queue.push({ x: newX, y: newY });
          }
        }
      }
    
      return false;
    }
  
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
  
    do {
      generateMaze(grid);
      addRandomWalls(grid, 400);
    } while (!bfsHasPath(grid, startNode, endNode));
    
    this.setState({ grid });
  }
  
  

  // MAZE PRIM ALGORITHM

  generatePrimMaze() {
    const { grid } = this.state;

    const rows = grid.length;
    const cols = grid[0].length;
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // Right, Down, Left, Up

    const isValid = (x, y) => x >= 0 && x < rows && y >= 0 && y < cols;

    // Initially, all nodes are walls
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            grid[r][c].isWall = true;
        }
    }

    // Choose an arbitrary starting node
    let startRow = Math.floor(Math.random() * rows);
    let startCol = Math.floor(Math.random() * cols);
    grid[startRow][startCol].isWall = false;

    let wallList = [];

    // Add the walls of the starting node to the list
    for (let [dx, dy] of directions) {
        if (isValid(startRow + dx, startCol + dy)) {
            wallList.push({ x: startRow + dx, y: startCol + dy });
        }
    }

    while (wallList.length) {
        let wallIndex = Math.floor(Math.random() * wallList.length);
        let wall = wallList[wallIndex];

        let oppositeNode = null;
        for (let [dx, dy] of directions) {
            let nx = wall.x + dx;
            let ny = wall.y + dy;
            if (isValid(nx, ny) && !grid[nx][ny].isWall) {
                if (oppositeNode) {
                    oppositeNode = null;
                    break;
                }
                oppositeNode = { x: nx, y: ny };
            }
        }

        if (oppositeNode) {
            grid[wall.x][wall.y].isWall = false;
            for (let [dx, dy] of directions) {
                let nx = wall.x + dx;
                let ny = wall.y + dy;
                if (isValid(nx, ny) && grid[nx][ny].isWall) {
                    wallList.push({ x: nx, y: ny });
                }
            }
        }

        wallList.splice(wallIndex, 1);
    }

    this.setState({ grid });
  }


  clearBoard() {
    window.location.reload();
  }

  addMiddleNode(row, col) {
    this.setState({
      middleNodeRow: row,
      middleNodeCol: col,
      addingMiddleNode: true,
    });
  }

  addPresetWall() {
    const { grid } = this.state;
    const newGrid = grid.slice(); 
    const numWallsToAdd = 100;
  
    for (let i = 0; i < numWallsToAdd; i++) {
      let randomRow, randomCol;
      
      do {
        randomRow = Math.floor(Math.random() * newGrid.length);
        randomCol = Math.floor(Math.random() * newGrid[0].length);
      } while (
        newGrid[randomRow][randomCol].isMiddle || 
        newGrid[randomRow][randomCol].isStart ||  
        newGrid[randomRow][randomCol].isFinish    
      );
      newGrid[randomRow][randomCol].isWall = true;
    }
  
    this.setState({ grid: newGrid });
  }
  
  render() {
    const {grid, mouseIsPressed} = this.state;

    return (
      <>
        <div class="container">
          <div className="button-container">
            <button onClick={() => this.visualizeDijkstra()} class="visualization-button">
              Visualize Dijkstra's Algorithm
            </button>
            <div class="description">Find the shortest path using Dijkstra's algorithm, which considers the shortest cumulative distance from the start point to every other point on the grid.</div>
          </div>

          <div className="button-container">
            <button onClick={() => this.visualizeFloydWarshall()} class="visualization-button">
              Visualize Floyd Warshall's Algorithm
            </button>
            <div class="description">Visualize the Floyd-Warshall algorithm, which finds the shortest paths between all pairs of nodes on the grid, suitable for dense graphs.</div>
          </div>

          <div className="button-container">
            <button onClick={() => this.visualizeAstar()} class="visualization-button">
              Visualize Astar's Algorithm
            </button>
            <div class="description">Use the A* algorithm to find the shortest path with an efficient heuristic, ideal for navigating complex grids with varying terrain costs.</div>
          </div>

          <div className="button-container">
            <button onClick={() => this.visualizeBFS()} class="visualization-button">
              Visualize BFS's Algorithm
            </button>
            <div class="description">Execute the Breadth-First Search algorithm to explore the grid level by level, suitable for finding the shortest path on unweighted graphs.</div>
          </div>

          <div className="button-container">
            <button onClick={() => this.visualizeDFS()} class="visualization-button">
              Visualize DFS's Algorithm
            </button>
            <div class="description">Execute the Breadth-First Search algorithm to explore the grid level by level, suitable for finding the shortest path on unweighted graphs.</div>
          </div>

          <div class="separator"></div>

          <div className="button-container">
            <button onClick={() => this.addPresetWall()} class="functionality-button">
              Add a random Wall Preset
            </button>
            <div class="description">Quickly add a preset wall pattern to the grid, simulating obstacles or barriers in your pathfinding scenarios.</div>
          </div>

          <div className="button-container">
            <button onClick={() => this.generateKruskalMaze()} class="functionality-button">
              Generate a Maze using Kruskal's Algorithm
            </button>
            <div class="description">Quickly add a preset wall pattern to the grid, simulating obstacles or barriers in your pathfinding scenarios.</div>
          </div>

          <div className="button-container">
            <button onClick={() => this.generatePrimMaze()} class="functionality-button">
              Generate a Maze using Prim's Algorithm
            </button>
            <div class="description">Quickly add a preset wall pattern to the grid, simulating obstacles or barriers in your pathfinding scenarios.</div>
          </div>

          <div class="separator"></div>

          <div className="middle-container">
            <div className="button-container">
              <button onClick={() => this.addMiddleNode()} class="functionality-button">
                Add a Middle Target
              </button>
              <div class="description">Insert a middle target node to the grid, allowing you to visualize pathfinding algorithms with specific intermediate destinations.</div>
            </div>
          </div>

          <div className="clear-container">
            <div className="button-container">
              <button onClick={() => this.clearBoard()} class="functionality-button">
                Clear Board
              </button>
              <div class="description">Clear the grid, removing all nodes and obstacles, to start a new pathfinding visualization from scratch.</div>
            </div>
          </div>
        </div>

        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx}>
                {row.map((node, nodeIdx) => {
                  const {row, col, isFinish, isStart, isWall} = node;
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      isFinish={isFinish}
                      isStart={isStart}
                      isWall={isWall}
                      mouseIsPressed={mouseIsPressed}
                      onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                      onMouseEnter={(row, col) => this.handleMouseEnter(row, col)}
                      onMouseUp={() => this.handleMouseUp()}
                      row={row}
                      isMiddle={node.isMiddle} 
                      middleNodeCounts={this.state.middleNodeCounts}>
                      </Node>        
                  );
                })}
              </div>
            );
          })}
        </div>
      </>
    );
  }
}

const getInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < 20; row++) {
    const currentRow = [];
    for (let col = 0; col < 50; col++) {
      currentRow.push(createNode(col, row));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row) => {
  return {
    col,
    row,
    isStart: row === START_NODE_ROW && col === START_NODE_COL,
    isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
    isMiddle: false,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};

function resetNodes(grid) {
  for (const row of grid) {
    for (const node of row) {
      node.distance = Infinity;
      node.isVisited = false;
      node.previousNode = null;
    }
  }
}


class UnionFind {
  constructor(size) {
    this.parent = new Array(size).fill(0).map((_, index) => index);
    this.rank = new Array(size).fill(0);
  }

  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  union(x, y) {
    let rootX = this.find(x);
    let rootY = this.find(y);

    if (rootX === rootY) return false;

    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }

    return true;
  }
}







