import { useCallback } from "react";

/**
 * `useCallback` is a React Hook that lets you cache a function definition between re-renders.
 *
 * Syntax:
 * const cashedFn = useCallback(function, [dependencies]);
 *
 * Parameters:
 *
 * 1. function: The function value that you want to cache.
 * It can take any arguments and return any values. React will return (not call!) your function back to you during the initial render.
 * On next renders, React will give you the same function again if the dependencies have not changed since the last render.
 * Otherwise, it will give you the function that you have passed during the current render, and store it in case it can be reused later.
 * React will not call your function. The function is returned to you so you can decide when and whether to call it.
 *
 * 2. dependencies: The list of all reactive values referenced inside of the function code.
 * Reactive values include props, state, and all the variables and functions declared directly inside your component body.
 * If your linter is configured for React, it will verify that every reactive value is correctly specified as a dependency.
 * The list of dependencies must have a constant number of items and be written inline like [dep1, dep2, dep3].
 * React will compare each dependency with its previous value using the Object.is comparison algorithm.
 *
 * Return:
 *
 * On the initial render, useCallback returns the function you have passed.
 * During subsequent renders, it will either return an already stored  function from the last render (if the dependencies haven’t changed), or return the function you have passed during this render.
 *
 */

function ProductPage({ productId, referrer }) {
  // A useCallback function to handleSubmit the form when there is a change in productId and referrer.
  const handleSubmit = useCallback(
    (orderDetails) => {
      // A post request to the URL
      post("/product/" + productId + "/buy", {
        referrer,
        orderDetails,
      });
    },
    [productId, referrer]
  );
  handleSubmit();
}

ProductPage();
