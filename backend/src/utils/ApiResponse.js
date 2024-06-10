/**
 * ApiResponse
 *
 * A class representing the structure of an API response. This class is used
 * to standardize the format of responses sent by the server, including the
 * status code, data payload, success indicator, and an optional message.
 *
 * @class
 * @param {number} statusCode - The HTTP status code of the response.
 * @param {Object} data - The data payload of the response.
 * @param {string} [message="Success"] - An optional message providing additional information about the response.
 */
class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export { ApiResponse };
