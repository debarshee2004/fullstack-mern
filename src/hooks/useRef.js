/**
 * The `useRef()` Hook
 * -------------------
 *
 * useRef is a React Hook that lets you reference a value that’s not needed for rendering.
 *
 * Parameters:
 *
 * initialValue: The value you want the ref object’s current property to be initially. It can be a value of any type.
 * This argument is ignored after the initial render.
 *
 * Return:
 * useRef returns an object with a single property:
 *
 * current: Initially, it’s set to the initialValue you have passed.
 * You can later set it to something else.
 * If you pass the ref object to React as a ref attribute to a JSX node, React will set its current property.
 * On the next renders, useRef will return the same object.
 *
 * Syntax:
 * const referenceVariable = useRef(default);
 */

import { useRef } from "react";

function MyComponent() {
  const intervalRef = useRef(0);
  const inputRef = useRef(null);
}

MyComponent();
