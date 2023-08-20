import React, { Component } from 'react';
import './Node.css';

export default class Node extends Component {
  render() {
    const {
      col,
      isFinish,
      isStart,
      isWall,
      isMiddle,
      onMouseDown,
      onMouseEnter,
      onMouseUp,
      row,
      middleNodeCounts, // Add middleNodeCount as a prop
    } = this.props;

    const extraClassName = isFinish
      ? 'node-finish'
      : isStart
      ? 'node-start'
      : isWall
      ? 'node-wall'
      : isMiddle
      ? 'node-middle'
      : '';

    return (
      <div
        id={`node-${row}-${col}`}
        className={`node ${extraClassName}`}
        onMouseDown={() => onMouseDown(row, col)}
        onMouseEnter={() => onMouseEnter(row, col)}
        onMouseUp={() => onMouseUp()}
      >
        {/* Display the middle number only when isMiddle is true */}
        {isMiddle && (
          <span className="middle-number">
          {middleNodeCounts[`${row}-${col}`]}
        </span>
        )}
      </div>
    );
  }
}
