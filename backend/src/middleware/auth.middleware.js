import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncFnHandler } from "../utils/AsyncFnHandler.js";
import jwt from "jsonwebtoken";

/**
 * Middleware to verify the user's JWT (JSON Web Token) for authentication.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res (_) - Express response object.
 * @param {Function} next - Express next middleware function.
 * @param {Object} err - Optional error object.
 * @throws {ApiError} Throws an error if the token is missing, invalid, or if the user is not found.
 */
export const verifyUserJWT = AsyncFnHandler(async (req, res, next, err) => {
  try {
    // Retrieve the user token from cookies or the Authorization header
    const userToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // If no token is provided, throw an unauthorized error
    if (!userToken) {
      throw new ApiError(401, "Unauthorized Request.");
    }

    // Verify the token using the secret key and extract the payload
    const decodedTokenInformation = jwt.verify(
      userToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    // Find the user by ID from the decoded token payload, excluding password and refresh token fields
    const existingUser = await User.findById(
      decodedTokenInformation?._id
    ).select("-password -refreshtoken");

    // If the user does not exist, throw an invalid token error
    if (!existingUser) {
      throw new ApiError(401, "Invalid Access Token");
    }

    // Attach the found user to the request object
    req.user = existingUser;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // If any error occurs, throw an unauthorized error
    throw new ApiError(401, error?.message || "Invalid Access token");
  }
});
