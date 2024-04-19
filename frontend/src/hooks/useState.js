import { useState } from "react";

/**
 * The `useState()` Hook
 * ----------------------
 *
 * When a state variable updates the UI must update the changes in the DOM.
 * The useState Hook from React library helps this process.
 *
 * Parameters:
 *
 * 1. initialState: The value you want the state to be initially.
 * It can be a value of any type, but there is a special behavior for functions.
 * This argument is ignored after the initial render.
 *
 * 2. If you pass a function as initialState, it will be treated as an initializer function.
 * It should be pure, should take no arguments, and should return a value of any type.
 * React will call your initializer function when initializing the component, and store its return value as the initial state.
 *
 * Returns:
 * useState returns an array with exactly two values:
 *
 * 1. The current state. During the first render, it will match the initialState you have passed.
 * 2. The set function that lets you update the state to a different value and trigger a re-render.
 *
 * Syntax:
 * const [state, setState] = useState(initialState)
 */

const UseSateFunc = () => {
  // Initializing the useState() function
  const [variable, setVariable] = useState(0);
  // A basic increment for loop to change the variable state
  for (let i = 0; i < 10; i++) {
    setVariable(variable + 1);
  }
  // Checking the output
  console.log(variable);
};

UseSateFunc();
