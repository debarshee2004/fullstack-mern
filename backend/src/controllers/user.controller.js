import { AsyncFnHandler } from "../utils/AsyncFnHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/service/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

/**
 * Asynchronously generates an access token and a refresh token for a given user.
 *
 * @param {String} userId - The ID of the user for whom the tokens are to be generated.
 * @returns {Object} An object containing the generated access token and refresh token.
 * @throws {ApiError} Throws an error if the tokens cannot be generated or saved.
 */
const generateAccessTokenAndRefreshTokens = async (userId) => {
  try {
    // Find the user by their ID in the database
    const existingUser = await User.findOne(userId);

    // Generate an access token for the user
    const userAccessToken = existingUser.generateAccessToken();

    // Generate a refresh token for the user
    const userRefreshToken = existingUser.generateRefreshToken();

    // Assign the newly generated refresh token to the user's refreshToken field
    existingUser.refreshToken = userRefreshToken;

    // Save the updated user document in the database without validation
    const refreshTokenSavedinDatabase = await existingUser.save({
      validateBeforeSave: false,
    });

    // If the refresh token could not be saved, throw an error
    if (!refreshTokenSavedinDatabase) {
      throw new ApiError(
        500,
        "Refresh Token failed to be saved in the Database."
      );
    }

    // Return the generated access token and refresh token
    return { userAccessToken, userRefreshToken };
  } catch (error) {
    // If any error occurs during the process, throw an ApiError
    throw new ApiError(
      500,
      "Access Token and Refresh Token failed to generate."
    );
  }
};

/**
 * Handler function for registering a new user.
 *
 * 1. Get user details from the frontend.
 * 2. Validate that no field is empty.
 * 3. Check if the user already exists using email or username.
 * 4. Check if there are avatar and cover image files provided.
 * 5. Upload avatar and cover image to Cloudinary.
 * 6. Create a new user object and save it in the database.
 * 7. Remove password and refresh token fields from the response.
 * 8. Return the created user in the response.
 */
const registerUser = AsyncFnHandler(async (req, res) => {
  // Destructure user details from the request body
  const { username, email, password, fullname } = req.body;
  // console.log(req.body);

  // Validate that all fields are provided and not empty
  if (
    [username, email, password, fullname].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required.", [], "");
  }

  // Check if a user with the provided email or username already exists
  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  // If the user already exists, throw a conflict error
  if (existedUser) {
    throw new ApiError(
      409,
      "User with email and username already exists.",
      [],
      ""
    );
  }

  // Get the local paths for the avatar and cover image files from the request
  let avatarLocalPath, coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarLocalPath = req.files.avatar[0].path;
  }
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // Ensure coverImageLocalPath is defined if cover image is provided
  // if (
  //   req.files &&
  //   Array.isArray(req.files.coverImage) &&
  //   req.files.coverImage.length > 0
  // ) {
  //   coverImageLocalPath = req.files.coverImage[0].path;
  // }

  // If avatar file is not provided, throw an error
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required", [], "");
  }

  // Upload avatar and cover image to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  // If avatar upload fails, throw an error
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required", [], "");
  }

  // Create a new user in the database
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // Retrieve the created user without the password and refresh token fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // If user creation fails, throw an internal server error
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // Return the created user in the response with a success status
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered Successfully"));
});

/**
 * Handler function for login an existing user.
 *
 * 1. Get user details from the frontend.
 * 2. Validate that no field is empty.
 * 3. Check if the user already exists using email or username.
 * 4. If yes check the password.
 * 5. If no tell the user to create a new account.
 * 6. Validate the password and add option for forget password.
 * 7. If not valid return negative response.
 * 8. If password if valid generate Access Token and Refresh Token.
 * 9. Send the Tokens as secured cookies.
 * 10. Return a response of success to the user.
 */
const loginUser = AsyncFnHandler(async (req, res) => {
  const { email, username, password } = req.body;
  // console.log(email, password);

  // Validate input: email or username is required
  if (!email && !username) {
    // (!(email || username))
    throw new ApiError(400, "Email or Username is Required.");
  }

  // Find user by either username or email
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  // console.log(existingUser);

  // If user does not exist, throw a 404 error
  if (!existingUser) {
    throw new ApiError(404, "User does not exist.");
  }

  // Check if the provided password matches the stored password
  const isPasswordValid = await existingUser.isPasswordCorrect(password);
  // console.log(isPasswordValid);

  // If password is incorrect, throw a 401 error
  if (!isPasswordValid) {
    throw new ApiError(401, "Password does not match.");
  }

  // Generate access and refresh tokens
  const { userAccessToken, userRefreshToken } =
    await generateAccessTokenAndRefreshTokens(existingUser._id);

  // Define cookie options for storing tokens
  const cookieOptions = {
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookies
    secure: true, // Ensures cookies are sent only over HTTPS
  };

  // Remove sensitive fields from the user object
  const userResponse = await User.findOne(existingUser._id).select(
    "-password -refreshToken"
  );

  // Set cookies and respond with user data and tokens
  return res
    .status(200)
    .cookie("accessToken", userAccessToken, cookieOptions)
    .cookie("refreshToken", userRefreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: userResponse, // Provide the logged-in user information
          userAccessToken,
          userRefreshToken,
        },
        "User logged in Successfully."
      )
    );
});

const logoutUser = AsyncFnHandler(async (req, res) => {
  // Remove the refresh token from the user document in the database
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: "",
    },
  });

  // Define cookie options to clear tokens
  const cookieOptions = {
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookies
    secure: true, // Ensures cookies are sent only over HTTPS
  };

  // Clear the access and refresh token cookies and respond with a success message
  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully"));
});

const refreshAccessToken = AsyncFnHandler(async (req, res) => {
  // Retrieve the refresh token from cookies or request body
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  // If no refresh token is provided, throw an unauthorized error
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request of the Refresh Token.");
  }

  try {
    // Verify the incoming refresh token using the secret key
    const decodedTokenInformation = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Find the user associated with the decoded token information
    const existingUser = await User.findById(decodedTokenInformation?._id);

    // If the user does not exist, throw an invalid token error
    if (!existingUser) {
      throw new ApiError(401, "Invalid Refresh Token.");
    }

    // Check if the incoming refresh token matches the user's stored refresh token
    if (incomingRefreshToken !== existingUser?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used.");
    }

    // Define cookie options for storing tokens
    const cookieOptions = {
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookies
      secure: true, // Ensures cookies are sent only over HTTPS
    };

    // Generate new access and refresh tokens
    const { accessToken, newRefreshToken } =
      await generateAccessTokenAndRefreshTokens(existingUser._id);

    // Set new access and refresh tokens in cookies and respond with tokens
    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = AsyncFnHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // Find the user by their ID stored in the request object
  const existingUser = await User.findById(req.user?._id);

  // Check if the provided old password is correct
  const isPasswordCorrect = await existingUser.isPasswordCorrect(oldPassword);

  // If the old password is incorrect, throw a 400 error
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  // Update the user's password with the new password
  existingUser.password = newPassword;
  await existingUser.save({ validateBeforeSave: false });

  // Respond with a success message
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = AsyncFnHandler(async (req, res) => {
  // Respond with the current user information stored in the request object
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        req.user,
        "Currently Active User fetched successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
};
