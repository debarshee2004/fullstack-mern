/**
 * AsyncFnHandler
 *
 * A higher-order function that wraps an asynchronous route handler function
 * to manage errors effectively. This function ensures that any errors
 * occurring within the asynchronous function are caught and handled
 * appropriately, sending an error response to the client.
 *
 * @param {Function} func - An asynchronous function (req, res, next) that serves as the route handler.
 * @returns {Function} - A new function that wraps the provided asynchronous function, handling errors.
 */
const AsyncFnHandler = (func) => async (req, res, next) => {
  try {
    await func(req, res, next);
  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export { AsyncFnHandler };
