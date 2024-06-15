import { AsyncFnHandler } from "../utils/AsyncFnHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/service/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
  let avatarLocalPath, coverimageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarLocalPath = req.files.avatar[0].path;
  }
  if (
    req.files &&
    Array.isArray(req.files.coverimage) &&
    req.files.coverimage.length > 0
  ) {
    coverimageLocalPath = req.files.coverimage[0].path;
  }

  // Ensure coverimageLocalPath is defined if cover image is provided
  // if (
  //   req.files &&
  //   Array.isArray(req.files.coverimage) &&
  //   req.files.coverimage.length > 0
  // ) {
  //   coverimageLocalPath = req.files.coverimage[0].path;
  // }

  // If avatar file is not provided, throw an error
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required", [], "");
  }

  // Upload avatar and cover image to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverimage = coverimageLocalPath
    ? await uploadOnCloudinary(coverimageLocalPath)
    : null;

  // If avatar upload fails, throw an error
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required", [], "");
  }

  // Create a new user in the database
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverimage: coverimage?.url || "",
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

export { registerUser };
