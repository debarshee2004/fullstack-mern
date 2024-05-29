import { useReducer } from "react";

/**
 * `useReducer` is a React Hook that lets you add a reducer to your component.
 *
 * Syntax:
 * const [state, dispatch] = useReducer(reducer, initialArg, init?)
 *
 * Parameters:
 *
 * reducer: The reducer function that specifies how the state gets updated. It must be pure, should take the state and action as arguments, and should return the next state. State and action can be of any types.
 * initialArg: The value from which the initial state is calculated. It can be a value of any type. How the initial state is calculated from it depends on the next init argument.
 * optional init: The initializer function that should return the initial state. If it’s not specified, the initial state is set to initialArg. Otherwise, the initial state is set to the result of calling init(initialArg).
 *
 * Returns:
 *
 * useReducer returns an array with exactly two values:
 * The current state. During the first render, it’s set to init(initialArg) or initialArg (if there’s no init).
 * The dispatch function that lets you update the state to a different value and trigger a re-render.
 *
 * The dispatch function returned by useReducer lets you update the state to a different value and trigger a re-render.
 * Parameters: action: The action performed by the user. It can be a value of any type. By convention, an action is usually an object with a type property identifying it and, optionally, other properties with additional information.
 * Return: dispatch functions do not have a return value.
 */

function reducer(state, action) {
  if (action.type === "incremented_age") {
    return {
      age: state.age + 1,
    };
  }
  throw Error("Unknown action.");
}

export default function Counter() {
  const [state, dispatch] = useReducer(reducer, { age: 42 });

  return (
    <>
      <button
        onClick={() => {
          dispatch({ type: "incremented_age" });
        }}
      >
        Increment age
      </button>
      <p>Hello! You are {state.age}.</p>
    </>
  );
}
