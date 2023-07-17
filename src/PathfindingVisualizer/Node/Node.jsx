import React, {Component} from 'react';

import './Node.css';

export default class Node extends Component {

  /*The render() method is responsible for returning the JSX (JavaScript XML) that represents the component's UI. */
  render() {

    /*Extracts the required properties from the props object.
     In React, props are a way to pass data from a parent component to a child component.
     These properties are passed to the Node component when it is used in another component  */
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
    } = this.props;

    /*This line uses a conditional (ternary) operator to determine the extraClassName based on the isFinish, isStart, and isWall properties.
     It assigns a specific class name to extraClassName based on the conditions.
    If none of the conditions match, an empty string is assigned.*/
    const extraClassName = isFinish
      ? 'node-finish'
      : isStart
      ? 'node-start'
      : isWall
      ? 'node-wall'
      : isMiddle // Add this condition for the middle node
      ? 'node-middle'
      : '';

    return (
      <div
        id={`node-${row}-${col}`}
        className={`node ${extraClassName}`}
        onMouseDown={() => onMouseDown(row, col)}
        onMouseEnter={() => onMouseEnter(row, col)}
        onMouseUp={() => onMouseUp()}
        
        ></div>
    );
  }
}
