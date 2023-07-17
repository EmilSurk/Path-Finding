import React, {Component} from 'react';

/*This line imports the Node component from the './Node/Node' file.*/
import Node from './Node/Node';

/*This line imports the dijkstra function and getNodesInShortestPathOrder function from the '../algorithms/dijkstra' file.
 These functions are used in the visualizeDijkstra method to perform the Dijkstra's algorithm and retrieve the shortest path.*/
import {dijkstra, getNodesInShortestPathOrder} from '../algorithms/dijkstra';

import './PathfindingVisualizer.css';

const START_NODE_ROW = 10;
const START_NODE_COL = 15;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 35;

/*The PathfindingVisualizer component inherits functionality from Component and can implement its own methods and properties.*/
export default class PathfindingVisualizer extends Component {

  /*Called when an instance of the component is created. Within the constructor, the initial state of the component is set.*/
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
    };
  }

  /* This is a lifecycle method of the PathfindingVisualizer component that is automatically called after the component has been rendered to the DOM.
   In this method, the getInitialGrid function is called to initialize the grid, and the grid is set in the component's state using setState.*/
  componentDidMount() {
    const grid = getInitialGrid();
    this.setState({grid});
  }

  /*Handles the mouse down event on a node. It takes the row and col as parameters, representing the row and column indices of the node.
   It toggles the wall state of the node in the grid and sets the updated grid and mouseIsPressed state in the component using setState.*/
  handleMouseDown(row, col) {
    const { grid } = this.state;
    const node = grid[row][col];

  // Check if the "Add Middle Target" button is clicked
  if (this.state.addingMiddleNode) {
    const newGrid = grid.slice();
    const middleNode = newGrid[row][col];
    middleNode.isMiddle = true;

    this.setState({
      grid: newGrid,
      middleNodeRow: row,
      middleNodeCol: col,
      addingMiddleNode: false, // Reset the flag after adding the middle node
    });
  } 

  else if (node.isStart || node.isFinish) {
    const currentTime = new Date().getTime();
    const { prevMouseDownTime } = this.state;

    if (node.isStart && prevMouseDownTime && currentTime - prevMouseDownTime < 300) {
      // Double mouse press detected, start node dragging
      this.setState({
        mouseIsPressed: true,
        startNodeDragged: true,
        draggedNodeRow: row,
        draggedNodeCol: col,
      });
      
    } else if (node.isFinish && prevMouseDownTime && currentTime - prevMouseDownTime < 300) {
      // Double mouse press detected, start node dragging
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

  /*Handles the mouse enter event on a node. It takes the row and col as parameters, representing the row and column indices of the node.
  If the mouse is not pressed (i.e., mouseIsPressed is false), the method returns early and does not perform any action.
  If the mouse is pressed, it toggles the wall state of the node in the grid and sets the updated grid state in the component using setState.*/
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
  
  

  /*Handles the mouse up event. It sets the mouseIsPressed state to false, indicating that the mouse button is no longer pressed.*/
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

  /*Animating the visualization of the Dijkstra's algorithm. 
  It takes visitedNodesInOrder and nodesInShortestPathOrder as parameters. 
  It iterates over the visitedNodesInOrder array and updates the CSS class of each visited node to visualize the algorithm's progress. 
  After the iteration is complete, it calls animateShortestPath with nodesInShortestPathOrder to animate the visualization of the shortest path.*/
  animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {

    for (let i = 0; i <= visitedNodesInOrder.length; i++) {

      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-visited';
      }, 10 * i);
    }
  }

  /*This method is responsible for animating the visualization of the shortest path found by Dijkstra's algorithm.
   It takes nodesInShortestPathOrder as a parameter.
   It iterates over the nodesInShortestPathOrder array and updates the CSS class of each node to visualize it as part of the shortest path.*/
  animateShortestPath(nodesInShortestPathOrder) {

    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-shortest-path';
      }, 50 * i);
    }
  }

  /*This method is called when the "Visualize Dijkstra's Algorithm" button is clicked.
  It retrieves the grid from the component's state.
  It gets the start and finish nodes from the grid based on the defined row and column indices.
  Then, it calls the dijkstra function, passing the grid, start node, and finish node to get the visited nodes in order.
  It also calls the getNodesInShortestPathOrder function, passing the finish node, to get the nodes in the shortest path order.
  Finally, it calls animateDijkstra with the visited nodes and nodes in the shortest path to start the animation.*/
  // Helper function that returns a Promise that resolves after a specified time (in milliseconds)


visualizeDijkstra() {
  const { grid, startNodeRow, startNodeCol, middleNodeRow, middleNodeCol, finishNodeRow, finishNodeCol } = this.state;
  const startNode = grid[startNodeRow][startNodeCol];
  const finishNode = grid[finishNodeRow][finishNodeCol];

  if (middleNodeRow !== null && middleNodeCol !== null) {
    const middleNode = grid[middleNodeRow][middleNodeCol];

    // Find path from start node to middle node
    const visitedNodesToMiddle = dijkstra(grid, startNode, middleNode);
    const nodesInShortestPathToMiddle = getNodesInShortestPathOrder(middleNode);

    // Animate the path from start node to middle node
    
   
    resetNodes(grid);

    // Find path from middle node to finish node
    const visitedNodesToFinish = dijkstra(grid, middleNode, finishNode);
    const nodesInShortestPathToFinish = getNodesInShortestPathOrder(finishNode);

    // Combine both paths
    const visitedNodesInOrder = this.combinePaths(visitedNodesToMiddle, visitedNodesToFinish);
    const nodesInShortestPathOrder = nodesInShortestPathToMiddle.concat(nodesInShortestPathToFinish.slice(1));

    // Animate the path from middle node to finish node
    this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
  } else {
    // Find path from start node to finish node
    const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);

    // Animate the entire path from start node to finish node
    this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
  }
}

  
  
  

  combinePaths(path1, path2) {
    const combinedPath = [...path1];
    // Find the index where the paths have the common node (the middle node)
    const commonNodeIndex = path2.findIndex(node => combinedPath.includes(node));
  
    // Remove the common node to avoid duplication
    if (commonNodeIndex !== -1) {
      path2.splice(commonNodeIndex, 1);
    }
  
    // Combine the two paths
    combinedPath.push(...path2);
  
    return combinedPath;
  }

  /////////////////////
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
  

  /*Responsible for rendering the JSX that represents the component's UI.*/
  render() {

    /*Uses destructuring assignment to extract the grid and mouseIsPressed properties from the component's state object.*/
    const {grid, mouseIsPressed} = this.state;

    // Create grid and Button to start Dijkstra Algorithm 
    /* It represents the component's UI.
       It consists of a button that triggers the visualization of Dijkstra's algorithm and a div element with the grid class that contains the nodes.*/
    return (
      <>

        {/* This is a button element with an onClick event handler that calls the visualizeDijkstra method when clicked.*/}
        <button onClick={() => this.visualizeDijkstra()}>
          Visualize Dijkstra's Algorithm
        </button>
        <button onClick={() => this.addMiddleNode()}>
          Add Middle Target
        </button>
        <button onClick={() => this.clearBoard()}>
          Clear Board
        </button>
        <div className="grid">
          

          {/* This line maps over the grid array to render the rows of nodes. 
          For each row, a div element is rendered with the key set to rowIdx. 
          Within each row, another map function is used to render the individual nodes.
          The Node component is used to render each node, passing the necessary props such as col, isFinish, isStart, isWall, mouseIsPressed, and event handlers (onMouseDown, onMouseEnter, onMouseUp).*/}
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
                      isMiddle={row === this.state.middleNodeRow && col === this.state.middleNodeCol}> 
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

/*This is a helper function that returns the initial grid.
 It creates a 2D array representing the grid and populates it with nodes created by the createNode function.*/
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

/*This is a helper function that creates a node object.*/
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

/*This is a helper function that takes the current grid, row, and col as parameters.
It creates a new grid by making a shallow copy of the current grid.
 It toggles the wall state of the node at the specified row and col in the new grid and returns the updated grid.*/
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


