/**
 * Multer Upload Configuration
 *
 * This module configures Multer for handling file uploads in an Express application.
 * It defines the storage strategy for uploaded files, specifying the destination directory
 * and filename. The configured `upload` middleware can be used in route handlers to
 * manage file uploads.
 */

import multer from "multer";

// Define storage strategy
const storage = multer.diskStorage({
  /**
   * Set the destination directory for uploaded files.
   *
   * @param {Object} req - The Express request object.
   * @param {Object} file - The file object to be uploaded.
   * @param {Function} cb - Callback function to set the destination.
   */
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  /**
   * Set the filename for uploaded files.
   * Uses UUID to ensure unique filenames and retains the original file extension.
   *
   * @param {Object} req - The Express request object.
   * @param {Object} file - The file object to be uploaded.
   * @param {Function} cb - Callback function to set the filename.
   */
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage,
});
