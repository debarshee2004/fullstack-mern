import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncFnHandler } from "../utils/AsyncFnHandler.js";
import jwt from "jsonwebtoken";

/**
 * Middleware function to verify the user's JWT (JSON Web Token) for authentication.
 *
 * Middleware functions are functions that have access to the request object (req),
 * the response object (res), and the next middleware function in the application’s
 * request-response cycle. These functions can perform tasks, modify request and
 * response objects, or end the request-response cycle.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The Express next middleware function.
 * @param {Object} err - Optional error object.
 *
 * This middleware:
 * 1. Retrieves the user token from cookies or the Authorization header.
 * 2. Throws an unauthorized error if no token is provided.
 * 3. Verifies the token using the secret key defined in `process.env.ACCESS_TOKEN_SECRET`.
 * 4. Finds the user by ID from the decoded token payload, excluding sensitive fields like password and refresh token.
 * 5. Throws an invalid token error if the user associated with the token is not found.
 * 6. Attaches the found user object to the request object (`req.user`).
 * 7. Passes control to the next middleware function or route handler if successful.
 *
 * @throws {ApiError} Throws an error if the token is missing, invalid, or if the user is not found.
 */
export const verifyUserJWT = AsyncFnHandler(async (req, res, next, err) => {
  try {
    const userToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!userToken) {
      throw new ApiError(401, "Unauthorized Request.");
    }

    const decodedTokenInformation = jwt.verify(
      userToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    const existingUser = await User.findById(
      decodedTokenInformation?._id
    ).select("-password -refreshToken");

    if (!existingUser) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = existingUser;

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access token");
  }
});
