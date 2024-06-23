import { AsyncFnHandler } from "../utils/AsyncFnHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/service/Cloudinary.js";
import jwt from "jsonwebtoken";

/**
 * Asynchronously generates an access token and a refresh token for a given user.
 *
 * This function performs the following steps:
 * 1. Finds the user by their ID in the database.
 * 2. Generates an access token for the user.
 * 3. Generates a refresh token for the user.
 * 4. Assigns the newly generated refresh token to the user's refreshToken field.
 * 5. Saves the updated user document in the database without validation.
 * 6. Returns the generated access token and refresh token.
 *
 * If any step fails, the function throws an `ApiError` with an appropriate message.
 *
 * @param {String} userId - The ID of the user for whom the tokens are to be generated.
 * @returns {Object} An object containing the generated access token and refresh token.
 * @throws {ApiError} Throws an error if the tokens cannot be generated or saved.
 */
const generateAccessTokenAndRefreshTokens = async (userId) => {
  try {
    const existingUser = await User.findOne(userId);
    const userAccessToken = existingUser.generateAccessToken();
    const userRefreshToken = existingUser.generateRefreshToken();
    existingUser.refreshToken = userRefreshToken;
    const refreshTokenSavedinDatabase = await existingUser.save({
      validateBeforeSave: false,
    });

    if (!refreshTokenSavedinDatabase) {
      throw new ApiError(
        500,
        "Refresh Token failed to be saved in the Database."
      );
    }

    return { userAccessToken, userRefreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Access Token and Refresh Token failed to generate."
    );
  }
};

/**
 * Handler function for registering a new user.
 *
 * @param {Object} req - The request object from the client, containing user details and files.
 * @param {Object} res - The response object to be sent back to the client.
 *
 * This controller handles the registration of a new user. It performs several steps to ensure
 * the user's data is valid and that the user does not already exist. If successful, it saves the
 * user to the database and returns the newly created user without sensitive fields.
 *
 * Steps of the controller:
 * 1. Get user details from the frontend request.
 * 2. Validate that no field is empty.
 * 3. Check if the user already exists using email or username.
 * 4. Check if avatar and cover image files are provided.
 * 5. Upload avatar and cover image to Cloudinary.
 * 6. Create a new user object and save it in the database.
 * 7. Remove password and refresh token fields from the response.
 * 8. Return the created user in the response.
 *
 * @returns {Object} A response containing the created user (without password and refresh token).
 * @throws {ApiError} Throws an error if validation fails, the user already exists, or there is an issue during user creation.
 */
const registerUser = AsyncFnHandler(async (req, res) => {
  const { username, email, password, fullname } = req.body;

  if (
    [username, email, password, fullname].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required.", [], "");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new ApiError(
      409,
      "User with email and username already exists.",
      [],
      ""
    );
  }

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

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required", [], "");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required", [], "");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered Successfully"));
});

/**
 * Handler function for logging in an existing user.
 *
 * @param {Object} req - The request object from the client, containing user login details.
 * @param {Object} res - The response object to be sent back to the client.
 *
 * This controller handles the login process for an existing user. It validates the user's credentials,
 * checks if the user exists, verifies the password, generates tokens, and returns a success response with
 * the tokens as secured cookies.
 *
 * Steps of the controller:
 * 1. Get user details from the frontend request.
 * 2. Validate that no field is empty.
 * 3. Check if the user exists using email or username.
 * 4. If the user exists, check the password.
 * 5. If the user does not exist, prompt the user to create a new account.
 * 6. Validate the password and provide an option for forgotten password.
 * 7. If the password is invalid, return a negative response.
 * 8. If the password is valid, generate Access Token and Refresh Token.
 * 9. Send the tokens as secured cookies.
 * 10. Return a success response to the user.
 *
 * @returns {Object} A response containing the user data and tokens.
 * @throws {ApiError} Throws an error if validation fails, the user does not exist, or the password is incorrect.
 */
const loginUser = AsyncFnHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!email && !username) {
    throw new ApiError(400, "Email or Username is Required.");
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!existingUser) {
    throw new ApiError(404, "User does not exist.");
  }

  const isPasswordValid = await existingUser.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password does not match.");
  }

  const { userAccessToken, userRefreshToken } =
    await generateAccessTokenAndRefreshTokens(existingUser._id);

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  const userResponse = await User.findOne(existingUser._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", userAccessToken, cookieOptions)
    .cookie("refreshToken", userRefreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: userResponse,
          userAccessToken,
          userRefreshToken,
        },
        "User logged in Successfully."
      )
    );
});

/**
 * Handler function for logging out an existing user.
 *
 * @param {Object} req - The request object from the client, containing user information.
 * @param {Object} res - The response object to be sent back to the client.
 *
 * This controller handles the logout process for an existing user. It removes the refresh token
 * from the user document in the database, clears the authentication cookies, and returns a success
 * response.
 *
 * Steps of the controller:
 * 1. Remove the refresh token from the user document in the database.
 * 2. Define cookie options to clear tokens.
 * 3. Clear the access and refresh token cookies.
 * 4. Return a success response to the user.
 *
 * @returns {Object} A response indicating successful logout.
 */
const logoutUser = AsyncFnHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $unset: {
      refreshToken: 1,
    },
  });

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully"));
});

/**
 * Handler function for refreshing an access token using a refresh token.
 *
 * @param {Object} req - The request object from the client, containing cookies or body with the refresh token.
 * @param {Object} res - The response object to be sent back to the client.
 *
 * This controller handles the process of refreshing an access token. It verifies the provided refresh token,
 * generates new access and refresh tokens, and sends them back to the client as secured cookies.
 *
 * Steps of the controller:
 * 1. Retrieve the refresh token from cookies or request body.
 * 2. If no refresh token is provided, throw an unauthorized error.
 * 3. Verify the incoming refresh token using the secret key.
 * 4. Find the user associated with the decoded token information.
 * 5. If the user does not exist, throw an invalid token error.
 * 6. Check if the incoming refresh token matches the user's stored refresh token.
 * 7. If the token is expired or used, throw an error.
 * 8. Define cookie options for storing tokens.
 * 9. Generate new access and refresh tokens.
 * 10. Set new access and refresh tokens in cookies and respond with tokens.
 *
 * @returns {Object} A response containing the new access token and refresh token.
 * @throws {ApiError} Throws an error if the refresh token is invalid or any other error occurs during the process.
 */
const refreshAccessToken = AsyncFnHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request of the Refresh Token.");
  }

  try {
    const decodedTokenInformation = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const existingUser = await User.findById(decodedTokenInformation?._id);

    if (!existingUser) {
      throw new ApiError(401, "Invalid Refresh Token.");
    }

    if (incomingRefreshToken !== existingUser?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used.");
    }

    const cookieOptions = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessTokenAndRefreshTokens(existingUser._id);

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

/**
 * Handler function for changing the current user's password.
 *
 * @param {Object} req - The request object from the client, containing the old and new passwords.
 * @param {Object} res - The response object to be sent back to the client.
 *
 * This controller handles the process of changing a user's password. It verifies the old password,
 * updates the password to the new one, and returns a success response.
 *
 * Steps of the controller:
 * 1. Retrieve the old and new passwords from the request body.
 * 2. Find the user by their ID stored in the request object.
 * 3. Check if the provided old password is correct.
 * 4. If the old password is incorrect, throw an error.
 * 5. Update the user's password with the new password.
 * 6. Save the updated user document in the database.
 * 7. Respond with a success message.
 *
 * @returns {Object} A response indicating the password was changed successfully.
 * @throws {ApiError} Throws an error if the old password is incorrect or any other error occurs during the process.
 */
const changeCurrentPassword = AsyncFnHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const existingUser = await User.findById(req.user?._id);

  const isPasswordCorrect = await existingUser.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  existingUser.password = newPassword;
  await existingUser.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

/**
 * Handler function for retrieving the current user's information.
 *
 * @param {Object} req - The request object from the client, containing the current user's information.
 * @param {Object} res - The response object to be sent back to the client.
 *
 * This controller handles the retrieval of the currently authenticated user's information.
 * It directly responds with the user data stored in the request object.
 *
 * Steps of the controller:
 * 1. Access the current user's information stored in the request object.
 * 2. Respond with the user information and a success message.
 *
 * @returns {Object} A response containing the current user's information.
 */
const getCurrentUser = AsyncFnHandler(async (req, res) => {
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

/**
 * Handler function for updating the current user's account details.
 *
 * @param {Object} req - The request object from the client, containing the updated account details.
 * @param {Object} res - The response object to be sent back to the client.
 *
 * This controller handles the update of a user's account details. It validates the input, updates the user information
 * in the database, and returns the updated user data.
 *
 * Steps of the controller:
 * 1. Retrieve the updated account details (fullname and email) from the request body.
 * 2. Validate that both fields (fullname and email) are provided.
 * 3. Update the user's details in the database using the user ID stored in the request object.
 * 4. Select the updated user details without password and refresh token fields.
 * 5. Respond with the updated user information and a success message.
 *
 * @returns {Object} A response containing the updated user information.
 * @throws {ApiError} Throws an error if any required field is missing.
 */
const updateAccountDetails = AsyncFnHandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    throw new ApiError(400, "All fields are Required.");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Account details updated successfully.")
    );
});

/**
 * Handler function for updating the current user's avatar.
 *
 * @param {Object} req - The request object from the client, containing the avatar file.
 * @param {Object} res - The response object to be sent back to the client.
 *
 * This controller handles the update of a user's avatar. It validates the input, uploads the new avatar to Cloudinary,
 * updates the user's avatar URL in the database, and returns the updated user data.
 *
 * Steps of the controller:
 * 1. Retrieve the local path of the new avatar file from the request.
 * 2. Validate that the avatar file is provided.
 * 3. Upload the new avatar to Cloudinary.
 * 4. Validate that the avatar was successfully uploaded.
 * 5. Update the user's avatar URL in the database using the user ID stored in the request object.
 * 6. Select the updated user details without password and refresh token fields.
 * 7. Respond with the updated user information and a success message.
 *
 * @returns {Object} A response containing the updated user information.
 * @throws {ApiError} Throws an error if the avatar file is missing or if any error occurs during the upload/update process.
 */
const updateUserAvater = AsyncFnHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing.");
  }

  const newAvatar = await uploadOnCloudinary(avatarLocalPath);

  if (!newAvatar.url) {
    throw new ApiError(400, "Error happened while updating new Avatar.");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: newAvatar.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Avatar image updated successfully")
    );
});

/**
 * Handler function for updating the current user's cover image.
 *
 * @param {Object} req - The request object from the client, containing the cover image file.
 * @param {Object} res - The response object to be sent back to the client.
 *
 * This controller handles the update of a user's cover image. It validates the input, uploads the new cover image to Cloudinary,
 * updates the user's cover image URL in the database, and returns the updated user data.
 *
 * Steps of the controller:
 * 1. Retrieve the local path of the new cover image file from the request.
 * 2. Validate that the cover image file is provided.
 * 3. Upload the new cover image to Cloudinary.
 * 4. Validate that the cover image was successfully uploaded.
 * 5. Update the user's cover image URL in the database using the user ID stored in the request object.
 * 6. Select the updated user details without password and refresh token fields.
 * 7. Respond with the updated user information and a success message.
 *
 * @returns {Object} A response containing the updated user information.
 * @throws {ApiError} Throws an error if the cover image file is missing or if any error occurs during the upload/update process.
 */
const updateUserCoverImage = AsyncFnHandler(async (req, res) => {
  const coverLocalPath = req.file?.path;

  if (!coverLocalPath) {
    throw new ApiError(400, "Cover Image file is missing.");
  }

  const newCover = await uploadOnCloudinary(coverLocalPath);

  if (!newCover.url) {
    throw new ApiError(400, "Error happened while updating new Cover Image.");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: newCover.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Cover Image updated successfully")
    );
});

/**
 * Handler function for retrieving user channel profile information.
 *
 * @param {Object} req - The request object from the client, containing the username parameter.
 * @param {Object} res - The response object to be sent back to the client.
 *
 * This controller retrieves and aggregates information about a user's channel profile.
 * It uses MongoDB aggregation pipelines to perform multiple operations:
 * 1. Matches the user's username to find the corresponding user document.
 * 2. Performs lookups to fetch information about subscribers and channels the user is subscribed to.
 * 3. Adds computed fields like subscriber count, channels subscribed to count, and subscription status for the requesting user.
 * 4. Projects selected fields to include in the response.
 *
 * MongoDB aggregation pipelines allow the aggregation framework to process data records and return computed results.
 * In this function:
 * - `$match` stage filters documents by the username provided in the request parameter.
 * - `$lookup` stages perform left outer joins with the 'subscriptions' collection to fetch subscriber and subscribedTo information.
 * - `$addFields` stage computes additional fields like `subscribersCount`, `channelsSubscribedToCount`, and `isSubscribed`.
 * - `$project` stage shapes the output document by including specific fields for the response.
 *
 * @returns {Object} A response containing the user's channel profile information.
 * @throws {ApiError} Throws an error if the username parameter is missing or if the channel does not exist.
 */
const getUserChannelProfile = AsyncFnHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        email: 1,
        username: 1,
        fullname: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel does not exist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User Channel fetched successfully")
    );
});

/**
 * Handler function for retrieving user's watch history.
 *
 * @param {Object} req - The request object from the client, containing the authenticated user's ID.
 * @param {Object} res - The response object to be sent back to the client.
 *
 * This controller uses MongoDB aggregation pipelines to aggregate and retrieve the user's watch history:
 * 1. Matches the authenticated user's ID to find the corresponding user document.
 * 2. Performs a `$lookup` operation with the 'videos' collection to populate the user's 'watchHistory' array.
 *    - It further uses a sub-pipeline to populate information about the video owner from the 'users' collection.
 *    - Projects specific fields (fullname, username, avatar) from the 'users' collection for the video owner.
 *    - Adds these fields under the 'owner' field in each video document.
 *
 * @returns {Object} A response containing the user's watch history.
 * @throws {ApiError} Throws an error if there's an issue retrieving the watch history.
 */
const getWatchHistory = AsyncFnHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history fetched successfully"
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
  updateAccountDetails,
  updateUserAvater,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
