import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required and should be unique."],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required and should be unique."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: [true, "Full Name is required and should be unique."],
      trim: true,
    },
    avatar: {
      type: String, // Cloudinary Url
      required: true,
    },
    coverimage: {
      type: String,
    },
    watchhistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    refreshtoken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
/**
 * User Schema Middleware and Methods
 *
 * This code defines middleware and methods for a Mongoose User schema, providing functionality for
 * password hashing, password comparison, and JWT token generation.
 */

// Pre-save middleware for hashing the password before saving a user document
/**
 * Pre-save Middleware
 *
 * This middleware is executed before saving a user document. It hashes the user's password
 * if it has been modified.
 *
 * @param {Function} next - The next middleware function in the stack.
 * @returns {void}
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // Use the line below in production
  // this.password = await bcrypt.hash(this.password, 10);
  // console.log(this.password);
  next();
});

// Method to compare a given password with the hashed password stored in the database
/**
 * Check if Password is Correct
 *
 * This method compares a given plain text password with the hashed password stored in the database.
 *
 * @param {string} password - The plain text password to compare.
 * @returns {Promise<boolean>} - A promise that resolves to true if the passwords match, otherwise false.
 */
userSchema.methods.isPasswordCorrect = async function (password) {
  // Use the line below in production
  // return await bcrypt.compare(password, this.password);
  // console.log(password, this.password);
  return password === this.password;
};

// Method to generate an access token for the user
/**
 * Generate Access Token
 *
 * This method generates a JWT access token for the user. The token includes the user's ID,
 * email, username, and fullname, and is signed with the access token secret from the environment variables.
 *
 * @returns {string} - The generated JWT access token.
 */
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Method to generate a refresh token for the user
/**
 * Generate Refresh Token
 *
 * This method generates a JWT refresh token for the user. The token includes only the user's ID,
 * and is signed with the refresh token secret from the environment variables.
 *
 * @returns {string} - The generated JWT refresh token.
 */
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
