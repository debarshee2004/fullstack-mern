import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Express Application
const app = express();

// Configurations for the Express Server.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes Import
import userRouter from "./routes/user.routes.js";

// Routes [http://localhost:8000]
app.use("/api/v1/users", userRouter);

export { app };
