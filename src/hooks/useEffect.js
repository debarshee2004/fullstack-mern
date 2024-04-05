/**
 * The `useEffect()` Hook
 * ----------------------
 *
 * This is a Hook which does a function call when the page first loads and when its dependencies change.
 *
 * Parameters:
 *
 * 1. setup: The function with your Effect’s logic. Your setup function may also optionally return a cleanup function.
 * When your component is added to the DOM, React will run your setup function.
 * After every re-render with changed dependencies, React will first run the cleanup function (if you provided it) with the old values, and then run your setup function with the new values.
 * After your component is removed from the DOM, React will run your cleanup function.
 *
 * 2. optional dependencies: The list of all reactive values referenced inside of the setup code.
 * Reactive values include props, state, and all the variables and functions declared directly inside your component body.
 * If your linter is configured for React, it will verify that every reactive value is correctly specified as a dependency.
 * The list of dependencies must have a constant number of items and be written inline like [dep1, dep2, dep3].
 * React will compare each dependency with its previous value using the Object.is comparison.
 * If you omit this argument, your Effect will re-run after every re-render of the component.
 *
 * Return:
 * `useEffect()` returns undefined.
 *
 * Syntax:
 * useEffect(function, [dependencies]);
 */

import { useEffect } from "react";
import { createConnection } from "./chat.js";

function ChatRoom({ roomId }) {
  const serverUrl = "https://localhost:1234";

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, [serverUrl, roomId]);
}

ChatRoom();
