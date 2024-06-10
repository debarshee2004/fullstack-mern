/**
 * ApiError
 *
 * A class representing an API error. This class extends the built-in Error class
 * and is used to standardize the format of error responses sent by the server.
 *
 * @class
 * @extends {Error}
 * @param {number} statusCode - The HTTP status code of the error.
 * @param {string} [message="Something went wrong"] - An optional message providing details about the error.
 * @param {Array} [errors=[]] - An optional array of specific error details.
 * @param {string} [stack=""] - An optional stack trace for the error.
 */
class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong with the API.",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
