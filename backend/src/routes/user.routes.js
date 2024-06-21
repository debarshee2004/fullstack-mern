import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyUserJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Public Routes
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser);

// Protected Routes
router.route("/logout").post(verifyUserJWT, logoutUser);
router.route("/refreshtoken").post(refreshAccessToken);

export default router;
