/**
 * Cloudinary Upload Utility
 *
 * This module configures Cloudinary and provides a function to upload files to Cloudinary.
 * The function handles file uploads and cleans up local files in case of errors.
 */
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file to Cloudinary
 *
 * This function uploads a file to Cloudinary and deletes the local file if the upload fails.
 *
 * @param {string} localFilePath - The path to the local file to be uploaded.
 * @returns {Promise<Object|null>} - The Cloudinary response object if the upload is successful, otherwise null.
 * @throws {Error} - Throws an error if the local file path is not provided or if the file upload fails.
 */
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.error("The path to the local file does not exist.");
    }

    // Validate that the file exists
    if (!fs.existsSync(localFilePath)) {
      console.error("The local file does not exist.");
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // console.log("File successfully uploaded to Cloudinary.");
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error.message);

    // Ensure the file exists before attempting to delete it
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
      console.log("Local file deleted due to upload failure.");
    }
    return null;
  }
};

export { uploadOnCloudinary };
