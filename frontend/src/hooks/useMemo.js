import { useMemo } from "react";

/**
 * `useMemo` is a React Hook that lets you cache the result of a calculation between re-renders.
 *
 * Syntax:
 * const cachedValue = useMemo(calculateValue, dependencies)
 *
 * Parameters:
 *
 * calculateValue: The function calculating the value that you want to cache. It should be pure, should take no arguments, and should return a value of any type.
 * React will call your function during the initial render. On next renders, React will return the same value again if the dependencies have not changed since the last render.
 * Otherwise, it will call calculateValue, return its result, and store it so it can be reused later.
 *
 * Returns:
 *
 * dependencies: The list of all reactive values referenced inside of the calculateValue code.
 * Reactive values include props, state, and all the variables and functions declared directly inside your component body.
 * If your linter is configured for React, it will verify that every reactive value is correctly specified as a dependency.
 * The list of dependencies must have a constant number of items and be written inline like [dep1, dep2, dep3].
 * React will compare each dependency with its previous value using the Object.is comparison.
 */

function TodoList({ todos, tab }) {
  const visibleTodos = useMemo(() => filterTodos(todos, tab), [todos, tab]);
}

/**
 * You need to pass two things to useMemo:
 * A calculation function that takes no arguments, like () =>, and returns what you wanted to calculate.
 * A list of dependencies including every value within your component that’s used inside your calculation.
 */
